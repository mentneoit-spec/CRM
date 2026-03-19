const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');
const { Readable } = require('stream');
const csvParser = require('csv-parser');

// ==================== COLLEGE SETTINGS / BRANDING ====================

const getCollegeSettings = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const college = await prisma.college.findUnique({
            where: { id: collegeId },
            include: { Domains: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }] } },
        });
        if (!college) return res.status(404).json({ success: false, message: 'College not found' });
        res.status(200).json({ success: true, data: college });
    } catch (error) {
        console.error('Get college settings error:', error);
        res.status(500).json({ success: false, message: 'Error fetching college settings' });
    }
};

const updateCollegeSettings = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { name, description, email, phone, address, city, state, country, pincode, theme, footerText, logo, favicon } = req.body;

        const updated = await prisma.college.update({
            where: { id: collegeId },
            data: {
                name,
                description,
                email,
                phone,
                address,
                city,
                state,
                country,
                pincode,
                theme,
                footerText,
                logo,
                favicon,
            },
        });

        res.status(200).json({ success: true, message: 'College settings updated', data: updated });
    } catch (error) {
        console.error('Update college settings error:', error);
        res.status(500).json({ success: false, message: 'Error updating college settings' });
    }
};

const requestCustomDomain = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { domain, isPrimary = false } = req.body;

        if (!domain) return res.status(400).json({ success: false, message: 'Domain is required' });

        const existingDomain = await prisma.collegeDomain.findUnique({ where: { domain } });
        if (existingDomain) {
            return res.status(400).json({ success: false, message: 'Domain already registered' });
        }

        const college = await prisma.college.findUnique({ where: { id: collegeId } });
        if (!college) return res.status(404).json({ success: false, message: 'College not found' });

        const dnsToken = crypto.randomBytes(16).toString('hex');
        const created = await prisma.collegeDomain.create({
            data: {
                domain,
                collegeId,
                collegeName: college.name,
                isPrimary: Boolean(isPrimary),
                status: 'pending',
                dnsVerified: false,
                dnsToken,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Domain requested. Please add the TXT record and ask SuperAdmin to verify/approve.',
            data: {
                domain: created,
                dnsVerification: {
                    type: 'TXT',
                    name: `_mentneo-verify.${domain}`,
                    value: dnsToken,
                },
            },
        });
    } catch (error) {
        console.error('Request custom domain error:', error);
        res.status(500).json({ success: false, message: 'Error requesting custom domain' });
    }
};

const listMyDomains = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const domains = await prisma.collegeDomain.findMany({
            where: { collegeId },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
        });
        res.status(200).json({ success: true, data: domains });
    } catch (error) {
        console.error('List my domains error:', error);
        res.status(500).json({ success: false, message: 'Error fetching domains' });
    }
};

// ==================== ADMIN PROFILE ====================

const sanitizeUser = (user) => {
    if (!user) return null;
    // eslint-disable-next-line no-unused-vars
    const { password, twoFASecret, ...safe } = user;
    return safe;
};

const getAdminProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        if (user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const admin = user.AdminProfile || null;

        return res.status(200).json({
            success: true,
            data: {
                user: sanitizeUser(user),
                admin,
            },
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({ success: false, message: 'Error fetching admin profile' });
    }
};

const updateAdminProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        if (user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { name, phone, profileImage, designation, department } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: name === undefined ? undefined : name,
                phone: phone === undefined ? undefined : phone,
                profileImage: profileImage === undefined ? undefined : profileImage,
            },
            include: {
                college: true,
                AdminProfile: true,
                TeacherProfile: true,
                StudentProfile: true,
                ParentProfile: true,
            },
        });

        if (!updatedUser.AdminProfile) {
            return res.status(400).json({ success: false, message: 'Admin profile record not found' });
        }

        const updatedAdmin = await prisma.admin.update({
            where: { userId: user.id },
            data: {
                name: name === undefined ? undefined : name,
                phone: phone === undefined ? undefined : phone,
                profileImage: profileImage === undefined ? undefined : profileImage,
                designation: designation === undefined ? undefined : designation,
                department: department === undefined ? undefined : department,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Profile updated',
            data: {
                user: sanitizeUser({ ...updatedUser, AdminProfile: undefined }),
                admin: updatedAdmin,
            },
        });
    } catch (error) {
        console.error('Update admin profile error:', error);
        res.status(500).json({ success: false, message: 'Error updating admin profile' });
    }
};

// ==================== USER MANAGEMENT ====================

// Create teacher
const createTeacher = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { name, email, phone, password, qualification, experience, specialization } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const passwordInput = String(password || '').trim();

        // Validate input
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!normalizedEmail) missingFields.push('email');
        if (!passwordInput) missingFields.push('password');
        if (!collegeId) missingFields.push('collegeId');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Required fields missing: ${missingFields.join(', ')}`,
            });
        }

        // Check if college exists
        const college = await prisma.college.findUnique({
            where: { id: collegeId },
        });

        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findFirst({
            where: { email: normalizedEmail, collegeId },
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(passwordInput, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                phone,
                role: 'Teacher',
                collegeId,
                isEmailVerified: true,
                isActive: true,
            },
        });

        // Create teacher profile
        const teacher = await prisma.teacher.create({
            data: {
                name,
                email: normalizedEmail,
                phone,
                password: hashedPassword,
                qualification,
                experience: experience ? parseInt(experience) : null,
                specialization,
                collegeId,
                userId: user.id,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: { user, teacher },
        });
    } catch (error) {
        console.error('Create teacher error:', error);
        res.status(500).json({ success: false, message: 'Error creating teacher' });
    }
};

// Create student
const createStudent = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const {
            name,
            studentId,
            email,
            phone,
            password,
            sclassId,
            sectionId,
            parentName,
            parentPhone,
            board,
            group,
        } = req.body;

        const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
        const passwordInput = String(password || '').trim();

        const integratedCourse = req.body.integratedCourse ?? req.body.integrated_course;
        const profileImage = req.body.profileImage ?? req.body.profile_image;

        if (!name || !studentId || !passwordInput || !collegeId || !sclassId) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        // Check college exists
        const college = await prisma.college.findUnique({
            where: { id: collegeId },
        });

        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }

        // Check student ID uniqueness
        const existingStudent = await prisma.student.findFirst({
            where: { studentId, collegeId },
        });

        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'Student ID already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(passwordInput, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                phone,
                role: 'Student',
                collegeId,
                isActive: true,
            },
        });

        // Create student profile
        const student = await prisma.student.create({
            data: {
                name,
                studentId,
                email: normalizedEmail,
                phone,
                password: hashedPassword,
                parentName,
                parentPhone,
                profileImage,
                board,
                integratedCourse,
                group,
                collegeId,
                sclassId,
                sectionId: sectionId || null,
                userId: user.id,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: { user, student },
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ success: false, message: 'Error creating student' });
    }
};

// Get all students in college
const getAllStudents = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { page = 1, limit = 20, sclassId, status = 'active' } = req.query;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;
        const filter = { collegeId, isDeleted: false };

        if (sclassId) filter.sclassId = sclassId;
        if (status === 'active') filter.isActive = true;

        const students = await prisma.student.findMany({
            where: filter,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                sclass: true,
                section: true,
                parent: true,
                _count: {
                    select: {
                        ExamResults: true,
                        Attendances: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.student.count({ where: filter });

        res.status(200).json({
            success: true,
            data: students,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }
};

// Get all teachers in college
const getAllTeachers = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { page = 1, limit = 20 } = req.query;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;

        const teachers = await prisma.teacher.findMany({
            where: { collegeId, isActive: true },
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                Subjects: true,
                ClassTeacherOf: true,
                _count: {
                    select: {
                        Subjects: true,
                        Homeworks: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.teacher.count({
            where: { collegeId, isActive: true }
        });

        res.status(200).json({
            success: true,
            data: teachers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ success: false, message: 'Error fetching teachers' });
    }
};

// ==================== TEAM MANAGEMENT ====================

// Create Team Member
const createTeamMember = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { name, email, phone, password, role } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const passwordInput = String(password || '').trim();

        if (!name || !normalizedEmail || !passwordInput || !collegeId || !role) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const validRoles = ['AdmissionTeam', 'AccountsTeam', 'TransportTeam'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid team role' });
        }

        const existingUser = await prisma.user.findFirst({
            where: { email: normalizedEmail, collegeId },
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(passwordInput, 10);

        const user = await prisma.user.create({
            data: { name, email: normalizedEmail, password: hashedPassword, phone, role, collegeId, isEmailVerified: true, isActive: true },
        });

        let teamProfile;
        if (role === 'AdmissionTeam') {
            teamProfile = await prisma.admissionTeam.create({ data: { name, email: normalizedEmail, phone, collegeId, userId: user.id } });
        } else if (role === 'AccountsTeam') {
            teamProfile = await prisma.accountsTeam.create({ data: { name, email: normalizedEmail, phone, collegeId, userId: user.id } });
        } else if (role === 'TransportTeam') {
            teamProfile = await prisma.transportTeam.create({ data: { name, email: normalizedEmail, phone, collegeId, userId: user.id } });
        }

        res.status(201).json({ success: true, message: `${role} member created`, data: { user, teamProfile } });
    } catch (error) {
        console.error('Create team member error:', error);
        res.status(500).json({ success: false, message: 'Error creating team member' });
    }
};

// Get Team Members
const getTeamMembers = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const admissions = await prisma.admissionTeam.findMany({ where: { collegeId }, orderBy: { createdAt: 'desc' }, include: { user: true } });
        const accounts = await prisma.accountsTeam.findMany({ where: { collegeId }, orderBy: { createdAt: 'desc' }, include: { user: true } });
        const transport = await prisma.transportTeam.findMany({ where: { collegeId }, orderBy: { createdAt: 'desc' }, include: { user: true } });

        res.status(200).json({ success: true, data: [...admissions.map(a => ({ ...a, role: 'AdmissionTeam' })), ...accounts.map(a => ({ ...a, role: 'AccountsTeam' })), ...transport.map(a => ({ ...a, role: 'TransportTeam' }))] });
    } catch (error) {
        console.error('Get team members error:', error);
        res.status(500).json({ success: false, message: 'Error fetching team members' });
    }
};

// ==================== CLASS MANAGEMENT ====================

// Create class
const createClass = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { sclassName, sclassCode, academicYear, description, classTeacherId } = req.body;

        if (!collegeId || !sclassName) {
            return res.status(400).json({ success: false, message: 'College and class name required' });
        }

        const sclass = await prisma.sclass.create({
            data: {
                sclassName,
                sclassCode: sclassCode || sclassName,
                academicYear: academicYear || new Date().getFullYear().toString(),
                description,
                collegeId,
                classTeacherId: classTeacherId || null,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: sclass,
        });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ success: false, message: 'Error creating class' });
    }
};

// Get all classes
const getAllClasses = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const classes = await prisma.sclass.findMany({
            where: { collegeId },
            include: {
                classTeacher: true,
                Subjects: true,
                Students: true,
                Sections: true,
                _count: {
                    select: {
                        Students: true,
                        Subjects: true,
                        Sections: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: classes,
        });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ success: false, message: 'Error fetching classes' });
    }
};

// ==================== SUBJECT MANAGEMENT ====================

const resolveTeacherIdForSubject = async (collegeId, teacherIdLike) => {
    if (!teacherIdLike) return null;
    const value = String(teacherIdLike).trim();
    if (!value) return null;

    const teacher = await prisma.teacher.findFirst({
        where: {
            collegeId,
            OR: [{ id: value }, { userId: value }],
        },
        select: { id: true },
    });

    return teacher?.id || null;
};

// Create subject
const createSubject = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { subName, subCode, description, sclassId, maxMarks, passingMarks, teacherId } = req.body;

        if (!collegeId || !subName || !subCode || !sclassId) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        // Check if subject already exists
        const existing = await prisma.subject.findFirst({
            where: { collegeId, sclassId, subCode },
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Subject code already exists in this class' });
        }

        const resolvedTeacherId = await resolveTeacherIdForSubject(collegeId, teacherId);
        if (teacherId && !resolvedTeacherId) {
            return res.status(400).json({ success: false, message: 'Invalid teacherId. Provide a valid Teacher ID or the teacher User ID.' });
        }

        const subject = await prisma.subject.create({
            data: {
                subName,
                subCode,
                description,
                collegeId,
                sclassId,
                maxMarks: maxMarks || 100,
                passingMarks: passingMarks || 40,
                teacherId: resolvedTeacherId,
            },
            include: { sclass: true, teacher: true },
        });

        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: subject,
        });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ success: false, message: 'Error creating subject' });
    }
};

// Get all subjects
const getSubjects = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const subjects = await prisma.subject.findMany({
            where: { collegeId },
            include: { sclass: true },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: subjects,
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ success: false, message: 'Error fetching subjects' });
    }
};

// ==================== FEE MANAGEMENT ====================

const parseFlexibleDate = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    // ISO (YYYY-MM-DD or full ISO timestamp)
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    // dd/mm/yyyy
    const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
        const day = parseInt(slash[1], 10);
        const month = parseInt(slash[2], 10);
        const year = parseInt(slash[3], 10);
        const d = new Date(Date.UTC(year, month - 1, day));
        return Number.isNaN(d.getTime()) ? null : d;
    }

    // dd-mm-yyyy
    const dash = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dash) {
        const day = parseInt(dash[1], 10);
        const month = parseInt(dash[2], 10);
        const year = parseInt(dash[3], 10);
        const d = new Date(Date.UTC(year, month - 1, day));
        return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
};

// Define fee structure (creates a fee record for a student)
const defineFeeStructure = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const {
            studentId,
            feeType,
            feeCategory,
            amount,
            dueDate,
            frequency,
            description,
            isActive,
        } = req.body;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const due = parseFlexibleDate(dueDate);
        if (!due) {
            return res.status(400).json({ success: false, message: 'Valid dueDate required' });
        }

        const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
        if (!Number.isFinite(numericAmount) || numericAmount < 0) {
            return res.status(400).json({ success: false, message: 'Amount must be a non-negative number' });
        }

        const student = await prisma.student.findFirst({
            where: { id: studentId, collegeId, isDeleted: false },
            select: { id: true },
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const created = await prisma.fee.create({
            data: {
                studentId: student.id,
                collegeId,
                feeType: String(feeType || '').trim(),
                feeCategory: feeCategory ? String(feeCategory).trim() : null,
                amount: numericAmount,
                dueDate: due,
                frequency: frequency ? String(frequency).trim() : undefined,
                description: description ? String(description).trim() : null,
                isActive: isActive === undefined ? true : Boolean(isActive),
            },
            include: { student: { select: { name: true, sclass: { select: { sclassName: true } } } } },
        });

        res.status(201).json({
            success: true,
            message: 'Fee created',
            data: created,
        });
    } catch (error) {
        console.error('Define fee error:', error);
        res.status(500).json({ success: false, message: 'Error creating fee' });
    }
};

// ==================== DASHBOARD ====================

// Get college dashboard
const getDashboard = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const college = await prisma.college.findUnique({
            where: { id: collegeId },
        });

        const studentCount = await prisma.student.count({
            where: { collegeId, isDeleted: false },
        });

        const teacherCount = await prisma.teacher.count({
            where: { collegeId, isActive: true },
        });

        const classCount = await prisma.sclass.count({
            where: { collegeId },
        });

        const revenueData = await prisma.payment.aggregate({
            where: { collegeId, status: 'completed' },
            _sum: { amount: true },
        });

        const admissionPending = await prisma.admission.count({
            where: { collegeId, status: 'pending' },
        });

        const recentPayments = await prisma.payment.findMany({
            where: { collegeId, status: 'completed' },
            take: 5,
            include: { student: true },
            orderBy: { createdAt: 'desc' },
        });

        // --- Chart aggregates (avoid frontend mock data) ---
        const now = new Date();
        const monthWindow = 6;
        const windowStart = new Date(now.getFullYear(), now.getMonth() - (monthWindow - 1), 1);

        const completedPaymentsInWindow = await prisma.payment.findMany({
            where: {
                collegeId,
                status: 'completed',
                createdAt: { gte: windowStart },
            },
            select: { amount: true, createdAt: true },
        });

        const monthBuckets = [];
        const monthIndex = new Map();
        for (let i = monthWindow - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthIndex.set(key, monthBuckets.length);
            monthBuckets.push({
                key,
                month: d.toLocaleString('en-US', { month: 'short' }),
                year: d.getFullYear(),
                revenue: 0,
            });
        }

        for (const p of completedPaymentsInWindow) {
            const d = new Date(p.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const idx = monthIndex.get(key);
            if (idx === undefined) continue;
            const amount = Number(p.amount) || 0;
            monthBuckets[idx].revenue += amount;
        }

        const admissionsByStatusRaw = await prisma.admission.groupBy({
            by: ['status'],
            where: { collegeId },
            _count: { _all: true },
        });

        const admissionsByStatusMap = new Map(
            admissionsByStatusRaw.map((r) => [String(r.status || '').toLowerCase(), r._count._all])
        );
        const admissionsByStatus = [
            { status: 'Approved', value: admissionsByStatusMap.get('approved') || 0 },
            { status: 'Pending', value: admissionsByStatusMap.get('pending') || 0 },
            { status: 'Rejected', value: admissionsByStatusMap.get('rejected') || 0 },
        ];

        const classesWithCounts = await prisma.sclass.findMany({
            where: { collegeId },
            select: {
                id: true,
                sclassName: true,
                _count: {
                    select: {
                        Students: {
                            where: { isDeleted: false },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        const studentsByClass = classesWithCounts.map((c) => ({
            classId: c.id,
            className: c.sclassName,
            students: c._count?.Students ?? 0,
        }));

        res.status(200).json({
            success: true,
            data: {
                college,
                stats: {
                    students: studentCount,
                    teachers: teacherCount,
                    classes: classCount,
                    revenue: revenueData._sum.amount || 0,
                    pendingAdmissions: admissionPending,
                },
                recentPayments,
                revenueByMonth: monthBuckets.map(({ month, year, revenue }) => ({ month, year, revenue })),
                admissionsByStatus,
                studentsByClass,
            },
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard' });
    }
};

// ==================== FEES ====================

const getFees = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }
        const fees = await prisma.fee.findMany({
            where: { collegeId },
            include: { student: { select: { name: true, sclass: { select: { sclassName: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: fees });
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({ success: false, message: 'Error fetching fees' });
    }
};

const updateFee = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { feeId } = req.params;

        const existing = await prisma.fee.findFirst({ where: { id: feeId, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Fee not found' });
        }

        const {
            feeType,
            feeCategory,
            amount,
            dueDate,
            frequency,
            description,
            isActive,
        } = req.body;

        const data = {};
        if (feeType !== undefined) data.feeType = String(feeType).trim();
        if (feeCategory !== undefined) data.feeCategory = feeCategory ? String(feeCategory).trim() : null;
        if (amount !== undefined) {
            const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
            if (!Number.isFinite(numericAmount) || numericAmount < 0) {
                return res.status(400).json({ success: false, message: 'Amount must be a non-negative number' });
            }
            data.amount = numericAmount;
        }
        if (dueDate !== undefined) {
            const due = parseFlexibleDate(dueDate);
            if (!due) {
                return res.status(400).json({ success: false, message: 'Valid dueDate required' });
            }
            data.dueDate = due;
        }
        if (frequency !== undefined) data.frequency = String(frequency).trim();
        if (description !== undefined) data.description = description ? String(description).trim() : null;
        if (isActive !== undefined) data.isActive = Boolean(isActive);

        const updated = await prisma.fee.update({
            where: { id: feeId },
            data,
            include: { student: { select: { name: true, sclass: { select: { sclassName: true } } } } },
        });

        res.status(200).json({ success: true, message: 'Fee updated', data: updated });
    } catch (error) {
        console.error('Update fee error:', error);
        res.status(500).json({ success: false, message: 'Error updating fee' });
    }
};

const deleteFee = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { feeId } = req.params;

        const existing = await prisma.fee.findFirst({ where: { id: feeId, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Fee not found' });
        }

        await prisma.fee.delete({ where: { id: feeId } });
        res.status(200).json({ success: true, message: 'Fee deleted' });
    } catch (error) {
        console.error('Delete fee error:', error);
        res.status(500).json({ success: false, message: 'Error deleting fee' });
    }
};

const bulkImportFees = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const mode = String(req.query.mode || 'update').toLowerCase() === 'skip' ? 'skip' : 'update';

        const file = Array.isArray(req.files) ? req.files[0] : null;
        if (!file) {
            return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
        }

        const rows = [];
        await new Promise((resolve, reject) => {
            Readable.from([file.buffer])
                .pipe(
                    csvParser({
                        mapHeaders: ({ header }) => normalizeCsvKey(header),
                    })
                )
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        let created = 0;
        let updated = 0;
        let skipped = 0;
        const errors = [];

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2;
            try {
                const studentUuid = pickCsvValue(raw, ['student_uuid', 'student_uuid_id', 'student_uuidid', 'student_internal_id']);
                const studentCustomId = pickCsvValue(raw, ['student_id', 'studentid', 'roll_no', 'roll', 'id']);
                const studentEmail = pickCsvValue(raw, ['student_email', 'email']);

                const feeType = pickCsvValue(raw, ['fee_type', 'feetype', 'type']);
                const feeCategory = pickCsvValue(raw, ['fee_category', 'feecategory', 'category']);
                const amountRaw = pickCsvValue(raw, ['amount', 'fee_amount']);
                const dueDateRaw = pickCsvValue(raw, ['due_date', 'duedate', 'date']);
                const frequency = pickCsvValue(raw, ['frequency', 'freq']);
                const description = pickCsvValue(raw, ['description', 'remarks', 'note']);
                const isActiveRaw = pickCsvValue(raw, ['is_active', 'active', 'status']);

                if (!feeType || !amountRaw || !dueDateRaw) {
                    errors.push({ row: rowNumber, studentId: studentCustomId || studentUuid || studentEmail || null, message: 'Missing required: feeType, amount, dueDate' });
                    continue;
                }

                const due = parseFlexibleDate(dueDateRaw);
                if (!due) {
                    errors.push({ row: rowNumber, studentId: studentCustomId || studentUuid || studentEmail || null, message: `Invalid dueDate: ${dueDateRaw}` });
                    continue;
                }

                const numericAmount = parseFloat(String(amountRaw));
                if (!Number.isFinite(numericAmount) || numericAmount < 0) {
                    errors.push({ row: rowNumber, studentId: studentCustomId || studentUuid || studentEmail || null, message: `Invalid amount: ${amountRaw}` });
                    continue;
                }

                let student = null;
                if (studentUuid) {
                    student = await prisma.student.findFirst({ where: { id: studentUuid, collegeId, isDeleted: false } });
                } else if (studentCustomId) {
                    student = await prisma.student.findFirst({ where: { collegeId, studentId: studentCustomId, isDeleted: false } });
                } else if (studentEmail) {
                    student = await prisma.student.findFirst({ where: { collegeId, email: studentEmail, isDeleted: false } });
                }

                if (!student) {
                    errors.push({ row: rowNumber, studentId: studentCustomId || studentUuid || studentEmail || null, message: 'Student not found' });
                    continue;
                }

                const isActive = isActiveRaw
                    ? ['1', 'true', 'yes', 'active'].includes(String(isActiveRaw).trim().toLowerCase())
                    : true;

                const matchWhere = {
                    collegeId,
                    studentId: student.id,
                    feeType: String(feeType).trim(),
                    dueDate: due,
                };

                const existing = await prisma.fee.findFirst({ where: matchWhere });
                if (existing) {
                    if (mode === 'skip') {
                        skipped++;
                        continue;
                    }

                    await prisma.fee.update({
                        where: { id: existing.id },
                        data: {
                            amount: numericAmount,
                            feeCategory: feeCategory ? String(feeCategory).trim() : null,
                            frequency: frequency ? String(frequency).trim() : undefined,
                            description: description ? String(description).trim() : null,
                            isActive,
                        },
                    });

                    updated++;
                    continue;
                }

                await prisma.fee.create({
                    data: {
                        collegeId,
                        studentId: student.id,
                        feeType: String(feeType).trim(),
                        feeCategory: feeCategory ? String(feeCategory).trim() : null,
                        amount: numericAmount,
                        dueDate: due,
                        frequency: frequency ? String(frequency).trim() : undefined,
                        description: description ? String(description).trim() : null,
                        isActive,
                    },
                });

                created++;
            } catch (err) {
                errors.push({ row: rowNumber, message: err?.message || 'Unknown error' });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Fees import completed',
            data: { created, updated, skipped, total: rows.length, errors },
        });
    } catch (error) {
        console.error('Bulk import fees error:', error);
        res.status(500).json({ success: false, message: 'Error importing fees' });
    }
};

// ==================== TEACHERS (DETAIL/UPDATE/DELETE) ====================

const getTeacher = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const teacher = await prisma.teacher.findFirst({
            where: { id, collegeId, isActive: true },
            include: {
                Subjects: true,
                ClassTeacherOf: true,
                user: { select: { id: true, name: true, email: true, phone: true, role: true, isActive: true } },
            },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, data: teacher });
    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({ success: false, message: 'Error fetching teacher' });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;
        const { name, email, phone, qualification, experience, specialization, isActive } = req.body;

        const teacher = await prisma.teacher.findFirst({ where: { id, collegeId } });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const updatedTeacher = await prisma.teacher.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                qualification,
                experience: experience === undefined ? undefined : (experience === null ? null : parseInt(experience)),
                specialization,
                isActive: isActive === undefined ? undefined : Boolean(isActive),
            },
        });

        if (teacher.userId) {
            await prisma.user.update({
                where: { id: teacher.userId },
                data: {
                    name: name === undefined ? undefined : name,
                    email: email === undefined ? undefined : email,
                    phone: phone === undefined ? undefined : phone,
                    isActive: isActive === undefined ? undefined : Boolean(isActive),
                },
            });
        }

        res.status(200).json({ success: true, message: 'Teacher updated', data: updatedTeacher });
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({ success: false, message: 'Error updating teacher' });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const teacher = await prisma.teacher.findFirst({ where: { id, collegeId } });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const updatedTeacher = await prisma.teacher.update({
            where: { id },
            data: { isActive: false },
        });

        if (teacher.userId) {
            await prisma.user.update({
                where: { id: teacher.userId },
                data: { isActive: false, isDeleted: true },
            });
        }

        res.status(200).json({ success: true, message: 'Teacher deactivated', data: updatedTeacher });
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ success: false, message: 'Error deleting teacher' });
    }
};

// ==================== STUDENTS (DETAIL/UPDATE/DELETE) ====================

const getStudent = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const student = await prisma.student.findFirst({
            where: { id, collegeId, isDeleted: false },
            include: {
                sclass: true,
                section: true,
                parent: true,
                user: { select: { id: true, name: true, email: true, phone: true, role: true, isActive: true } },
            },
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ success: false, message: 'Error fetching student' });
    }
};

const updateStudent = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;
        const {
            name,
            email,
            phone,
            sclassId,
            sectionId,
            parentName,
            parentPhone,
            board,
            group,
            isActive,
        } = req.body;

        const integratedCourse = req.body.integratedCourse ?? req.body.integrated_course;
        const profileImage = req.body.profileImage ?? req.body.profile_image;

        const student = await prisma.student.findFirst({ where: { id, collegeId } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const updatedStudent = await prisma.student.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                profileImage: profileImage === undefined ? undefined : profileImage,
                board: board === undefined ? undefined : board,
                integratedCourse: integratedCourse === undefined ? undefined : integratedCourse,
                group: group === undefined ? undefined : group,
                sclassId: sclassId === undefined ? undefined : sclassId,
                sectionId: sectionId === undefined ? undefined : (sectionId || null),
                parentName,
                parentPhone,
                isActive: isActive === undefined ? undefined : Boolean(isActive),
            },
            include: {
                sclass: true,
                section: true,
            },
        });

        if (student.userId) {
            await prisma.user.update({
                where: { id: student.userId },
                data: {
                    name: name === undefined ? undefined : name,
                    email: email === undefined ? undefined : email,
                    phone: phone === undefined ? undefined : phone,
                    profileImage: profileImage === undefined ? undefined : profileImage,
                    isActive: isActive === undefined ? undefined : Boolean(isActive),
                },
            });
        }

        res.status(200).json({ success: true, message: 'Student updated', data: updatedStudent });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ success: false, message: 'Error updating student' });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const student = await prisma.student.findFirst({ where: { id, collegeId } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const updatedStudent = await prisma.student.update({
            where: { id },
            data: { isDeleted: true, isActive: false },
        });

        if (student.userId) {
            await prisma.user.update({
                where: { id: student.userId },
                data: { isActive: false, isDeleted: true },
            });
        }

        res.status(200).json({ success: true, message: 'Student deleted', data: updatedStudent });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ success: false, message: 'Error deleting student' });
    }
};

// ==================== TEACHER SECTION ASSIGNMENTS ====================

const resolveTeacherByIdOrUserId = async (collegeId, idOrUserId) => {
    if (!idOrUserId) return null;
    const value = String(idOrUserId).trim();
    if (!value) return null;

    return prisma.teacher.findFirst({
        where: {
            collegeId,
            OR: [{ id: value }, { userId: value }],
        },
        select: { id: true, userId: true, collegeId: true, name: true, email: true },
    });
};

const getTeacherSections = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const teacher = await resolveTeacherByIdOrUserId(collegeId, id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const assignments = await prisma.teacherSectionAssignment.findMany({
            where: { collegeId, teacherId: teacher.id },
            include: {
                sclass: { select: { id: true, sclassName: true } },
                section: { select: { id: true, sectionName: true } },
            },
            orderBy: [{ sclassId: 'asc' }, { sectionId: 'asc' }],
        });

        res.status(200).json({
            success: true,
            data: {
                teacher,
                sectionIds: assignments.map((a) => a.sectionId),
                assignments,
            },
        });
    } catch (error) {
        console.error('Get teacher sections error:', error);
        res.status(500).json({ success: false, message: 'Error fetching teacher sections' });
    }
};

const setTeacherSections = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;
        const { sectionIds } = req.body;

        const teacher = await resolveTeacherByIdOrUserId(collegeId, id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const nextSectionIds = Array.isArray(sectionIds)
            ? sectionIds.map((x) => String(x).trim()).filter(Boolean)
            : [];

        const sections = nextSectionIds.length
            ? await prisma.section.findMany({
                where: { id: { in: nextSectionIds }, collegeId },
                select: { id: true, sclassId: true },
            })
            : [];

        if (sections.length !== nextSectionIds.length) {
            return res.status(400).json({ success: false, message: 'One or more sections are invalid for this college' });
        }

        await prisma.$transaction([
            prisma.teacherSectionAssignment.deleteMany({ where: { collegeId, teacherId: teacher.id } }),
            ...(sections.length
                ? [
                    prisma.teacherSectionAssignment.createMany({
                        data: sections.map((s) => ({
                            collegeId,
                            teacherId: teacher.id,
                            sclassId: s.sclassId,
                            sectionId: s.id,
                        })),
                        skipDuplicates: true,
                    }),
                ]
                : []),
        ]);

        res.status(200).json({
            success: true,
            message: 'Teacher sections updated',
            data: {
                teacherId: teacher.id,
                sectionIds: nextSectionIds,
                count: nextSectionIds.length,
            },
        });
    } catch (error) {
        console.error('Set teacher sections error:', error);
        res.status(500).json({ success: false, message: 'Error updating teacher sections' });
    }
};

// ==================== STUDENTS (BULK IMPORT) ====================

const detectCsvSeparator = (buffer) => {
    try {
        const text = Buffer.isBuffer(buffer) ? buffer.toString('utf8') : String(buffer || '');
        const firstLine = text.split(/\r?\n/)[0] || '';

        const commaCount = (firstLine.match(/,/g) || []).length;
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const tabCount = (firstLine.match(/\t/g) || []).length;

        if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
        if (semicolonCount > commaCount) return ';';
        return ',';
    } catch {
        return ',';
    }
};

const normalizeCsvKey = (key) => {
    return String(key || '')
        .trim()
        .toLowerCase()
        .replace(/[\s/]+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
};

const pickCsvValue = (row, keys) => {
    for (const key of keys) {
        const normalized = normalizeCsvKey(key);
        if (Object.prototype.hasOwnProperty.call(row, normalized)) {
            const value = row[normalized];
            if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
        }
    }
    return '';
};

const looksLikeEmail = (value) => {
    const s = String(value || '').trim();
    return Boolean(s) && /@/.test(s) && !/\s/.test(s);
};

const normalizeLooseName = (value) => {
    return String(value || '').trim();
};

const bulkImportStudents = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const mode = String(req.query.mode || 'skip').toLowerCase() === 'update' ? 'update' : 'skip';

        const file = Array.isArray(req.files) ? req.files[0] : null;
        if (!file) {
            return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
        }

        const rows = [];
        await new Promise((resolve, reject) => {
            Readable.from([file.buffer])
                .pipe(
                    csvParser({
                        separator: detectCsvSeparator(file.buffer),
                        mapHeaders: ({ header }) => normalizeCsvKey(header),
                    })
                )
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        let created = 0;
        let updated = 0;
        let skipped = 0;
        let defaultPasswordUsed = 0;
        const errors = [];

        const fallbackPassword = String(process.env.DEFAULT_STUDENT_PASSWORD || '').trim() || 'Student@123';

        const allowedBoards = new Set(['STATE', 'CBSE', 'IGCSE', 'IB']);

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2; // header is row 1
            try {
                const studentId = pickCsvValue(raw, [
                    'student_id',
                    'studentid',
                    'student_id_roll_no',
                    'student_id_rollno',
                    'student_roll_no',
                    'student_rollno',
                    'roll_no',
                    'roll',
                    'rollno',
                    'id',
                    'student_id__roll_no',
                ]);
                const name = pickCsvValue(raw, ['name', 'student_name', 'full_name']);

                const contactRaw = pickCsvValue(raw, ['contact', 'contact_info', 'contact_details']);
                const emailRaw = pickCsvValue(raw, ['email', 'student_email', 'mail', 'e_mail']);
                const phoneRaw = pickCsvValue(raw, ['phone', 'mobile', 'contact_number', 'contact_phone', 'mobile_number']);

                const email = emailRaw || (looksLikeEmail(contactRaw) ? contactRaw : '');
                const phone = phoneRaw || (!looksLikeEmail(contactRaw) ? contactRaw : '');
                const password = pickCsvValue(raw, ['password', 'temp_password', 'temporary_password']);
                const className = pickCsvValue(raw, ['class', 'class_name', 'sclass', 'sclass_name']);
                const sectionName = pickCsvValue(raw, ['section', 'section_name']);
                const parentName = pickCsvValue(raw, ['parent_name', 'guardian_name']);
                const parentPhone = pickCsvValue(raw, ['parent_phone', 'guardian_phone']);
                const boardRaw = pickCsvValue(raw, ['board']);
                const group = pickCsvValue(raw, ['group']);
                const integratedCourse = pickCsvValue(raw, ['integrated_course', 'integratedcourse']);
                const profileImage = pickCsvValue(raw, ['profile_image', 'profileimage']);

                const normalizedName = normalizeLooseName(name);
                if (!studentId || !normalizedName) {
                    errors.push({ row: rowNumber, studentId: studentId || null, message: 'Missing required: studentId and/or name' });
                    continue;
                }

                let board = null;
                if (boardRaw) {
                    const normalizedBoard = String(boardRaw).trim().toUpperCase();
                    if (!allowedBoards.has(normalizedBoard)) {
                        errors.push({ row: rowNumber, studentId, message: `Invalid board: ${boardRaw}. Allowed: ${Array.from(allowedBoards).join(', ')}` });
                        continue;
                    }
                    board = normalizedBoard;
                }

                let sclass = null;
                if (className) {
                    const classNameTrimmed = String(className).trim();
                    sclass = await prisma.sclass.findFirst({
                        where: {
                            collegeId,
                            sclassName: {
                                equals: classNameTrimmed,
                                mode: 'insensitive',
                            },
                        },
                    });
                    if (!sclass) {
                        errors.push({ row: rowNumber, studentId, message: `Class not found: ${className}` });
                        continue;
                    }
                }

                let section = null;
                if (sectionName) {
                    if (!sclass) {
                        errors.push({ row: rowNumber, studentId, message: 'Section provided but Class is missing/invalid' });
                        continue;
                    }
                    section = await prisma.section.findFirst({
                        where: {
                            collegeId,
                            sclassId: sclass.id,
                            sectionName: {
                                equals: String(sectionName).trim(),
                                mode: 'insensitive',
                            },
                        },
                    });
                    if (!section) {
                        errors.push({ row: rowNumber, studentId, message: `Section not found: ${sectionName} (Class: ${className})` });
                        continue;
                    }
                }

                const existingStudent = await prisma.student.findFirst({ where: { collegeId, studentId } });
                if (existingStudent) {
                    if (mode === 'skip') {
                        skipped++;
                        continue;
                    }

                    const updateData = { name: normalizedName };
                    if (email) updateData.email = email;
                    if (phone) updateData.phone = phone;
                    if (parentName) updateData.parentName = parentName;
                    if (parentPhone) updateData.parentPhone = parentPhone;
                    if (profileImage) updateData.profileImage = profileImage;
                    if (board) updateData.board = board;
                    if (integratedCourse) updateData.integratedCourse = integratedCourse;
                    if (group) updateData.group = group;
                    if (sclass) updateData.sclassId = sclass.id;
                    if (section) updateData.sectionId = section.id;

                    await prisma.student.update({ where: { id: existingStudent.id }, data: updateData });

                    if (existingStudent.userId) {
                        const userUpdate = { name: normalizedName };
                        if (email) userUpdate.email = email;
                        if (phone) userUpdate.phone = phone;
                        if (profileImage) userUpdate.profileImage = profileImage;
                        await prisma.user.update({ where: { id: existingStudent.userId }, data: userUpdate });
                    }

                    if (password) {
                        const hashed = await bcrypt.hash(password, 10);
                        await prisma.student.update({ where: { id: existingStudent.id }, data: { password: hashed } });
                        if (existingStudent.userId) {
                            await prisma.user.update({ where: { id: existingStudent.userId }, data: { password: hashed } });
                        }
                    }

                    updated++;
                    continue;
                }

                const effectivePassword = password || fallbackPassword;
                if (!password) defaultPasswordUsed++;

                if (!sclass) {
                    errors.push({ row: rowNumber, studentId, message: 'Missing required: Class' });
                    continue;
                }

                const hashedPassword = await bcrypt.hash(effectivePassword, 10);

                await prisma.$transaction(async (tx) => {
                    const user = await tx.user.create({
                        data: {
                            name: normalizedName,
                            email: email || null,
                            phone: phone || null,
                            password: hashedPassword,
                            profileImage: profileImage || null,
                            role: 'Student',
                            collegeId,
                            isActive: true,
                        },
                    });

                    await tx.student.create({
                        data: {
                            name: normalizedName,
                            studentId,
                            email: email || null,
                            phone: phone || null,
                            password: hashedPassword,
                            parentName: parentName || null,
                            parentPhone: parentPhone || null,
                            profileImage: profileImage || null,
                            board,
                            integratedCourse: integratedCourse || null,
                            group: group || null,
                            collegeId,
                            sclassId: sclass.id,
                            sectionId: section ? section.id : null,
                            userId: user.id,
                            isActive: true,
                        },
                    });
                });

                created++;
            } catch (rowError) {
                errors.push({
                    row: rowNumber,
                    studentId: pickCsvValue(raw, ['student_id', 'studentid', 'roll_no', 'roll', 'id']) || null,
                    message: rowError?.message || 'Row import failed',
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bulk import completed',
            data: {
                mode,
                totalRows: rows.length,
                created,
                updated,
                skipped,
                defaultPasswordUsed,
                defaultPasswordHint: defaultPasswordUsed > 0 ? 'Students created without a CSV password were assigned a temporary default password. Ask them to change it after first login.' : null,
                errorCount: errors.length,
                errors,
            },
        });
    } catch (error) {
        console.error('Bulk import students error:', error);
        res.status(500).json({ success: false, message: 'Error importing students' });
    }
};

// ==================== TEACHERS (BULK IMPORT) ====================

const bulkImportTeachers = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const mode = String(req.query.mode || 'skip').toLowerCase() === 'update' ? 'update' : 'skip';

        const file = Array.isArray(req.files) ? req.files[0] : null;
        if (!file) {
            return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
        }

        const rows = [];
        await new Promise((resolve, reject) => {
            Readable.from([file.buffer])
                .pipe(
                    csvParser({
                        mapHeaders: ({ header }) => normalizeCsvKey(header),
                    })
                )
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        let created = 0;
        let updated = 0;
        let skipped = 0;
        let defaultPasswordUsed = 0;
        const errors = [];

        const fallbackPassword = String(process.env.DEFAULT_TEACHER_PASSWORD || '').trim() || 'Teacher@123';

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2;
            try {
                const name = pickCsvValue(raw, ['name', 'teacher_name', 'full_name']);
                const email = pickCsvValue(raw, ['email', 'teacher_email']);
                const phone = pickCsvValue(raw, ['phone', 'mobile', 'contact']);
                const password = pickCsvValue(raw, ['password', 'temp_password', 'temporary_password']);
                const qualification = pickCsvValue(raw, ['qualification', 'degree']);
                const experienceRaw = pickCsvValue(raw, ['experience', 'years_experience', 'years']);
                const specialization = pickCsvValue(raw, ['specialization', 'subject', 'dept', 'department']);

                if (!name || !email) {
                    errors.push({ row: rowNumber, email: email || null, message: 'Missing required: name and/or email' });
                    continue;
                }

                const experience = experienceRaw ? parseInt(experienceRaw, 10) : null;
                if (experienceRaw && Number.isNaN(experience)) {
                    errors.push({ row: rowNumber, email, message: `Invalid experience: ${experienceRaw}` });
                    continue;
                }

                const existingTeacher = await prisma.teacher.findFirst({ where: { collegeId, email } });
                if (existingTeacher) {
                    if (mode === 'skip') {
                        skipped++;
                        continue;
                    }

                    const updateData = { name };
                    if (phone) updateData.phone = phone;
                    if (qualification) updateData.qualification = qualification;
                    if (experience !== null) updateData.experience = experience;
                    if (specialization) updateData.specialization = specialization;

                    await prisma.teacher.update({ where: { id: existingTeacher.id }, data: updateData });

                    if (existingTeacher.userId) {
                        const userUpdate = { name };
                        if (phone) userUpdate.phone = phone;
                        await prisma.user.update({ where: { id: existingTeacher.userId }, data: userUpdate });
                    }

                    if (password) {
                        const hashed = await bcrypt.hash(password, 10);
                        await prisma.teacher.update({ where: { id: existingTeacher.id }, data: { password: hashed } });
                        if (existingTeacher.userId) {
                            await prisma.user.update({ where: { id: existingTeacher.userId }, data: { password: hashed } });
                        }
                    }

                    updated++;
                    continue;
                }

                const existingUser = await prisma.user.findFirst({ where: { collegeId, email } });
                if (existingUser) {
                    errors.push({ row: rowNumber, email, message: 'Email already registered as a user' });
                    continue;
                }

                const effectivePassword = password || fallbackPassword;
                if (!password) defaultPasswordUsed++;
                const hashedPassword = await bcrypt.hash(effectivePassword, 10);

                await prisma.$transaction(async (tx) => {
                    const user = await tx.user.create({
                        data: {
                            name,
                            email,
                            phone: phone || null,
                            password: hashedPassword,
                            role: 'Teacher',
                            collegeId,
                            isEmailVerified: true,
                            isActive: true,
                        },
                    });

                    await tx.teacher.create({
                        data: {
                            name,
                            email,
                            phone: phone || null,
                            password: hashedPassword,
                            qualification: qualification || null,
                            experience,
                            specialization: specialization || null,
                            collegeId,
                            userId: user.id,
                            isActive: true,
                        },
                    });
                });

                created++;
            } catch (rowError) {
                errors.push({
                    row: rowNumber,
                    email: pickCsvValue(raw, ['email', 'teacher_email']) || null,
                    message: rowError?.message || 'Row import failed',
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bulk import completed',
            data: {
                mode,
                totalRows: rows.length,
                created,
                updated,
                skipped,
                defaultPasswordUsed,
                defaultPasswordHint: defaultPasswordUsed > 0 ? 'Teachers created without a CSV password were assigned a temporary default password. Ask them to change it after first login.' : null,
                errorCount: errors.length,
                errors,
            },
        });
    } catch (error) {
        console.error('Bulk import teachers error:', error);
        res.status(500).json({ success: false, message: 'Error importing teachers' });
    }
};

// ==================== CLASSES (BULK IMPORT) ====================

const bulkImportClasses = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const mode = String(req.query.mode || 'skip').toLowerCase() === 'update' ? 'update' : 'skip';

        const file = Array.isArray(req.files) ? req.files[0] : null;
        if (!file) {
            return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
        }

        const rows = [];
        await new Promise((resolve, reject) => {
            Readable.from([file.buffer])
                .pipe(
                    csvParser({
                        mapHeaders: ({ header }) => normalizeCsvKey(header),
                    })
                )
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        let created = 0;
        let updated = 0;
        let skipped = 0;
        const errors = [];

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2;
            try {
                const sclassName = pickCsvValue(raw, ['sclass_name', 'class_name', 'class', 'name']);
                const sclassCode = pickCsvValue(raw, ['sclass_code', 'class_code', 'code']);
                const academicYear = pickCsvValue(raw, ['academic_year', 'year']);
                const description = pickCsvValue(raw, ['description', 'notes']);
                const classTeacherEmail = pickCsvValue(raw, ['class_teacher_email', 'teacher_email', 'teacher']);

                if (!sclassName) {
                    errors.push({ row: rowNumber, code: sclassCode || null, message: 'Missing required: class name' });
                    continue;
                }

                let classTeacherId = null;
                if (classTeacherEmail) {
                    const teacher = await prisma.teacher.findFirst({ where: { collegeId, email: classTeacherEmail } });
                    if (!teacher) {
                        errors.push({ row: rowNumber, code: sclassCode || sclassName, message: `Class teacher not found: ${classTeacherEmail}` });
                        continue;
                    }
                    classTeacherId = teacher.id;
                }

                const existing = sclassCode
                    ? await prisma.sclass.findFirst({ where: { collegeId, sclassCode } })
                    : await prisma.sclass.findFirst({ where: { collegeId, sclassName } });

                if (existing) {
                    if (mode === 'skip') {
                        skipped++;
                        continue;
                    }

                    const updateData = {};
                    if (sclassName) updateData.sclassName = sclassName;
                    if (sclassCode) updateData.sclassCode = sclassCode;
                    if (academicYear) updateData.academicYear = academicYear;
                    if (description) updateData.description = description;
                    if (classTeacherEmail) updateData.classTeacherId = classTeacherId;

                    await prisma.sclass.update({ where: { id: existing.id }, data: updateData });
                    updated++;
                    continue;
                }

                await prisma.sclass.create({
                    data: {
                        sclassName,
                        sclassCode: sclassCode || sclassName,
                        academicYear: academicYear || new Date().getFullYear().toString(),
                        description: description || null,
                        collegeId,
                        classTeacherId: classTeacherEmail ? classTeacherId : null,
                    },
                });

                created++;
            } catch (rowError) {
                errors.push({
                    row: rowNumber,
                    code: pickCsvValue(raw, ['sclass_code', 'class_code', 'code']) || null,
                    message: rowError?.message || 'Row import failed',
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bulk import completed',
            data: {
                mode,
                totalRows: rows.length,
                created,
                updated,
                skipped,
                errorCount: errors.length,
                errors,
            },
        });
    } catch (error) {
        console.error('Bulk import classes error:', error);
        res.status(500).json({ success: false, message: 'Error importing classes' });
    }
};

// ==================== SUBJECTS (BULK IMPORT) ====================

const bulkImportSubjects = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const mode = String(req.query.mode || 'skip').toLowerCase() === 'update' ? 'update' : 'skip';

        const file = Array.isArray(req.files) ? req.files[0] : null;
        if (!file) {
            return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
        }

        const rows = [];
        await new Promise((resolve, reject) => {
            Readable.from([file.buffer])
                .pipe(
                    csvParser({
                        mapHeaders: ({ header }) => normalizeCsvKey(header),
                    })
                )
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        let created = 0;
        let updated = 0;
        let skipped = 0;
        const errors = [];

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2;
            try {
                const subName = pickCsvValue(raw, ['sub_name', 'subject_name', 'name']);
                const subCode = pickCsvValue(raw, ['sub_code', 'subject_code', 'code']);
                const description = pickCsvValue(raw, ['description', 'notes']);
                const sclassIdRaw = pickCsvValue(raw, ['sclass_id', 'class_id']);
                const classCode = pickCsvValue(raw, ['sclass_code', 'class_code']);
                const className = pickCsvValue(raw, ['sclass_name', 'class_name', 'class']);
                const maxMarksRaw = pickCsvValue(raw, ['max_marks', 'maxmarks']);
                const passingMarksRaw = pickCsvValue(raw, ['passing_marks', 'passingmarks']);
                const sessionsRaw = pickCsvValue(raw, ['sessions', 'total_sessions']);
                const teacherEmail = pickCsvValue(raw, ['teacher_email', 'teacher']);

                if (!subName || !subCode) {
                    errors.push({ row: rowNumber, subCode: subCode || null, message: 'Missing required: subName and/or subCode' });
                    continue;
                }

                let sclass = null;
                if (sclassIdRaw) {
                    sclass = await prisma.sclass.findFirst({ where: { collegeId, id: sclassIdRaw } });
                } else if (classCode) {
                    sclass = await prisma.sclass.findFirst({ where: { collegeId, sclassCode: classCode } });
                } else if (className) {
                    sclass = await prisma.sclass.findFirst({ where: { collegeId, sclassName: className } });
                }

                if (!sclass) {
                    errors.push({ row: rowNumber, subCode, message: 'Missing/invalid class reference (sclassId or classCode or className)' });
                    continue;
                }

                let teacherId = null;
                if (teacherEmail) {
                    const teacher = await prisma.teacher.findFirst({ where: { collegeId, email: teacherEmail } });
                    if (!teacher) {
                        errors.push({ row: rowNumber, subCode, message: `Teacher not found: ${teacherEmail}` });
                        continue;
                    }
                    teacherId = teacher.id;
                }

                const maxMarks = maxMarksRaw ? parseInt(maxMarksRaw, 10) : undefined;
                if (maxMarksRaw && Number.isNaN(maxMarks)) {
                    errors.push({ row: rowNumber, subCode, message: `Invalid maxMarks: ${maxMarksRaw}` });
                    continue;
                }

                const passingMarks = passingMarksRaw ? parseInt(passingMarksRaw, 10) : undefined;
                if (passingMarksRaw && Number.isNaN(passingMarks)) {
                    errors.push({ row: rowNumber, subCode, message: `Invalid passingMarks: ${passingMarksRaw}` });
                    continue;
                }

                const sessions = sessionsRaw ? parseInt(sessionsRaw, 10) : undefined;
                if (sessionsRaw && Number.isNaN(sessions)) {
                    errors.push({ row: rowNumber, subCode, message: `Invalid sessions: ${sessionsRaw}` });
                    continue;
                }

                const existing = await prisma.subject.findFirst({ where: { collegeId, sclassId: sclass.id, subCode } });
                if (existing) {
                    if (mode === 'skip') {
                        skipped++;
                        continue;
                    }

                    const updateData = { subName };
                    if (description) updateData.description = description;
                    if (typeof maxMarks === 'number') updateData.maxMarks = maxMarks;
                    if (typeof passingMarks === 'number') updateData.passingMarks = passingMarks;
                    if (typeof sessions === 'number') updateData.sessions = sessions;
                    if (teacherEmail) updateData.teacherId = teacherId;

                    await prisma.subject.update({ where: { id: existing.id }, data: updateData });
                    updated++;
                    continue;
                }

                await prisma.subject.create({
                    data: {
                        subName,
                        subCode,
                        description: description || null,
                        collegeId,
                        sclassId: sclass.id,
                        maxMarks: typeof maxMarks === 'number' ? maxMarks : 100,
                        passingMarks: typeof passingMarks === 'number' ? passingMarks : 40,
                        sessions: typeof sessions === 'number' ? sessions : undefined,
                        teacherId,
                    },
                });

                created++;
            } catch (rowError) {
                errors.push({
                    row: rowNumber,
                    subCode: pickCsvValue(raw, ['sub_code', 'subject_code', 'code']) || null,
                    message: rowError?.message || 'Row import failed',
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bulk import completed',
            data: {
                mode,
                totalRows: rows.length,
                created,
                updated,
                skipped,
                errorCount: errors.length,
                errors,
            },
        });
    } catch (error) {
        console.error('Bulk import subjects error:', error);
        res.status(500).json({ success: false, message: 'Error importing subjects' });
    }
};

// ==================== CLASSES (DETAIL/UPDATE/DELETE) ====================

const getClass = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const sclass = await prisma.sclass.findFirst({
            where: { id, collegeId },
            include: {
                classTeacher: true,
                Subjects: true,
                Sections: true,
                _count: { select: { Students: true, Subjects: true, Teachers: true } },
            },
        });

        if (!sclass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        res.status(200).json({ success: true, data: sclass });
    } catch (error) {
        console.error('Get class error:', error);
        res.status(500).json({ success: false, message: 'Error fetching class' });
    }
};

const updateClass = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;
        const { sclassName, sclassCode, academicYear, description, classTeacherId } = req.body;

        const existing = await prisma.sclass.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        const updated = await prisma.sclass.update({
            where: { id },
            data: {
                sclassName,
                sclassCode,
                academicYear,
                description,
                classTeacherId: classTeacherId === undefined ? undefined : (classTeacherId || null),
            },
        });

        res.status(200).json({ success: true, message: 'Class updated', data: updated });
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({ success: false, message: 'Error updating class' });
    }
};

const deleteClass = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const existing = await prisma.sclass.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        await prisma.sclass.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Class deleted' });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({ success: false, message: 'Error deleting class' });
    }
};

// ==================== SUBJECTS (DETAIL/UPDATE/DELETE) ====================

const getSubject = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const subject = await prisma.subject.findFirst({
            where: { id, collegeId },
            include: { sclass: true, teacher: true },
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({ success: false, message: 'Error fetching subject' });
    }
};

const updateSubject = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;
        const { subName, subCode, description, sclassId, maxMarks, passingMarks, sessions, teacherId } = req.body;

        const existing = await prisma.subject.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        let resolvedTeacherId;
        if (teacherId === undefined) {
            resolvedTeacherId = undefined;
        } else if (!teacherId) {
            resolvedTeacherId = null;
        } else {
            resolvedTeacherId = await resolveTeacherIdForSubject(collegeId, teacherId);
            if (!resolvedTeacherId) {
                return res.status(400).json({ success: false, message: 'Invalid teacherId. Provide a valid Teacher ID or the teacher User ID.' });
            }
        }

        const updated = await prisma.subject.update({
            where: { id },
            data: {
                subName,
                subCode,
                description,
                sclassId: sclassId === undefined ? undefined : sclassId,
                maxMarks: maxMarks === undefined ? undefined : maxMarks,
                passingMarks: passingMarks === undefined ? undefined : passingMarks,
                sessions: sessions === undefined ? undefined : sessions,
                teacherId: resolvedTeacherId,
            },
            include: { sclass: true, teacher: true },
        });

        res.status(200).json({ success: true, message: 'Subject updated', data: updated });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ success: false, message: 'Error updating subject' });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const existing = await prisma.subject.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        await prisma.subject.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Subject deleted' });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ success: false, message: 'Error deleting subject' });
    }
};

// ==================== NOTICES ====================

const createNotice = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { title, description, details, category, priority, attachments, publishedDate, isActive } = req.body;

        if (!collegeId || !title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        const notice = await prisma.notice.create({
            data: {
                title,
                description,
                details: details || null,
                category: category || null,
                priority: priority || 'normal',
                attachments: Array.isArray(attachments) ? attachments : [],
                publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
                collegeId,
                createdBy: req.user?.id || null,
                isActive: isActive === undefined ? true : Boolean(isActive),
            },
        });

        res.status(201).json({ success: true, message: 'Notice created', data: notice });
    } catch (error) {
        console.error('Create notice error:', error);
        res.status(500).json({ success: false, message: 'Error creating notice' });
    }
};

const getNotices = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { active } = req.query;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const filter = { collegeId };
        if (active === 'true') filter.isActive = true;

        const notices = await prisma.notice.findMany({
            where: filter,
            orderBy: { publishedDate: 'desc' },
        });

        res.status(200).json({ success: true, data: notices });
    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({ success: false, message: 'Error fetching notices' });
    }
};

const deleteNotice = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;

        const existing = await prisma.notice.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }

        await prisma.notice.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Notice deleted' });
    } catch (error) {
        console.error('Delete notice error:', error);
        res.status(500).json({ success: false, message: 'Error deleting notice' });
    }
};

// ==================== EXAMS & RESULTS ====================

// Create an exam (used by Admin to publish monthly results, etc.)
const createExam = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const {
            examName,
            examCode,
            description,
            examType,
            totalMarks,
            passingMarks,
            examDate,
            startTime,
            endTime,
            duration,
            isPublished,
            sclassId,
        } = req.body;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        if (!examName || !sclassId) {
            return res.status(400).json({ success: false, message: 'examName and sclassId are required' });
        }

        const klass = await prisma.sclass.findFirst({ where: { id: sclassId, collegeId } });
        if (!klass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        const exam = await prisma.exam.create({
            data: {
                examName: String(examName).trim(),
                examCode: examCode ? String(examCode).trim() : null,
                description: description ? String(description).trim() : null,
                examType: examType ? String(examType).trim() : 'offline',
                totalMarks: totalMarks === undefined || totalMarks === null || totalMarks === '' ? undefined : parseInt(totalMarks),
                passingMarks: passingMarks === undefined || passingMarks === null || passingMarks === '' ? undefined : parseInt(passingMarks),
                examDate: examDate ? new Date(examDate) : null,
                startTime: startTime ? String(startTime).trim() : null,
                endTime: endTime ? String(endTime).trim() : null,
                duration: duration === undefined || duration === null || duration === '' ? null : parseInt(duration),
                isPublished: isPublished === undefined ? true : Boolean(isPublished),
                collegeId,
                sclassId,
            },
            include: { sclass: true },
        });

        return res.status(201).json({ success: true, message: 'Exam created', data: exam });
    } catch (error) {
        console.error('Create exam error:', error);
        return res.status(500).json({ success: false, message: 'Error creating exam' });
    }
};

// Upload marks for a subject within an exam
// Body: { subjectId, marks: [{ studentId, marksObtained, remarks? }] }
const uploadExamMarks = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const examId = String(req.params?.examId || '').trim();
        const { subjectId, marks } = req.body;

        if (!examId || !subjectId || !marks || !Array.isArray(marks)) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam || exam.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject || subject.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        // Ensure subject belongs to the same class as the exam
        if (subject.sclassId !== exam.sclassId) {
            return res.status(400).json({ success: false, message: 'Subject does not belong to the exam class' });
        }

        let created = 0;
        let updated = 0;

        for (const markData of marks) {
            if (!markData?.studentId) continue;

            const existing = await prisma.examResult.findFirst({
                where: {
                    studentId: markData.studentId,
                    subjectId,
                    examId,
                },
            });

            const marksObtained = parseFloat(markData.marksObtained);
            if (!Number.isFinite(marksObtained)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid marks for studentId ${markData.studentId}`,
                });
            }

            const percentage = (marksObtained / (subject.maxMarks || 100)) * 100;
            const percentageValue = Number(percentage.toFixed(2));
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            if (existing) {
                await prisma.examResult.update({
                    where: { id: existing.id },
                    data: {
                        marksObtained,
                        percentage: percentageValue,
                        grade,
                        remarks: markData.remarks || null,
                    },
                });
                updated++;
            } else {
                await prisma.examResult.create({
                    data: {
                        studentId: markData.studentId,
                        subjectId,
                        examId,
                        collegeId,
                        marksObtained,
                        percentage: percentageValue,
                        grade,
                        remarks: markData.remarks || null,
                    },
                });
                created++;
            }
        }

        return res.status(201).json({
            success: true,
            message: `Marks uploaded: ${created} created, ${updated} updated`,
            data: { created, updated },
        });
    } catch (error) {
        console.error('Upload exam marks error:', error);
        return res.status(500).json({ success: false, message: 'Error uploading marks' });
    }
};

// List exams (used by Admin UI to edit/re-upload results)
const listExams = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { sclassId } = req.query;

        const filter = { collegeId };
        if (sclassId) filter.sclassId = String(sclassId);

        const exams = await prisma.exam.findMany({
            where: filter,
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({ success: true, data: exams });
    } catch (error) {
        console.error('List exams error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching exams' });
    }
};

// Get existing marks for an exam+subject (used for editable/prefill UI)
const getExamMarks = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const examId = String(req.params?.examId || '').trim();
        const subjectId = String(req.query?.subjectId || req.body?.subjectId || '').trim();

        if (!examId || !subjectId) {
            return res.status(400).json({ success: false, message: 'examId and subjectId are required' });
        }

        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam || exam.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject || subject.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        if (String(subject.sclassId) !== String(exam.sclassId)) {
            return res.status(400).json({ success: false, message: 'Subject does not belong to the exam class' });
        }

        const results = await prisma.examResult.findMany({
            where: { collegeId, examId, subjectId },
            include: {
                student: { select: { id: true, name: true, studentId: true, email: true, sclassId: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Get exam marks error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching marks' });
    }
};

// Bulk import marks from CSV (multipart/form-data: file)
// Query/body: subjectId
// Columns supported: student_id/studentId/email/id, marks/marks_obtained/score, remarks
const importExamMarksCsv = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const examId = String(req.params?.examId || '').trim();
        const subjectId = String(req.body?.subjectId || req.query?.subjectId || '').trim();

        if (!examId || !subjectId) {
            return res.status(400).json({ success: false, message: 'examId and subjectId are required' });
        }

        const file = Array.isArray(req.files) ? req.files[0] : null;
        if (!file) {
            return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
        }

        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam || exam.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject || subject.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        if (String(subject.sclassId) !== String(exam.sclassId)) {
            return res.status(400).json({ success: false, message: 'Subject does not belong to the exam class' });
        }

        const rows = [];
        await new Promise((resolve, reject) => {
            Readable.from([file.buffer])
                .pipe(
                    csvParser({
                        mapHeaders: ({ header }) => normalizeCsvKey(header),
                    })
                )
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        const students = await prisma.student.findMany({
            where: {
                collegeId,
                sclassId: exam.sclassId,
                isDeleted: false,
            },
            select: { id: true, studentId: true, email: true },
        });

        const byDbId = new Map(students.map((s) => [String(s.id), s]));
        const byStudentId = new Map(students.map((s) => [String(s.studentId), s]));
        const byEmail = new Map(students.filter((s) => s.email).map((s) => [String(s.email).toLowerCase(), s]));

        const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        let created = 0;
        let updated = 0;
        let skipped = 0;
        const errors = [];

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2;

            const studentKey = pickCsvValue(raw, ['student_db_id', 'student_uuid', 'id', 'student_id', 'studentid', 'studentId', 'email']);
            const marksRaw = pickCsvValue(raw, ['marks_obtained', 'marksobtained', 'marks', 'score']);
            const remarks = pickCsvValue(raw, ['remarks', 'remark', 'comment']);

            if (!studentKey || !marksRaw) {
                skipped++;
                continue;
            }

            const marksObtained = parseFloat(marksRaw);
            if (!Number.isFinite(marksObtained)) {
                errors.push({ row: rowNumber, student: studentKey, message: 'Invalid marks' });
                continue;
            }

            let student = null;
            if (uuidLike.test(studentKey)) {
                student = byDbId.get(studentKey) || null;
            } else if (studentKey.includes('@')) {
                student = byEmail.get(studentKey.toLowerCase()) || null;
            } else {
                student = byStudentId.get(studentKey) || null;
            }

            if (!student) {
                errors.push({ row: rowNumber, student: studentKey, message: 'Student not found in this class' });
                continue;
            }

            const percentage = (marksObtained / (subject.maxMarks || 100)) * 100;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            const exists = await prisma.examResult.findUnique({
                where: {
                    studentId_subjectId_examId: {
                        studentId: student.id,
                        subjectId,
                        examId,
                    },
                },
                select: { id: true },
            });

            await prisma.examResult.upsert({
                where: {
                    studentId_subjectId_examId: {
                        studentId: student.id,
                        subjectId,
                        examId,
                    },
                },
                update: {
                    marksObtained,
                    percentage: Number(percentage.toFixed(2)),
                    grade,
                    remarks: remarks || null,
                },
                create: {
                    studentId: student.id,
                    subjectId,
                    examId,
                    collegeId,
                    marksObtained,
                    percentage: Number(percentage.toFixed(2)),
                    grade,
                    remarks: remarks || null,
                },
            });

            if (exists) updated++;
            else created++;
        }

        return res.status(200).json({
            success: true,
            message: `Imported marks: ${created} created, ${updated} updated, ${skipped} skipped`,
            data: { created, updated, skipped, errors: errors.slice(0, 50) },
        });
    } catch (error) {
        console.error('Import exam marks CSV error:', error);
        return res.status(500).json({ success: false, message: 'Error importing marks' });
    }
};

// ==================== COMPLAINTS ====================

const getComplaints = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { status, page = 1, limit = 20 } = req.query;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;
        const filter = { collegeId };
        if (status) filter.status = status;

        const complaints = await prisma.complain.findMany({
            where: filter,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                student: { select: { id: true, name: true, studentId: true } },
                parent: { select: { id: true, name: true, phone: true } },
                teacher: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.complain.count({ where: filter });

        res.status(200).json({
            success: true,
            data: complaints,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ success: false, message: 'Error fetching complaints' });
    }
};

const updateComplaint = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { id } = req.params;
        const { status, adminResponse, priority } = req.body;

        const existing = await prisma.complain.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        const updated = await prisma.complain.update({
            where: { id },
            data: {
                status: status === undefined ? undefined : status,
                adminResponse: adminResponse === undefined ? undefined : adminResponse,
                priority: priority === undefined ? undefined : priority,
                resolvedDate: status === 'resolved' ? new Date() : undefined,
            },
        });

        res.status(200).json({ success: true, message: 'Complaint updated', data: updated });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ success: false, message: 'Error updating complaint' });
    }
};

module.exports = {
    getCollegeSettings,
    updateCollegeSettings,
    requestCustomDomain,
    listMyDomains,
    getAdminProfile,
    updateAdminProfile,
    createTeacher,
    createStudent,
    getAllStudents,
    getAllTeachers,
    getTeacher,
    updateTeacher,
    deleteTeacher,
    getStudent,
    updateStudent,
    deleteStudent,
    bulkImportStudents,
    bulkImportTeachers,
    bulkImportClasses,
    bulkImportSubjects,
    createTeamMember,
    getTeamMembers,
    createClass,
    getAllClasses,
    getClass,
    updateClass,
    deleteClass,
    createSubject,
    getSubjects,
    getSubject,
    updateSubject,
    deleteSubject,
    defineFeeStructure,
    getDashboard,
    getFees,
    updateFee,
    deleteFee,
    bulkImportFees,
    createNotice,
    getNotices,
    deleteNotice,
    createExam,
    uploadExamMarks,
    listExams,
    getExamMarks,
    importExamMarksCsv,
    getComplaints,
    updateComplaint,
    getTeacherSections,
    setTeacherSections,
};

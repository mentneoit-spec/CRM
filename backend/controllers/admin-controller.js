const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');

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

        // Validate input
        if (!name || !email || !password || !collegeId) {
            return res.status(400).json({
                success: false,
                message: 'Required fields missing'
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
            where: { email, collegeId },
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
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
                email,
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
        const { name, studentId, email, phone, password, sclassId, sectionId, parentName, parentPhone } = req.body;

        if (!name || !studentId || !password || !collegeId || !sclassId) {
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
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
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
                email,
                phone,
                password: hashedPassword,
                parentName,
                parentPhone,
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

        if (!name || !email || !password || !collegeId || !role) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const validRoles = ['AdmissionTeam', 'AccountsTeam', 'TransportTeam'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid team role' });
        }

        const existingUser = await prisma.user.findFirst({
            where: { email, collegeId },
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, phone, role, collegeId, isEmailVerified: true, isActive: true },
        });

        let teamProfile;
        if (role === 'AdmissionTeam') {
            teamProfile = await prisma.admissionTeam.create({ data: { name, email, phone, collegeId, userId: user.id } });
        } else if (role === 'AccountsTeam') {
            teamProfile = await prisma.accountsTeam.create({ data: { name, email, phone, collegeId, userId: user.id } });
        } else if (role === 'TransportTeam') {
            teamProfile = await prisma.transportTeam.create({ data: { name, email, phone, collegeId, userId: user.id } });
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

        const subject = await prisma.subject.create({
            data: {
                subName,
                subCode,
                description,
                collegeId,
                sclassId,
                maxMarks: maxMarks || 100,
                passingMarks: passingMarks || 40,
                teacherId: teacherId || null,
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

// Define fee structure
const defineFeeStructure = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { feeType, amount, dueDate, frequency, sclassId, description } = req.body;

        if (!collegeId || !feeType || !amount) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        // For now, we'll store this in Fee model per student
        // Later can create a FeeStructure model for college-wide fees

        res.status(201).json({
            success: true,
            message: 'Fee structure will be applied to students',
            data: { feeType, amount, dueDate, frequency },
        });
    } catch (error) {
        console.error('Define fee error:', error);
        res.status(500).json({ success: false, message: 'Error defining fees' });
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
        const collegeId = req.collegeId;
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
            isActive,
        } = req.body;

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
                teacherId: teacherId === undefined ? undefined : (teacherId || null),
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
    createNotice,
    getNotices,
    deleteNotice,
    getComplaints,
    updateComplaint,
};

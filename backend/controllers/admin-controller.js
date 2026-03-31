const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');
const { Readable } = require('stream');
const csvParser = require('csv-parser');
const nodemailer = require('nodemailer');

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
            rollNum,
            sclassId,
            sectionId,
            parentName,
            parentPhone,
            board,
            group,
            customClassName,
        } = req.body;

        const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
        
        // Use rollNum as password if not provided
        const passwordInput = String(password || rollNum || '').trim();

        const integratedCourse = req.body.integratedCourse ?? req.body.integrated_course;
        const profileImage = req.body.profileImage ?? req.body.profile_image;

        if (!name || !studentId || !collegeId) {
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

        // Auto-generate email if not provided
        let generatedEmail = normalizedEmail;
        if (!generatedEmail) {
            const emailBase = `${studentId.toLowerCase().replace(/\s+/g, '.')}@${college.name.toLowerCase().replace(/\s+/g, '')}.student`;
            generatedEmail = emailBase;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(passwordInput, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email: generatedEmail,
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
                email: generatedEmail,
                phone,
                password: hashedPassword,
                rollNum: rollNum ? parseInt(rollNum) : null,
                parentName,
                parentPhone,
                profileImage,
                board,
                integratedCourse,
                group,
                collegeId,
                sclassId: sclassId || null,
                sectionId: sectionId || null,
                customClassName: customClassName || null,
                userId: user.id,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: { 
                user, 
                student,
                loginCredentials: {
                    email: generatedEmail,
                    password: passwordInput,
                    note: 'Student can use these credentials to login'
                }
            },
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
            select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
                rollNum: true,
                phone: true,
                isActive: true,
                createdAt: true,
                sclass: { select: { id: true, sclassName: true } },
                section: { select: { id: true, sectionName: true } },
                parent: { select: { id: true, name: true, email: true } },
                Fees: { select: { id: true, feeType: true, amount: true, dueDate: true } },
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
        const { page = 1, limit = 50 } = req.query;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;

        const teachers = await prisma.teacher.findMany({
            where: { collegeId, isActive: true },
            skip: parseInt(skip),
            take: parseInt(limit),
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                qualification: true,
                experience: true,
                specialization: true,
                isActive: true,
                createdAt: true,
                Subjects: { select: { id: true, subName: true } },
                ClassTeacherOf: { select: { id: true, sclassName: true } },
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
        const { page = 1, limit = 50 } = req.query;
        
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;

        const admissions = await prisma.admissionTeam.findMany({ 
            where: { collegeId }, 
            skip: parseInt(skip),
            take: parseInt(limit),
            select: { id: true, name: true, email: true, phone: true, createdAt: true, user: { select: { id: true } } },
            orderBy: { createdAt: 'desc' } 
        });
        
        const accounts = await prisma.accountsTeam.findMany({ 
            where: { collegeId }, 
            skip: parseInt(skip),
            take: parseInt(limit),
            select: { id: true, name: true, email: true, phone: true, createdAt: true, user: { select: { id: true } } },
            orderBy: { createdAt: 'desc' } 
        });
        
        const transport = await prisma.transportTeam.findMany({ 
            where: { collegeId }, 
            skip: parseInt(skip),
            take: parseInt(limit),
            select: { id: true, name: true, email: true, phone: true, createdAt: true, user: { select: { id: true } } },
            orderBy: { createdAt: 'desc' } 
        });

        const total = await Promise.all([
            prisma.admissionTeam.count({ where: { collegeId } }),
            prisma.accountsTeam.count({ where: { collegeId } }),
            prisma.transportTeam.count({ where: { collegeId } })
        ]).then(counts => counts.reduce((a, b) => a + b, 0));

        const data = [
            ...admissions.map(a => ({ ...a, role: 'AdmissionTeam' })), 
            ...accounts.map(a => ({ ...a, role: 'AccountsTeam' })), 
            ...transport.map(a => ({ ...a, role: 'TransportTeam' }))
        ];

        res.status(200).json({ 
            success: true, 
            data,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
            }
        });
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
        const { page = 1, limit = 50 } = req.query;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;

        const classes = await prisma.sclass.findMany({
            where: { collegeId },
            skip: parseInt(skip),
            take: parseInt(limit),
            select: {
                id: true,
                sclassName: true,
                createdAt: true,
                classTeacher: { select: { id: true, name: true } },
                Subjects: { select: { id: true, subName: true } },
                Students: { select: { id: true, name: true } },
                Sections: { select: { id: true, sectionName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.sclass.count({ where: { collegeId } });

        res.status(200).json({
            success: true,
            data: classes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
            },
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
        const { page = 1, limit = 50 } = req.query;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;

        const subjects = await prisma.subject.findMany({
            where: { collegeId },
            skip: parseInt(skip),
            take: parseInt(limit),
            select: {
                id: true,
                subName: true,
                subCode: true,
                description: true,
                maxMarks: true,
                passingMarks: true,
                createdAt: true,
                sclass: { select: { id: true, sclassName: true } },
                teacher: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.subject.count({ where: { collegeId } });

        res.status(200).json({
            success: true,
            data: subjects,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
            },
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

        // Run all queries in parallel for better performance
        const [
            college,
            studentCount,
            teacherCount,
            classCount,
            revenueData,
            admissionPending,
            recentPayments,
            admissionsByStatusRaw,
            classesWithCounts,
        ] = await Promise.all([
            prisma.college.findUnique({ where: { id: collegeId } }),
            prisma.student.count({ where: { collegeId, isDeleted: false } }),
            prisma.teacher.count({ where: { collegeId, isActive: true } }),
            prisma.sclass.count({ where: { collegeId } }),
            prisma.payment.aggregate({
                where: { collegeId, status: 'completed' },
                _sum: { amount: true },
            }),
            prisma.admission.count({ where: { collegeId, status: 'pending' } }),
            prisma.payment.findMany({
                where: { collegeId, status: 'completed' },
                take: 5,
                select: {
                    id: true,
                    amount: true,
                    createdAt: true,
                    student: { select: { id: true, name: true, studentId: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.admission.groupBy({
                by: ['status'],
                where: { collegeId },
                _count: { _all: true },
            }),
            prisma.sclass.findMany({
                where: { collegeId },
                select: {
                    id: true,
                    sclassName: true,
                    _count: {
                        select: {
                            Students: { where: { isDeleted: false } },
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

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

        const admissionsByStatusMap = new Map(
            admissionsByStatusRaw.map((r) => [String(r.status || '').toLowerCase(), r._count._all])
        );
        const admissionsByStatus = [
            { status: 'Approved', value: admissionsByStatusMap.get('approved') || 0 },
            { status: 'Pending', value: admissionsByStatusMap.get('pending') || 0 },
            { status: 'Rejected', value: admissionsByStatusMap.get('rejected') || 0 },
        ];

        const studentsByClass = classesWithCounts.map((c) => ({
            classId: c.id,
            className: c.sclassName,
            students: c._count?.Students ?? 0,
        }));

        // --- Fee Management Data ---
        // Get all fees with payment information
        const allFees = await prisma.fee.findMany({
            where: { collegeId, isActive: true },
            select: {
                id: true,
                amount: true,
                dueDate: true,
                studentId: true,
                student: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true,
                        sclass: { select: { id: true, sclassName: true } },
                    },
                },
            },
        });

        // Get all payments
        const allPayments = await prisma.payment.findMany({
            where: { collegeId, status: 'completed' },
            select: {
                studentId: true,
                amount: true,
            },
        });

        // Calculate payment totals per student
        const paymentsByStudent = new Map();
        for (const payment of allPayments) {
            const current = paymentsByStudent.get(payment.studentId) || 0;
            paymentsByStudent.set(payment.studentId, current + Number(payment.amount));
        }

        // Calculate fee statistics
        let totalDues = 0;
        let totalCollected = 0;
        let overdueCount = 0;
        const feesByClass = new Map();
        const currentDate = new Date();

        for (const fee of allFees) {
            const feeAmount = Number(fee.amount) || 0;
            totalDues += feeAmount;

            const paidAmount = paymentsByStudent.get(fee.studentId) || 0;
            totalCollected += Math.min(paidAmount, feeAmount);

            // Check if overdue
            const dueDate = new Date(fee.dueDate);
            if (dueDate < currentDate && paidAmount < feeAmount) {
                overdueCount++;
            }

            // Group by class
            const className = fee.student?.sclass?.sclassName || 'Unassigned';
            if (!feesByClass.has(className)) {
                feesByClass.set(className, {
                    className,
                    totalDues: 0,
                    collected: 0,
                    studentCount: new Set(),
                });
            }
            const classData = feesByClass.get(className);
            classData.totalDues += feeAmount;
            classData.collected += Math.min(paidAmount, feeAmount);
            classData.studentCount.add(fee.studentId);
        }

        // Format fee collection by class
        const feeCollectionByClass = Array.from(feesByClass.values())
            .map((classData) => ({
                className: classData.className,
                totalDues: classData.totalDues,
                collected: classData.collected,
                pending: classData.totalDues - classData.collected,
                collectionRate: classData.totalDues > 0 
                    ? Math.round((classData.collected / classData.totalDues) * 100) 
                    : 0,
                studentCount: classData.studentCount.size,
            }))
            .sort((a, b) => b.totalDues - a.totalDues);

        const totalPending = totalDues - totalCollected;
        const overallCollectionRate = totalDues > 0 
            ? Math.round((totalCollected / totalDues) * 100) 
            : 0;

        // Get recent fee records with payment status
        const recentFeeRecords = await prisma.fee.findMany({
            where: { collegeId, isActive: true },
            take: 5,
            select: {
                id: true,
                amount: true,
                dueDate: true,
                feeType: true,
                student: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true,
                        sclass: { select: { sclassName: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const recentFeesWithStatus = recentFeeRecords.map((fee) => {
            const paidAmount = paymentsByStudent.get(fee.student.id) || 0;
            const feeAmount = Number(fee.amount) || 0;
            const dueDate = new Date(fee.dueDate);
            const isPaid = paidAmount >= feeAmount;
            const isOverdue = dueDate < currentDate && !isPaid;

            return {
                ...fee,
                paidAmount,
                dueAmount: Math.max(0, feeAmount - paidAmount),
                status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
            };
        });

        // --- Subject Performance Data ---
        // Get all subjects for the college
        const subjects = await prisma.subject.findMany({
            where: { collegeId },
            select: { 
                id: true, 
                subName: true, 
                maxMarks: true,
                subCode: true 
            },
        });

        // Get all exam results with marks
        const examResults = await prisma.examResult.findMany({
            where: { 
                exam: { collegeId },
                isAbsent: false,
            },
            select: {
                subjectId: true,
                marksObtained: true,
                percentage: true,
                subject: {
                    select: { 
                        maxMarks: true,
                        subName: true 
                    }
                }
            },
        });

        // Calculate subject performance grouped by subject NAME (not ID)
        const subjectPerformanceByName = new Map();
        
        for (const result of examResults) {
            if (!result.subjectId || result.marksObtained == null) continue;
            
            const subjectName = result.subject?.subName;
            if (!subjectName) continue;
            
            if (!subjectPerformanceByName.has(subjectName)) {
                subjectPerformanceByName.set(subjectName, {
                    totalMarks: 0,
                    obtainedMarks: 0,
                    count: 0,
                });
            }
            
            const data = subjectPerformanceByName.get(subjectName);
            const maxMarks = result.subject?.maxMarks || 100;
            data.totalMarks += maxMarks;
            data.obtainedMarks += Number(result.marksObtained);
            data.count += 1;
        }

        // Get unique subject names
        const uniqueSubjectNames = new Set(subjects.map(s => s.subName));

        // Format subject performance with actual data (unique subjects only)
        const subjectPerformance = Array.from(uniqueSubjectNames).map((subjectName) => {
            const perfData = subjectPerformanceByName.get(subjectName);
            
            if (!perfData || perfData.count === 0) {
                return null; // Will be filtered out
            }

            const percentage = Math.round((perfData.obtainedMarks / perfData.totalMarks) * 100);
            
            // Assign colors based on performance
            let color = '#667eea'; // default blue
            if (percentage >= 80) color = '#43e97b'; // green
            else if (percentage >= 70) color = '#4facfe'; // light blue
            else if (percentage >= 60) color = '#feca57'; // yellow
            else if (percentage >= 50) color = '#fa709a'; // pink
            else color = '#f5576c'; // red

            return {
                subject: subjectName,
                percentage,
                change: '+0%',
                color,
                changeColor: '#43e97b',
                hasData: true,
                resultCount: perfData.count
            };
        }).filter(s => s !== null) // Only show subjects with data
          .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending

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
                subjectPerformance,
                feeManagement: {
                    totalDues,
                    totalCollected,
                    totalPending,
                    overallCollectionRate,
                    overdueStudents: overdueCount,
                    feeCollectionByClass,
                    recentFees: recentFeesWithStatus,
                },
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
        const { page = 1, limit = 50, status } = req.query;
        
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;

        // Get all fees with student and payment information
        const fees = await prisma.fee.findMany({
            where: { collegeId, isActive: true },
            select: {
                id: true,
                feeType: true,
                feeCategory: true,
                amount: true,
                dueDate: true,
                frequency: true,
                isActive: true,
                createdAt: true,
                studentId: true,
                student: { 
                    select: { 
                        id: true, 
                        name: true, 
                        studentId: true,
                        sclass: { select: { sclassName: true } } 
                    } 
                },
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get all payments for these students
        const studentIds = fees.map(fee => fee.studentId);
        const payments = await prisma.payment.findMany({
            where: { 
                collegeId, 
                studentId: { in: studentIds },
                status: 'completed' 
            },
            select: {
                studentId: true,
                amount: true,
            },
        });

        // Calculate payment totals per student
        const paymentsByStudent = new Map();
        for (const payment of payments) {
            const current = paymentsByStudent.get(payment.studentId) || 0;
            paymentsByStudent.set(payment.studentId, current + Number(payment.amount));
        }

        // Process fees with payment information and status
        const currentDate = new Date();
        const processedFees = fees.map(fee => {
            const feeAmount = Number(fee.amount) || 0;
            const paidAmount = paymentsByStudent.get(fee.studentId) || 0;
            const dueAmount = Math.max(0, feeAmount - paidAmount);
            const dueDate = new Date(fee.dueDate);
            
            // Determine fee status
            let feeStatus = 'pending';
            if (paidAmount >= feeAmount) {
                feeStatus = 'completed';
            } else if (dueDate < currentDate) {
                feeStatus = 'overdue';
            }

            return {
                id: fee.id,
                name: fee.student?.name || 'Unknown',
                studentId: fee.student?.studentId || 'N/A',
                class: fee.student?.sclass?.sclassName || 'N/A',
                totalFee: feeAmount,
                paidAmount,
                dueAmount,
                dueDate: fee.dueDate,
                feeStatus,
                feeType: fee.feeType,
                feeCategory: fee.feeCategory,
                student: fee.student,
                createdAt: fee.createdAt
            };
        });

        // Apply status filter if provided
        let filteredFees = processedFees;
        if (status && status !== 'all') {
            filteredFees = processedFees.filter(fee => fee.feeStatus === status);
        }

        // Apply pagination to filtered results
        const paginatedFees = filteredFees.slice(skip, skip + parseInt(limit));
        const total = filteredFees.length;

        // Calculate summary statistics
        const totalFees = processedFees.reduce((sum, fee) => sum + fee.totalFee, 0);
        const totalCollected = processedFees.reduce((sum, fee) => sum + fee.paidAmount, 0);
        const totalDue = processedFees.reduce((sum, fee) => sum + fee.dueAmount, 0);
        const completedCount = processedFees.filter(fee => fee.feeStatus === 'completed').length;
        const pendingCount = processedFees.filter(fee => fee.feeStatus === 'pending').length;
        const overdueCount = processedFees.filter(fee => fee.feeStatus === 'overdue').length;

        res.status(200).json({ 
            success: true, 
            data: paginatedFees,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
            summary: {
                totalFees,
                totalCollected,
                totalDue,
                totalStudents: processedFees.length,
                completedCount,
                pendingCount,
                overdueCount,
                collectionRate: totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 0
            }
        });
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
        const errors = [];
        const createdStudents = []; // Track created students with login credentials

        const college = await prisma.college.findUnique({ where: { id: collegeId } });

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
                const rollNumRaw = pickCsvValue(raw, ['roll_number', 'roll_num', 'rollnumber', 'rollnum', 'roll']);

                const email = emailRaw || (looksLikeEmail(contactRaw) ? contactRaw : '');
                const phone = phoneRaw || (!looksLikeEmail(contactRaw) ? contactRaw : '');
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
                        // Auto-create missing class
                        try {
                            sclass = await prisma.sclass.create({
                                data: {
                                    sclassName: classNameTrimmed,
                                    collegeId,
                                },
                            });
                        } catch (createError) {
                            errors.push({ row: rowNumber, studentId, message: `Failed to create class: ${className}` });
                            continue;
                        }
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
                        // Auto-create missing section
                        try {
                            section = await prisma.section.create({
                                data: {
                                    sectionName: String(sectionName).trim(),
                                    sclassId: sclass.id,
                                    collegeId,
                                },
                            });
                        } catch (createError) {
                            errors.push({ row: rowNumber, studentId, message: `Failed to create section: ${sectionName} (Class: ${className})` });
                            continue;
                        }
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
                    if (rollNumRaw) updateData.rollNum = parseInt(rollNumRaw);

                    await prisma.student.update({ where: { id: existingStudent.id }, data: updateData });

                    if (existingStudent.userId) {
                        const userUpdate = { name: normalizedName };
                        if (email) userUpdate.email = email;
                        if (phone) userUpdate.phone = phone;
                        if (profileImage) userUpdate.profileImage = profileImage;
                        await prisma.user.update({ where: { id: existingStudent.userId }, data: userUpdate });
                    }

                    updated++;
                    continue;
                }

                if (!sclass) {
                    errors.push({ row: rowNumber, studentId, message: 'Missing required: Class' });
                    continue;
                }

                // Use rollNum as password, fallback to studentId
                const passwordForStudent = rollNumRaw || studentId;
                
                // Auto-generate email if not provided
                let generatedEmail = email;
                if (!generatedEmail && college) {
                    const emailBase = `${studentId.toLowerCase().replace(/\s+/g, '.')}@${college.name.toLowerCase().replace(/\s+/g, '')}.student`;
                    generatedEmail = emailBase;
                }

                const hashedPassword = await bcrypt.hash(String(passwordForStudent), 10);

                await prisma.$transaction(async (tx) => {
                    const user = await tx.user.create({
                        data: {
                            name: normalizedName,
                            email: generatedEmail || null,
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
                            email: generatedEmail || null,
                            phone: phone || null,
                            password: hashedPassword,
                            rollNum: rollNumRaw ? parseInt(rollNumRaw) : null,
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

                // Track created student with login credentials
                createdStudents.push({
                    studentId,
                    name: normalizedName,
                    email: generatedEmail,
                    password: String(passwordForStudent),
                    rollNum: rollNumRaw || null,
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
                errorCount: errors.length,
                errors,
                createdStudents, // Include login credentials for created students
                note: 'Students created without email were auto-generated with format: studentid@collegename.student. Password is the roll number or student ID.'
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

// Download payment receipt (admin can download any receipt)
const downloadPaymentReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const collegeId = req.collegeId;

        // Verify payment exists and belongs to this college
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { student: true }
        });

        if (!payment || payment.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Receipt only available for completed payments' });
        }

        // Generate receipt on demand
        const { generatePaymentReceipt } = require('../utils/payment-receipt');
        const receiptData = await generatePaymentReceipt({
            paymentId: payment.id,
            studentName: payment.student?.name || 'Student',
            studentId: payment.student?.studentId || 'N/A',
            collegeName: payment.student?.college?.name || 'School',
            amount: payment.amount,
            feeType: payment.notes,
            paymentDate: payment.paymentDate,
            transactionId: payment.razorpayPaymentId,
            paymentMethod: payment.paymentMethod,
        });

        // Send file
        res.download(receiptData.filepath, `receipt_${paymentId}.pdf`);
    } catch (error) {
        console.error('Download receipt error:', error);
        res.status(500).json({ success: false, message: 'Error downloading receipt' });
    }
};
getAnalytics = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        console.log('Fetching analytics for collegeId:', collegeId);

        // Fetch all analytics data in parallel
        const [
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects,
            totalAdmissions,
            totalFees,
            totalPayments,
            completedPayments,
            pendingPayments,
            studentsByClass,
            admissionsByStatus,
            feesByType,
            paymentsByMonth,
            attendanceStats,
            examStats,
            resultStats,
        ] = await Promise.all([
            // Student stats
            prisma.student.count({ where: { collegeId, isDeleted: false } }),
            prisma.teacher.count({ where: { collegeId, isActive: true } }),
            prisma.sclass.count({ where: { collegeId } }),
            prisma.subject.count({ where: { collegeId } }),

            // Admission stats
            prisma.admission.count({ where: { collegeId } }),

            // Fee stats
            prisma.fee.count({ where: { collegeId } }),
            prisma.payment.count({ where: { collegeId } }),
            prisma.payment.count({ where: { collegeId, status: 'completed' } }),
            prisma.payment.count({ where: { collegeId, status: 'pending' } }),

            // Students by class
            prisma.sclass.findMany({
                where: { collegeId },
                select: {
                    sclassName: true,
                    _count: { select: { Students: { where: { isDeleted: false } } } },
                },
            }),

            // Admissions by status
            prisma.admission.groupBy({
                by: ['status'],
                where: { collegeId },
                _count: { _all: true },
            }),

            // Fees by type
            prisma.fee.groupBy({
                by: ['feeType'],
                where: { collegeId },
                _count: { _all: true },
                _sum: { amount: true },
            }),

            // Payments by month (last 6 months)
            prisma.payment.findMany({
                where: {
                    collegeId,
                    status: 'completed',
                    createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
                },
                select: { amount: true, createdAt: true },
            }),

            // Attendance stats
            prisma.attendance.aggregate({
                where: { collegeId },
                _count: { _all: true },
            }),

            // Exam stats
            prisma.exam.count({ where: { collegeId } }),

            // Result stats
            prisma.examResult.aggregate({
                where: { collegeId },
                _count: { _all: true },
                _avg: { marksObtained: true },
            }),
        ]);

        // Process students by class
        const classData = studentsByClass.map(c => ({
            name: c.sclassName,
            students: c._count.Students,
        }));

        // Process admissions by status
        const admissionData = admissionsByStatus.map(a => ({
            status: a.status || 'Unknown',
            count: a._count._all,
        }));

        // Process fees by type
        const feeData = feesByType.map(f => ({
            type: f.feeType,
            count: f._count._all,
            total: f._sum.amount || 0,
        }));

        // Process payments by month
        const monthMap = new Map();
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            monthMap.set(key, 0);
        }

        paymentsByMonth.forEach(p => {
            const d = new Date(p.createdAt);
            const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            if (monthMap.has(key)) {
                monthMap.set(key, (monthMap.get(key) || 0) + (p.amount || 0));
            }
        });

        const revenueData = Array.from(monthMap.entries()).map(([month, revenue]) => ({
            month,
            revenue,
        }));

        // Calculate average marks
        const avgMarks = resultStats._avg.marksObtained || 0;

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalStudents,
                    totalTeachers,
                    totalClasses,
                    totalSubjects,
                    totalAdmissions,
                    totalFees,
                    totalPayments,
                    completedPayments,
                    pendingPayments,
                    totalAttendance: attendanceStats._count._all,
                    totalExams: examStats,
                    totalResults: resultStats._count._all,
                    averageMarks: Math.round(avgMarks * 100) / 100,
                },
                charts: {
                    studentsByClass: classData,
                    admissionsByStatus: admissionData,
                    feesByType: feeData,
                    revenueByMonth: revenueData,
                },
            },
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
    }
}

// ==================== RESULTS ====================

// Get all exam results with filtering
const getResults = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { classId, subjectId, examId, studentId, page = 1, limit = 50 } = req.query;

        const filter = { collegeId };
        if (classId) filter.exam = { sclassId: classId };
        if (subjectId) filter.subjectId = subjectId;
        if (examId) filter.examId = examId;
        if (studentId) filter.studentId = studentId;

        const results = await prisma.examResult.findMany({
            where: filter,
            include: {
                student: { select: { id: true, name: true, studentId: true, email: true } },
                subject: { select: { id: true, subName: true, subCode: true } },
                exam: { select: { id: true, examName: true, examDate: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        });

        const total = await prisma.examResult.count({ where: filter });

        res.status(200).json({
            success: true,
            data: results,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ success: false, message: 'Error fetching results' });
    }
};

// Upload marks for multiple students
const uploadMarksAdmin = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { examId, subjectId, marks } = req.body;

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

        let created = 0;
        let updated = 0;

        for (const markData of marks) {
            if (!markData?.studentId) continue;

            const marksObtained = parseFloat(markData.marksObtained);
            if (!Number.isFinite(marksObtained)) continue;

            const percentage = (marksObtained / (subject.maxMarks || 100)) * 100;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            const existing = await prisma.examResult.findFirst({
                where: {
                    studentId: markData.studentId,
                    subjectId,
                    examId,
                },
            });

            if (existing) {
                await prisma.examResult.update({
                    where: { id: existing.id },
                    data: {
                        marksObtained,
                        percentage: Number(percentage.toFixed(2)),
                        grade,
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
                        percentage: Number(percentage.toFixed(2)),
                        grade,
                    },
                });
                created++;
            }
        }

        res.status(201).json({
            success: true,
            message: `Marks uploaded: ${created} created, ${updated} updated`,
            data: { created, updated },
        });
    } catch (error) {
        console.error('Upload marks error:', error);
        res.status(500).json({ success: false, message: 'Error uploading marks' });
    }
};

// Upload marks from CSV
const uploadMarksCsv = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { classId, subjectId, examId } = req.body;
        const file = Array.isArray(req.files) ? req.files[0] : null;

        if (!file || !classId || !subjectId || !examId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam || exam.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject || subject.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        const klass = await prisma.sclass.findFirst({ where: { id: classId, collegeId } });
        if (!klass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Parse CSV
        const csv = file.buffer.toString('utf-8');
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

        const studentIdIdx = headers.findIndex(h => ['student_id', 'studentid', 'id'].includes(h));
        const marksIdx = headers.findIndex(h => ['marks', 'marks_obtained', 'score'].includes(h));

        if (studentIdIdx === -1 || marksIdx === -1) {
            return res.status(400).json({ success: false, message: 'Invalid CSV format' });
        }

        let created = 0;
        let updated = 0;
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const studentId = values[studentIdIdx];
            const marksStr = values[marksIdx];

            if (!studentId || !marksStr) continue;

            const marksObtained = parseFloat(marksStr);
            if (!Number.isFinite(marksObtained) || marksObtained < 0 || marksObtained > 100) {
                errors.push({ row: i + 1, message: `Invalid marks: ${marksStr}` });
                continue;
            }

            const student = await prisma.student.findFirst({
                where: { studentId, sclassId: classId, collegeId },
            });

            if (!student) {
                errors.push({ row: i + 1, message: `Student not found: ${studentId}` });
                continue;
            }

            const percentage = (marksObtained / (subject.maxMarks || 100)) * 100;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            const existing = await prisma.examResult.findFirst({
                where: { studentId: student.id, subjectId, examId },
            });

            if (existing) {
                await prisma.examResult.update({
                    where: { id: existing.id },
                    data: {
                        marksObtained,
                        percentage: Number(percentage.toFixed(2)),
                        grade,
                    },
                });
                updated++;
            } else {
                await prisma.examResult.create({
                    data: {
                        studentId: student.id,
                        subjectId,
                        examId,
                        collegeId,
                        marksObtained,
                        percentage: Number(percentage.toFixed(2)),
                        grade,
                    },
                });
                created++;
            }
        }

        res.status(201).json({
            success: true,
            message: `CSV processed: ${created} created, ${updated} updated${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
            data: { created, updated, errors },
        });
    } catch (error) {
        console.error('Upload marks CSV error:', error);
        res.status(500).json({ success: false, message: 'Error uploading CSV' });
    }
};

// ==================== ADMISSION TEAM MANAGEMENT ====================

const getAdmissionTeamMembers = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const members = await prisma.admissionTeam.findMany({
            where: { collegeId },
            include: {
                user: {
                    select: { id: true, email: true, isActive: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({ success: true, data: members });
    } catch (error) {
        console.error('Get admission team members error:', error);
        res.status(500).json({ success: false, message: 'Error fetching team members' });
    }
};

const createAdmissionTeamMember = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check if email already exists in this college
        const existingUser = await prisma.user.findFirst({
            where: { 
                email,
                collegeId
            },
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists in this college' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'AdmissionTeam',
                collegeId,
                isActive: true,
            },
        });

        // Create admission team member
        const member = await prisma.admissionTeam.create({
            data: {
                name,
                email,
                phone,
                collegeId,
                userId: user.id,
                isActive: true,
            },
            include: {
                user: {
                    select: { id: true, email: true, isActive: true },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Admission team member created successfully',
            data: member,
        });
    } catch (error) {
        console.error('Create admission team member error:', error);
        res.status(500).json({ success: false, message: 'Error creating team member' });
    }
};

const updateAdmissionTeamMember = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { id } = req.params;
        const { name, email, phone, password } = req.body;

        // Check if member exists
        const member = await prisma.admissionTeam.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!member || member.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Team member not found' });
        }

        // Update user
        const updateData = { name, email, phone };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: member.userId },
            data: updateData,
        });

        // Update admission team member
        const updated = await prisma.admissionTeam.update({
            where: { id },
            data: { name, email, phone },
            include: {
                user: {
                    select: { id: true, email: true, isActive: true },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Team member updated successfully',
            data: updated,
        });
    } catch (error) {
        console.error('Update admission team member error:', error);
        res.status(500).json({ success: false, message: 'Error updating team member' });
    }
};

const deleteAdmissionTeamMember = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { id } = req.params;

        // Check if member exists
        const member = await prisma.admissionTeam.findUnique({
            where: { id },
        });

        if (!member || member.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Team member not found' });
        }

        // Delete user (cascade will delete admission team member)
        await prisma.user.delete({
            where: { id: member.userId },
        });

        res.status(200).json({
            success: true,
            message: 'Team member deleted successfully',
        });
    } catch (error) {
        console.error('Delete admission team member error:', error);
        res.status(500).json({ success: false, message: 'Error deleting team member' });
    }
};

// ==================== MARKS EMAIL NOTIFICATION ====================

// Send marks via email to student
const sendMarksEmail = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { studentId, subjectId, examId, marks, totalMarks = 100, remarks } = req.body;

        // Validation
        if (!studentId || !subjectId || marks === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide studentId, subjectId, and marks'
            });
        }

        if (marks < 0 || marks > totalMarks) {
            return res.status(400).json({
                success: false,
                message: `Marks must be between 0 and ${totalMarks}`
            });
        }

        // Find student with email
        const student = await prisma.student.findFirst({
            where: { id: studentId, collegeId, isDeleted: false },
            include: {
                sclass: { select: { sclassName: true } },
                college: { select: { name: true } }
            }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (!student.email) {
            return res.status(400).json({
                success: false,
                message: 'Student email not found'
            });
        }

        // Find subject
        const subject = await prisma.subject.findFirst({
            where: { id: subjectId, collegeId }
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Find or create exam result
        let examResult;
        if (examId) {
            const exam = await prisma.exam.findFirst({
                where: { id: examId, collegeId }
            });

            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: 'Exam not found'
                });
            }

            // Check if result already exists
            const existing = await prisma.examResult.findFirst({
                where: { studentId, subjectId, examId }
            });

            const percentage = ((marks / totalMarks) * 100).toFixed(2);
            const grade = calculateGrade(percentage);

            if (existing) {
                examResult = await prisma.examResult.update({
                    where: { id: existing.id },
                    data: {
                        marksObtained: marks,
                        percentage: parseFloat(percentage),
                        grade,
                        remarks
                    }
                });
            } else {
                examResult = await prisma.examResult.create({
                    data: {
                        studentId,
                        subjectId,
                        examId,
                        collegeId,
                        marksObtained: marks,
                        percentage: parseFloat(percentage),
                        grade,
                        remarks
                    }
                });
            }
        }

        // Send email
        try {
            const percentage = ((marks / totalMarks) * 100).toFixed(2);
            const grade = calculateGrade(percentage);

            await sendMarksNotificationEmail(
                student.email,
                student.name,
                subject.subName,
                marks,
                totalMarks,
                percentage,
                grade,
                student.college.name,
                student.sclass?.sclassName || 'N/A'
            );

            res.status(200).json({
                success: true,
                message: 'Marks saved and email sent successfully',
                data: {
                    student: {
                        id: student.id,
                        name: student.name,
                        email: student.email
                    },
                    marks: {
                        subject: subject.subName,
                        marks,
                        totalMarks,
                        percentage,
                        grade
                    },
                    examResult
                }
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(500).json({
                success: false,
                message: 'Marks saved but email sending failed',
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('Send marks email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending marks email',
            error: error.message
        });
    }
};

// Calculate grade based on percentage
const calculateGrade = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B+';
    if (percent >= 60) return 'B';
    if (percent >= 50) return 'C';
    if (percent >= 40) return 'D';
    return 'F';
};

// Email sending function
const sendMarksNotificationEmail = async (
    studentEmail,
    studentName,
    subjectName,
    marks,
    totalMarks,
    percentage,
    grade,
    collegeName,
    className
) => {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Email configuration not found. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `"${collegeName}" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Exam Results - ${subjectName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .marks-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .marks-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .marks-row:last-child { border-bottom: none; }
                    .label { font-weight: bold; color: #555; }
                    .value { color: #667eea; font-weight: bold; }
                    .grade { font-size: 48px; color: #667eea; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Exam Results</h1>
                        <p>${collegeName}</p>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${studentName}</strong>,</p>
                        <p>Your exam results for <strong>${subjectName}</strong> have been published.</p>
                        
                        <div class="marks-box">
                            <div class="marks-row">
                                <span class="label">Class:</span>
                                <span class="value">${className}</span>
                            </div>
                            <div class="marks-row">
                                <span class="label">Subject:</span>
                                <span class="value">${subjectName}</span>
                            </div>
                            <div class="marks-row">
                                <span class="label">Marks Obtained:</span>
                                <span class="value">${marks} / ${totalMarks}</span>
                            </div>
                            <div class="marks-row">
                                <span class="label">Percentage:</span>
                                <span class="value">${percentage}%</span>
                            </div>
                        </div>

                        <div class="grade">Grade: ${grade}</div>

                        <p style="text-align: center; color: #666;">
                            ${percentage >= 40 ? '🎉 Congratulations! Keep up the good work!' : '💪 Keep working hard. You can do better!'}
                        </p>

                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} ${collegeName}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
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
    downloadPaymentReceipt,
    getAnalytics,
    getResults,
    uploadMarksAdmin,
    uploadMarksCsv,
    getAdmissionTeamMembers,
    createAdmissionTeamMember,
    updateAdmissionTeamMember,
    deleteAdmissionTeamMember,
    sendMarksEmail,
};

// ==================== PAYMENTS ====================

const createPayment = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { studentId, amount, paymentMethod, transactionId, remarks, status = 'completed' } = req.body;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        if (!studentId || !amount) {
            return res.status(400).json({ success: false, message: 'Student ID and amount are required' });
        }

        // Verify student exists and belongs to college
        const student = await prisma.student.findFirst({
            where: { id: studentId, collegeId, isDeleted: false }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                collegeId,
                studentId,
                amount: parseFloat(amount),
                paymentMethod: paymentMethod || 'manual',
                transactionId,
                remarks,
                status,
                paymentDate: new Date(),
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true,
                        sclass: { select: { sclassName: true } }
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: payment
        });

    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, message: 'Error creating payment' });
    }
};

const getPayments = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { page = 1, limit = 50, studentId, status } = req.query;

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const skip = (page - 1) * limit;
        const where = { collegeId };

        if (studentId) where.studentId = studentId;
        if (status) where.status = status;

        const payments = await prisma.payment.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true,
                        sclass: { select: { sclassName: true } }
                    }
                }
            },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.payment.count({ where });

        res.status(200).json({
            success: true,
            data: payments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            }
        });

    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
};

// ==================== HR MANAGEMENT (ADMIN VIEW) ====================

// Get HR Dashboard for Admin
const getHRDashboardAdmin = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;

        // Get all HR Managers
        const hrManagers = await prisma.hRManager.count({
            where: { collegeId },
        });

        // Get all Employees
        const employees = await prisma.employee.findMany({
            where: { collegeId },
            include: {
                hrManager: {
                    select: { name: true, email: true, id: true },
                },
            },
        });

        // Today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAttendance = await prisma.employeeAttendance.findMany({
            where: {
                collegeId,
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Get pending salaries
        const pendingSalaries = await prisma.employeeSalary.findMany({
            where: { collegeId, status: 'Pending' },
            include: {
                employee: {
                    select: { name: true, email: true, salary: true },
                },
            },
        });

        // Department breakdown
        const departmentStats = {};
        employees.forEach((emp) => {
            if (!departmentStats[emp.department]) {
                departmentStats[emp.department] = {
                    count: 0,
                    salary: 0,
                };
            }
            departmentStats[emp.department].count++;
            departmentStats[emp.department].salary += emp.salary;
        });

        const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
        const activeEmployees = employees.filter((e) => e.status === 'Active').length;

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    hrManagers,
                    totalEmployees: employees.length,
                    activeEmployees,
                    totalSalaryBill: totalSalary,
                    attendanceToday: todayAttendance.length,
                    pendingSalaries: pendingSalaries.length,
                },
                employees,
                departmentStats,
                pendingSalaries,
            },
        });
    } catch (error) {
        console.error('Error fetching HR dashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching HR dashboard',
            error: error.message,
        });
    }
};

// Get list of HR Managers
const getHRManagersList = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;

        const hrManagers = await prisma.hRManager.findMany({
            where: { collegeId },
            include: {
                user: {
                    select: { lastLogin: true, isActive: true, createdAt: true },
                },
                Employees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        designation: true,
                        salary: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({
            success: true,
            data: hrManagers,
        });
    } catch (error) {
        console.error('Error fetching HR managers:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching HR managers',
            error: error.message,
        });
    }
};

// Get all employees (Admin view)
const getAllEmployees = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;
        const { department, status, hrManagerId } = req.query;

        let where = { collegeId };
        if (department) where.department = department;
        if (status) where.status = status;
        if (hrManagerId) where.hrManagerId = hrManagerId;

        const employees = await prisma.employee.findMany({
            where,
            include: {
                hrManager: {
                    select: { id: true, name: true, email: true },
                },
                Attendances: {
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                        },
                    },
                },
                SalaryDetails: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);

        return res.status(200).json({
            success: true,
            data: employees,
            stats: {
                total: employees.length,
                active: employees.filter((e) => e.status === 'Active').length,
                totalSalary,
            },
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message,
        });
    }
};

// Get individual employee data (Admin view)
const getEmployeeData = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const collegeId = req.user.collegeId;

        const employee = await prisma.employee.findFirst({
            where: { id: employeeId, collegeId },
            include: {
                hrManager: true,
                Attendances: {
                    orderBy: { date: 'desc' },
                    take: 60,
                },
                SalaryDetails: {
                    orderBy: { createdAt: 'desc' },
                    take: 24,
                },
                LeaveRecords: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Calculate attendance percentage
        const totalAttendance = employee.Attendances.length;
        const presentDays = employee.Attendances.filter((a) => a.status === 'Present').length;
        const attendancePercentage = totalAttendance > 0 ? ((presentDays / totalAttendance) * 100).toFixed(2) : 0;

        // Calculate total salary
        const totalSalaryPaid = employee.SalaryDetails.reduce((sum, s) => sum + (s.status === 'Processed' ? s.netSalary : 0), 0);

        return res.status(200).json({
            success: true,
            data: employee,
            stats: {
                attendancePercentage,
                totalAttendance,
                presentDays,
                totalSalaryPaid,
                salaryRecords: employee.SalaryDetails.length,
                leaves: employee.LeaveRecords.length,
            },
        });
    } catch (error) {
        console.error('Error fetching employee data:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching employee data',
            error: error.message,
        });
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
    downloadPaymentReceipt,
    getAnalytics,
    getResults,
    uploadMarksAdmin,
    uploadMarksCsv,
    getAdmissionTeamMembers,
    createAdmissionTeamMember,
    updateAdmissionTeamMember,
    deleteAdmissionTeamMember,
    sendMarksEmail,
    createPayment,
    getPayments,
    // HR Management
    getHRDashboardAdmin,
    getHRManagersList,
    getAllEmployees,
    getEmployeeData,
};
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

// ==================== USER MANAGEMENT ====================

// Create teacher
const createTeacher = async (req, res) => {
    try {
        const { collegeId } = req.query;
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
        const { collegeId } = req.query;
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
        const { collegeId } = req.query;
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
        const { collegeId } = req.query;
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
        const { collegeId } = req.query;
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
            teamProfile = await prisma.admissionTeam.create({ data: { name, email, phone, password: hashedPassword, collegeId, userId: user.id } });
        } else if (role === 'AccountsTeam') {
            teamProfile = await prisma.accountsTeam.create({ data: { name, email, phone, password: hashedPassword, collegeId, userId: user.id } });
        } else if (role === 'TransportTeam') {
            teamProfile = await prisma.transportTeam.create({ data: { name, email, phone, password: hashedPassword, collegeId, userId: user.id } });
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
        const { collegeId } = req.query;
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
        const { collegeId } = req.query;
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
        const { collegeId } = req.query;

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
                        Teachers: true,
                        Subjects: true,
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
        const { collegeId } = req.query;
        const { subName, subCode, description, sclassId, maxMarks, passingMarks } = req.body;

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
            },
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
        const { collegeId } = req.query;

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
        const { collegeId } = req.query;
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
        const { collegeId } = req.query;

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

module.exports = {
    createTeacher,
    createStudent,
    getAllStudents,
    getAllTeachers,
    createTeamMember,
    getTeamMembers,
    createClass,
    getAllClasses,
    createSubject,
    getSubjects,
    defineFeeStructure,
    getDashboard,
    getFees,
};

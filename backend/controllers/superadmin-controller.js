const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

// ==================== COLLEGE MANAGEMENT ====================

// Create new college
const createCollege = async (req, res) => {
    try {
        const { name, email, phone, address, city, state, country, pincode, domain } = req.body;

        // Validate input
        if (!name || !domain) {
            return res.status(400).json({ success: false, message: 'Name and domain are required' });
        }

        // Check if domain already exists
        const existingDomain = await prisma.collegeDomain.findUnique({
            where: { domain },
        });

        if (existingDomain) {
            return res.status(400).json({ success: false, message: 'Domain already registered' });
        }

        // Create college
        const college = await prisma.college.create({
            data: {
                name,
                email,
                phone,
                address,
                city,
                state,
                country,
                pincode,
                status: 'active',
                whiteLabel: true,
            },
        });

        // Create primary domain
        await prisma.collegeDomain.create({
            data: {
                domain,
                collegeName: name,
                collegeId: college.id,
                isPrimary: true,
                status: 'active',
                dnsVerified: true,
            },
        });

        res.status(201).json({ 
            success: true, 
            message: 'College created successfully',
            data: college 
        });
    } catch (error) {
        console.error('Create college error:', error);
        res.status(500).json({ success: false, message: 'Error creating college' });
    }
};

// View all colleges
const getAllColleges = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const filter = status ? { status } : {};

        const colleges = await prisma.college.findMany({
            where: filter,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                Domains: true,
                _count: {
                    select: {
                        Users: true,
                        Students: true,
                        Teachers: true,
                        Payments: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.college.count({ where: filter });

        res.status(200).json({
            success: true,
            data: colleges,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get colleges error:', error);
        res.status(500).json({ success: false, message: 'Error fetching colleges' });
    }
};

// Get college details
const getCollegeDetails = async (req, res) => {
    try {
        const { collegeId } = req.params;

        const college = await prisma.college.findUnique({
            where: { id: collegeId },
            include: {
                Domains: true,
                _count: {
                    select: {
                        Users: true,
                        Students: true,
                        Teachers: true,
                        Payments: true,
                        Admissions: true,
                    },
                },
            },
        });

        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }

        res.status(200).json({ success: true, data: college });
    } catch (error) {
        console.error('Get college error:', error);
        res.status(500).json({ success: false, message: 'Error fetching college' });
    }
};

// Edit college
const editCollege = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const { name, email, phone, address, city, state, country, pincode, theme, status } = req.body;

        const college = await prisma.college.update({
            where: { id: collegeId },
            data: {
                name,
                email,
                phone,
                address,
                city,
                state,
                country,
                pincode,
                theme,
                status,
            },
        });

        res.status(200).json({
            success: true,
            message: 'College updated successfully',
            data: college,
        });
    } catch (error) {
        console.error('Edit college error:', error);
        res.status(500).json({ success: false, message: 'Error updating college' });
    }
};

// Suspend college
const suspendCollege = async (req, res) => {
    try {
        const { collegeId } = req.params;

        const college = await prisma.college.update({
            where: { id: collegeId },
            data: { status: 'suspended' },
        });

        res.status(200).json({
            success: true,
            message: 'College suspended successfully',
            data: college,
        });
    } catch (error) {
        console.error('Suspend college error:', error);
        res.status(500).json({ success: false, message: 'Error suspending college' });
    }
};

// ==================== ADMIN MANAGEMENT ====================

// Create college admin
const createCollegeAdmin = async (req, res) => {
    try {
        const { collegeId, name, email, password, phone } = req.body;

        if (!collegeId || !name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check college exists
        const college = await prisma.college.findUnique({
            where: { id: collegeId },
        });

        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }

        // Check if email already exists in this college
        const existingUser = await prisma.user.findUnique({
            where: { email_collegeId: { email, collegeId } },
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered for this college' });
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
                role: 'Admin',
                collegeId,
                isEmailVerified: true,
                isActive: true,
            },
        });

        // Create admin profile
        const admin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                collegeId,
                userId: user.id,
            },
        });

        res.status(201).json({
            success: true,
            message: 'College admin created successfully',
            data: { user, admin },
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ success: false, message: 'Error creating admin' });
    }
};

// Reset admin password
const resetAdminPassword = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ success: false, message: 'New password is required' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const admin = await prisma.admin.update({
            where: { id: adminId },
            data: { password: hashedPassword },
        });

        // Also update user password
        await prisma.user.update({
            where: { id: admin.userId },
            data: { password: hashedPassword },
        });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Error resetting password' });
    }
};

// ==================== PLATFORM MONITORING ====================

// Get platform analytics
const getPlatformAnalytics = async (req, res) => {
    try {
        const totalColleges = await prisma.college.count();
        const activeColleges = await prisma.college.count({ where: { status: 'active' } });
        const totalUsers = await prisma.user.count();
        const totalStudents = await prisma.student.count();
        const totalTeachers = await prisma.teacher.count();
        const totalPayments = await prisma.payment.aggregate({
            where: { status: 'completed' },
            _sum: { amount: true },
        });

        const revenueStats = await prisma.payment.groupBy({
            by: ['status'],
            where: { status: 'completed' },
            _sum: { amount: true },
            _count: true,
        });

        res.status(200).json({
            success: true,
            data: {
                colleges: {
                    total: totalColleges,
                    active: activeColleges,
                },
                users: totalUsers,
                students: totalStudents,
                teachers: totalTeachers,
                revenue: totalPayments._sum.amount || 0,
                revenueStats,
            },
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: 'Error fetching analytics' });
    }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
    try {
        const { collegeId, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const filter = collegeId ? { collegeId } : {};

        const logs = await prisma.auditLog.findMany({
            where: filter,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: { user: true, college: true },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.auditLog.count({ where: filter });

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ success: false, message: 'Error fetching audit logs' });
    }
};

// Create audit log (helper function)
const createAuditLog = async (userId, collegeId, action, entityType, entityId, oldValues = null, newValues = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                collegeId,
                action,
                entityType,
                entityId,
                oldValues,
                newValues,
                ipAddress: null,
                userAgent: null,
            },
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
};

module.exports = {
    createCollege,
    getAllColleges,
    getCollegeDetails,
    editCollege,
    suspendCollege,
    createCollegeAdmin,
    resetAdminPassword,
    getPlatformAnalytics,
    getAuditLogs,
    createAuditLog,
};

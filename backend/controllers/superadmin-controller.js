const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');

// ==================== COLLEGE MANAGEMENT ====================

// Create new college
const createCollege = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            address,
            city,
            state,
            country,
            pincode,
            domain,
            subscriptionPlan,
            storageLimit,
        } = req.body;

        const subscriptionPlanValue =
            subscriptionPlan === undefined || subscriptionPlan === null || subscriptionPlan === ''
                ? undefined
                : subscriptionPlan;

        const storageLimitValue =
            storageLimit === undefined || storageLimit === null || storageLimit === ''
                ? undefined
                : Number(storageLimit);

        if (storageLimitValue !== undefined && (!Number.isFinite(storageLimitValue) || storageLimitValue < 0)) {
            return res.status(400).json({ success: false, message: 'Invalid storageLimit' });
        }

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
                subscriptionPlan: subscriptionPlanValue,
                storageLimit: storageLimitValue,
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

        // Run both queries in parallel
        const [colleges, total] = await Promise.all([
            prisma.college.findMany({
                where: filter,
                skip: parseInt(skip),
                take: parseInt(limit),
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    city: true,
                    state: true,
                    country: true,
                    status: true,
                    subscriptionPlan: true,
                    storageUsed: true,
                    storageLimit: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.college.count({ where: filter }),
        ]);

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
        const {
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
            subscriptionPlan,
            storageLimit,
        } = req.body;

        const subscriptionPlanValue =
            subscriptionPlan === undefined || subscriptionPlan === null || subscriptionPlan === ''
                ? undefined
                : subscriptionPlan;

        const storageLimitValue =
            storageLimit === undefined || storageLimit === null || storageLimit === ''
                ? undefined
                : Number(storageLimit);

        if (storageLimitValue !== undefined && (!Number.isFinite(storageLimitValue) || storageLimitValue < 0)) {
            return res.status(400).json({ success: false, message: 'Invalid storageLimit' });
        }

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
                subscriptionPlan: subscriptionPlanValue,
                storageLimit: storageLimitValue,
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

// ==================== DOMAIN MANAGEMENT ====================

const createCollegeDomain = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const { domain, isPrimary = false } = req.body;

        if (!domain) {
            return res.status(400).json({ success: false, message: 'Domain is required' });
        }

        const college = await prisma.college.findUnique({ where: { id: collegeId } });
        if (!college) return res.status(404).json({ success: false, message: 'College not found' });

        const existingDomain = await prisma.collegeDomain.findUnique({ where: { domain } });
        if (existingDomain) {
            return res.status(400).json({ success: false, message: 'Domain already registered' });
        }

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
            message: 'Domain request created',
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
        console.error('Create college domain error:', error);
        res.status(500).json({ success: false, message: 'Error creating domain request' });
    }
};

const listCollegeDomains = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const domains = await prisma.collegeDomain.findMany({
            where: { collegeId },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
        });
        res.status(200).json({ success: true, data: domains });
    } catch (error) {
        console.error('List college domains error:', error);
        res.status(500).json({ success: false, message: 'Error fetching domains' });
    }
};

const verifyCollegeDomain = async (req, res) => {
    try {
        const { domainId } = req.params;
        const { dnsToken } = req.body;

        const domain = await prisma.collegeDomain.findUnique({ where: { id: domainId } });
        if (!domain) return res.status(404).json({ success: false, message: 'Domain not found' });

        if (!dnsToken || dnsToken !== domain.dnsToken) {
            return res.status(400).json({
                success: false,
                message: 'DNS token mismatch',
                data: {
                    expected: {
                        type: 'TXT',
                        name: `_mentneo-verify.${domain.domain}`,
                        value: domain.dnsToken,
                    },
                },
            });
        }

        const updated = await prisma.collegeDomain.update({
            where: { id: domainId },
            data: { dnsVerified: true },
        });

        res.status(200).json({ success: true, message: 'Domain verified', data: updated });
    } catch (error) {
        console.error('Verify domain error:', error);
        res.status(500).json({ success: false, message: 'Error verifying domain' });
    }
};

const approveCollegeDomain = async (req, res) => {
    try {
        const { domainId } = req.params;

        const domain = await prisma.collegeDomain.findUnique({ where: { id: domainId } });
        if (!domain) return res.status(404).json({ success: false, message: 'Domain not found' });

        if (!domain.dnsVerified) {
            return res.status(400).json({ success: false, message: 'DNS not verified yet' });
        }

        const updated = await prisma.collegeDomain.update({
            where: { id: domainId },
            data: {
                status: 'active',
                approvedBy: req.user.id,
                approvedAt: new Date(),
                sslEnabled: true,
            },
        });

        res.status(200).json({ success: true, message: 'Domain approved and activated', data: updated });
    } catch (error) {
        console.error('Approve domain error:', error);
        res.status(500).json({ success: false, message: 'Error approving domain' });
    }
};

const deactivateCollegeDomain = async (req, res) => {
    try {
        const { domainId } = req.params;

        const domain = await prisma.collegeDomain.findUnique({ where: { id: domainId } });
        if (!domain) return res.status(404).json({ success: false, message: 'Domain not found' });

        const updated = await prisma.collegeDomain.update({
            where: { id: domainId },
            data: {
                status: 'inactive',
                isPrimary: false,
            },
        });

        res.status(200).json({ success: true, message: 'Domain deactivated', data: updated });
    } catch (error) {
        console.error('Deactivate domain error:', error);
        res.status(500).json({ success: false, message: 'Error deactivating domain' });
    }
};

const setPrimaryCollegeDomain = async (req, res) => {
    try {
        const { domainId } = req.params;

        const domain = await prisma.collegeDomain.findUnique({ where: { id: domainId } });
        if (!domain) return res.status(404).json({ success: false, message: 'Domain not found' });

        if (domain.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Domain must be active to set primary' });
        }

        await prisma.collegeDomain.updateMany({
            where: { collegeId: domain.collegeId },
            data: { isPrimary: false },
        });

        const updated = await prisma.collegeDomain.update({
            where: { id: domainId },
            data: { isPrimary: true },
        });

        res.status(200).json({ success: true, message: 'Primary domain updated', data: updated });
    } catch (error) {
        console.error('Set primary domain error:', error);
        res.status(500).json({ success: false, message: 'Error setting primary domain' });
    }
};

// ==================== ADMIN MANAGEMENT ====================

// Create college admin
const createCollegeAdmin = async (req, res) => {
    try {
        const { collegeId, name, email, password, phone } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const passwordInput = String(password || '').trim();

        if (!collegeId || !name || !normalizedEmail || !passwordInput) {
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
            where: { email_collegeId: { email: normalizedEmail, collegeId } },
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered for this college' });
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
                email: normalizedEmail,
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

// Get platform analytics (optimized with parallel queries)
const getPlatformAnalytics = async (req, res) => {
    try {
        // Run all queries in parallel for better performance
        const [
            totalColleges,
            activeColleges,
            totalUsers,
            totalStudents,
            totalTeachers,
            totalPayments,
        ] = await Promise.all([
            prisma.college.count(),
            prisma.college.count({ where: { status: 'active' } }),
            prisma.user.count(),
            prisma.student.count(),
            prisma.teacher.count(),
            prisma.payment.aggregate({
                where: { status: 'completed' },
                _sum: { amount: true },
            }),
        ]);

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
            },
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: 'Error fetching analytics' });
    }
};

// Get audit logs (optimized)
const getAuditLogs = async (req, res) => {
    try {
        const { collegeId, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const filter = collegeId ? { collegeId } : {};

        // Run both queries in parallel
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: filter,
                skip: parseInt(skip),
                take: parseInt(limit),
                select: {
                    id: true,
                    action: true,
                    entityType: true,
                    entityId: true,
                    changes: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.auditLog.count({ where: filter }),
        ]);

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
    createCollegeDomain,
    listCollegeDomains,
    verifyCollegeDomain,
    approveCollegeDomain,
    deactivateCollegeDomain,
    setPrimaryCollegeDomain,
    createCollegeAdmin,
    resetAdminPassword,
    getPlatformAnalytics,
    getAuditLogs,
    createAuditLog,
};

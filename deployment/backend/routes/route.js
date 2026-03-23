const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');

// Import all route modules
const authRoutes = require('./auth-routes');
const superAdminRoutes = require('./superadmin-routes');
const adminRoutes = require('./admin-routes');
const teacherRoutes = require('./teacher-routes');
const studentRoutes = require('./student-routes');
const parentRoutes = require('./parent-routes');
const admissionRoutes = require('./admission-routes');
const accountsRoutes = require('./accounts-routes');
const transportRoutes = require('./transport-routes');

// ==================== PUBLIC ROUTES ====================
// No authentication required
router.use('/auth', authRoutes);
router.use('/admission', admissionRoutes);

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication and college_id validation

// Super Admin Routes
router.use('/superadmin', authMiddleware, authorize('superadmin', 'SuperAdmin'), superAdminRoutes);

// College Admin Routes
router.use('/admin', authMiddleware, authorize('admin', 'Admin', 'SuperAdmin'), adminRoutes);

// Teacher Routes
router.use('/teacher', authMiddleware, authorize('teacher', 'Teacher'), teacherRoutes);

// Student Routes
router.use('/student', authMiddleware, authorize('student', 'Student'), studentRoutes);

// Parent Routes
router.use('/parent', authMiddleware, authorize('parent', 'Parent'), parentRoutes);

// Accounts Team Routes
router.use('/accounts', authMiddleware, authorize('accounts', 'AccountsTeam', 'Admin', 'SuperAdmin'), accountsRoutes);

// Transport Team Routes
router.use('/transport', authMiddleware, authorize('transport', 'TransportTeam', 'Admin', 'SuperAdmin'), transportRoutes);

// ==================== HEALTH CHECK ====================
router.get('/health', async (req, res) => {
    try {
        const prisma = require('../lib/prisma');
        const { isRedisConnected } = require('../utils/redis-service');

        // Check database
        await prisma.$queryRaw`SELECT 1`;
        const dbStatus = 'connected';

        // Check Redis
        const redisStatus = isRedisConnected() ? 'connected' : 'disconnected';

        res.status(200).json({
            status: 'healthy',
            timestamp: new Date(),
            uptime: process.uptime(),
            database: dbStatus,
            redis: redisStatus,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            },
            version: require('../package.json').version,
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date(),
        });
    }
});

// ==================== 404 HANDLER ====================
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

module.exports = router;

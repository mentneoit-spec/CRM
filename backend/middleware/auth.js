const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// Verify JWT Token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
        return null;
    }
};

// Main authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from headers
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                college: true,
                AdminProfile: true,
                TeacherProfile: true,
                StudentProfile: true,
                ParentProfile: true,
            },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }

        // Validate domain if college-specific
        if (user.collegeId && req.collegeId && user.collegeId !== req.collegeId) {
            return res.status(403).json({ success: false, message: 'Access denied: Invalid college' });
        }

        // Attach user to request
        req.user = user;
        req.collegeId = user.collegeId;
        req.role = user.role;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
};

// Domain detection middleware
const detectDomain = async (req, res, next) => {
    try {
        const host = req.get('host');
        
        // Extract domain (without port for development)
        const domain = host.split(':')[0];

        // Find college by domain
        const collegeDomain = await prisma.collegeDomain.findUnique({
            where: { domain },
            include: { college: true },
        });

        if (collegeDomain && collegeDomain.status === 'active') {
            req.collegeId = collegeDomain.collegeId;
            req.collegeName = collegeDomain.collegeName;
            req.collegeData = collegeDomain.college;
        }

        // For localhost or development, allow domain in query or headers
        if (!req.collegeId && (req.query.collegeId || req.headers['x-college-id'])) {
            req.collegeId = req.query.collegeId || req.headers['x-college-id'];
        }

        next();
    } catch (error) {
        console.error('Domain detection error:', error);
        next(); // Continue even if domain detection fails
    }
};

// Role-based access control middleware
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: Insufficient permissions' 
            });
        }

        next();
    };
};

// College-specific authorization (user must belong to college)
const authorizeCollege = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (req.user.role === 'SuperAdmin') {
        return next(); // SuperAdmin can access any college
    }

    if (!req.user.collegeId || !req.collegeId) {
        return res.status(403).json({ success: false, message: 'College not identified' });
    }

    if (req.user.collegeId !== req.collegeId) {
        return res.status(403).json({ success: false, message: 'Access denied: Invalid college' });
    }

    next();
};

module.exports = {
    authMiddleware,
    detectDomain,
    authorize,
    authorizeCollege,
    verifyToken,
};

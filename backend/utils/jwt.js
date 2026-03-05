const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT Token
const generateToken = (userId, role, collegeId = null) => {
    const payload = {
        userId,
        role,
        collegeId,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Verify JWT Token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    JWT_SECRET,
    JWT_EXPIRE,
};

const express = require('express');
const router = express.Router();
const {
    login,
    superAdminLogin,
    logout,
    getCurrentUser,
    changePassword,
    register,
} = require('../controllers/auth-controller');
const { authMiddleware } = require('../middleware/auth');
const { requestLoginOTP, verifyLoginOTP, requestRegistrationOTP, verifyRegistrationOTP } = require('../utils/otp-service');

// Public routes
router.post('/login', login);
router.post('/superadmin-login', superAdminLogin);
router.post('/register', register);

// OTP Routes
router.post('/otp/request-login', async (req, res) => {
    const { phone } = req.body;
    const result = await requestLoginOTP(phone);
    res.json(result);
});

router.post('/otp/verify-login', async (req, res) => {
    const { phone, otp } = req.body;
    const result = await verifyLoginOTP(phone, otp);
    res.json(result);
});

router.post('/otp/request-register', async (req, res) => {
    const { phone } = req.body;
    const result = await requestRegistrationOTP(phone);
    res.json(result);
});

router.post('/otp/verify-register', async (req, res) => {
    const { phone, otp } = req.body;
    const result = await verifyRegistrationOTP(phone, otp);
    res.json(result);
});

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    login,
    superAdminLogin,
    logout,
    getCurrentUser,
    getMyProfile,
    updateMyProfile,
    changePassword,
    register,
    requestOTP,
    verifyOTPLogin,
    requestRegistrationOTP,
    verifyRegistrationOTP,
    googleAuthUrl,
    googleCallback,
    setup2FA,
    enable2FA,
    disable2FA,
    verify2FA,
} = require('../controllers/auth-controller');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/superadmin-login', superAdminLogin);
router.post('/register', register);

// Tenant discovery (custom domain -> college)
router.get('/tenant', (req, res) => {
    if (!req.collegeId) {
        return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({
        success: true,
        data: {
            collegeId: req.collegeId,
            college: req.collegeData || null,
            collegeName: req.collegeData?.name || req.collegeName || null,
            domain: req.get('host')?.split(':')?.[0] || null,
        },
    });
});

// OTP Routes
router.post('/otp/request-login', requestOTP);
router.post('/otp/verify-login', verifyOTPLogin);

router.post('/otp/request-register', requestRegistrationOTP);
router.post('/otp/verify-register', verifyRegistrationOTP);

// Google OAuth
router.get('/google/url', googleAuthUrl);
router.get('/google/callback', googleCallback);

// 2FA (Protected)
router.post('/2fa/setup', authMiddleware, setup2FA);
router.post('/2fa/enable', authMiddleware, enable2FA);
router.post('/2fa/disable', authMiddleware, disable2FA);
router.post('/2fa/verify', authMiddleware, verify2FA);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);
router.get('/profile', authMiddleware, getMyProfile);
router.put('/profile', authMiddleware, updateMyProfile);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;

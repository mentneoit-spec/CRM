const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { setOTP, getOTP, deleteOTP, incrementOTPAttempts } = require('../utils/redis-service');
const { sendEmail } = require('../utils/email-service');

// ==================== LOGIN ====================

const login = async (req, res) => {
    try {
        const { email, password, collegeId } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        let user;
        
        if (collegeId) {
            // College-specific login
            user = await prisma.user.findUnique({
                where: { email_collegeId: { email, collegeId } },
                include: { college: true },
            });
        } else {
            // SuperAdmin or non-college user login
            // Use findFirst since email alone is not unique
            user = await prisma.user.findFirst({
                where: { 
                    email,
                    collegeId: null
                },
                include: { college: true },
            });
        }

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'User account is inactive' 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check college status if college user
        if (user.collegeId && user.college) {
            if (user.college.status !== 'active') {
                return res.status(403).json({ 
                    success: false, 
                    message: 'College is not active' 
                });
            }
        }

        // Generate token
        const token = generateToken(user.id, user.role, user.collegeId);

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
};

// ==================== SUPER ADMIN LOGIN ====================

const superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find super admin
        const superAdmin = await prisma.superAdmin.findUnique({
            where: { email },
        });

        if (!superAdmin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check if account is active
        if (!superAdmin.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Account is inactive' 
            });
        }

        // Generate token
        const token = generateToken(superAdmin.id, 'SuperAdmin', null);

        // Update last login
        await prisma.superAdmin.update({
            where: { id: superAdmin.id },
            data: { lastLogin: new Date() },
        });

        const { password: _, ...adminWithoutPassword } = superAdmin;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: adminWithoutPassword,
                token,
            },
        });
    } catch (error) {
        console.error('Super admin login error:', error);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
};

// ==================== LOGOUT ====================

const logout = async (req, res) => {
    try {
        // Token is validated by middleware, just return success
        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Error during logout' });
    }
};

// ==================== GET CURRENT USER ====================

const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        const { password, ...userWithoutPassword } = req.user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword,
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ success: false, message: 'Error fetching user' });
    }
};

// ==================== CHANGE PASSWORD ====================

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Old and new passwords are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Old password is incorrect' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Error changing password' });
    }
};

// ==================== REGISTER (For test purposes) ====================

const register = async (req, res) => {
    try {
        const { name, email, password, phone, role = 'Student', collegeId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, and password are required' 
            });
        }

        // Check if email already exists
        let existingUser;
        if (collegeId) {
            existingUser = await prisma.user.findUnique({
                where: { email_collegeId: { email, collegeId } },
            });
        } else {
            // Use findFirst for non-college users since email alone is not unique
            existingUser = await prisma.user.findFirst({
                where: { 
                    email,
                    collegeId: null
                },
            });
        }

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and role-specific record in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create base user record
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    role,
                    collegeId,
                    isActive: true,
                },
            });

            // Create role-specific record
            let roleProfile = null;

            switch (role) {
                case 'Student':
                    if (collegeId) {
                        // For students, we need a class (sclassId)
                        // For now, create without class - admin can assign later
                        roleProfile = await tx.student.create({
                            data: {
                                name,
                                email,
                                phone,
                                password: hashedPassword,
                                studentId: `STU${Date.now()}`, // Generate unique student ID
                                user: { connect: { id: user.id } },
                                college: { connect: { id: collegeId } },
                                // sclass will be assigned by admin later (optional field)
                            },
                        });
                    }
                    break;

                case 'Teacher':
                    if (collegeId) {
                        roleProfile = await tx.teacher.create({
                            data: {
                                name,
                                email,
                                phone,
                                password: hashedPassword,
                                user: { connect: { id: user.id } },
                                college: { connect: { id: collegeId } },
                            },
                        });
                    }
                    break;

                case 'Parent':
                    if (collegeId) {
                        roleProfile = await tx.parent.create({
                            data: {
                                name,
                                email,
                                phone,
                                password: hashedPassword,
                                user: { connect: { id: user.id } },
                                college: { connect: { id: collegeId } },
                            },
                        });
                    }
                    break;

                case 'Admin':
                    if (collegeId) {
                        roleProfile = await tx.admin.create({
                            data: {
                                name,
                                email,
                                phone,
                                password: hashedPassword,
                                user: { connect: { id: user.id } },
                                college: { connect: { id: collegeId } },
                            },
                        });
                    }
                    break;

                case 'SuperAdmin':
                    // SuperAdmin goes to separate table
                    roleProfile = await tx.superAdmin.create({
                        data: {
                            name,
                            email,
                            phone,
                            password: hashedPassword,
                        },
                    });
                    break;

                case 'AdmissionTeam':
                    if (collegeId) {
                        roleProfile = await tx.admissionTeam.create({
                            data: {
                                name,
                                email,
                                phone,
                                userId: user.id,
                                collegeId,
                            },
                        });
                    }
                    break;

                case 'AccountsTeam':
                    if (collegeId) {
                        roleProfile = await tx.accountsTeam.create({
                            data: {
                                name,
                                email,
                                phone,
                                userId: user.id,
                                collegeId,
                            },
                        });
                    }
                    break;

                case 'TransportTeam':
                    if (collegeId) {
                        roleProfile = await tx.transportTeam.create({
                            data: {
                                name,
                                email,
                                phone,
                                userId: user.id,
                                collegeId,
                            },
                        });
                    }
                    break;
            }

            return { user, roleProfile };
        });

        // Generate token
        const token = generateToken(result.user.id, role, collegeId);

        const { password: _, ...userWithoutPassword } = result.user;

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: userWithoutPassword,
                roleProfile: result.roleProfile,
                token,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error during registration',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    login,
    superAdminLogin,
    logout,
    getCurrentUser,
    changePassword,
    register,
};

// ==================== OTP AUTHENTICATION ====================

const requestOTP = async (req, res) => {
    try {
        const { phone, collegeId } = req.body;

        if (!phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number is required' 
            });
        }

        // Check if user exists
        let user;
        if (collegeId) {
            user = await prisma.user.findFirst({
                where: { phone, collegeId },
            });
        } else {
            user = await prisma.user.findFirst({
                where: { phone },
            });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Phone number not registered' 
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in Redis (10 minutes expiry)
        await setOTP(phone, otp, 600);

        // Send OTP via SMS (in production, use Twilio/AWS SNS)
        console.log(`[OTP] Phone: ${phone}, OTP: ${otp}`);

        // For demo, also send via email if available
        if (user.email) {
            await sendEmail(user.email, 'otpLogin', [user.name, otp]);
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            expiresIn: 600,
        });
    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
};

const verifyOTPLogin = async (req, res) => {
    try {
        const { phone, otp, collegeId } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone and OTP are required' 
            });
        }

        // Get OTP from Redis
        const otpData = await getOTP(phone);

        if (!otpData) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP expired or not found' 
            });
        }

        // Check attempts
        if (otpData.attempts >= 5) {
            await deleteOTP(phone);
            return res.status(429).json({ 
                success: false, 
                message: 'Maximum OTP verification attempts exceeded' 
            });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            await incrementOTPAttempts(phone);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP',
                attemptsRemaining: 5 - (otpData.attempts + 1),
            });
        }

        // OTP verified, delete from Redis
        await deleteOTP(phone);

        // Find user
        let user;
        if (collegeId) {
            user = await prisma.user.findFirst({
                where: { phone, collegeId },
                include: { college: true },
            });
        } else {
            user = await prisma.user.findFirst({
                where: { phone },
                include: { college: true },
            });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'User account is inactive' 
            });
        }

        // Check college status
        if (user.collegeId && user.college && user.college.status !== 'active') {
            return res.status(403).json({ 
                success: false, 
                message: 'College is not active' 
            });
        }

        // Generate token
        const token = generateToken(user.id, user.role, user.collegeId);

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { 
                lastLogin: new Date(),
                isPhoneVerified: true,
            },
        });

        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        console.error('Verify OTP login error:', error);
        res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
};

// ==================== GOOGLE OAUTH ====================

const googleAuthUrl = async (req, res) => {
    try {
        const { collegeId } = req.query;
        const { getGoogleAuthUrl } = require('../utils/google-oauth-service');
        
        const authUrl = getGoogleAuthUrl(collegeId);
        
        res.status(200).json({
            success: true,
            authUrl,
        });
    } catch (error) {
        console.error('Google auth URL error:', error);
        res.status(500).json({ success: false, message: 'Error generating auth URL' });
    }
};

const googleCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        const { handleGoogleCallback } = require('../utils/google-oauth-service');
        
        const result = await handleGoogleCallback(code, state);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Google callback error:', error);
        res.status(500).json({ success: false, message: 'Error processing Google login' });
    }
};

// ==================== 2FA ====================

const setup2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        
        const { setup2FA } = require('../utils/2fa-service');
        const result = await setup2FA(userId, userEmail);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Setup 2FA error:', error);
        res.status(500).json({ success: false, message: 'Error setting up 2FA' });
    }
};

const enable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: '2FA token is required' 
            });
        }
        
        const { enable2FA } = require('../utils/2fa-service');
        const result = await enable2FA(userId, token);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ success: false, message: 'Error enabling 2FA' });
    }
};

const disable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: '2FA token is required' 
            });
        }
        
        const { disable2FA } = require('../utils/2fa-service');
        const result = await disable2FA(userId, token);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({ success: false, message: 'Error disabling 2FA' });
    }
};

const verify2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: '2FA token is required' 
            });
        }
        
        const { validate2FALogin } = require('../utils/2fa-service');
        const result = await validate2FALogin(userId, token);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({ success: false, message: 'Error verifying 2FA' });
    }
};

module.exports = {
    login,
    superAdminLogin,
    logout,
    getCurrentUser,
    changePassword,
    register,
    requestOTP,
    verifyOTPLogin,
    googleAuthUrl,
    googleCallback,
    setup2FA,
    enable2FA,
    disable2FA,
    verify2FA,
};

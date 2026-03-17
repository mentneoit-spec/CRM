const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { setOTP, getOTP, deleteOTP, incrementOTPAttempts } = require('../utils/redis-service');
const { sendEmail } = require('../utils/email-service');
const { sendSMSOTP } = require('../utils/sms');

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

        let user;

        if (collegeId) {
            user = await prisma.user.findUnique({
                where: { email_collegeId: { email, collegeId } },
                include: { college: true },
            });
        } else {
            user = await prisma.user.findFirst({
                where: {
                    email,
                    collegeId: null,
                },
                include: { college: true },
            });

            if (!user) {
                const matches = await prisma.user.findMany({
                    where: {
                        email,
                        collegeId: { not: null },
                    },
                    include: { college: true },
                    take: 2,
                });

                if (matches.length === 1) {
                    user = matches[0];
                } else if (matches.length > 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Multiple accounts found for this email. Please provide collegeId.',
                        requiresCollegeId: true,
                    });
                }
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'User account is inactive'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (user.collegeId && user.college) {
            if (user.college.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'College is not active'
                });
            }
        }

        const token = generateToken(user.id, user.role, user.collegeId);

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
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
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
};

// ==================== SUPER ADMIN LOGIN ====================

const superAdminLogin = async (req, res) => {
    try {
        const { email, password, twoFAToken } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const superAdmin = await prisma.superAdmin.findUnique({
            where: { email },
        });

        if (!superAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!superAdmin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        if (superAdmin.twoFAEnabled) {
            if (!superAdmin.twoFASecret) {
                await prisma.superAdmin.update({
                    where: { id: superAdmin.id },
                    data: { twoFAEnabled: false },
                });
            } else {
                if (!twoFAToken) {
                    return res.status(400).json({
                        success: false,
                        message: '2FA token is required',
                        requires2FA: true,
                    });
                }

                const speakeasy = require('speakeasy');
                const verified = speakeasy.totp.verify({
                    secret: superAdmin.twoFASecret,
                    encoding: 'base32',
                    token: String(twoFAToken),
                    window: 2,
                });

                if (!verified) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid 2FA token',
                        requires2FA: true,
                    });
                }
            }
        }

        let user = await prisma.user.findFirst({
            where: {
                email,
                collegeId: null,
                role: 'SuperAdmin',
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: superAdmin.name,
                    email: superAdmin.email,
                    phone: superAdmin.phone,
                    password: superAdmin.password,
                    role: 'SuperAdmin',
                    collegeId: null,
                    isEmailVerified: true,
                    isActive: superAdmin.isActive,
                },
            });
        }

        const token = generateToken(user.id, 'SuperAdmin', null);

        await Promise.all([
            prisma.superAdmin.update({
                where: { id: superAdmin.id },
                data: { lastLogin: new Date() },
            }),
            prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
            }),
        ]);

        const { password: __, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
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

// ==================== MY PROFILE ====================

const getMyProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profileImage: true,
                role: true,
                collegeId: true,
                twoFAEnabled: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                college: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { name, phone, profileImage } = req.body || {};

        const dataToUpdate = {};
        if (typeof name === 'string' && name.trim()) dataToUpdate.name = name.trim();
        if (typeof phone === 'string') dataToUpdate.phone = phone.trim() || null;
        if (typeof profileImage === 'string') dataToUpdate.profileImage = profileImage.trim() || null;

        if (!Object.keys(dataToUpdate).length) {
            return res.status(400).json({ success: false, message: 'No updatable fields provided' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profileImage: true,
                role: true,
                collegeId: true,
                twoFAEnabled: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const sync = async (fn) => {
            try {
                await fn();
            } catch (e) {
                const code = e?.code;
                if (code !== 'P2025') {
                    console.warn('Profile sync warning:', e?.message || e);
                }
            }
        };

        await Promise.all([
            sync(() => prisma.student.update({ where: { userId }, data: { name: updatedUser.name, phone: updatedUser.phone, profileImage: updatedUser.profileImage } })),
            sync(() => prisma.teacher.update({ where: { userId }, data: { name: updatedUser.name, phone: updatedUser.phone, profileImage: updatedUser.profileImage } })),
            sync(() => prisma.parent.update({ where: { userId }, data: { name: updatedUser.name, phone: updatedUser.phone, profileImage: updatedUser.profileImage } })),
            sync(() => prisma.admin.update({ where: { userId }, data: { name: updatedUser.name, phone: updatedUser.phone, profileImage: updatedUser.profileImage } })),
            sync(() => prisma.accountsTeam.update({ where: { userId }, data: { name: updatedUser.name, phone: updatedUser.phone, profileImage: updatedUser.profileImage } })),
            sync(() => prisma.transportTeam.update({ where: { userId }, data: { name: updatedUser.name, phone: updatedUser.phone, profileImage: updatedUser.profileImage } })),
            sync(() => prisma.admissionTeam.update({ where: { userId }, data: { name: updatedUser.name, phone: updatedUser.phone, profileImage: updatedUser.profileImage } })),
        ]);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Update my profile error:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
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

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

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

// ==================== REGISTER ====================

const register = async (req, res) => {
    try {
        const { name, email, password, phone, role = 'Student', collegeId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        let existingUser;
        if (collegeId) {
            existingUser = await prisma.user.findUnique({
                where: { email_collegeId: { email, collegeId } },
            });
        } else {
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
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

            let roleProfile = null;

            switch (role) {
                case 'Student':
                    if (collegeId) {
                        roleProfile = await tx.student.create({
                            data: {
                                name,
                                email,
                                phone,
                                password: hashedPassword,
                                studentId: `STU${Date.now()}`,
                                user: { connect: { id: user.id } },
                                college: { connect: { id: collegeId } },
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
            error: error.message
        });
    }
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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await setOTP(phone, otp, 600);

        // --- Trigger AWS SNS SMS ---
        console.log(`[SNS] Attempting to send OTP to: ${phone}`);
        try {
            await sendSMSOTP(phone, otp);
        } catch (snsError) {
            console.error("AWS SNS failed:", snsError.message);
            // Fallback: Code will still show in console logs for testing
        }

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

        const otpData = await getOTP(phone);

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found'
            });
        }

        if (otpData.attempts >= 5) {
            await deleteOTP(phone);
            return res.status(429).json({
                success: false,
                message: 'Maximum OTP verification attempts exceeded'
            });
        }

        if (otpData.otp !== otp) {
            await incrementOTPAttempts(phone);
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                attemptsRemaining: 5 - (otpData.attempts + 1),
            });
        }

        await deleteOTP(phone);

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

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'User account is inactive'
            });
        }

        if (user.collegeId && user.college && user.college.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'College is not active'
            });
        }

        const token = generateToken(user.id, user.role, user.collegeId);

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
            if (req.accepts('html')) {
                const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
                const url = new URL('/login', frontendBase);
                url.hash = `googleError=${encodeURIComponent(result.message || 'Google login failed')}`;
                return res.redirect(url.toString());
            }
            return res.status(400).json(result);
        }

        if (req.accepts('html')) {
            const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
            const url = new URL('/login', frontendBase);
            url.hash = `googleToken=${encodeURIComponent(result.token)}`;
            return res.redirect(url.toString());
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
            return res.status(400).json({ success: false, message: '2FA token is required' });
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
            return res.status(400).json({ success: false, message: '2FA token is required' });
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
            return res.status(400).json({ success: false, message: '2FA token is required' });
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
    getMyProfile,
    updateMyProfile,
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
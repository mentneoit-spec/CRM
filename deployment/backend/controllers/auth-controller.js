const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const {
    setOTP,
    getOTP,
    deleteOTP,
    incrementOTPAttempts,
    setVerificationFlag,
    getVerificationFlag,
    deleteVerificationFlag,
} = require('../utils/redis-service');
const { sendEmail } = require('../utils/email-service');
const { sendSMSOTP } = require('../utils/sms');

// ==================== LOGIN ====================

const login = async (req, res) => {
    try {
        const { email, identifier, password, collegeId } = req.body;
        const identifierInput = String(identifier ?? email ?? '').trim();
        const passwordInput = String(password || '');
        const passwordTrimmed = passwordInput.trim();
        const passwordCandidates = passwordTrimmed && passwordTrimmed !== passwordInput
            ? [passwordInput, passwordTrimmed]
            : [passwordInput];

        // If a tenant middleware resolved collegeId (custom domain / proxy), use it as a fallback.
        const normalizedCollegeId = String(collegeId || req.collegeId || '').trim();

        const looksLikeEmail = identifierInput.includes('@');
        const normalizedEmail = looksLikeEmail ? identifierInput.toLowerCase() : '';
        const normalizedPhone = identifierInput.replace(/\s+/g, '');
        const normalizedStudentId = identifierInput.trim();

        if (!identifierInput || !passwordInput) {
            return res.status(400).json({
                success: false,
                message: 'Email (or Student ID) and password are required'
            });
        }

        const buildIdentifierWhere = (collegeWhere) => {
            const or = [];
            if (normalizedEmail) or.push({ email: { equals: normalizedEmail, mode: 'insensitive' } });
            if (normalizedPhone) or.push({ phone: normalizedPhone });
            if (normalizedStudentId) {
                or.push({ StudentProfile: { is: { studentId: normalizedStudentId } } });
            }

            return {
                ...collegeWhere,
                isDeleted: false,
                OR: or.length ? or : undefined,
            };
        };

        const findCandidates = async (collegeWhere, take = 10) => {
            const items = await prisma.user.findMany({
                where: buildIdentifierWhere(collegeWhere),
                include: { college: true },
                take,
            });
            return Array.isArray(items) ? items : [];
        };

        const uniqueById = (items) => {
            const seen = new Set();
            const out = [];
            for (const item of items || []) {
                if (!item?.id || seen.has(item.id)) continue;
                seen.add(item.id);
                out.push(item);
            }
            return out;
        };

        let candidates = [];

        if (normalizedCollegeId) {
            candidates = await findCandidates({ collegeId: normalizedCollegeId }, 10);
        }

        // If collegeId is missing or wrong/stale, fall back to searching across colleges.
        if (!candidates.length) {
            const pool = [];

            // Prefer global accounts only when identifier is actually an email.
            if (normalizedEmail) {
                pool.push(...await findCandidates({ collegeId: null }, 5));
            }
            pool.push(...await findCandidates({ collegeId: { not: null } }, 20));
            candidates = uniqueById(pool);
        }

        // Filter inactive accounts early.
        candidates = (candidates || []).filter((u) => u && u.isActive);

        let matchedUser = null;
        const matchedUsers = [];

        for (const candidate of candidates) {
            if (!candidate?.password || typeof candidate.password !== 'string') continue;
            for (const pw of passwordCandidates) {
                const ok = await bcrypt.compare(pw, candidate.password);
                if (ok) {
                    matchedUsers.push(candidate);
                    break;
                }
            }
        }

        if (matchedUsers.length === 1) {
            matchedUser = matchedUsers[0];
        } else if (matchedUsers.length > 1) {
            return res.status(400).json({
                success: false,
                message: 'Multiple accounts matched these credentials. Please provide collegeId.',
                requiresCollegeId: true,
            });
        }

        if (!matchedUser) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = matchedUser;

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
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const passwordInput = String(password || '');

        if (!normalizedEmail || !passwordInput) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const superAdmin = await prisma.superAdmin.findUnique({
            where: { email: normalizedEmail },
        });

        if (!superAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!superAdmin.password || typeof superAdmin.password !== 'string') {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(passwordInput, superAdmin.password);
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
                email: normalizedEmail,
                collegeId: null,
                role: 'SuperAdmin',
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: superAdmin.name,
                    email: normalizedEmail,
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

const assertCollegeActiveOrThrow = async (collegeId) => {
    if (!collegeId) return null;
    const college = await prisma.college.findUnique({
        where: { id: String(collegeId) },
        select: { id: true, status: true },
    });
    if (!college) {
        const err = new Error('Invalid collegeId');
        err.code = 'INVALID_COLLEGE_ID';
        return Promise.reject(err);
    }
    if (college.status !== 'active') {
        const err = new Error('College is not active');
        err.code = 'COLLEGE_INACTIVE';
        return Promise.reject(err);
    }
    return college;
};

const register = async (req, res) => {
    try {
        const { name, email, password, phone, role = 'Student', collegeId: providedCollegeId } = req.body;

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const resolvedCollegeId = role === 'SuperAdmin' ? null : (providedCollegeId || req.collegeId || null);

        if (resolvedCollegeId) {
            await assertCollegeActiveOrThrow(resolvedCollegeId);
        }

        if (!name || !normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // In production, require email OTP verification before creating accounts.
        if ((process.env.NODE_ENV || 'development') === 'production' && role !== 'SuperAdmin') {
            if (!resolvedCollegeId) {
                return res.status(400).json({
                    success: false,
                    message: 'College not identified. Please provide collegeId or use your college domain.',
                    requiresCollegeId: true,
                });
            }

            const verifyKey = `register:${resolvedCollegeId || 'none'}:${normalizedEmail}`;
            const ok = await getVerificationFlag(verifyKey);
            if (!ok) {
                return res.status(400).json({
                    success: false,
                    message: 'Please verify the OTP sent to your email before registering.',
                    requiresOTP: true,
                });
            }

            await deleteVerificationFlag(verifyKey);
        }

        let existingUser;
        if (resolvedCollegeId) {
            existingUser = await prisma.user.findUnique({
                where: { email_collegeId: { email: normalizedEmail, collegeId: resolvedCollegeId } },
            });
        } else {
            existingUser = await prisma.user.findFirst({
                where: {
                    email: normalizedEmail,
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
                    email: normalizedEmail,
                    password: hashedPassword,
                    phone,
                    role,
                    collegeId: resolvedCollegeId,
                    isActive: true,
                    isEmailVerified: role === 'SuperAdmin' ? true : ((process.env.NODE_ENV || 'development') === 'production'),
                },
            });

            let roleProfile = null;

            switch (role) {
                case 'Student':
                    if (resolvedCollegeId) {
                        roleProfile = await tx.student.create({
                            data: {
                                name,
                                email: normalizedEmail,
                                phone,
                                password: hashedPassword,
                                studentId: `STU${Date.now()}`,
                                user: { connect: { id: user.id } },
                                college: { connect: { id: resolvedCollegeId } },
                            },
                        });
                    }
                    break;
                case 'Teacher':
                    if (resolvedCollegeId) {
                        roleProfile = await tx.teacher.create({
                            data: {
                                name,
                                email: normalizedEmail,
                                phone,
                                password: hashedPassword,
                                user: { connect: { id: user.id } },
                                college: { connect: { id: resolvedCollegeId } },
                            },
                        });
                    }
                    break;
                case 'Parent':
                    if (resolvedCollegeId) {
                        roleProfile = await tx.parent.create({
                            data: {
                                name,
                                email: normalizedEmail,
                                phone,
                                password: hashedPassword,
                                user: { connect: { id: user.id } },
                                college: { connect: { id: resolvedCollegeId } },
                            },
                        });
                    }
                    break;
                case 'Admin':
                    if (resolvedCollegeId) {
                        roleProfile = await tx.admin.create({
                            data: {
                                name,
                                email: normalizedEmail,
                                phone,
                                password: hashedPassword,
                                user: { connect: { id: user.id } },
                                college: { connect: { id: resolvedCollegeId } },
                            },
                        });
                    }
                    break;
                case 'SuperAdmin':
                    roleProfile = await tx.superAdmin.create({
                        data: {
                            name,
                            email: normalizedEmail,
                            phone,
                            password: hashedPassword,
                        },
                    });
                    break;
                case 'AdmissionTeam':
                    if (resolvedCollegeId) {
                        roleProfile = await tx.admissionTeam.create({
                            data: {
                                name,
                                email: normalizedEmail,
                                phone,
                                userId: user.id,
                                collegeId: resolvedCollegeId,
                            },
                        });
                    }
                    break;
                case 'AccountsTeam':
                    if (resolvedCollegeId) {
                        roleProfile = await tx.accountsTeam.create({
                            data: {
                                name,
                                email: normalizedEmail,
                                phone,
                                userId: user.id,
                                collegeId: resolvedCollegeId,
                            },
                        });
                    }
                    break;
                case 'TransportTeam':
                    if (resolvedCollegeId) {
                        roleProfile = await tx.transportTeam.create({
                            data: {
                                name,
                                email: normalizedEmail,
                                phone,
                                userId: user.id,
                                collegeId: resolvedCollegeId,
                            },
                        });
                    }
                    break;
            }

            return { user, roleProfile };
        });

        const token = generateToken(result.user.id, role, resolvedCollegeId);

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
        if (error?.code === 'INVALID_COLLEGE_ID' || error?.code === 'COLLEGE_INACTIVE') {
            return res.status(400).json({
                success: false,
                message: error.code === 'COLLEGE_INACTIVE' ? 'College is not active' : 'Invalid collegeId. Please enter the correct College ID.',
                requiresCollegeId: true,
            });
        }

        // Prisma: record to connect not found / constraint issues -> return a user-friendly 400
        if (error?.code === 'P2025') {
            return res.status(400).json({
                success: false,
                message: 'Invalid collegeId. Please enter the correct College ID.',
                requiresCollegeId: true,
            });
        }
        if (error?.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error during registration',
            error: error.message
        });
    }
};

// ==================== REGISTRATION OTP (EMAIL) ====================

const requestRegistrationOTP = async (req, res) => {
    try {
        const { email, collegeId: providedCollegeId } = req.body || {};
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!normalizedEmail) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const isProduction = (process.env.NODE_ENV || 'development') === 'production';

        let resolvedCollegeId = providedCollegeId || req.collegeId || null;

        // In production we still require an explicit college context; in local/dev
        // we allow email-only registration OTP so you can test signup freely.
        if (!resolvedCollegeId && isProduction) {
            return res.status(400).json({
                success: false,
                message: 'College not identified. Please provide collegeId or use your college domain.',
                requiresCollegeId: true,
            });
        }

        if (resolvedCollegeId) {
            await assertCollegeActiveOrThrow(resolvedCollegeId);
        }

        let existingUser;
        if (resolvedCollegeId) {
            existingUser = await prisma.user.findUnique({
                where: { email_collegeId: { email: normalizedEmail, collegeId: resolvedCollegeId } },
                select: { id: true },
            });
        } else {
            // Dev/global context: look for users without a college assigned
            existingUser = await prisma.user.findFirst({
                where: { email: normalizedEmail, collegeId: null },
                select: { id: true },
            });
        }

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpKey = `register:${resolvedCollegeId || 'none'}:${normalizedEmail}`;

        await setOTP(otpKey, otp, 600);

        const emailResult = await sendEmail(normalizedEmail, 'otpLogin', [normalizedEmail, otp]);
        if (!emailResult?.success) {
            return res.status(500).json({
                success: false,
                message: emailResult?.message || 'Failed to send email OTP',
            });
        }

        res.status(200).json({ success: true, message: 'OTP sent to your email', expiresIn: 600 });
    } catch (error) {
        console.error('Request registration OTP error:', error);
        if (error?.code === 'INVALID_COLLEGE_ID' || error?.code === 'COLLEGE_INACTIVE') {
            return res.status(400).json({
                success: false,
                message: error.code === 'COLLEGE_INACTIVE' ? 'College is not active' : 'Invalid collegeId. Please enter the correct College ID.',
                requiresCollegeId: true,
            });
        }
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
};

const verifyRegistrationOTP = async (req, res) => {
    try {
        const { email, otp, collegeId: providedCollegeId } = req.body || {};
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const providedOtp = String(otp || '').trim();

        if (!normalizedEmail || !providedOtp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const isProduction = (process.env.NODE_ENV || 'development') === 'production';

        let resolvedCollegeId = providedCollegeId || req.collegeId || null;

        if (!resolvedCollegeId && isProduction) {
            return res.status(400).json({
                success: false,
                message: 'College not identified. Please provide collegeId or use your college domain.',
                requiresCollegeId: true,
            });
        }

        if (resolvedCollegeId) {
            await assertCollegeActiveOrThrow(resolvedCollegeId);
        }

        const otpKey = `register:${resolvedCollegeId || 'none'}:${normalizedEmail}`;
        const otpData = await getOTP(otpKey);

        if (!otpData) {
            return res.status(400).json({ success: false, message: 'OTP expired or not found' });
        }

        if (otpData.attempts >= 5) {
            await deleteOTP(otpKey);
            return res.status(429).json({
                success: false,
                message: 'Maximum OTP verification attempts exceeded',
            });
        }

        if (String(otpData.otp) !== providedOtp) {
            await incrementOTPAttempts(otpKey);
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                attemptsRemaining: 5 - (otpData.attempts + 1),
            });
        }

        await deleteOTP(otpKey);

        const verifyKey = `register:${resolvedCollegeId || 'none'}:${normalizedEmail}`;
        await setVerificationFlag(verifyKey, 15 * 60);

        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify registration OTP error:', error);
        if (error?.code === 'INVALID_COLLEGE_ID' || error?.code === 'COLLEGE_INACTIVE') {
            return res.status(400).json({
                success: false,
                message: error.code === 'COLLEGE_INACTIVE' ? 'College is not active' : 'Invalid collegeId. Please enter the correct College ID.',
                requiresCollegeId: true,
            });
        }
        res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
};

// ==================== OTP AUTHENTICATION ====================

const requestOTP = async (req, res) => {
    try {
        const { phone, email, collegeId } = req.body || {};

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPhone = String(phone || '').trim();

        if (collegeId) {
            await assertCollegeActiveOrThrow(collegeId);
        }

        if (!normalizedEmail && !normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone is required'
            });
        }

        let user = null;

        if (normalizedEmail) {
            if (collegeId) {
                user = await prisma.user.findUnique({
                    where: { email_collegeId: { email: normalizedEmail, collegeId } },
                    include: { college: true },
                });
            } else {
                user = await prisma.user.findFirst({
                    where: { email: normalizedEmail, collegeId: null },
                    include: { college: true },
                });

                if (!user) {
                    const matches = await prisma.user.findMany({
                        where: { email: normalizedEmail, collegeId: { not: null } },
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
                return res.status(404).json({
                    success: false,
                    message: 'Email not registered'
                });
            }
        } else {
            if (collegeId) {
                user = await prisma.user.findFirst({ where: { phone: normalizedPhone, collegeId } });
            } else {
                user = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Phone number not registered'
                });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpKey = normalizedEmail
            ? `login:${user.collegeId || 'none'}:${normalizedEmail}`
            : `login:${collegeId || user.collegeId || 'none'}:${normalizedPhone}`;

        await setOTP(otpKey, otp, 600);

        // --- Trigger AWS SNS SMS ---
        if (normalizedPhone) {
            console.log(`[SNS] Attempting to send OTP to: ${normalizedPhone}`);
            try {
                await sendSMSOTP(normalizedPhone, otp);
            } catch (snsError) {
                console.error('AWS SNS failed:', snsError.message);
                // Fallback: Code will still show in console logs for testing
            }
        }

        const targetEmail = normalizedEmail || user.email;
        if (targetEmail) {
            await sendEmail(targetEmail, 'otpLogin', [user.name || targetEmail, otp]);
        }

        res.status(200).json({
            success: true,
            message: normalizedEmail ? 'OTP sent to your email' : 'OTP sent successfully',
            expiresIn: 600,
        });
    } catch (error) {
        console.error('Request OTP error:', error);
        if (error?.code === 'INVALID_COLLEGE_ID' || error?.code === 'COLLEGE_INACTIVE') {
            return res.status(400).json({
                success: false,
                message: error.code === 'COLLEGE_INACTIVE' ? 'College is not active' : 'Invalid collegeId. Please enter the correct College ID.',
                requiresCollegeId: true,
            });
        }
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
};

const verifyOTPLogin = async (req, res) => {
    try {
        const { phone, email, otp, collegeId } = req.body || {};

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPhone = String(phone || '').trim();
        const providedOtp = String(otp || '').trim();

        if (collegeId) {
            await assertCollegeActiveOrThrow(collegeId);
        }

        if ((!normalizedEmail && !normalizedPhone) || !providedOtp) {
            return res.status(400).json({
                success: false,
                message: 'Email/phone and OTP are required'
            });
        }

        let user = null;
        if (normalizedEmail) {
            if (collegeId) {
                user = await prisma.user.findUnique({
                    where: { email_collegeId: { email: normalizedEmail, collegeId } },
                    include: { college: true },
                });
            } else {
                user = await prisma.user.findFirst({
                    where: { email: normalizedEmail, collegeId: null },
                    include: { college: true },
                });

                if (!user) {
                    const matches = await prisma.user.findMany({
                        where: { email: normalizedEmail, collegeId: { not: null } },
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
        } else {
            if (collegeId) {
                user = await prisma.user.findFirst({
                    where: { phone: normalizedPhone, collegeId },
                    include: { college: true },
                });
            } else {
                user = await prisma.user.findFirst({
                    where: { phone: normalizedPhone },
                    include: { college: true },
                });
            }
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otpKey = normalizedEmail
            ? `login:${user.collegeId || 'none'}:${normalizedEmail}`
            : `login:${collegeId || user.collegeId || 'none'}:${normalizedPhone}`;

        const otpData = await getOTP(otpKey);

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found'
            });
        }

        if (otpData.attempts >= 5) {
            await deleteOTP(otpKey);
            return res.status(429).json({
                success: false,
                message: 'Maximum OTP verification attempts exceeded'
            });
        }

        if (String(otpData.otp) !== providedOtp) {
            await incrementOTPAttempts(otpKey);
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                attemptsRemaining: 5 - (otpData.attempts + 1),
            });
        }

        await deleteOTP(otpKey);

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
                ...(normalizedPhone ? { isPhoneVerified: true } : {}),
                ...(normalizedEmail ? { isEmailVerified: true } : {}),
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
        if (error?.code === 'INVALID_COLLEGE_ID' || error?.code === 'COLLEGE_INACTIVE') {
            return res.status(400).json({
                success: false,
                message: error.code === 'COLLEGE_INACTIVE' ? 'College is not active' : 'Invalid collegeId. Please enter the correct College ID.',
                requiresCollegeId: true,
            });
        }
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
    requestRegistrationOTP,
    verifyRegistrationOTP,
    googleAuthUrl,
    googleCallback,
    setup2FA,
    enable2FA,
    disable2FA,
    verify2FA,
};
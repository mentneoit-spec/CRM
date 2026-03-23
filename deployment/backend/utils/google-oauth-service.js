const { OAuth2Client } = require('google-auth-library');
const prisma = require('../lib/prisma');
const { generateToken } = require('./jwt');

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google/callback'
);

// Generate Google OAuth URL
const getGoogleAuthUrl = (collegeId = null) => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const state = collegeId ? JSON.stringify({ collegeId }) : null;

    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state,
        prompt: 'consent',
    });

    return authUrl;
};

// Verify Google token and get user info
const verifyGoogleToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        return {
            success: true,
            user: {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                emailVerified: payload.email_verified,
            },
        };
    } catch (error) {
        console.error('Verify Google token error:', error);
        return {
            success: false,
            message: 'Invalid Google token',
            error: error.message,
        };
    }
};

// Handle Google OAuth callback
const handleGoogleCallback = async (code, state) => {
    try {
        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Verify token and get user info
        const verification = await verifyGoogleToken(tokens.id_token);

        if (!verification.success) {
            return verification;
        }

        const googleUser = verification.user;
        const stateData = state ? JSON.parse(state) : {};
        const collegeId = stateData.collegeId || null;

        // Check if user exists
        let user;
        if (collegeId) {
            user = await prisma.user.findFirst({
                where: {
                    email: googleUser.email,
                    collegeId,
                },
                include: { college: true },
            });
        } else {
            user = await prisma.user.findFirst({
                where: { email: googleUser.email },
                include: { college: true },
            });
        }

        if (!user) {
            return {
                success: false,
                message: 'User not found. Please register first or contact admin.',
                googleUser,
            };
        }

        // Check if user is active
        if (!user.isActive) {
            return {
                success: false,
                message: 'User account is inactive',
            };
        }

        // Check college status
        if (user.collegeId && user.college && user.college.status !== 'active') {
            return {
                success: false,
                message: 'College is not active',
            };
        }

        // Update user profile image if not set
        if (!user.profileImage && googleUser.picture) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    profileImage: googleUser.picture,
                    isEmailVerified: true,
                },
            });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Generate JWT token
        const jwtToken = generateToken(user.id, user.role, user.collegeId);

        const { password: _, ...userWithoutPassword } = user;

        return {
            success: true,
            message: 'Google login successful',
            user: userWithoutPassword,
            token: jwtToken,
        };
    } catch (error) {
        console.error('Google callback error:', error);
        return {
            success: false,
            message: 'Error processing Google login',
            error: error.message,
        };
    }
};

// Link Google account to existing user
const linkGoogleAccount = async (userId, googleToken) => {
    try {
        const verification = await verifyGoogleToken(googleToken);

        if (!verification.success) {
            return verification;
        }

        const googleUser = verification.user;

        // Check if Google account is already linked to another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email: googleUser.email,
                id: { not: userId },
            },
        });

        if (existingUser) {
            return {
                success: false,
                message: 'This Google account is already linked to another user',
            };
        }

        // Update user with Google info
        await prisma.user.update({
            where: { id: userId },
            data: {
                email: googleUser.email,
                profileImage: googleUser.picture || undefined,
                isEmailVerified: true,
                metadata: {
                    googleId: googleUser.googleId,
                    googleLinked: true,
                },
            },
        });

        return {
            success: true,
            message: 'Google account linked successfully',
        };
    } catch (error) {
        console.error('Link Google account error:', error);
        return {
            success: false,
            message: 'Error linking Google account',
            error: error.message,
        };
    }
};

// Unlink Google account
const unlinkGoogleAccount = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.metadata?.googleLinked) {
            return {
                success: false,
                message: 'Google account not linked',
            };
        }

        // Remove Google info
        await prisma.user.update({
            where: { id: userId },
            data: {
                metadata: {
                    ...user.metadata,
                    googleId: null,
                    googleLinked: false,
                },
            },
        });

        return {
            success: true,
            message: 'Google account unlinked successfully',
        };
    } catch (error) {
        console.error('Unlink Google account error:', error);
        return {
            success: false,
            message: 'Error unlinking Google account',
            error: error.message,
        };
    }
};

// Register new user with Google
const registerWithGoogle = async (googleToken, collegeId, role = 'Student') => {
    try {
        const verification = await verifyGoogleToken(googleToken);

        if (!verification.success) {
            return verification;
        }

        const googleUser = verification.user;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                email: googleUser.email,
                collegeId,
            },
        });

        if (existingUser) {
            return {
                success: false,
                message: 'User already exists with this email',
            };
        }

        // Create new user
        const user = await prisma.user.create({
            data: {
                name: googleUser.name,
                email: googleUser.email,
                password: '', // No password for Google OAuth users
                profileImage: googleUser.picture,
                role,
                collegeId,
                isEmailVerified: true,
                isActive: true,
                metadata: {
                    googleId: googleUser.googleId,
                    googleLinked: true,
                },
            },
        });

        // Generate JWT token
        const jwtToken = generateToken(user.id, role, collegeId);

        const { password: _, ...userWithoutPassword } = user;

        return {
            success: true,
            message: 'Registration with Google successful',
            user: userWithoutPassword,
            token: jwtToken,
        };
    } catch (error) {
        console.error('Register with Google error:', error);
        return {
            success: false,
            message: 'Error registering with Google',
            error: error.message,
        };
    }
};

module.exports = {
    getGoogleAuthUrl,
    verifyGoogleToken,
    handleGoogleCallback,
    linkGoogleAccount,
    unlinkGoogleAccount,
    registerWithGoogle,
};

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const prisma = require('../lib/prisma');

// Generate 2FA secret for user
const generate2FASecret = async (userId, userEmail) => {
    try {
        const secret = speakeasy.generateSecret({
            name: `College ERP (${userEmail})`,
            issuer: 'College Management System',
            length: 32,
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        return {
            success: true,
            secret: secret.base32,
            qrCode: qrCodeUrl,
            otpauthUrl: secret.otpauth_url,
        };
    } catch (error) {
        console.error('Generate 2FA secret error:', error);
        return {
            success: false,
            message: 'Error generating 2FA secret',
            error: error.message,
        };
    }
};

// Verify 2FA token
const verify2FAToken = (secret, token) => {
    try {
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2, // Allow 2 time steps before/after for clock drift
        });

        return {
            success: verified,
            message: verified ? '2FA token verified' : 'Invalid 2FA token',
        };
    } catch (error) {
        console.error('Verify 2FA token error:', error);
        return {
            success: false,
            message: 'Error verifying 2FA token',
            error: error.message,
        };
    }
};

// Enable 2FA for user
const enable2FA = async (userId, token) => {
    try {
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        if (!user.twoFASecret) {
            return {
                success: false,
                message: '2FA secret not generated. Please generate secret first.',
            };
        }

        // Verify token
        const verification = verify2FAToken(user.twoFASecret, token);

        if (!verification.success) {
            return verification;
        }

        // Enable 2FA
        await prisma.user.update({
            where: { id: userId },
            data: { twoFAEnabled: true },
        });

        return {
            success: true,
            message: '2FA enabled successfully',
        };
    } catch (error) {
        console.error('Enable 2FA error:', error);
        return {
            success: false,
            message: 'Error enabling 2FA',
            error: error.message,
        };
    }
};

// Disable 2FA for user
const disable2FA = async (userId, token) => {
    try {
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        if (!user.twoFAEnabled) {
            return {
                success: false,
                message: '2FA is not enabled',
            };
        }

        // Verify token before disabling
        const verification = verify2FAToken(user.twoFASecret, token);

        if (!verification.success) {
            return verification;
        }

        // Disable 2FA
        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFAEnabled: false,
                twoFASecret: null,
            },
        });

        return {
            success: true,
            message: '2FA disabled successfully',
        };
    } catch (error) {
        console.error('Disable 2FA error:', error);
        return {
            success: false,
            message: 'Error disabling 2FA',
            error: error.message,
        };
    }
};

// Setup 2FA (generate and save secret)
const setup2FA = async (userId, userEmail) => {
    try {
        // Generate secret
        const secretData = await generate2FASecret(userId, userEmail);

        if (!secretData.success) {
            return secretData;
        }

        // Save secret to database (not enabled yet)
        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFASecret: secretData.secret,
                twoFAEnabled: false,
            },
        });

        return {
            success: true,
            message: '2FA setup initiated. Scan QR code and verify to enable.',
            qrCode: secretData.qrCode,
            secret: secretData.secret,
            otpauthUrl: secretData.otpauthUrl,
        };
    } catch (error) {
        console.error('Setup 2FA error:', error);
        return {
            success: false,
            message: 'Error setting up 2FA',
            error: error.message,
        };
    }
};

// Validate 2FA during login
const validate2FALogin = async (userId, token) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        if (!user.twoFAEnabled) {
            return {
                success: true,
                message: '2FA not enabled for this user',
            };
        }

        // Verify token
        const verification = verify2FAToken(user.twoFASecret, token);

        return verification;
    } catch (error) {
        console.error('Validate 2FA login error:', error);
        return {
            success: false,
            message: 'Error validating 2FA',
            error: error.message,
        };
    }
};

// Generate backup codes
const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
    }
    return codes;
};

// Save backup codes
const saveBackupCodes = async (userId) => {
    try {
        const codes = generateBackupCodes();

        // In production, hash these codes before storing
        await prisma.user.update({
            where: { id: userId },
            data: {
                metadata: {
                    backupCodes: codes,
                },
            },
        });

        return {
            success: true,
            codes,
            message: 'Backup codes generated. Store them securely.',
        };
    } catch (error) {
        console.error('Save backup codes error:', error);
        return {
            success: false,
            message: 'Error generating backup codes',
            error: error.message,
        };
    }
};

// Verify backup code
const verifyBackupCode = async (userId, code) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.metadata?.backupCodes) {
            return {
                success: false,
                message: 'No backup codes found',
            };
        }

        const codes = user.metadata.backupCodes;
        const codeIndex = codes.indexOf(code);

        if (codeIndex === -1) {
            return {
                success: false,
                message: 'Invalid backup code',
            };
        }

        // Remove used code
        codes.splice(codeIndex, 1);

        await prisma.user.update({
            where: { id: userId },
            data: {
                metadata: {
                    ...user.metadata,
                    backupCodes: codes,
                },
            },
        });

        return {
            success: true,
            message: 'Backup code verified',
            remainingCodes: codes.length,
        };
    } catch (error) {
        console.error('Verify backup code error:', error);
        return {
            success: false,
            message: 'Error verifying backup code',
            error: error.message,
        };
    }
};

module.exports = {
    generate2FASecret,
    verify2FAToken,
    enable2FA,
    disable2FA,
    setup2FA,
    validate2FALogin,
    generateBackupCodes,
    saveBackupCodes,
    verifyBackupCode,
};

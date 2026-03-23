const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// In-memory OTP store (use Redis in production)
const otpStore = {};

// Generate OTP
const generateOTP = (phone) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    otpStore[phone] = {
        otp,
        expiresAt,
        attempts: 0,
    };

    return otp;
};

// Send OTP (simulate SMS)
const sendOTP = async (phone, otp) => {
    try {
        // In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
        console.log(`[OTP] Phone: ${phone}, OTP: ${otp}`);
        
        // For demo, store in log file
        const fs = require('fs');
        fs.appendFileSync('otp.log', `${new Date().toISOString()} - ${phone}: ${otp}\n`);
        
        return true;
    } catch (error) {
        console.error('Send OTP error:', error);
        return false;
    }
};

// Verify OTP
const verifyOTP = async (phone, otp) => {
    try {
        const otpData = otpStore[phone];

        if (!otpData) {
            return { success: false, message: 'OTP not found or expired' };
        }

        if (new Date() > otpData.expiresAt) {
            delete otpStore[phone];
            return { success: false, message: 'OTP has expired' };
        }

        if (otpData.attempts >= 5) {
            delete otpStore[phone];
            return { success: false, message: 'Maximum OTP verification attempts exceeded' };
        }

        if (otpData.otp !== otp) {
            otpData.attempts++;
            return { success: false, message: 'Invalid OTP' };
        }

        delete otpStore[phone];
        return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
        console.error('Verify OTP error:', error);
        return { success: false, message: 'Error verifying OTP' };
    }
};

// Request OTP for login
const requestLoginOTP = async (phone) => {
    try {
        // Check if phone exists in system
        const user = await prisma.user.findFirst({
            where: { phone },
        });

        if (!user) {
            return { success: false, message: 'Phone number not registered' };
        }

        const otp = generateOTP(phone);
        const sent = await sendOTP(phone, otp);

        if (!sent) {
            return { success: false, message: 'Failed to send OTP' };
        }

        return { 
            success: true, 
            message: 'OTP sent successfully',
            expiresIn: 600, // 10 minutes
        };
    } catch (error) {
        console.error('Request OTP error:', error);
        return { success: false, message: 'Error sending OTP' };
    }
};

// Request OTP for registration
const requestRegistrationOTP = async (phone) => {
    try {
        // Check if phone is already registered
        const user = await prisma.user.findFirst({
            where: { phone },
        });

        if (user) {
            return { success: false, message: 'Phone number already registered' };
        }

        const otp = generateOTP(phone);
        const sent = await sendOTP(phone, otp);

        if (!sent) {
            return { success: false, message: 'Failed to send OTP' };
        }

        return { 
            success: true, 
            message: 'OTP sent successfully',
            expiresIn: 600,
        };
    } catch (error) {
        console.error('Request registration OTP error:', error);
        return { success: false, message: 'Error sending OTP' };
    }
};

// Verify OTP for login
const verifyLoginOTP = async (phone, otp) => {
    try {
        const verification = await verifyOTP(phone, otp);

        if (!verification.success) {
            return verification;
        }

        // OTP verified, user can proceed with login
        return { success: true, message: 'OTP verified, proceed with login' };
    } catch (error) {
        console.error('Verify login OTP error:', error);
        return { success: false, message: 'Error verifying OTP' };
    }
};

// Verify OTP for registration
const verifyRegistrationOTP = async (phone, otp) => {
    try {
        const verification = await verifyOTP(phone, otp);

        if (!verification.success) {
            return verification;
        }

        // OTP verified, user can proceed with registration
        return { success: true, message: 'OTP verified, proceed with registration' };
    } catch (error) {
        console.error('Verify registration OTP error:', error);
        return { success: false, message: 'Error verifying OTP' };
    }
};

module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP,
    requestLoginOTP,
    requestRegistrationOTP,
    verifyLoginOTP,
    verifyRegistrationOTP,
};

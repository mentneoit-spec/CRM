const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // e.g., svljyothikanookala30@gmail.com
        pass: process.env.EMAIL_PASSWORD, // your 16-char App Password
    },
});

// Email templates
const emailTemplates = {
    welcome: (name, email, password) => ({
        subject: 'Welcome to Your School Management System',
        html: `
            <h2>Welcome, ${name}!</h2>
            <p>Your account has been created successfully.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
            <p>Please log in and change your password immediately.</p>
        `,
    }),

    otpLogin: (name, otp) => ({
        subject: 'Your Gravity CRM Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4A90E2;">OTP Verification</h2>
                <p>Dear ${name},</p>
                <p>Your One-Time Password (OTP) for login/registration is:</p>
                <h1 style="background: #f4f4f4; padding: 15px; display: inline-block; letter-spacing: 5px; color: #333; border-radius: 5px;">${otp}</h1>
                <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email.</p>
            </div>
        `,
    }),

    feeReminder: (studentName, parentName, totalDue, dueDate) => ({
        subject: `Reminder: School Fee Payment Due - ${studentName}`,
        html: `
            <h2>School Fee Payment Reminder</h2>
            <p>Dear ${parentName},</p>
            <p>This is a reminder that the school fee for <strong>${studentName}</strong> is due.</p>
            <p><strong>Amount Due:</strong> ₹${totalDue}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p>Please complete the payment at your earliest convenience.</p>
            <p>Thank you!</p>
        `,
    }),

    admissionApproved: (studentName, parentName) => ({
        subject: `Admission Approved - ${studentName}`,
        html: `
            <h2>Congratulations!</h2>
            <p>Dear ${parentName},</p>
            <p>We are pleased to inform you that <strong>${studentName}</strong> has been approved for admission.</p>
            <p>Please log in to complete the final registration and payment steps.</p>
            <p>Welcome to our school community!</p>
        `,
    }),

    admissionRejected: (studentName, parentName, reason) => ({
        subject: `Admission Status Update - ${studentName}`,
        html: `
            <h2>Admission Application Update</h2>
            <p>Dear ${parentName},</p>
            <p>We regret to inform you that the admission application for <strong>${studentName}</strong> has not been approved at this time.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you have any questions, please contact our admission team.</p>
        `,
    }),

    markSheetGenerated: (studentName, parentName, classSection) => ({
        subject: `Marksheet Available - ${studentName}`,
        html: `
            <h2>Marksheet Available</h2>
            <p>Dear ${parentName},</p>
            <p>The marksheet for <strong>${studentName}</strong> (Class ${classSection}) is now available.</p>
            <p>Please log in to your parent portal to view or download the marksheet.</p>
        `,
    }),

    attendanceAlert: (studentName, parentName, attendancePercentage) => ({
        subject: `Attendance Alert - ${studentName}`,
        html: `
            <h2>Attendance Alert</h2>
            <p>Dear ${parentName},</p>
            <p>The current attendance percentage for <strong>${studentName}</strong> is ${attendancePercentage}%.</p>
            <p>Please ensure regular attendance to avoid any academic issues.</p>
        `,
    }),

    passwordReset: (name, resetToken) => ({
        subject: 'Password Reset Request',
        html: `
            <h2>Password Reset</h2>
            <p>Dear ${name},</p>
            <p>Click the link below to reset your password (valid for 1 hour):</p>
            <p><a href="${process.env.APP_URL}/reset-password/${resetToken}">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
        `,
    }),

    homeworkAssigned: (studentName, parentName, subject, dueDate) => ({
        subject: `New Homework Assigned - ${subject}`,
        html: `
            <h2>Homework Assignment</h2>
            <p>Dear ${parentName},</p>
            <p>Homework in <strong>${subject}</strong> has been assigned to <strong>${studentName}</strong>.</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p>Please check the parent portal for details.</p>
        `,
    }),

    classAnnouncement: (className, announcement) => ({
        subject: `New Announcement - ${className}`,
        html: `
            <h2>Class Announcement</h2>
            <p><strong>Class:</strong> ${className}</p>
            <p><strong>Announcement:</strong></p>
            <p>${announcement}</p>
        `,
    }),
};

// Send email function
const sendEmail = async (to, templateName, variables) => {
    try {
        const template = emailTemplates[templateName];

        if (!template) {
            console.error(`Email template '${templateName}' not found`);
            return { success: false, message: 'Email template not found' };
        }

        const emailContent = template(...variables);

        const mailOptions = {
            from: `"Gravity CRM" <${process.env.EMAIL_USER}>`,
            to,
            subject: emailContent.subject,
            html: emailContent.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to} - Template: ${templateName} - ID: ${info.messageId}`);

        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Send email error:', error);
        return { success: false, message: 'Error sending email', error: error.message };
    }
};

// Send bulk emails
const sendBulkEmails = async (recipients, templateName, variables) => {
    try {
        const results = [];

        for (const recipient of recipients) {
            const result = await sendEmail(recipient.email, templateName, [
                recipient.name,
                ...variables,
            ]);
            results.push({ email: recipient.email, ...result });
        }

        return { success: true, results };
    } catch (error) {
        console.error('Send bulk emails error:', error);
        return { success: false, message: 'Error sending bulk emails' };
    }
};

// Schedule email 
const scheduleEmail = async (to, templateName, variables, scheduleTime) => {
    try {
        const delay = new Date(scheduleTime).getTime() - Date.now();

        if (delay < 0) {
            return { success: false, message: 'Schedule time is in the past' };
        }

        setTimeout(() => {
            sendEmail(to, templateName, variables);
        }, delay);

        return { success: true, message: 'Email scheduled successfully' };
    } catch (error) {
        console.error('Schedule email error:', error);
        return { success: false, message: 'Error scheduling email' };
    }
};

module.exports = {
    sendEmail,
    sendBulkEmails,
    scheduleEmail,
    emailTemplates,
};

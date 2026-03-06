const Bull = require('bull');
const { sendEmail } = require('./email-service');
const prisma = require('../lib/prisma');

// Queue configurations
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create queues
const emailQueue = new Bull('email-queue', REDIS_URL, {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

const notificationQueue = new Bull('notification-queue', REDIS_URL, {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

const reportQueue = new Bull('report-queue', REDIS_URL, {
    defaultJobOptions: {
        attempts: 2,
        timeout: 300000, // 5 minutes
        removeOnComplete: true,
        removeOnFail: false,
    },
});

const paymentQueue = new Bull('payment-queue', REDIS_URL, {
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 3000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

[emailQueue, notificationQueue, reportQueue, paymentQueue].forEach(queue => {
    queue.on('error', (error) => {
        if (process.env.NODE_ENV !== 'test') {
            console.warn(`Bull queue error: ${error.message}`);
        }
    });
});

// ==================== EMAIL QUEUE PROCESSORS ====================

emailQueue.process(async (job) => {
    const { to, templateName, variables } = job.data;

    console.log(`Processing email job: ${job.id} - ${templateName} to ${to}`);

    const result = await sendEmail(to, templateName, variables);

    if (!result.success) {
        throw new Error(result.message);
    }

    return result;
});

// Email queue events
emailQueue.on('completed', (job, result) => {
    console.log(`Email job ${job.id} completed:`, result.message);
});

emailQueue.on('failed', (job, err) => {
    console.error(`Email job ${job.id} failed:`, err.message);
});

// ==================== NOTIFICATION QUEUE PROCESSORS ====================

notificationQueue.process(async (job) => {
    const { userId, collegeId, type, title, message, data } = job.data;

    console.log(`Processing notification job: ${job.id} for user ${userId}`);

    // Create notification in database
    await prisma.notification.create({
        data: {
            userId,
            collegeId,
            type,
            title,
            message,
            data,
            isRead: false,
        },
    });

    // In production, also send push notification via FCM/APNS

    return { success: true, message: 'Notification created' };
});

notificationQueue.on('completed', (job) => {
    console.log(`Notification job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
    console.error(`Notification job ${job.id} failed:`, err.message);
});

// ==================== REPORT QUEUE PROCESSORS ====================

reportQueue.process(async (job) => {
    const { reportType, collegeId, filters, userId } = job.data;

    console.log(`Processing report job: ${job.id} - ${reportType}`);

    // Generate report based on type
    let reportData;

    switch (reportType) {
        case 'attendance':
            reportData = await generateAttendanceReport(collegeId, filters);
            break;
        case 'fees':
            reportData = await generateFeesReport(collegeId, filters);
            break;
        case 'academic':
            reportData = await generateAcademicReport(collegeId, filters);
            break;
        default:
            throw new Error(`Unknown report type: ${reportType}`);
    }

    // Save report to database
    const report = await prisma.report.create({
        data: {
            type: reportType,
            collegeId,
            userId,
            data: reportData,
            status: 'completed',
        },
    });

    // Send email notification
    await emailQueue.add({
        to: job.data.userEmail,
        templateName: 'reportReady',
        variables: [job.data.userName, reportType],
    });

    return { success: true, reportId: report.id };
});

reportQueue.on('completed', (job, result) => {
    console.log(`Report job ${job.id} completed:`, result.reportId);
});

reportQueue.on('failed', (job, err) => {
    console.error(`Report job ${job.id} failed:`, err.message);
});

// ==================== PAYMENT QUEUE PROCESSORS ====================

paymentQueue.process(async (job) => {
    const { paymentId, action } = job.data;

    console.log(`Processing payment job: ${job.id} - ${action}`);

    switch (action) {
        case 'send_reminder':
            await sendPaymentReminder(paymentId);
            break;
        case 'process_refund':
            await processRefund(paymentId);
            break;
        case 'update_status':
            await updatePaymentStatus(paymentId, job.data.status);
            break;
        default:
            throw new Error(`Unknown payment action: ${action}`);
    }

    return { success: true, message: `Payment ${action} completed` };
});

paymentQueue.on('completed', (job) => {
    console.log(`Payment job ${job.id} completed`);
});

paymentQueue.on('failed', (job, err) => {
    console.error(`Payment job ${job.id} failed:`, err.message);
});

// ==================== HELPER FUNCTIONS ====================

const generateAttendanceReport = async (collegeId, filters) => {
    // Implementation for attendance report generation
    const attendanceData = await prisma.attendance.findMany({
        where: {
            collegeId,
            ...filters,
        },
        include: {
            student: true,
            subject: true,
        },
    });

    return attendanceData;
};

const generateFeesReport = async (collegeId, filters) => {
    // Implementation for fees report generation
    const feesData = await prisma.payment.findMany({
        where: {
            collegeId,
            ...filters,
        },
        include: {
            student: true,
            fee: true,
        },
    });

    return feesData;
};

const generateAcademicReport = async (collegeId, filters) => {
    // Implementation for academic report generation
    const academicData = await prisma.examResult.findMany({
        where: {
            collegeId,
            ...filters,
        },
        include: {
            student: true,
            subject: true,
            exam: true,
        },
    });

    return academicData;
};

const sendPaymentReminder = async (paymentId) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            student: { include: { parent: true } },
            fee: true,
        },
    });

    if (payment && payment.student?.parent?.email) {
        await emailQueue.add({
            to: payment.student.parent.email,
            templateName: 'feeReminder',
            variables: [
                payment.student.name,
                payment.student.parent.name,
                payment.amount,
                payment.fee.dueDate,
            ],
        });
    }
};

const processRefund = async (paymentId) => {
    // Implementation for refund processing
    await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'refunded' },
    });
};

const updatePaymentStatus = async (paymentId, status) => {
    await prisma.payment.update({
        where: { id: paymentId },
        data: { status },
    });
};

// ==================== QUEUE MANAGEMENT FUNCTIONS ====================

// Add email to queue
const queueEmail = async (to, templateName, variables, delay = 0) => {
    return await emailQueue.add(
        { to, templateName, variables },
        { delay }
    );
};

// Add notification to queue
const queueNotification = async (userId, collegeId, type, title, message, data = {}) => {
    return await notificationQueue.add({
        userId,
        collegeId,
        type,
        title,
        message,
        data,
    });
};

// Add report generation to queue
const queueReport = async (reportType, collegeId, filters, userId, userEmail, userName) => {
    return await reportQueue.add({
        reportType,
        collegeId,
        filters,
        userId,
        userEmail,
        userName,
    });
};

// Add payment processing to queue
const queuePayment = async (paymentId, action, additionalData = {}) => {
    return await paymentQueue.add({
        paymentId,
        action,
        ...additionalData,
    });
};

// Get queue stats
const getQueueStats = async (queueName) => {
    let queue;
    switch (queueName) {
        case 'email':
            queue = emailQueue;
            break;
        case 'notification':
            queue = notificationQueue;
            break;
        case 'report':
            queue = reportQueue;
            break;
        case 'payment':
            queue = paymentQueue;
            break;
        default:
            return null;
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
    ]);

    return {
        waiting,
        active,
        completed,
        failed,
        delayed,
    };
};

// Clean completed jobs
const cleanQueue = async (queueName, grace = 3600000) => {
    let queue;
    switch (queueName) {
        case 'email':
            queue = emailQueue;
            break;
        case 'notification':
            queue = notificationQueue;
            break;
        case 'report':
            queue = reportQueue;
            break;
        case 'payment':
            queue = paymentQueue;
            break;
        default:
            return null;
    }

    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
};

// Graceful shutdown
const closeQueues = async () => {
    await Promise.all([
        emailQueue.close(),
        notificationQueue.close(),
        reportQueue.close(),
        paymentQueue.close(),
    ]);
    console.log('✓ All queues closed');
};

module.exports = {
    emailQueue,
    notificationQueue,
    reportQueue,
    paymentQueue,
    queueEmail,
    queueNotification,
    queueReport,
    queuePayment,
    getQueueStats,
    cleanQueue,
    closeQueues,
};

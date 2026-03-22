const prisma = require('../lib/prisma');

// ==================== PAYMENT MANAGEMENT ====================

// Get all payments
const getAllPayments = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { status, page = 1, limit = 20, startDate, endDate } = req.query;

        let filter = { collegeId };
        if (status) filter.status = status;

        if (startDate && endDate) {
            filter.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const skip = (page - 1) * limit;

        const payments = await prisma.payment.findMany({
            where: filter,
            select: {
                id: true,
                amount: true,
                status: true,
                paymentDate: true,
                notes: true,
                transactionId: true,
                createdAt: true,
                studentId: true,
                feeId: true,
                student: { select: { id: true, name: true, email: true, sclass: { select: { sclassName: true } } } },
                fee: { select: { id: true, feeType: true, amount: true } },
            },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.payment.count({ where: filter });

        res.status(200).json({
            success: true,
            data: payments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const collegeId = req.collegeId;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                student: true,
                fee: true,
            },
        });

        if (!payment || payment.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        console.error('Get payment details error:', error);
        res.status(500).json({ success: false, message: 'Error fetching payment' });
    }
};

// Record manual payment
const recordManualPayment = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { studentId, feeId, amount, paymentMethod, reference, notes } = req.body;

        if (!studentId || !feeId || !amount || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const fee = await prisma.fee.findUnique({
            where: { id: feeId },
        });

        if (!fee || fee.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Fee not found' });
        }

        const payment = await prisma.payment.create({
            data: {
                studentId,
                feeId,
                amount: parseFloat(amount),
                paymentMethod,
                transactionId: reference || `MANUAL-${Date.now()}`,
                status: 'completed',
                notes,
                collegeId,
            },
            include: { student: true, fee: true },
        });

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: payment,
        });
    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({ success: false, message: 'Error recording payment' });
    }
};

// ==================== REFUNDS ====================

// Process refund
const processRefund = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason, amount } = req.body;
        const collegeId = req.collegeId;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment || payment.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });
        }

        const refundAmount = amount || payment.amount;

        const refund = await prisma.refund.create({
            data: {
                paymentId,
                amount: parseFloat(refundAmount),
                reason,
                status: 'pending',
                collegeId,
            },
        });

        // Update payment status
        await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'refunded' },
        });

        res.status(201).json({
            success: true,
            message: 'Refund initiated successfully',
            data: refund,
        });
    } catch (error) {
        console.error('Process refund error:', error);
        res.status(500).json({ success: false, message: 'Error processing refund' });
    }
};

// Get refund status
const getRefundStatus = async (req, res) => {
    try {
        const { refundId } = req.params;
        const collegeId = req.collegeId;

        const refund = await prisma.refund.findUnique({
            where: { id: refundId },
            include: { payment: true },
        });

        if (!refund || refund.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Refund not found' });
        }

        res.status(200).json({ success: true, data: refund });
    } catch (error) {
        console.error('Get refund error:', error);
        res.status(500).json({ success: false, message: 'Error fetching refund' });
    }
};

// ==================== FINANCIAL REPORTS ====================

// Get payment report
const getPaymentReport = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { startDate, endDate, groupBy = 'day' } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            };
        }

        const payments = await prisma.payment.findMany({
            where: {
                collegeId,
                status: 'completed',
                ...dateFilter,
            },
            include: {
                student: { select: { name: true, sclass: { select: { name: true } } } },
                fee: true,
            },
        });

        // Calculate statistics
        let totalAmount = 0;
        let totalTransactions = 0;
        const paymentMethods = {};

        payments.forEach(payment => {
            totalAmount += payment.amount;
            totalTransactions++;
            paymentMethods[payment.paymentMethod] = (paymentMethods[payment.paymentMethod] || 0) + payment.amount;
        });

        res.status(200).json({
            success: true,
            data: {
                totalAmount,
                totalTransactions,
                averagePayment: totalTransactions > 0 ? (totalAmount / totalTransactions).toFixed(2) : 0,
                paymentMethodBreakdown: paymentMethods,
                details: payments,
            },
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ success: false, message: 'Error fetching report' });
    }
};

// Get revenue dashboard
const getRevenueDashboard = async (req, res) => {
    try {
        const collegeId = req.collegeId;

        const totalRevenue = await prisma.payment.aggregate({
            where: { collegeId, status: 'completed' },
            _sum: { amount: true },
        });

        const pendingPayments = await prisma.fee.aggregate({
            where: { collegeId },
            _sum: { amount: true },
        });

        const completedPayments = await prisma.payment.count({
            where: { collegeId, status: 'completed' },
        });

        const refundedAmount = await prisma.refund.aggregate({
            where: { collegeId, status: 'completed' },
            _sum: { amount: true },
        });

        const monthlyData = await prisma.payment.groupBy({
            by: ['createdAt'],
            where: { collegeId, status: 'completed' },
            _sum: { amount: true },
        });

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: totalRevenue._sum.amount || 0,
                pendingFees: pendingPayments._sum.amount || 0,
                completedTransactions: completedPayments,
                refundedAmount: refundedAmount._sum.amount || 0,
                netRevenue: (totalRevenue._sum.amount || 0) - (refundedAmount._sum.amount || 0),
                monthlyBreakdown: monthlyData,
            },
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard' });
    }
};

// Export payment data
const exportPaymentData = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { format = 'csv' } = req.query;

        const payments = await prisma.payment.findMany({
            where: { collegeId },
            include: {
                student: true,
                fee: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        if (format === 'csv') {
            let csv = 'Student Name,Email,Fee Type,Amount,Payment Method,Status,Date\n';
            payments.forEach(payment => {
                csv += `${payment.student.name},${payment.student.email},${payment.fee.feeType},${payment.amount},${payment.paymentMethod},${payment.status},${payment.createdAt}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
            res.send(csv);
        } else {
            res.json({ success: true, data: payments });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, message: 'Error exporting data' });
    }
};

module.exports = {
    getAllPayments,
    getPaymentDetails,
    recordManualPayment,
    processRefund,
    getRefundStatus,
    getPaymentReport,
    getRevenueDashboard,
    exportPaymentData,
};

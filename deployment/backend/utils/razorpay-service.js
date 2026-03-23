const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('./email-service');

const prisma = new PrismaClient();

// Verify Razorpay signature
const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
    try {
        const message = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(message)
            .digest('hex');

        return signature === expectedSignature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

// Handle payment success webhook
const handlePaymentSuccess = async (paymentData) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

        // Verify signature
        const isValidSignature = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            process.env.RAZORPAY_SECRET
        );

        if (!isValidSignature) {
            console.error('Invalid Razorpay signature');
            return { success: false, message: 'Invalid signature' };
        }

        // Update payment status in database
        const payment = await prisma.payment.findFirst({
            where: {
                transactionId: razorpay_order_id,
            },
            include: {
                student: { include: { parent: true } },
                fee: true,
            },
        });

        if (!payment) {
            return { success: false, message: 'Payment not found' };
        }

        // Update payment
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'completed',
                transactionId: razorpay_payment_id,
                paidAt: new Date(),
            },
        });

        // Send confirmation email to parent
        if (payment.student?.parent?.email) {
            await sendEmail(
                payment.student.parent.email,
                'feeConfirmation',
                [
                    payment.student.parent.name || 'Parent',
                    payment.student.name,
                    payment.amount,
                    payment.fee.feeType,
                ]
            );
        }

        return {
            success: true,
            message: 'Payment processed successfully',
            data: updatedPayment,
        };
    } catch (error) {
        console.error('Handle payment success error:', error);
        return { success: false, message: 'Error processing payment' };
    }
};

// Handle payment failure webhook
const handlePaymentFailure = async (paymentData) => {
    try {
        const { razorpay_order_id, error_code, error_description } = paymentData;

        // Update payment status
        const payment = await prisma.payment.findFirst({
            where: { transactionId: razorpay_order_id },
            include: {
                student: { include: { parent: true } },
            },
        });

        if (payment) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'failed',
                    failureReason: error_description,
                },
            });

            // Send failure notification
            if (payment.student?.parent?.email) {
                await sendEmail(
                    payment.student.parent.email,
                    'paymentFailed',
                    [
                        payment.student.parent.name || 'Parent',
                        payment.student.name,
                        error_description,
                    ]
                );
            }
        }

        return {
            success: true,
            message: 'Payment failure recorded',
        };
    } catch (error) {
        console.error('Handle payment failure error:', error);
        return { success: false, message: 'Error recording failure' };
    }
};

// Handle refund webhook
const handleRefund = async (refundData) => {
    try {
        const { razorpay_refund_id, razorpay_payment_id } = refundData;

        // Find payment
        const payment = await prisma.payment.findFirst({
            where: { transactionId: razorpay_payment_id },
            include: {
                student: { include: { parent: true } },
            },
        });

        if (!payment) {
            return { success: false, message: 'Payment not found' };
        }

        // Update refund status
        await prisma.refund.updateMany({
            where: { paymentId: payment.id },
            data: {
                status: 'completed',
                refundId: razorpay_refund_id,
            },
        });

        // Update payment status
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'refunded' },
        });

        // Send refund confirmation email
        if (payment.student?.parent?.email) {
            await sendEmail(
                payment.student.parent.email,
                'refundConfirmation',
                [
                    payment.student.parent.name || 'Parent',
                    payment.student.name,
                    payment.amount,
                ]
            );
        }

        return {
            success: true,
            message: 'Refund processed successfully',
        };
    } catch (error) {
        console.error('Handle refund error:', error);
        return { success: false, message: 'Error processing refund' };
    }
};

// Webhook handler
const handleWebhook = async (req, res) => {
    try {
        const event = req.body;

        console.log(`Received Razorpay webhook: ${event.event}`);

        let result;

        switch (event.event) {
            case 'payment.authorized':
            case 'payment.captured':
                result = await handlePaymentSuccess(event.payload.payment.entity);
                break;

            case 'payment.failed':
                result = await handlePaymentFailure(event.payload.payment.entity);
                break;

            case 'refund.created':
                result = await handleRefund(event.payload.refund.entity);
                break;

            default:
                console.log(`Unhandled event: ${event.event}`);
                return res.status(200).json({ success: true, message: 'Event received' });
        }

        if (result.success) {
            res.status(200).json({ success: true, message: 'Webhook processed' });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, message: 'Error processing webhook' });
    }
};

module.exports = {
    verifyRazorpaySignature,
    handlePaymentSuccess,
    handlePaymentFailure,
    handleRefund,
    handleWebhook,
};

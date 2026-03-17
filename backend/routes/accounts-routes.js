const express = require('express');
const {
    getAllPayments,
    getPaymentDetails,
    recordManualPayment,
    processRefund,
    getRefundStatus,
    getPaymentReport,
    getRevenueDashboard,
    exportPaymentData,
} = require('../controllers/accounts-controller');
const { authorize, authorizeCollege } = require('../middleware/auth');

const router = express.Router();

// ==================== PAYMENT MANAGEMENT ====================
router.get('/payments', authorize('AccountsTeam', 'Admin'), authorizeCollege, getAllPayments);
router.get('/payments/:paymentId', authorize('AccountsTeam', 'Admin'), authorizeCollege, getPaymentDetails);
router.post('/payments/manual', authorize('AccountsTeam', 'Admin'), authorizeCollege, recordManualPayment);

// ==================== REFUNDS ====================
router.post('/refunds/:paymentId', authorize('AccountsTeam', 'Admin'), authorizeCollege, processRefund);
// Alias for frontend: POST /accounts/payments/:paymentId/refund
router.post('/payments/:paymentId/refund', authorize('AccountsTeam', 'Admin'), authorizeCollege, processRefund);
router.get('/refunds/:refundId', authorize('AccountsTeam', 'Admin'), authorizeCollege, getRefundStatus);

// ==================== REPORTS ====================
router.get('/reports/payment', authorize('AccountsTeam', 'Admin'), authorizeCollege, getPaymentReport);
router.get('/dashboard', authorize('AccountsTeam', 'Admin'), authorizeCollege, getRevenueDashboard);
router.get('/export', authorize('AccountsTeam', 'Admin'), authorizeCollege, exportPaymentData);
// Alias for frontend: GET /accounts/payments/export
router.get('/payments/export', authorize('AccountsTeam', 'Admin'), authorizeCollege, exportPaymentData);

module.exports = router;

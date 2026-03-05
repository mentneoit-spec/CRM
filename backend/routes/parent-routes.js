const express = require('express');
const router = express.Router();
const {
    getParentProfile,
    updateParentProfile,
    getMyStudents,
    getStudentProfile,
    getStudentAttendance,
    getStudentMarks,
    getStudentFees,
    getPaymentHistory,
    createPayment,
    verifyPayment,
    getStudentHomework,
    raiseComplaint,
    getMyComplaints,
    downloadReportCard,
    getDashboard,
} = require('../controllers/parent-controller');
const { authorize, authorizeCollege } = require('../middleware/auth');

// ==================== DASHBOARD & PROFILE ====================
router.get('/dashboard', authorize('Parent'), authorizeCollege, getDashboard);
router.get('/profile', authorize('Parent'), authorizeCollege, getParentProfile);
router.put('/profile', authorize('Parent'), authorizeCollege, updateParentProfile);

// ==================== STUDENTS ====================
router.get('/students', authorize('Parent'), authorizeCollege, getMyStudents);
router.get('/students/:studentId', authorize('Parent'), authorizeCollege, getStudentProfile);

// ==================== ATTENDANCE ====================
router.get('/students/:studentId/attendance', authorize('Parent'), authorizeCollege, getStudentAttendance);

// ==================== MARKS & EXAMS ====================
router.get('/students/:studentId/marks', authorize('Parent'), authorizeCollege, getStudentMarks);

// ==================== FEES ====================
router.get('/students/:studentId/fees', authorize('Parent'), authorizeCollege, getStudentFees);

// ==================== PAYMENTS ====================
router.get('/students/:studentId/payments', authorize('Parent'), authorizeCollege, getPaymentHistory);
router.post('/payments', authorize('Parent'), authorizeCollege, createPayment);
router.post('/payments/verify', authorize('Parent'), authorizeCollege, verifyPayment);

// ==================== HOMEWORK ====================
router.get('/students/:studentId/homework', authorize('Parent'), authorizeCollege, getStudentHomework);

// ==================== COMPLAINTS ====================
router.post('/complaints', authorize('Parent'), authorizeCollege, raiseComplaint);
router.get('/students/:studentId/complaints', authorize('Parent'), authorizeCollege, getMyComplaints);

// ==================== REPORTS ====================
router.get('/students/:studentId/report-card', authorize('Parent'), authorizeCollege, downloadReportCard);

module.exports = router;

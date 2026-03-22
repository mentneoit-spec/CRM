const express = require('express');
const {
    getStudentProfile,
    updateStudentProfile,
    getMyAttendance,
    getMyMarks,
    getMyExams,
    getMyFees,
    getMyPaymentHistory,
    createMyPayment,
    verifyMyPayment,
    downloadPaymentReceipt,
    getMyHomework,
    getMyTimetable,
    getMyNotices,
    submitComplaint,
    getMyComplaints,
    getMySubjects,
    getMyTeachers,
    getDashboard,
} = require('../controllers/student-controller');
const { authorize, authorizeCollege } = require('../middleware/auth');

const router = express.Router();

// ==================== PROFILE ====================
router.get('/profile', authorize('Student'), authorizeCollege, getStudentProfile);
router.put('/profile', authorize('Student'), authorizeCollege, updateStudentProfile);

// ==================== ATTENDANCE ====================
router.get('/attendance', authorize('Student'), authorizeCollege, getMyAttendance);

// ==================== MARKS ====================
router.get('/marks', authorize('Student'), authorizeCollege, getMyMarks);

// ==================== EXAMS ====================
router.get('/exams', authorize('Student'), authorizeCollege, getMyExams);

// ==================== RESULTS (ALIAS) ====================
router.get('/results', authorize('Student'), authorizeCollege, getMyMarks);

// ==================== FEES ====================
router.get('/fees', authorize('Student'), authorizeCollege, getMyFees);
router.get('/payments', authorize('Student'), authorizeCollege, getMyPaymentHistory);
router.post('/payments', authorize('Student'), authorizeCollege, createMyPayment);
router.post('/payments/verify', authorize('Student'), authorizeCollege, verifyMyPayment);
router.get('/payments/:paymentId/receipt', authorize('Student'), authorizeCollege, downloadPaymentReceipt);

// ==================== HOMEWORK ====================
router.get('/homework', authorize('Student'), authorizeCollege, getMyHomework);

// ==================== TIMETABLE ====================
router.get('/timetable', authorize('Student'), authorizeCollege, getMyTimetable);

// ==================== NOTICES ====================
router.get('/notices', authorize('Student'), authorizeCollege, getMyNotices);

// ==================== COMPLAINTS ====================
router.post('/complaints', authorize('Student'), authorizeCollege, submitComplaint);
router.get('/complaints', authorize('Student'), authorizeCollege, getMyComplaints);

// ==================== SUBJECTS ====================
router.get('/subjects', authorize('Student'), authorizeCollege, getMySubjects);

// ==================== TEACHERS ====================
router.get('/teachers', authorize('Student'), authorizeCollege, getMyTeachers);

// ==================== DASHBOARD ====================
router.get('/dashboard', authorize('Student'), authorizeCollege, getDashboard);

module.exports = router;

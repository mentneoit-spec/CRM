const express = require('express');
const {
    getStudentProfile,
    updateStudentProfile,
    getMyAttendance,
    getMyMarks,
    getMyFees,
    getMyPaymentHistory,
    getMyHomework,
    getMyTimetable,
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

// ==================== FEES ====================
router.get('/fees', authorize('Student'), authorizeCollege, getMyFees);
router.get('/payments', authorize('Student'), authorizeCollege, getMyPaymentHistory);

// ==================== HOMEWORK ====================
router.get('/homework', authorize('Student'), authorizeCollege, getMyHomework);

// ==================== TIMETABLE ====================
router.get('/timetable', authorize('Student'), authorizeCollege, getMyTimetable);

// ==================== DASHBOARD ====================
router.get('/dashboard', authorize('Student'), authorizeCollege, getDashboard);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getTeacherProfile,
    updateTeacherProfile,
    getMyClasses,
    getClassStudents,
    markAttendance,
    getAttendanceReport,
    uploadMarks,
    getMarksReport,
    createHomework,
    getMyHomework,
    getDashboard,
} = require('../controllers/teacher-controller');
const { authorize, authorizeCollege } = require('../middleware/auth');

// ==================== DASHBOARD & PROFILE ====================
router.get('/dashboard', authorize('Teacher'), authorizeCollege, getDashboard);
router.get('/profile', authorize('Teacher'), authorizeCollege, getTeacherProfile);
router.put('/profile', authorize('Teacher'), authorizeCollege, updateTeacherProfile);

// ==================== CLASSES & STUDENTS ====================
router.get('/classes', authorize('Teacher'), authorizeCollege, getMyClasses);
router.get('/classes/:classId/students', authorize('Teacher'), authorizeCollege, getClassStudents);

// ==================== ATTENDANCE ====================
router.post('/attendance', authorize('Teacher'), authorizeCollege, markAttendance);
router.get('/attendance-report', authorize('Teacher'), authorizeCollege, getAttendanceReport);

// ==================== MARKS ====================
router.post('/marks', authorize('Teacher'), authorizeCollege, uploadMarks);
router.get('/marks-report', authorize('Teacher'), authorizeCollege, getMarksReport);

// ==================== HOMEWORK ====================
router.post('/homework', authorize('Teacher'), authorizeCollege, createHomework);
router.get('/homework', authorize('Teacher'), authorizeCollege, getMyHomework);

module.exports = router;

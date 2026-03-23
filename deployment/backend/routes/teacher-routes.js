const express = require('express');
const router = express.Router();
const {
    getTeacherProfile,
    updateTeacherProfile,
    getMyClasses,
    getClassStudents,
    getMyStudents,
    createStudentForTeacher,
    bulkImportStudentsForTeacher,
    markAttendance,
    getAttendanceReport,
    uploadMarks,
    getMarksReport,
    createHomework,
    getMyHomework,
    updateHomework,
    deleteHomework,
    getDashboard,
    getMyReports,
    getMyExams,
    createExamForTeacher,
    importExamMarksCsvForTeacher,
    getMyAssignments,
    getMyNotices,
} = require('../controllers/teacher-controller');
const { authorize, authorizeCollege } = require('../middleware/auth');
const { uploadMemory } = require('../utils/file-upload-service');

// ==================== DASHBOARD & PROFILE ====================
router.get('/dashboard', authorize('Teacher'), authorizeCollege, getDashboard);
router.get('/profile', authorize('Teacher'), authorizeCollege, getTeacherProfile);
router.put('/profile', authorize('Teacher'), authorizeCollege, updateTeacherProfile);

// ==================== CLASSES & STUDENTS ====================
router.get('/classes', authorize('Teacher'), authorizeCollege, getMyClasses);
router.get('/classes/:classId/students', authorize('Teacher'), authorizeCollege, getClassStudents);
router.get('/students', authorize('Teacher'), authorizeCollege, getMyStudents);

// Teacher can add students manually and bulk import
router.post('/students', authorize('Teacher'), authorizeCollege, createStudentForTeacher);
router.post(
    '/students/import',
    authorize('Teacher'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    bulkImportStudentsForTeacher
);

// ==================== ATTENDANCE ====================
router.post('/attendance', authorize('Teacher'), authorizeCollege, markAttendance);
router.get('/attendance', authorize('Teacher'), authorizeCollege, getAttendanceReport);
router.get('/attendance/:classId', authorize('Teacher'), authorizeCollege, getAttendanceReport);
router.get('/attendance-report', authorize('Teacher'), authorizeCollege, getAttendanceReport);

// ==================== MARKS ====================
router.post('/marks', authorize('Teacher'), authorizeCollege, uploadMarks);
router.post('/marks/upload', authorize('Teacher'), authorizeCollege, uploadMarks);
router.get('/marks', authorize('Teacher'), authorizeCollege, getMarksReport);
router.get('/marks-report', authorize('Teacher'), authorizeCollege, getMarksReport);

// ==================== HOMEWORK ====================
router.post('/homework', authorize('Teacher'), authorizeCollege, createHomework);
router.get('/homework', authorize('Teacher'), authorizeCollege, getMyHomework);
router.put('/homework/:id', authorize('Teacher'), authorizeCollege, updateHomework);
router.delete('/homework/:id', authorize('Teacher'), authorizeCollege, deleteHomework);

// ==================== REPORTS ====================
router.get('/reports', authorize('Teacher'), authorizeCollege, getMyReports);

// ==================== EXAMS ====================
router.post('/exams', authorize('Teacher'), authorizeCollege, createExamForTeacher);
router.get('/exams', authorize('Teacher'), authorizeCollege, getMyExams);
router.post(
    '/exams/:examId/marks/import',
    authorize('Teacher'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    importExamMarksCsvForTeacher
);

// ==================== ASSIGNMENTS ====================
router.get('/assignments', authorize('Teacher'), authorizeCollege, getMyAssignments);

// ==================== NOTICES ====================
router.get('/notices', authorize('Teacher'), authorizeCollege, getMyNotices);

module.exports = router;

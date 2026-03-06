const express = require('express');
const router = express.Router();
const { authorize, authorizeCollege } = require('../middleware/auth');
const {
    getDashboard,
    createTeacher,
    getAllTeachers,
    createStudent,
    getAllStudents,
    createTeamMember,
    getTeamMembers,
    createClass,
    getAllClasses,
    createSubject,
    getSubjects,
    defineFeeStructure,
} = require('../controllers/admin-controller');

const {
    getAllAdmissions,
    approveAdmission,
    rejectAdmission
} = require('../controllers/admission-controller');

// ==================== DASHBOARD ====================
router.get('/dashboard', authorize('Admin'), authorizeCollege, getDashboard);

// ==================== TEACHERS ====================
router.post('/teachers', authorize('Admin'), authorizeCollege, createTeacher);
router.get('/teachers', authorize('Admin'), authorizeCollege, getAllTeachers);

// ==================== STUDENTS ====================
router.post('/students', authorize('Admin'), authorizeCollege, createStudent);
router.get('/students', authorize('Admin'), authorizeCollege, getAllStudents);

// ==================== TEAMS ====================
router.post('/teams', authorize('Admin'), authorizeCollege, createTeamMember);
router.get('/teams', authorize('Admin'), authorizeCollege, getTeamMembers);

// ==================== CLASSES ====================
router.post('/classes', authorize('Admin'), authorizeCollege, createClass);
router.get('/classes', authorize('Admin'), authorizeCollege, getAllClasses);

// ==================== SUBJECTS ====================
router.post('/subjects', authorize('Admin'), authorizeCollege, createSubject);
router.get('/subjects', authorize('Admin'), authorizeCollege, getSubjects);

// ==================== FEES ====================
router.post('/fees', authorize('Admin'), authorizeCollege, defineFeeStructure);

// ==================== ADMISSIONS ====================
router.get('/admissions', authorize('Admin'), authorizeCollege, getAllAdmissions);
router.post('/admissions/:admissionId/approve', authorize('Admin'), authorizeCollege, approveAdmission);
router.post('/admissions/:admissionId/reject', authorize('Admin'), authorizeCollege, rejectAdmission);

module.exports = router;

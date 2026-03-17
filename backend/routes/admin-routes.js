const express = require('express');
const router = express.Router();
const { authorize, authorizeCollege } = require('../middleware/auth');
const {
    getDashboard,
    getAdminProfile,
    updateAdminProfile,
    getCollegeSettings,
    updateCollegeSettings,
    requestCustomDomain,
    listMyDomains,
    createTeacher,
    getAllTeachers,
    getTeacher,
    updateTeacher,
    deleteTeacher,
    createStudent,
    getAllStudents,
    getStudent,
    updateStudent,
    deleteStudent,
    createTeamMember,
    getTeamMembers,
    createClass,
    getAllClasses,
    getClass,
    updateClass,
    deleteClass,
    createSubject,
    getSubjects,
    getSubject,
    updateSubject,
    deleteSubject,
    defineFeeStructure,
    createNotice,
    getNotices,
    deleteNotice,
    getComplaints,
    updateComplaint,
    getFees,
} = require('../controllers/admin-controller');

const {
    getAllAdmissions,
    approveAdmission,
    rejectAdmission
} = require('../controllers/admission-controller');

// ==================== DASHBOARD ====================
router.get('/dashboard', authorize('Admin'), authorizeCollege, getDashboard);

// ==================== PROFILE ====================
router.get('/profile', authorize('Admin'), authorizeCollege, getAdminProfile);
router.put('/profile', authorize('Admin'), authorizeCollege, updateAdminProfile);

// ==================== COLLEGE SETTINGS / BRANDING ====================
router.get('/college', authorize('Admin'), authorizeCollege, getCollegeSettings);
router.put('/college', authorize('Admin'), authorizeCollege, updateCollegeSettings);

// ==================== CUSTOM DOMAINS ====================
router.post('/domains', authorize('Admin'), authorizeCollege, requestCustomDomain);
router.get('/domains', authorize('Admin'), authorizeCollege, listMyDomains);

// ==================== TEACHERS ====================
router.post('/teachers', authorize('Admin'), authorizeCollege, createTeacher);
router.get('/teachers', authorize('Admin'), authorizeCollege, getAllTeachers);
router.get('/teachers/:id', authorize('Admin'), authorizeCollege, getTeacher);
router.put('/teachers/:id', authorize('Admin'), authorizeCollege, updateTeacher);
router.delete('/teachers/:id', authorize('Admin'), authorizeCollege, deleteTeacher);

// ==================== STUDENTS ====================
router.post('/students', authorize('Admin'), authorizeCollege, createStudent);
router.get('/students', authorize('Admin'), authorizeCollege, getAllStudents);
router.get('/students/:id', authorize('Admin'), authorizeCollege, getStudent);
router.put('/students/:id', authorize('Admin'), authorizeCollege, updateStudent);
router.delete('/students/:id', authorize('Admin'), authorizeCollege, deleteStudent);

// ==================== TEAMS ====================
router.post('/teams', authorize('Admin'), authorizeCollege, createTeamMember);
router.get('/teams', authorize('Admin'), authorizeCollege, getTeamMembers);

// ==================== CLASSES ====================
router.post('/classes', authorize('Admin'), authorizeCollege, createClass);
router.get('/classes', authorize('Admin'), authorizeCollege, getAllClasses);
router.get('/classes/:id', authorize('Admin'), authorizeCollege, getClass);
router.put('/classes/:id', authorize('Admin'), authorizeCollege, updateClass);
router.delete('/classes/:id', authorize('Admin'), authorizeCollege, deleteClass);

// ==================== SUBJECTS ====================
router.post('/subjects', authorize('Admin'), authorizeCollege, createSubject);
router.get('/subjects', authorize('Admin'), authorizeCollege, getSubjects);
router.get('/subjects/:id', authorize('Admin'), authorizeCollege, getSubject);
router.put('/subjects/:id', authorize('Admin'), authorizeCollege, updateSubject);
router.delete('/subjects/:id', authorize('Admin'), authorizeCollege, deleteSubject);

// ==================== FEES ====================
router.post('/fees', authorize('Admin'), authorizeCollege, defineFeeStructure);
router.get('/fees', authorize('Admin'), authorizeCollege, getFees);

// ==================== NOTICES ====================
router.post('/notices', authorize('Admin'), authorizeCollege, createNotice);
router.get('/notices', authorize('Admin'), authorizeCollege, getNotices);
router.delete('/notices/:id', authorize('Admin'), authorizeCollege, deleteNotice);

// ==================== COMPLAINTS ====================
router.get('/complaints', authorize('Admin'), authorizeCollege, getComplaints);
router.put('/complaints/:id', authorize('Admin'), authorizeCollege, updateComplaint);

// ==================== ADMISSIONS ====================
router.get('/admissions', authorize('Admin'), authorizeCollege, getAllAdmissions);
router.post('/admissions/:admissionId/approve', authorize('Admin'), authorizeCollege, approveAdmission);
router.post('/admissions/:admissionId/reject', authorize('Admin'), authorizeCollege, rejectAdmission);

module.exports = router;

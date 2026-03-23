const express = require('express');
const router = express.Router();
const { authorize, authorizeCollege } = require('../middleware/auth');
const { uploadMemory } = require('../utils/file-upload-service');
const { validateCreateFee, validateUpdateFee } = require('../middleware/validation');
const {
    getDashboard,
    getAnalytics,
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
    bulkImportTeachers,
    createStudent,
    getAllStudents,
    getStudent,
    updateStudent,
    deleteStudent,
    bulkImportStudents,
    createTeamMember,
    getTeamMembers,
    createClass,
    getAllClasses,
    getClass,
    updateClass,
    deleteClass,
    bulkImportClasses,
    createSubject,
    getSubjects,
    getSubject,
    updateSubject,
    deleteSubject,
    bulkImportSubjects,
    defineFeeStructure,
    createNotice,
    getNotices,
    deleteNotice,
    createExam,
    uploadExamMarks,
    listExams,
    getExamMarks,
    importExamMarksCsv,
    getComplaints,
    updateComplaint,
    getFees,
    updateFee,
    deleteFee,
    bulkImportFees,
    getTeacherSections,
    setTeacherSections,
    downloadPaymentReceipt,
    getResults,
    uploadMarksAdmin,
    uploadMarksCsv,
    getAdmissionTeamMembers,
    createAdmissionTeamMember,
    updateAdmissionTeamMember,
    deleteAdmissionTeamMember,
    sendMarksEmail,
} = require('../controllers/admin-controller');

const {
    getAllAdmissions,
    approveAdmission,
    rejectAdmission,
    bulkImportAdmissions
} = require('../controllers/admission-controller');

// ==================== DASHBOARD ====================
router.get('/dashboard', authorize('Admin'), authorizeCollege, getDashboard);
router.get('/analytics', authorize('Admin'), authorizeCollege, getAnalytics);

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

// Teacher Section Assignments
router.get('/teachers/:id/sections', authorize('Admin'), authorizeCollege, getTeacherSections);
router.put('/teachers/:id/sections', authorize('Admin'), authorizeCollege, setTeacherSections);

// Bulk CSV import (multipart/form-data: file)
router.post(
    '/teachers/import',
    authorize('Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    bulkImportTeachers
);

// ==================== STUDENTS ====================
router.post('/students', authorize('Admin'), authorizeCollege, createStudent);
router.get('/students', authorize('Admin'), authorizeCollege, getAllStudents);
router.get('/students/:id', authorize('Admin'), authorizeCollege, getStudent);
router.put('/students/:id', authorize('Admin'), authorizeCollege, updateStudent);
router.delete('/students/:id', authorize('Admin'), authorizeCollege, deleteStudent);

// Bulk CSV import (multipart/form-data: file)
router.post(
    '/students/import',
    authorize('Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    bulkImportStudents
);

// ==================== TEAMS ====================
router.post('/teams', authorize('Admin'), authorizeCollege, createTeamMember);
router.get('/teams', authorize('Admin'), authorizeCollege, getTeamMembers);

// ==================== CLASSES ====================
router.post('/classes', authorize('Admin'), authorizeCollege, createClass);
router.get('/classes', authorize('Admin'), authorizeCollege, getAllClasses);
router.get('/classes/:id', authorize('Admin'), authorizeCollege, getClass);
router.put('/classes/:id', authorize('Admin'), authorizeCollege, updateClass);
router.delete('/classes/:id', authorize('Admin'), authorizeCollege, deleteClass);

// Bulk CSV import (multipart/form-data: file)
router.post(
    '/classes/import',
    authorize('Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    bulkImportClasses
);

// ==================== SUBJECTS ====================
router.post('/subjects', authorize('Admin'), authorizeCollege, createSubject);
router.get('/subjects', authorize('Admin'), authorizeCollege, getSubjects);
router.get('/subjects/:id', authorize('Admin'), authorizeCollege, getSubject);
router.put('/subjects/:id', authorize('Admin'), authorizeCollege, updateSubject);
router.delete('/subjects/:id', authorize('Admin'), authorizeCollege, deleteSubject);

// Bulk CSV import (multipart/form-data: file)
router.post(
    '/subjects/import',
    authorize('Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    bulkImportSubjects
);

// ==================== FEES ====================
router.post('/fees', authorize('Admin'), authorizeCollege, validateCreateFee, defineFeeStructure);
router.get('/fees', authorize('Admin'), authorizeCollege, getFees);
router.put('/fees/:feeId', authorize('Admin'), authorizeCollege, validateUpdateFee, updateFee);
router.delete('/fees/:feeId', authorize('Admin'), authorizeCollege, validateUpdateFee, deleteFee);

// Bulk CSV import (multipart/form-data: file)
router.post(
    '/fees/import',
    authorize('Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    bulkImportFees
);

// ==================== NOTICES ====================
router.post('/notices', authorize('Admin'), authorizeCollege, createNotice);
router.get('/notices', authorize('Admin'), authorizeCollege, getNotices);
router.delete('/notices/:id', authorize('Admin'), authorizeCollege, deleteNotice);

// ==================== EXAMS & RESULTS ====================
router.get('/exams', authorize('Admin'), authorizeCollege, listExams);
router.post('/exams', authorize('Admin'), authorizeCollege, createExam);
router.get('/exams/:examId/marks', authorize('Admin'), authorizeCollege, getExamMarks);
router.post('/exams/:examId/marks', authorize('Admin'), authorizeCollege, uploadExamMarks);
router.post(
    '/exams/:examId/marks/import',
    authorize('Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    importExamMarksCsv
);

// Results
router.get('/results', authorize('Admin'), authorizeCollege, getResults);
router.post('/marks/upload', authorize('Admin'), authorizeCollege, uploadMarksAdmin);
router.post(
    '/marks/csv-upload',
    authorize('Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    uploadMarksCsv
);

// ==================== COMPLAINTS ====================
router.get('/complaints', authorize('Admin'), authorizeCollege, getComplaints);
router.put('/complaints/:id', authorize('Admin'), authorizeCollege, updateComplaint);

// ==================== ADMISSIONS ====================
router.get('/admissions', authorize('Admin'), authorizeCollege, getAllAdmissions);
router.post(
    '/admissions/import',
    authorize('Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    bulkImportAdmissions
);
router.post('/admissions/:admissionId/approve', authorize('Admin'), authorizeCollege, approveAdmission);
router.post('/admissions/:admissionId/reject', authorize('Admin'), authorizeCollege, rejectAdmission);

// ==================== PAYMENTS & RECEIPTS ====================
router.get('/payments/:paymentId/receipt', authorize('Admin'), authorizeCollege, downloadPaymentReceipt);

// ==================== ADMISSION TEAM MANAGEMENT ====================
router.get('/admission-team', authorize('Admin'), authorizeCollege, getAdmissionTeamMembers);
router.post('/admission-team', authorize('Admin'), authorizeCollege, createAdmissionTeamMember);
router.put('/admission-team/:id', authorize('Admin'), authorizeCollege, updateAdmissionTeamMember);
router.delete('/admission-team/:id', authorize('Admin'), authorizeCollege, deleteAdmissionTeamMember);

// ==================== MARKS EMAIL NOTIFICATION ====================
router.post('/marks/send-email', authorize('Admin'), authorizeCollege, sendMarksEmail);

module.exports = router;

const express = require('express');
const {
    createAdmissionForm,
    getAllAdmissions,
    getAdmissionDetails,
    updateAdmissionDetails,
    uploadDocuments,
    approveAdmission,
    rejectAdmission,
    sendMessageToParent,
    getAdmissionStats,
} = require('../controllers/admission-controller');
const { authorize, authorizeCollege } = require('../middleware/auth');

const router = express.Router();

// ==================== ADMISSION FORM SUBMISSION ====================
router.post('/form', createAdmissionForm); // Public endpoint
router.put('/:admissionId', authorize('AdmissionTeam'), authorizeCollege, updateAdmissionDetails);
router.put('/:admissionId/documents', authorize('AdmissionTeam'), authorizeCollege, uploadDocuments);

// ==================== ADMISSION MANAGEMENT ====================
router.get('/', authorize('AdmissionTeam', 'Admin'), authorizeCollege, getAllAdmissions);
router.get('/:admissionId', authorize('AdmissionTeam', 'Admin'), authorizeCollege, getAdmissionDetails);

// ==================== APPROVAL WORKFLOW ====================
router.put('/:admissionId/approve', authorize('Admin'), authorizeCollege, approveAdmission);
router.put('/:admissionId/reject', authorize('Admin'), authorizeCollege, rejectAdmission);

// ==================== COMMUNICATION ====================
router.post('/:admissionId/message', authorize('AdmissionTeam', 'Admin'), authorizeCollege, sendMessageToParent);

// ==================== STATISTICS ====================
router.get('/stats/overview', authorize('Admin'), authorizeCollege, getAdmissionStats);

module.exports = router;

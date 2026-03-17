const express = require('express');
const router = express.Router();
const {
    createCollege,
    getAllColleges,
    getCollegeDetails,
    editCollege,
    suspendCollege,
    createCollegeDomain,
    listCollegeDomains,
    verifyCollegeDomain,
    approveCollegeDomain,
    deactivateCollegeDomain,
    setPrimaryCollegeDomain,
    createCollegeAdmin,
    resetAdminPassword,
    getPlatformAnalytics,
    getAuditLogs,
} = require('../controllers/superadmin-controller');
const { authorize } = require('../middleware/auth');
const { checkPermission } = require('../utils/permissions');

// ==================== COLLEGE MANAGEMENT ====================

// Create college
router.post('/colleges', authorize('SuperAdmin'), checkPermission('create_college'), createCollege);

// Get all colleges
router.get('/colleges', authorize('SuperAdmin'), getAllColleges);

// Get college details
router.get('/colleges/:collegeId', authorize('SuperAdmin'), getCollegeDetails);

// Edit college
router.put('/colleges/:collegeId', authorize('SuperAdmin'), checkPermission('edit_college'), editCollege);

// Suspend college
router.patch('/colleges/:collegeId/suspend', authorize('SuperAdmin'), suspendCollege);

// ==================== DOMAIN MANAGEMENT ====================

// Create a (pending) additional domain for a college
router.post(
    '/colleges/:collegeId/domains',
    authorize('SuperAdmin'),
    checkPermission('approve_domain'),
    createCollegeDomain
);

// List domains for a college
router.get('/colleges/:collegeId/domains', authorize('SuperAdmin'), listCollegeDomains);

// Verify DNS token (simple token-based verification)
router.post(
    '/domains/:domainId/verify',
    authorize('SuperAdmin'),
    checkPermission('approve_domain'),
    verifyCollegeDomain
);

// Approve/activate a domain (requires dnsVerified)
router.patch(
    '/domains/:domainId/approve',
    authorize('SuperAdmin'),
    checkPermission('approve_domain'),
    approveCollegeDomain
);

// Deactivate a domain
router.patch(
    '/domains/:domainId/deactivate',
    authorize('SuperAdmin'),
    checkPermission('approve_domain'),
    deactivateCollegeDomain
);

// Set a domain as primary for a college
router.patch(
    '/domains/:domainId/set-primary',
    authorize('SuperAdmin'),
    checkPermission('approve_domain'),
    setPrimaryCollegeDomain
);

// ==================== ADMIN MANAGEMENT ====================

// Create college admin
router.post('/admins', authorize('SuperAdmin'), checkPermission('create_admin'), createCollegeAdmin);

// Reset admin password
router.patch('/admins/:adminId/reset-password', authorize('SuperAdmin'), resetAdminPassword);

// ==================== PLATFORM MONITORING ====================

// Get platform analytics
router.get('/analytics', authorize('SuperAdmin'), getPlatformAnalytics);

// Get audit logs
router.get('/audit-logs', authorize('SuperAdmin'), getAuditLogs);

module.exports = router;

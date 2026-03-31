const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    addHRManager,
    getHRManagers,
    deleteHRManager,
    addEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    markAttendance,
    getEmployeeAttendance,
    createSalaryRecord,
    getSalaryRecords,
    updateSalaryStatus,
    getHRDashboard,
    getAdminHRDashboard,
    getAvailableTeachers,
    regenerateHRManagerPasswords,
} = require('../controllers/hr-controller');

// All routes require authentication
router.use(authMiddleware);

// ==================== HR MANAGER ROUTES (Admin only) ====================
router.post('/hr-managers', addHRManager);
router.get('/hr-managers', getHRManagers);
router.delete('/hr-managers/:hrManagerId', deleteHRManager);

// ==================== EMPLOYEE ROUTES ====================
router.post('/employees', addEmployee);
router.get('/employees', getEmployees);
router.get('/employees/:employeeId', getEmployee);
router.put('/employees/:employeeId', updateEmployee);
router.delete('/employees/:employeeId', deleteEmployee);

// ==================== ATTENDANCE ROUTES ====================
router.post('/attendance', markAttendance);
router.get('/attendance/:employeeId', getEmployeeAttendance);

// ==================== SALARY ROUTES ====================
router.post('/salaries', createSalaryRecord);
router.get('/salaries', getSalaryRecords);
router.put('/salaries/:salaryId/status', updateSalaryStatus);

// ==================== DASHBOARD ROUTES ====================
router.get('/dashboard/hr', getHRDashboard);
router.get('/dashboard/admin-hr', getAdminHRDashboard);

// ==================== AVAILABLE TEACHERS ROUTES ====================
router.get('/teachers/available', getAvailableTeachers);

// ==================== PASSWORD MANAGEMENT ROUTES ====================
router.post('/hr-managers/regenerate-passwords', regenerateHRManagerPasswords);

module.exports = router;

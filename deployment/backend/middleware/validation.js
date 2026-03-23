const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};

// ==================== AUTH VALIDATIONS ====================

const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
];

const validateRegister = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    handleValidationErrors,
];

const validateOTPRequest = [
    body('phone').isMobilePhone().withMessage('Valid phone number is required'),
    handleValidationErrors,
];

const validateOTPVerify = [
    body('phone').isMobilePhone().withMessage('Valid phone number is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    handleValidationErrors,
];

const validateChangePassword = [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters'),
    handleValidationErrors,
];

// ==================== COLLEGE VALIDATIONS ====================

const validateCreateCollege = [
    body('name').trim().notEmpty().withMessage('College name is required'),
    body('domain').trim().notEmpty().withMessage('Domain is required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
    handleValidationErrors,
];

const validateUpdateCollege = [
    param('collegeId').isUUID().withMessage('Valid college ID required'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    handleValidationErrors,
];

// ==================== USER VALIDATIONS ====================

const validateCreateUser = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
    body('role')
        .isIn(['Admin', 'Teacher', 'Student', 'Parent', 'AdmissionTeam', 'AccountsTeam', 'TransportTeam'])
        .withMessage('Invalid role'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

const validateUpdateUser = [
    param('userId').isUUID().withMessage('Valid user ID required'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    handleValidationErrors,
];

// ==================== STUDENT VALIDATIONS ====================

const validateCreateStudent = [
    body('name').trim().notEmpty().withMessage('Student name is required'),
    body('studentId').trim().notEmpty().withMessage('Student ID is required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
    body('sclassId').isUUID().withMessage('Valid class ID required'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

const validateUpdateStudent = [
    param('studentId').isUUID().withMessage('Valid student ID required'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    handleValidationErrors,
];

// ==================== TEACHER VALIDATIONS ====================

const validateCreateTeacher = [
    body('name').trim().notEmpty().withMessage('Teacher name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

const validateUpdateTeacher = [
    param('teacherId').isUUID().withMessage('Valid teacher ID required'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    handleValidationErrors,
];

// ==================== CLASS VALIDATIONS ====================

const validateCreateClass = [
    body('sclassName').trim().notEmpty().withMessage('Class name is required'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

const validateUpdateClass = [
    param('classId').isUUID().withMessage('Valid class ID required'),
    body('sclassName').optional().trim().notEmpty().withMessage('Class name cannot be empty'),
    handleValidationErrors,
];

// ==================== SUBJECT VALIDATIONS ====================

const validateCreateSubject = [
    body('subName').trim().notEmpty().withMessage('Subject name is required'),
    body('subCode').trim().notEmpty().withMessage('Subject code is required'),
    body('sclassId').isUUID().withMessage('Valid class ID required'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

const validateUpdateSubject = [
    param('subjectId').isUUID().withMessage('Valid subject ID required'),
    body('subName').optional().trim().notEmpty().withMessage('Subject name cannot be empty'),
    handleValidationErrors,
];

// ==================== EXAM VALIDATIONS ====================

const validateCreateExam = [
    body('examName').trim().notEmpty().withMessage('Exam name is required'),
    body('sclassId').isUUID().withMessage('Valid class ID required'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    body('totalMarks').optional().isInt({ min: 1 }).withMessage('Total marks must be positive'),
    handleValidationErrors,
];

const validateUpdateExam = [
    param('examId').isUUID().withMessage('Valid exam ID required'),
    body('examName').optional().trim().notEmpty().withMessage('Exam name cannot be empty'),
    handleValidationErrors,
];

// ==================== MARKS VALIDATIONS ====================

const validateUploadMarks = [
    body('studentId').isUUID().withMessage('Valid student ID required'),
    body('subjectId').isUUID().withMessage('Valid subject ID required'),
    body('examId').isUUID().withMessage('Valid exam ID required'),
    body('marksObtained').isFloat({ min: 0 }).withMessage('Marks must be non-negative'),
    handleValidationErrors,
];

// ==================== ATTENDANCE VALIDATIONS ====================

const validateMarkAttendance = [
    body('studentId').isUUID().withMessage('Valid student ID required'),
    body('subjectId').isUUID().withMessage('Valid subject ID required'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('status')
        .isIn(['present', 'absent', 'leave', 'sick'])
        .withMessage('Invalid attendance status'),
    handleValidationErrors,
];

// ==================== FEE VALIDATIONS ====================

const validateCreateFee = [
    body('studentId').isUUID().withMessage('Valid student ID required'),
    body('feeType').trim().notEmpty().withMessage('Fee type is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
    body('dueDate').isISO8601().withMessage('Valid due date required'),
    handleValidationErrors,
];

const validateUpdateFee = [
    param('feeId').isUUID().withMessage('Valid fee ID required'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
    handleValidationErrors,
];

// ==================== PAYMENT VALIDATIONS ====================

const validateCreatePayment = [
    body('studentId').isUUID().withMessage('Valid student ID required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
    body('paymentMethod')
        .isIn(['razorpay', 'bank_transfer', 'cash', 'check'])
        .withMessage('Invalid payment method'),
    handleValidationErrors,
];

// ==================== ADMISSION VALIDATIONS ====================

const validateCreateAdmission = [
    body('applicantName').trim().notEmpty().withMessage('Applicant name is required'),
    body('applicantEmail').isEmail().withMessage('Valid email is required'),
    body('applicantPhone').isMobilePhone().withMessage('Valid phone is required'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

const validateUpdateAdmission = [
    param('admissionId').isUUID().withMessage('Valid admission ID required'),
    body('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected', 'enrolled'])
        .withMessage('Invalid status'),
    handleValidationErrors,
];

// ==================== NOTICE VALIDATIONS ====================

const validateCreateNotice = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

// ==================== HOMEWORK VALIDATIONS ====================

const validateCreateHomework = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('dueDate').isISO8601().withMessage('Valid due date required'),
    body('subjectId').isUUID().withMessage('Valid subject ID required'),
    body('teacherId').isUUID().withMessage('Valid teacher ID required'),
    handleValidationErrors,
];

// ==================== TRANSPORT VALIDATIONS ====================

const validateCreateRoute = [
    body('routeName').trim().notEmpty().withMessage('Route name is required'),
    body('routeNumber').trim().notEmpty().withMessage('Route number is required'),
    body('startPoint').trim().notEmpty().withMessage('Start point is required'),
    body('endPoint').trim().notEmpty().withMessage('End point is required'),
    body('fee').isFloat({ min: 0 }).withMessage('Fee must be non-negative'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

const validateCreateBus = [
    body('busNumber').trim().notEmpty().withMessage('Bus number is required'),
    body('regNumber').trim().notEmpty().withMessage('Registration number is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be positive'),
    body('driverName').trim().notEmpty().withMessage('Driver name is required'),
    body('driverPhone').isMobilePhone().withMessage('Valid driver phone required'),
    body('routeId').isUUID().withMessage('Valid route ID required'),
    body('collegeId').isUUID().withMessage('Valid college ID required'),
    handleValidationErrors,
];

// ==================== PAGINATION VALIDATIONS ====================

const validatePagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors,
];

// ==================== ID VALIDATIONS ====================

const validateUUID = (paramName) => [
    param(paramName).isUUID().withMessage(`Valid ${paramName} required`),
    handleValidationErrors,
];

module.exports = {
    handleValidationErrors,
    validateLogin,
    validateRegister,
    validateOTPRequest,
    validateOTPVerify,
    validateChangePassword,
    validateCreateCollege,
    validateUpdateCollege,
    validateCreateUser,
    validateUpdateUser,
    validateCreateStudent,
    validateUpdateStudent,
    validateCreateTeacher,
    validateUpdateTeacher,
    validateCreateClass,
    validateUpdateClass,
    validateCreateSubject,
    validateUpdateSubject,
    validateCreateExam,
    validateUpdateExam,
    validateUploadMarks,
    validateMarkAttendance,
    validateCreateFee,
    validateUpdateFee,
    validateCreatePayment,
    validateCreateAdmission,
    validateUpdateAdmission,
    validateCreateNotice,
    validateCreateHomework,
    validateCreateRoute,
    validateCreateBus,
    validatePagination,
    validateUUID,
};

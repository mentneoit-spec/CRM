// Role-based permissions matrix
const PERMISSIONS = {
    SuperAdmin: [
        // College Management
        'create_college',
        'edit_college',
        'delete_college',
        'suspend_college',
        'view_all_colleges',
        'approve_domain',
        'manage_subscription',
        'set_storage_limits',

        // Admin Management
        'create_admin',
        'edit_admin',
        'delete_admin',
        'reset_admin_password',
        'transfer_ownership',

        // Platform Monitoring
        'view_platform_analytics',
        'view_audit_logs',
        'view_infra_health',
        'manage_active_sessions',
        'block_suspicious_accounts',
    ],

    Admin: [
        // Branding
        'upload_logo',
        'change_theme',
        'customize_domain',
        'manage_footer',
        'view_college_settings',
        'edit_college_info',

        // User Management
        'create_teacher',
        'create_student',
        'create_parent',
        'create_admission_team',
        'create_accounts_team',
        'create_transport_team',
        'edit_user',
        'delete_user',
        'reset_password',
        'view_all_users',

        // Academic
        'create_class',
        'edit_class',
        'delete_class',
        'assign_class_teacher',
        'create_subject',
        'edit_subject',
        'delete_subject',
        'approve_admission',
        'view_admissions',
        'define_exam_pattern',
        'enable_online_exams',

        // Finance
        'define_fees',
        'edit_fee_structure',
        'view_payments',
        'view_revenue',
        'generate_reports',

        // Reports
        'view_revenue_dashboard',
        'view_attendance_analytics',
        'view_admission_pipeline',
        'view_teacher_performance',
    ],

    Teacher: [
        'view_students',
        'mark_attendance',
        'upload_homework',
        'create_quiz',
        'conduct_exam',
        'upload_marks',
        'add_feedback',
        'view_student_reports',
        'view_class_details',
    ],

    Student: [
        'view_own_profile',
        'view_attendance',
        'view_homework',
        'attempt_quiz',
        'attempt_exam',
        'view_marks',
        'view_fees',
        'download_report',
    ],

    Parent: [
        'view_student_profile',
        'view_attendance',
        'view_homework',
        'view_exam_results',
        'download_report',
        'pay_fees',
        'view_payment_history',
        'submit_feedback',
        'raise_complaint',
    ],

    AdmissionTeam: [
        'create_admission_form',
        'enter_student_details',
        'upload_documents',
        'submit_admission',
        'track_status',
        'communicate_with_parents',
    ],

    AccountsTeam: [
        'view_payments',
        'view_razorpay_transactions',
        'manual_payment_entry',
        'process_refunds',
        'generate_payment_reports',
        'export_payments',
    ],

    TransportTeam: [
        'manage_routes',
        'assign_bus',
        'track_attendance',
        'update_fees',
        'view_transport_reports',
    ],
};

// Check if user has permission
const hasPermission = (userRole, permission) => {
    const rolePermissions = PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
};

// Check multiple permissions (AND logic)
const hasAllPermissions = (userRole, permissions) => {
    return permissions.every(permission => hasPermission(userRole, permission));
};

// Check multiple permissions (OR logic)
const hasAnyPermission = (userRole, permissions) => {
    return permissions.some(permission => hasPermission(userRole, permission));
};

// Middleware to check permission
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        if (!hasPermission(req.user.role, requiredPermission)) {
            return res.status(403).json({ 
                success: false, 
                message: `Permission denied: ${requiredPermission}` 
            });
        }

        next();
    };
};

module.exports = {
    PERMISSIONS,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    checkPermission,
};

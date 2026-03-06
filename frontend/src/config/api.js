import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add collegeId from localStorage if available
    const collegeId = localStorage.getItem('collegeId');
    if (collegeId && !config.params?.collegeId) {
      config.params = { ...config.params, collegeId };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('collegeId');
        window.location.href = '/login';
      }

      // Return error message
      return Promise.reject(error.response.data);
    } else if (error.request) {
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      return Promise.reject({ message: error.message });
    }
  }
);

// ==================== AUTH APIs ====================

export const authAPI = {
  // Login with email/password
  login: (credentials) => api.post('/auth/login', credentials),

  // Register new user
  register: (data) => api.post('/auth/register', data),

  // Super admin login
  superAdminLogin: (credentials) => api.post('/auth/superadmin/login', credentials),

  // Request Login OTP
  requestOTP: (data) => api.post('/auth/otp/request-login', data),

  // Verify Login OTP
  verifyOTP: (data) => api.post('/auth/otp/verify-login', data),

  // Request Registration OTP
  requestRegistrationOTP: (data) => api.post('/auth/otp/request-register', data),

  // Verify Registration OTP
  verifyRegistrationOTP: (data) => api.post('/auth/otp/verify-register', data),

  // Google OAuth URL
  getGoogleAuthURL: (collegeId) => api.get(`/auth/google/url?collegeId=${collegeId}`),

  // Setup 2FA
  setup2FA: () => api.post('/auth/2fa/setup'),

  // Enable 2FA
  enable2FA: (token) => api.post('/auth/2fa/enable', { token }),

  // Disable 2FA
  disable2FA: (token) => api.post('/auth/2fa/disable', { token }),

  // Change password
  changePassword: (data) => api.post('/auth/change-password', data),

  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
};

// ==================== SUPER ADMIN APIs ====================

export const superAdminAPI = {
  // Colleges
  createCollege: (data) => api.post('/superadmin/colleges', data),
  getColleges: (params) => api.get('/superadmin/colleges', { params }),
  getCollege: (id) => api.get(`/superadmin/colleges/${id}`),
  updateCollege: (id, data) => api.put(`/superadmin/colleges/${id}`, data),
  suspendCollege: (id) => api.post(`/superadmin/colleges/${id}/suspend`),

  // Admins
  createAdmin: (data) => api.post('/superadmin/admins', data),

  // Analytics
  getAnalytics: () => api.get('/superadmin/analytics'),

  // Audit Logs
  getAuditLogs: (params) => api.get('/superadmin/audit-logs', { params }),
};

// ==================== ADMIN APIs ====================

export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Teachers
  createTeacher: (data) => api.post('/admin/teachers', data),
  getTeachers: (params) => api.get('/admin/teachers', { params }),
  getTeacher: (id) => api.get(`/admin/teachers/${id}`),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),

  // Students
  createStudent: (data) => api.post('/admin/students', data),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  // Classes
  createClass: (data) => api.post('/admin/classes', data),
  getClasses: () => api.get('/admin/classes'),
  getClass: (id) => api.get(`/admin/classes/${id}`),
  updateClass: (id, data) => api.put(`/admin/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),

  // Subjects
  createSubject: (data) => api.post('/admin/subjects', data),
  getSubjects: (params) => api.get('/admin/subjects', { params }),
  getSubject: (id) => api.get(`/admin/subjects/${id}`),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),

  // Teams
  createTeamMember: (data) => api.post('/admin/teams', data),
  getTeams: (params) => api.get('/admin/teams', { params }),

  // Fees
  createFee: (data) => api.post('/admin/fees', data),
  getFees: (params) => api.get('/admin/fees', { params }),

  // Notices
  createNotice: (data) => api.post('/admin/notices', data),
  getNotices: () => api.get('/admin/notices'),
  deleteNotice: (id) => api.delete(`/admin/notices/${id}`),

  // Admissions
  getAdmissions: (params) => api.get('/admin/admissions', { params }),
  approveAdmission: (id) => api.post(`/admin/admissions/${id}/approve`),
  rejectAdmission: (id, reason) => api.post(`/admin/admissions/${id}/reject`, { rejectionReason: reason }),
};

// ==================== TEACHER APIs ====================

export const teacherAPI = {
  // Dashboard
  getDashboard: () => api.get('/teacher/dashboard'),

  // Students
  getStudents: (params) => api.get('/teacher/students', { params }),

  // Attendance
  markAttendance: (data) => api.post('/teacher/attendance', data),
  getAttendance: (params) => api.get('/teacher/attendance', { params }),

  // Marks
  uploadMarks: (data) => api.post('/teacher/marks', data),
  getMarks: (params) => api.get('/teacher/marks', { params }),

  // Homework
  createHomework: (data) => api.post('/teacher/homework', data),
  getHomework: (params) => api.get('/teacher/homework', { params }),
  updateHomework: (id, data) => api.put(`/teacher/homework/${id}`, data),
  deleteHomework: (id) => api.delete(`/teacher/homework/${id}`),
};

// ==================== STUDENT APIs ====================

export const studentAPI = {
  // Profile
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),

  // Attendance
  getAttendance: (params) => api.get('/student/attendance', { params }),

  // Marks
  getMarks: (params) => api.get('/student/marks', { params }),

  // Homework
  getHomework: (params) => api.get('/student/homework', { params }),

  // Fees
  getFees: () => api.get('/student/fees'),

  // Notices
  getNotices: () => api.get('/student/notices'),
};

// ==================== PARENT APIs ====================

export const parentAPI = {
  // Children
  getChildren: () => api.get('/parent/children'),

  // Child details
  getChildAttendance: (studentId) => api.get(`/parent/children/${studentId}/attendance`),
  getChildMarks: (studentId) => api.get(`/parent/children/${studentId}/marks`),
  getChildFees: (studentId) => api.get(`/parent/children/${studentId}/fees`),

  // Payments
  createPayment: (data) => api.post('/parent/payments', data),
  getPayments: (params) => api.get('/parent/payments', { params }),
};

// ==================== ADMISSION APIs ====================

export const admissionAPI = {
  // Submit admission
  submitAdmission: (data) => api.post('/admission/apply', data),

  // Get admission status
  getAdmissionStatus: (admissionNumber) => api.get(`/admission/${admissionNumber}`),
};

// ==================== ACCOUNTS APIs ====================

export const accountsAPI = {
  // Payments
  getPayments: (params) => api.get('/accounts/payments', { params }),
  createManualPayment: (data) => api.post('/accounts/payments/manual', data),
  processRefund: (id, reason) => api.post(`/accounts/payments/${id}/refund`, { reason }),
  exportPayments: (params) => api.get('/accounts/payments/export', { params, responseType: 'blob' }),
};

// ==================== TRANSPORT APIs ====================

export const transportAPI = {
  // Routes
  createRoute: (data) => api.post('/transport/routes', data),
  getRoutes: () => api.get('/transport/routes'),
  updateRoute: (id, data) => api.put(`/transport/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/transport/routes/${id}`),

  // Buses
  createBus: (data) => api.post('/transport/buses', data),
  getBuses: () => api.get('/transport/buses'),
  updateBus: (id, data) => api.put(`/transport/buses/${id}`, data),
  deleteBus: (id) => api.delete(`/transport/buses/${id}`),
};

// ==================== FILE UPLOAD APIs ====================

export const uploadAPI = {
  // Upload profile picture
  uploadProfile: (file) => {
    const formData = new FormData();
    formData.append('files', file);
    return api.post('/upload/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Upload documents
  uploadDocuments: (files, folder) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', folder);
    return api.post('/upload/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete file
  deleteFile: (fileKey) => api.delete(`/upload/${fileKey}`),
};

export default api;

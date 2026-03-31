import axios from 'axios';

const getDefaultApiBaseUrl = () => {
  try {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
      }
      return '/api';
    }
  } catch {
    // ignore
  }
  return '/api';
};

const normalizeApiBaseUrl = (url) => {
  const fallback = getDefaultApiBaseUrl();
  if (!url) return fallback;
  const trimmed = String(url).replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

const safeRedirectToRoleHome = () => {
  try {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const role = String(user?.role || '').trim();
    const roleRoutes = {
      Student: '/student/dashboard',
      Teacher: '/teacher/dashboard',
      Parent: '/parent/dashboard',
      Admin: '/admin/dashboard',
      SuperAdmin: '/superadmin/dashboard',
      AccountsTeam: '/accounts/dashboard',
      TransportTeam: '/transport/dashboard',
    };
    window.location.href = roleRoutes[role] || '/';
  } catch {
    window.location.href = '/';
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // IMPORTANT: don't force-inject collegeId into Auth routes or HR routes
    // Auth endpoints may accept collegeId in the request body, and a stale
    // localStorage value can cause failures if injected as a query param.
    // HR routes should use the collegeId from the JWT token user object.
    const isAuthRoute = typeof config.url === 'string' && config.url.startsWith('/auth');
    const isHRRoute = typeof config.url === 'string' && config.url.startsWith('/hr');
    
    if (!isAuthRoute && !isHRRoute) {
      const collegeId = localStorage.getItem('collegeId');
      if (collegeId && !config.params?.collegeId) {
        config.params = { ...config.params, collegeId };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }

      if (error.response.status === 403) {
        safeRedirectToRoleHome();
      }
      return Promise.reject(error.response.data || { message: 'Request failed' });
    }

    if (error.request) {
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    }

    return Promise.reject({ message: error.message });
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getTenant: () => api.get('/auth/tenant'),
  register: (data) => api.post('/auth/register', data),
  superAdminLogin: (credentials) => api.post('/auth/superadmin-login', credentials),
  requestOTP: (data) => api.post('/auth/otp/request-login', data),
  verifyOTP: (data) => api.post('/auth/otp/verify-login', data),
  requestRegistrationOTP: (data) => api.post('/auth/otp/request-register', data),
  verifyRegistrationOTP: (data) => api.post('/auth/otp/verify-register', data),
  getGoogleAuthURL: (collegeId) => api.get(`/auth/google/url?collegeId=${collegeId}`),
  setup2FA: () => api.post('/auth/2fa/setup'),
  enable2FA: (token) => api.post('/auth/2fa/enable', { token }),
  disable2FA: (token) => api.post('/auth/2fa/disable', { token }),
  changePassword: (data) => api.post('/auth/change-password', data),
  getCurrentUser: () => api.get('/auth/me'),
  getMyProfile: () => api.get('/auth/profile'),
  updateMyProfile: (data) => api.put('/auth/profile', data),
};

export const superAdminAPI = {
  createCollege: (data) => api.post('/superadmin/colleges', data),
  getColleges: (params) => api.get('/superadmin/colleges', { params }),
  getCollege: (id) => api.get(`/superadmin/colleges/${id}`),
  updateCollege: (id, data) => api.put(`/superadmin/colleges/${id}`, data),
  suspendCollege: (id) => api.patch(`/superadmin/colleges/${id}/suspend`),
  createCollegeDomain: (collegeId, data) => api.post(`/superadmin/colleges/${collegeId}/domains`, data),
  listCollegeDomains: (collegeId) => api.get(`/superadmin/colleges/${collegeId}/domains`),
  verifyDomain: (domainId, dnsToken) => api.post(`/superadmin/domains/${domainId}/verify`, { dnsToken }),
  approveDomain: (domainId) => api.patch(`/superadmin/domains/${domainId}/approve`),
  deactivateDomain: (domainId) => api.patch(`/superadmin/domains/${domainId}/deactivate`),
  setPrimaryDomain: (domainId) => api.patch(`/superadmin/domains/${domainId}/set-primary`),
  createAdmin: (data) => api.post('/superadmin/admins', data),
  resetAdminPassword: (adminId, newPassword) => api.patch(`/superadmin/admins/${adminId}/reset-password`, { newPassword }),
  getAnalytics: () => api.get('/superadmin/analytics'),
  getAuditLogs: (params) => api.get('/superadmin/audit-logs', { params }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  getCollege: () => api.get('/admin/college'),
  updateCollege: (data) => api.put('/admin/college', data),
  createTeacher: (data) => api.post('/admin/teachers', data),
  getTeachers: (params) => api.get('/admin/teachers', { params }),
  getTeacher: (id) => api.get(`/admin/teachers/${id}`),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  getTeacherSections: (id) => api.get(`/admin/teachers/${id}/sections`),
  setTeacherSections: (id, data) => api.put(`/admin/teachers/${id}/sections`, data),
  createStudent: (data) => api.post('/admin/students', data),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  bulkImportStudents: (file, mode = 'skip') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/students/import?mode=${encodeURIComponent(mode)}`, formData, {
      // CSV imports can take longer than normal API calls.
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  bulkImportTeachers: (file, mode = 'skip') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/teachers/import?mode=${encodeURIComponent(mode)}`, formData, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  bulkImportClasses: (file, mode = 'skip') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/classes/import?mode=${encodeURIComponent(mode)}`, formData, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  bulkImportSubjects: (file, mode = 'skip') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/subjects/import?mode=${encodeURIComponent(mode)}`, formData, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  bulkImportAdmissions: (file, mode = 'skip') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/admissions/import?mode=${encodeURIComponent(mode)}`, formData, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createClass: (data) => api.post('/admin/classes', data),
  getClasses: () => api.get('/admin/classes'),
  getClass: (id) => api.get(`/admin/classes/${id}`),
  updateClass: (id, data) => api.put(`/admin/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  createSubject: (data) => api.post('/admin/subjects', data),
  getSubjects: (params) => api.get('/admin/subjects', { params }),
  getSubject: (id) => api.get(`/admin/subjects/${id}`),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  createTeamMember: (data) => api.post('/admin/teams', data),
  getTeams: (params) => api.get('/admin/teams', { params }),
  createFee: (data) => api.post('/admin/fees', data),
  getFees: (params) => api.get('/admin/fees', { params }),
  updateFee: (feeId, data) => api.put(`/admin/fees/${feeId}`, data),
  deleteFee: (feeId) => api.delete(`/admin/fees/${feeId}`),
  bulkImportFees: (file, mode = 'update') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/fees/import?mode=${encodeURIComponent(mode)}`, formData, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createNotice: (data) => api.post('/admin/notices', data),
  getNotices: () => api.get('/admin/notices'),
  deleteNotice: (id) => api.delete(`/admin/notices/${id}`),
  getAdmissions: (params) => api.get('/admin/admissions', { params }),
  approveAdmission: (id) => api.post(`/admin/admissions/${id}/approve`),
  rejectAdmission: (id, reason) => api.post(`/admin/admissions/${id}/reject`, { rejectionReason: reason }),

  // Exams & Results
  createExam: (data) => api.post('/admin/exams', data),
  getExams: (params) => api.get('/admin/exams', params ? { params } : undefined),
  getExamMarks: (examId, params) => api.get(`/admin/exams/${examId}/marks`, params ? { params } : undefined),
  uploadExamMarks: (examId, data) => api.post(`/admin/exams/${examId}/marks`, data),
  importExamMarksCsv: (examId, subjectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    if (subjectId) formData.append('subjectId', subjectId);
    return api.post(`/admin/exams/${examId}/marks/import`, formData, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Payments & Receipts
  createPayment: (data) => api.post('/admin/payments', data),
  getPayments: (params) => api.get('/admin/payments', { params }),
  downloadPaymentReceipt: (paymentId) => api.get(`/admin/payments/${paymentId}/receipt`, { responseType: 'blob' }),
};

export const teacherAPI = {
  getDashboard: () => api.get('/teacher/dashboard'),
  getStudents: (params) => api.get('/teacher/students', { params }),
  markAttendance: (data) => api.post('/teacher/attendance', data),
  getAttendance: (params) => api.get('/teacher/attendance', { params }),
  uploadMarks: (data) => api.post('/teacher/marks', data),
  getMarks: (params) => api.get('/teacher/marks', { params }),
  createHomework: (data) => api.post('/teacher/homework', data),
  getHomework: (params) => api.get('/teacher/homework', { params }),
  updateHomework: (id, data) => api.put(`/teacher/homework/${id}`, data),
  deleteHomework: (id) => api.delete(`/teacher/homework/${id}`),
};

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getAttendance: (params) => api.get('/student/attendance', { params }),
  getMarks: (params) => api.get('/student/marks', { params }),
  getHomework: (params) => api.get('/student/homework', { params }),
  getFees: () => api.get('/student/fees'),
  getNotices: () => api.get('/student/notices'),
};

export const parentAPI = {
  getChildren: () => api.get('/parent/children'),
  getChildAttendance: (studentId) => api.get(`/parent/children/${studentId}/attendance`),
  getChildMarks: (studentId) => api.get(`/parent/children/${studentId}/marks`),
  getChildFees: (studentId) => api.get(`/parent/children/${studentId}/fees`),
  createPayment: (data) => api.post('/parent/payments', data),
  getPayments: (params) => api.get('/parent/payments', { params }),
};

export const admissionAPI = {
  submitAdmission: (data) => api.post('/admission/apply', data),
  getAdmissionStatus: (admissionNumber) => api.get(`/admission/${admissionNumber}`),
};

export const accountsAPI = {
  getPayments: (params) => api.get('/accounts/payments', { params }),
  getPaymentDetails: (paymentId) => api.get(`/accounts/payments/${paymentId}`),
  createManualPayment: (data) => api.post('/accounts/payments/manual', data),
  processRefund: (id, reason) => api.post(`/accounts/payments/${id}/refund`, { reason }),
  getRefundStatus: (refundId) => api.get(`/accounts/refunds/${refundId}`),
  exportPayments: (params) => api.get('/accounts/payments/export', { params, responseType: 'blob' }),
  getDashboard: () => api.get('/accounts/dashboard'),
  getPaymentReport: (params) => api.get('/accounts/reports/payment', { params }),
};

export const transportAPI = {
  createRoute: (data) => api.post('/transport/routes', data),
  getRoutes: () => api.get('/transport/routes'),
  updateRoute: (id, data) => api.put(`/transport/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/transport/routes/${id}`),
  createBus: (data) => api.post('/transport/buses', data),
  getBuses: () => api.get('/transport/buses'),
  updateBus: (id, data) => api.put(`/transport/buses/${id}`, data),
  deleteBus: (id) => api.delete(`/transport/buses/${id}`),
  bulkImportBuses: (file, mode = 'skip') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/transport/buses/import?mode=${encodeURIComponent(mode)}`, formData, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  assignStudentToBus: (busId, studentId) => api.put(`/transport/buses/${busId}/assign`, { studentId }),
  markBusAttendance: (busId, data) => api.post(`/transport/buses/${busId}/attendance`, data),
  getBusAttendanceReport: (busId) => api.get(`/transport/buses/${busId}/report`),
  defineTransportFee: (data) => api.post('/transport/fees', data),
  getDashboard: () => api.get('/transport/dashboard'),
};

export const uploadAPI = {
  uploadProfile: (file) => {
    const formData = new FormData();
    formData.append('files', file);
    return api.post('/upload/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadDocuments: (files, folder) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', folder);
    return api.post('/upload/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteFile: (fileKey) => api.delete(`/upload/${fileKey}`),
};

export default api;
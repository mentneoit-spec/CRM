import axios from 'axios';

const getDefaultApiBaseUrl = () => {
  try {
    if (typeof window !== 'undefined' && window.location) {
      const protocol = window.location.protocol || 'http:';
      const hostname = window.location.hostname;

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
      }

      return `${protocol}//${hostname}:5000/api`;
    }
  } catch {
    // ignore
  }

  return 'http://localhost:5000/api';
};

const normalizeApiBaseUrl = (url) => {
  const fallback = getDefaultApiBaseUrl();
  if (!url) return fallback;
  const trimmed = String(url).replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
};

const API_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const data = error?.response?.data;
      const message = data?.message;
      if (error?.response?.status === 404 && message === 'Route not found') {
        const method = (data?.method || error?.config?.method || 'GET').toUpperCase();
        const path = data?.path || error?.config?.url || '';

        const baseURL = error?.config?.baseURL || '';
        const url = error?.config?.url || '';
        const fullUrl = /^https?:\/\//i.test(url)
          ? url
          : `${String(baseURL).replace(/\/+$/, '')}/${String(url).replace(/^\/+/, '')}`;

        error.response.data = {
          ...data,
          message: `Route not found: ${method} ${path} (${fullUrl})`,
        };
      }
    } catch {
      // ignore
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  getMyProfile: () => api.get('/auth/profile'),
  updateMyProfile: (data) => api.put('/auth/profile', data),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

// Student APIs
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getAttendance: (params) => api.get('/student/attendance', params ? { params } : undefined),
  getExams: () => api.get('/student/exams'),
  getMarks: (params) => api.get('/student/marks', params ? { params } : undefined),
  getResults: () => api.get('/student/results'),
  getFees: () => api.get('/student/fees'),
  getPaymentHistory: (params) => api.get('/student/payments', params ? { params } : undefined),
  getSubjects: () => api.get('/student/subjects'),
  getHomework: () => api.get('/student/homework'),
  getNotices: () => api.get('/student/notices'),
  submitComplaint: (data) => api.post('/student/complaints', data),
  getComplaints: () => api.get('/student/complaints'),
};

// Teacher APIs
export const teacherAPI = {
  getDashboard: () => api.get('/teacher/dashboard'),
  getProfile: () => api.get('/teacher/profile'),
  updateProfile: (data) => api.put('/teacher/profile', data),
  getClasses: () => api.get('/teacher/classes'),
  getStudents: (classId) => api.get(`/teacher/classes/${classId}/students`),
  markAttendance: (data) => api.post('/teacher/attendance', data),
  getAttendance: (classId, params) => {
    if (classId) return api.get(`/teacher/attendance/${classId}`, params ? { params } : undefined);
    return api.get('/teacher/attendance', params ? { params } : undefined);
  },
  createHomework: (data) => api.post('/teacher/homework', data),
  getHomework: () => api.get('/teacher/homework'),
  updateHomework: (id, data) => api.put(`/teacher/homework/${id}`, data),
  deleteHomework: (id) => api.delete(`/teacher/homework/${id}`),
  addMarks: (data) => api.post('/teacher/marks', data),
  getMarks: (params) => api.get('/teacher/marks', params ? { params } : undefined),
  getReports: () => api.get('/teacher/reports'),
  getExams: () => api.get('/teacher/exams'),
  getAssignments: () => api.get('/teacher/assignments'),
  getNotices: () => api.get('/teacher/notices'),
};

// Parent APIs
export const parentAPI = {
  getDashboard: () => api.get('/parent/dashboard'),
  getProfile: () => api.get('/parent/profile'),
  updateProfile: (data) => api.put('/parent/profile', data),
  getChildren: () => api.get('/parent/children'),
  getChildProfile: (studentId) => api.get(`/parent/children/${studentId}`),
  getChildAttendance: (studentId, params) => api.get(`/parent/children/${studentId}/attendance`, params ? { params } : undefined),
  getChildResults: (studentId) => api.get(`/parent/children/${studentId}/results`),
  getChildFees: (studentId) => api.get(`/parent/children/${studentId}/fees`),
  getChildHomework: (studentId) => api.get(`/parent/children/${studentId}/homework`),
  getChildPayments: (studentId, params) => api.get(`/parent/students/${studentId}/payments`, params ? { params } : undefined),
  createPayment: (data) => api.post('/parent/payments', data),
  verifyPayment: (data) => api.post('/parent/payments/verify', data),
  getNotices: () => api.get('/parent/notices'),
  submitComplaint: (data) => api.post('/parent/complaints', data),
  getComplaints: () => api.get('/parent/complaints'),
  downloadReportCard: (studentId) => api.get(`/parent/students/${studentId}/report-card`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProfile: () => api.get('/admin/profile'),
  
  // Students
  getStudents: () => api.get('/admin/students'),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  
  // Teachers
  getTeachers: () => api.get('/admin/teachers'),
  getTeacher: (id) => api.get(`/admin/teachers/${id}`),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  
  // Classes
  getClasses: () => api.get('/admin/classes'),
  getClass: (id) => api.get(`/admin/classes/${id}`),
  createClass: (data) => api.post('/admin/classes', data),
  updateClass: (id, data) => api.put(`/admin/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  
  // Subjects
  getSubjects: () => api.get('/admin/subjects'),
  createSubject: (data) => api.post('/admin/subjects', data),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  
  // Notices
  getNotices: () => api.get('/admin/notices'),
  createNotice: (data) => api.post('/admin/notices', data),
  updateNotice: (id, data) => api.put(`/admin/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/admin/notices/${id}`),
  
  // Complaints
  getComplaints: () => api.get('/admin/complaints'),
  updateComplaint: (id, data) => api.put(`/admin/complaints/${id}`, data),
};

export default api;

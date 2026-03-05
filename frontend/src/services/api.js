import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

// Student APIs
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getAttendance: () => api.get('/student/attendance'),
  getExams: () => api.get('/student/exams'),
  getResults: () => api.get('/student/results'),
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
  getAttendance: (classId) => api.get(`/teacher/attendance/${classId}`),
  createHomework: (data) => api.post('/teacher/homework', data),
  getHomework: () => api.get('/teacher/homework'),
  addMarks: (data) => api.post('/teacher/marks', data),
  getNotices: () => api.get('/teacher/notices'),
};

// Parent APIs
export const parentAPI = {
  getDashboard: () => api.get('/parent/dashboard'),
  getProfile: () => api.get('/parent/profile'),
  updateProfile: (data) => api.put('/parent/profile', data),
  getChildren: () => api.get('/parent/children'),
  getChildAttendance: (studentId) => api.get(`/parent/children/${studentId}/attendance`),
  getChildResults: (studentId) => api.get(`/parent/children/${studentId}/results`),
  getNotices: () => api.get('/parent/notices'),
  submitComplaint: (data) => api.post('/parent/complaints', data),
  getComplaints: () => api.get('/parent/complaints'),
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

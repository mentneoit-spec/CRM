import api from './api';

export const hrAPI = {
  // HR Manager Management
  addHRManager: (data) => api.post('/hr/hr-managers', data),
  getHRManagers: () => api.get('/hr/hr-managers'),
  deleteHRManager: (hrManagerId) => api.delete(`/hr/hr-managers/${hrManagerId}`),

  // Employee Management
  addEmployee: (data) => api.post('/hr/employees', data),
  getEmployees: (params) => api.get('/hr/employees', { params }),
  getEmployee: (employeeId) => api.get(`/hr/employees/${employeeId}`),
  updateEmployee: (employeeId, data) => api.put(`/hr/employees/${employeeId}`, data),
  deleteEmployee: (employeeId) => api.delete(`/hr/employees/${employeeId}`),

  // Employee Management - Admin View
  getAllEmployees: (params) => api.get('/admin/hr/employees', { params }),
  getEmployeeData: (employeeId) => api.get(`/admin/hr/employees/${employeeId}`),

  // Attendance
  markAttendance: (data) => api.post('/hr/attendance', data),
  getEmployeeAttendance: (employeeId, params) =>
    api.get(`/hr/attendance/${employeeId}`, { params }),

  // Salary Management
  createSalaryRecord: (data) => api.post('/hr/salaries', data),
  getSalaryRecords: (params) => api.get('/hr/salaries', { params }),
  updateSalaryStatus: (salaryId, data) =>
    api.put(`/hr/salaries/${salaryId}/status`, data),

  // Dashboard
  getHRDashboard: () => api.get('/hr/dashboard/hr'),
  getAdminHRDashboard: () => api.get('/hr/dashboard/admin-hr'),

  // Available Teachers (for Admin HR Management)
  getAvailableTeachers: () => api.get('/hr/teachers/available'),

  // Password Management
  regenerateHRManagerPasswords: () => api.post('/hr/hr-managers/regenerate-passwords'),

  // AI HR Services - Real Groq AI
  getHRInsights: (query, collegeId) => api.post('/ai-hr/hr-insights', { query, collegeId }),
  chatWithAI: (messages, collegeId) => api.post('/ai-hr/chat', { messages, collegeId }),
  analyzeSalary: (collegeId) => api.post('/ai-hr/analyze-salary', { collegeId }),
  analyzeTeam: (collegeId) => api.post('/ai-hr/analyze-team', { collegeId }),
  getSalaryRecommendations: (collegeId) => api.post('/ai-hr/salary-recommendations', { collegeId }),
};

export default hrAPI;

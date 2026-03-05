import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';

// Modern Pages
import LandingPage from './pages/LandingPage';
import ModernLogin from './pages/ModernLogin';
import ModernAdmissionPortal from './pages/ModernAdmissionPortal';
import ConnectionTest from './pages/ConnectionTest';

// Modern Dashboards
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import StudentDashboardModern from './pages/student/StudentDashboardModern';
import TeacherDashboardModern from './pages/teacher/TeacherDashboardModern';
import ParentDashboardModern from './pages/parent/ParentDashboardModern';
import AdminDashboardModern from './pages/admin/AdminDashboardModern';

// Old pages (keeping for backward compatibility)
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ChooseUser from './pages/ChooseUser';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Modern Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<ModernLogin />} />
          <Route path="/admission" element={<ModernAdmissionPortal />} />
          <Route path="/connection-test" element={<ConnectionTest />} />

          {/* Modern Dashboards */}
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboardModern />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboardModern />} />
          <Route path="/parent/dashboard" element={<ParentDashboardModern />} />
          
          <Route path="/student/dashboard" element={<StudentDashboardModern />} />
          <Route path="/student/courses" element={<StudentDashboardModern />} />
          <Route path="/student/attendance" element={<StudentDashboardModern />} />
          <Route path="/student/assignments" element={<StudentDashboardModern />} />
          <Route path="/student/results" element={<StudentDashboardModern />} />
          <Route path="/student/fees" element={<StudentDashboardModern />} />
          <Route path="/student/transport" element={<StudentDashboardModern />} />
          <Route path="/student/notices" element={<StudentDashboardModern />} />

          {/* Old Routes (backward compatibility) */}
          <Route path="/old-home" element={<Homepage />} />
          <Route path="/choose" element={<ChooseUser visitor="normal" />} />
          <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />
          <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
          <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
          <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
          <Route path="/Adminregister" element={<AdminRegisterPage />} />

          {/* Old Dashboards */}
          <Route path="/student/old-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/old-dashboard" element={<TeacherDashboard />} />
          <Route path="/admin/old-dashboard" element={<AdminDashboard />} />

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
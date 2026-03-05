import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';

// Pages
import LandingPage from './pages/LandingPage';
import ModernLogin from './pages/ModernLogin';
import StudentDashboardModern from './pages/student/StudentDashboardModern';
import ModernAdmissionPortal from './pages/ModernAdmissionPortal';

// You can add more dashboards for other roles
// import TeacherDashboard from './pages/teacher/TeacherDashboard';
// import ParentDashboard from './pages/parent/ParentDashboard';
// import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<ModernLogin />} />
          <Route path="/admission" element={<ModernAdmissionPortal />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboardModern />} />
          <Route path="/student/courses" element={<StudentDashboardModern />} />
          <Route path="/student/attendance" element={<StudentDashboardModern />} />
          <Route path="/student/assignments" element={<StudentDashboardModern />} />
          <Route path="/student/results" element={<StudentDashboardModern />} />
          <Route path="/student/fees" element={<StudentDashboardModern />} />
          <Route path="/student/transport" element={<StudentDashboardModern />} />
          <Route path="/student/notices" element={<StudentDashboardModern />} />

          {/* Teacher Routes - Add similar structure */}
          <Route path="/teacher/dashboard" element={<div>Teacher Dashboard (Coming Soon)</div>} />

          {/* Parent Routes - Add similar structure */}
          <Route path="/parent/dashboard" element={<div>Parent Dashboard (Coming Soon)</div>} />

          {/* Admin Routes - Add similar structure */}
          <Route path="/admin/dashboard" element={<div>Admin Dashboard (Coming Soon)</div>} />

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

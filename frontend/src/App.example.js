import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Theme
import theme from './theme/mentneoTheme';

// Pages
import ModernLoginPage from './pages/ModernLoginPage';
import AdminDashboard from './pages/admin/ModernAdminDashboard';
import StudentDashboard from './pages/student/ModernStudentDashboard';
import ParentDashboard from './pages/parent/ModernParentDashboard';

// Protected Route Component
const ProtectedRoute = ({ element, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  const userData = JSON.parse(user);
  
  if (requiredRole && userData.role !== requiredRole) {
    return <Navigate to={`/${userData.role.toLowerCase()}/dashboard`} />;
  }

  return element;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<ModernLoginPage />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Protected Routes */}
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute
                element={<AdminDashboard />}
                requiredRole="Admin"
              />
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute
                element={<StudentDashboard />}
                requiredRole="Student"
              />
            }
          />

          {/* Parent Routes */}
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute
                element={<ParentDashboard />}
                requiredRole="Parent"
              />
            }
          />

          {/* Teacher Routes (To be added) */}
          {/* <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute
                element={<TeacherDashboard />}
                requiredRole="Teacher"
              />
            }
          /> */}

          {/* SuperAdmin Routes (To be added) */}
          {/* <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute
                element={<SuperAdminDashboard />}
                requiredRole="SuperAdmin"
              />
            }
          /> */}

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

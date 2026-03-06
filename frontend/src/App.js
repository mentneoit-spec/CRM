import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';

// Modern Pages
import LandingPage from './pages/LandingPage';
import ModernLogin from './pages/ModernLogin_Enhanced'; // Enhanced version
import ModernSignup from './pages/ModernSignup_Enhanced'; // Enhanced version
import ModernAdmissionPortal from './pages/ModernAdmissionPortal';
import ConnectionTest from './pages/ConnectionTest';

// Modern Dashboards
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import CollegesList from './pages/superadmin/CollegesList';
import AdminDashboardModern from './pages/admin/AdminDashboardModern';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminClasses from './pages/admin/AdminClasses';
import AdminAdmissions from './pages/admin/AdminAdmissions';
import AdminFees from './pages/admin/AdminFees';
import AdminSubjects from './pages/admin/AdminSubjects';
import TeamManagement from './pages/admin/TeamManagement';
import AdminTransport from './pages/admin/AdminTransport';
import StudentDashboardModern from './pages/student/StudentDashboardModern';
import TeacherDashboardModern from './pages/teacher/TeacherDashboardModern';
import ParentDashboardModern from './pages/parent/ParentDashboardModern';

// New Comprehensive Admin Pages
import AdminLayout from './layouts/AdminLayout';
import ComprehensiveAdminDashboard from './pages/admin/ComprehensiveAdminDashboard';
import StudentsManagement from './pages/admin/StudentsManagement';
import TeachersManagement from './pages/admin/TeachersManagement';
import ClassesSubjectsManagement from './pages/admin/ClassesSubjectsManagement';
import FinanceManagement from './pages/admin/FinanceManagement';
import AdmissionsManagement from './pages/admin/AdmissionsManagement';
import NoticesComplaintsManagement from './pages/admin/NoticesComplaintsManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';

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
          <Route path="/signup" element={<ModernSignup />} />
          <Route path="/admission" element={<ModernAdmissionPortal />} />
          <Route path="/connection-test" element={<ConnectionTest />} />

          {/* Modern Dashboards */}
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/colleges" element={<CollegesList />} />
          <Route path="/admin/dashboard" element={<AdminDashboardModern />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/admissions" element={<AdminAdmissions />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/fees" element={<AdminFees />} />
          <Route path="/admin/teams" element={<TeamManagement />} />
          <Route path="/admin/transport" element={<AdminTransport />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboardModern />} />
          <Route path="/parent/dashboard" element={<ParentDashboardModern />} />

          {/* Comprehensive Admin Layout with New Pages */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<ComprehensiveAdminDashboard />} />
            <Route path="students" element={<StudentsManagement />} />
            <Route path="teachers" element={<TeachersManagement />} />
            <Route path="classes" element={<ClassesSubjectsManagement />} />
            <Route path="subjects" element={<ClassesSubjectsManagement />} />
            <Route path="finance" element={<FinanceManagement />} />
            <Route path="payments" element={<FinanceManagement />} />
            <Route path="fees" element={<FinanceManagement />} />
            <Route path="admissions" element={<AdmissionsManagement />} />
            <Route path="notices" element={<NoticesComplaintsManagement />} />
            <Route path="complaints" element={<NoticesComplaintsManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
          </Route>

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
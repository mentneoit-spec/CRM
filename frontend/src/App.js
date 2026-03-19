import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';

// Modern Pages
import LandingPage from './pages/LandingPage';
import ModernLogin from './pages/ModernLogin_Enhanced'; // Enhanced version
import SimpleLogin from './pages/SimpleLogin'; // Debug version
import ModernSignup from './pages/ModernSignup_Enhanced'; // Enhanced version
import ModernAdmissionPortal from './pages/ModernAdmissionPortal';
import ConnectionTest from './pages/ConnectionTest';

// Modern Dashboards
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import CollegesList from './pages/superadmin/CollegesList';
import CreateSchoolPage from './pages/superadmin/pages/CreateSchoolPage';
import EditSchoolPage from './pages/superadmin/pages/EditSchoolPage';
import AssignPlanPage from './pages/superadmin/pages/AssignPlanPage';
import StorageLimitPage from './pages/superadmin/pages/StorageLimitPage';
import AdminManagementPage from './pages/superadmin/pages/AdminManagementPage';
import MonitoringPage from './pages/superadmin/pages/MonitoringPage';
import SecurityPage from './pages/superadmin/pages/SecurityPage';
import CollegeStatusPage from './pages/superadmin/pages/CollegeStatusPage';
import CollegeDeletePage from './pages/superadmin/pages/CollegeDeletePage';
import CustomDomainPage from './pages/superadmin/pages/CustomDomainPage';
import WhiteLabelPage from './pages/superadmin/pages/WhiteLabelPage';
import AdminDashboardModern from './pages/admin/AdminDashboardModern';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminClasses from './pages/admin/AdminClasses';
import AdminAdmissions from './pages/admin/AdminAdmissions';
import AdminFees from './pages/admin/AdminFees';
import AdminSubjects from './pages/admin/AdminSubjects';
import TeamManagement from './pages/admin/TeamManagement';
import AdminTransport from './pages/admin/AdminTransport';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import StudentDashboardModern from './pages/student/StudentDashboardModern';
import StudentHomework from './pages/student/pages/HomeworkPage';
import StudentAttendance from './pages/student/pages/AttendancePage';
import StudentMarks from './pages/student/pages/MarksPage';
import StudentFees from './pages/student/pages/FeesPage';
import StudentProfilePage from './pages/student/pages/StudentProfile';
import StudentSettingsPage from './pages/student/pages/SettingsPage';
import StudentComplaint from './pages/student/pages/ComplaintPage';
import StudentTests from './pages/student/pages/TestPage';
import TeacherDashboardModern from './pages/teacher/TeacherDashboardModern';
import TeacherClassesModern from './pages/teacher/TeacherClassesModern';
import TeacherStudentsModern from './pages/teacher/TeacherStudentsModern';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherReports from './pages/teacher/TeacherReports';
import TeacherProfileModern from './pages/teacher/TeacherProfileModern';
import TeacherSettingsModern from './pages/teacher/TeacherSettingsModern';
import ParentDashboardModern from './pages/parent/ParentDashboardModern';
import ParentAttendance from './pages/parent/pages/AttendancePage';
import ParentHomework from './pages/parent/pages/HomeworkPage';
import ParentExamResults from './pages/parent/pages/ExamResultsPage';
import ParentFees from './pages/parent/pages/FeesPage';
import ParentPaymentHistory from './pages/parent/pages/PaymentHistory';
import ParentProfile from './pages/parent/pages/StudentProfile';
import ParentSettingsPage from './pages/parent/pages/SettingsPage';
import ParentFeedback from './pages/parent/pages/FeedbackPage';
import TransportDashboard from './pages/transport/pages/TransportDashboard';
import RoutesPage from './pages/transport/pages/RoutesPage';
import AssignBusPage from './pages/transport/pages/AssignBusPage';
import BusAttendancePage from './pages/transport/pages/BusAttendancePage';
import BusFeesPage from './pages/transport/pages/BusFeesPage';
import TransportReports from './pages/transport/pages/TransportReports';
import TransportProfilePage from './pages/transport/pages/ProfilePage';
import TransportSettingsPage from './pages/transport/pages/SettingsPage';
import AccountsDashboard from './pages/accounts/pages/AccountsDashboard';
import AllPaymentsPage from './pages/accounts/pages/AllPaymentsPage';
import RazorpayTransactions from './pages/accounts/pages/RazorpayTransactions';
import ManualPaymentEntry from './pages/accounts/pages/ManualPaymentEntry';
import RefundsPage from './pages/accounts/pages/RefundsPage';
import PaymentReports from './pages/accounts/pages/PaymentReports';
import ExportCSVPage from './pages/accounts/pages/ExportCSVPage';
import AccountsProfilePage from './pages/accounts/pages/ProfilePage';
import AccountsSettingsPage from './pages/accounts/pages/SettingsPage';
import SuperAdminProfilePage from './pages/superadmin/pages/ProfilePage';
import SuperAdminSettingsPage from './pages/superadmin/pages/SettingsPage';

// Old pages (keeping for backward compatibility)
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import AdminProfileModern from './pages/admin/AdminProfileModern';
import ChooseUser from './pages/ChooseUser';
import ProtectedRoute from './components/ProtectedRoute';

const getStoredRoleHome = () => {
  try {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const role = user?.role;
    switch (String(role || '').trim()) {
      case 'Student':
        return '/student/dashboard';
      case 'Teacher':
        return '/teacher/dashboard';
      case 'Parent':
        return '/parent/dashboard';
      case 'Admin':
        return '/admin/dashboard';
      case 'SuperAdmin':
        return '/superadmin/dashboard';
      case 'AccountsTeam':
        return '/accounts/dashboard';
      case 'TransportTeam':
        return '/transport/dashboard';
      default:
        return '/';
    }
  } catch {
    return '/';
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Modern Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<ModernLogin />} />
          <Route path="/simple-login" element={<SimpleLogin />} />
          <Route path="/signup" element={<ModernSignup />} />
          <Route path="/admission" element={<ModernAdmissionPortal />} />
          <Route path="/connection-test" element={<ConnectionTest />} />

          {/* Modern Dashboards */}
          <Route path="/dashboard" element={<Navigate to={getStoredRoleHome()} replace />} />

          <Route
            path="/superadmin/dashboard"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<SuperAdminDashboard />} />}
          />
          <Route
            path="/superadmin/colleges"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<CollegesList />} />}
          />
          <Route
            path="/superadmin/colleges/create"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<CreateSchoolPage />} />}
          />
          <Route
            path="/superadmin/colleges/edit"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<EditSchoolPage />} />}
          />
          <Route
            path="/superadmin/colleges/plan"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<AssignPlanPage />} />}
          />
          <Route
            path="/superadmin/colleges/storage"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<StorageLimitPage />} />}
          />
          <Route
            path="/superadmin/colleges/status"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<CollegeStatusPage />} />}
          />
          <Route
            path="/superadmin/colleges/delete"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<CollegeDeletePage />} />}
          />
          <Route
            path="/superadmin/colleges/domain"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<CustomDomainPage />} />}
          />
          <Route
            path="/superadmin/colleges/white-label"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<WhiteLabelPage />} />}
          />
          <Route
            path="/superadmin/admins"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<AdminManagementPage />} />}
          />
          <Route
            path="/superadmin/monitoring"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<MonitoringPage />} />}
          />
          <Route
            path="/superadmin/security"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<SecurityPage />} />}
          />
          <Route
            path="/superadmin/profile"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<SuperAdminProfilePage />} />}
          />
          <Route
            path="/superadmin/settings"
            element={<ProtectedRoute allowedRoles={["SuperAdmin"]} element={<SuperAdminSettingsPage />} />}
          />

          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminDashboardModern />} />}
          />
          <Route
            path="/admin/teachers"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminTeachers />} />}
          />
          <Route
            path="/admin/students"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminStudents />} />}
          />
          <Route
            path="/admin/classes"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminClasses />} />}
          />
          <Route
            path="/admin/admissions"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminAdmissions />} />}
          />
          <Route
            path="/admin/subjects"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminSubjects />} />}
          />
          <Route
            path="/admin/fees"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminFees />} />}
          />
          <Route
            path="/admin/teams"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<TeamManagement />} />}
          />
          <Route
            path="/admin/transport"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminTransport />} />}
          />
          <Route
            path="/admin/reports"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminReports />} />}
          />
          <Route
            path="/admin/settings"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminSettings />} />}
          />
          <Route
            path="/admin/profile"
            element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} element={<AdminProfileModern />} />}
          />

          <Route
            path="/teacher/dashboard"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherDashboardModern />} />}
          />
          <Route
            path="/teacher/classes"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherClassesModern />} />}
          />
          <Route
            path="/teacher/students"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherStudentsModern />} />}
          />
          <Route
            path="/teacher/attendance"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherAttendance />} />}
          />
          <Route
            path="/teacher/assignments"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherAssignments />} />}
          />
          <Route
            path="/teacher/exams"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherExams />} />}
          />
          <Route
            path="/teacher/reports"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherReports />} />}
          />
          <Route
            path="/teacher/profile"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherProfileModern />} />}
          />
          <Route
            path="/teacher/settings"
            element={<ProtectedRoute allowedRoles={["Teacher"]} element={<TeacherSettingsModern />} />}
          />

          <Route
            path="/parent/dashboard"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentDashboardModern />} />}
          />
          <Route
            path="/parent/attendance"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentAttendance />} />}
          />
          <Route
            path="/parent/homework"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentHomework />} />}
          />
          <Route
            path="/parent/exams"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentExamResults />} />}
          />
          <Route
            path="/parent/fees"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentFees />} />}
          />
          <Route
            path="/parent/payment-history"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentPaymentHistory />} />}
          />
          <Route
            path="/parent/profile"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentProfile />} />}
          />
          <Route
            path="/parent/settings"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentSettingsPage />} />}
          />
          <Route
            path="/parent/feedback"
            element={<ProtectedRoute allowedRoles={["Parent"]} element={<ParentFeedback />} />}
          />

          <Route
            path="/transport/dashboard"
            element={<ProtectedRoute allowedRoles={["TransportTeam", "Admin", "SuperAdmin"]} element={<TransportDashboard />} />}
          />
          <Route
            path="/transport/routes"
            element={<ProtectedRoute allowedRoles={["TransportTeam", "Admin", "SuperAdmin"]} element={<RoutesPage />} />}
          />
          <Route
            path="/transport/assign-bus"
            element={<ProtectedRoute allowedRoles={["TransportTeam", "Admin", "SuperAdmin"]} element={<AssignBusPage />} />}
          />
          <Route
            path="/transport/attendance"
            element={<ProtectedRoute allowedRoles={["TransportTeam", "Admin", "SuperAdmin"]} element={<BusAttendancePage />} />}
          />
          <Route
            path="/transport/fees"
            element={<ProtectedRoute allowedRoles={["TransportTeam", "Admin", "SuperAdmin"]} element={<BusFeesPage />} />}
          />
          <Route
            path="/transport/reports"
            element={<ProtectedRoute allowedRoles={["TransportTeam", "Admin", "SuperAdmin"]} element={<TransportReports />} />}
          />
          <Route
            path="/transport/profile"
            element={<ProtectedRoute allowedRoles={["TransportTeam", "Admin", "SuperAdmin"]} element={<TransportProfilePage />} />}
          />
          <Route
            path="/transport/settings"
            element={<ProtectedRoute allowedRoles={["TransportTeam", "Admin", "SuperAdmin"]} element={<TransportSettingsPage />} />}
          />

          <Route
            path="/accounts/dashboard"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<AccountsDashboard />} />}
          />
          <Route
            path="/accounts/payments"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<AllPaymentsPage />} />}
          />
          <Route
            path="/accounts/razorpay"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<RazorpayTransactions />} />}
          />
          <Route
            path="/accounts/manual"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<ManualPaymentEntry />} />}
          />
          <Route
            path="/accounts/refunds"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<RefundsPage />} />}
          />
          <Route
            path="/accounts/reports"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<PaymentReports />} />}
          />
          <Route
            path="/accounts/export"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<ExportCSVPage />} />}
          />
          <Route
            path="/accounts/profile"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<AccountsProfilePage />} />}
          />
          <Route
            path="/accounts/settings"
            element={<ProtectedRoute allowedRoles={["AccountsTeam", "Admin", "SuperAdmin"]} element={<AccountsSettingsPage />} />}
          />

          <Route
            path="/student/dashboard"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentDashboardModern />} />}
          />
          <Route
            path="/student/homework"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentHomework />} />}
          />
          <Route
            path="/student/attendance"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentAttendance />} />}
          />
          <Route
            path="/student/tests"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentTests />} />}
          />
          <Route
            path="/student/marks"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentMarks />} />}
          />
          <Route
            path="/student/fees"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentFees />} />}
          />
          <Route
            path="/student/profile"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentProfilePage />} />}
          />
          <Route
            path="/student/settings"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentSettingsPage />} />}
          />
          <Route
            path="/student/complaints"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentComplaint />} />}
          />
          <Route
            path="/student/assignments"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentHomework />} />}
          />
          <Route
            path="/student/results"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentMarks />} />}
          />
          <Route
            path="/student/courses"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentTests />} />}
          />
          <Route
            path="/student/transport"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentDashboardModern />} />}
          />
          <Route
            path="/student/notices"
            element={<ProtectedRoute allowedRoles={["Student"]} element={<StudentDashboardModern />} />}
          />

          {/* Old Routes (backward compatibility) */}
          <Route path="/old-home" element={<Homepage />} />
          <Route path="/choose" element={<ChooseUser visitor="normal" />} />
          <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />
          <Route path="/Adminlogin" element={<Navigate to="/login?role=Admin" replace />} />
          <Route path="/Studentlogin" element={<Navigate to="/login?role=Student" replace />} />
          <Route path="/Teacherlogin" element={<Navigate to="/login?role=Teacher" replace />} />
          <Route path="/Adminregister" element={<AdminRegisterPage />} />

          {/* Old Dashboards */}
          <Route path="/Admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/Student/dashboard" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/Teacher/dashboard" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="/student/old-dashboard" element={<StudentDashboardModern />} />
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
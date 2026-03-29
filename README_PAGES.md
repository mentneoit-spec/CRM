# Gravity CRM - Complete Pages Documentation

## 📋 Table of Contents
1. [Public Pages](#public-pages)
2. [Authentication](#authentication)
3. [SuperAdmin Pages](#superadmin-pages)
4. [Admin Pages](#admin-pages)
5. [Teacher Pages](#teacher-pages)
6. [Student Pages](#student-pages)
7. [Parent Pages](#parent-pages)
8. [Transport Pages](#transport-pages)
9. [Accounts Pages](#accounts-pages)
10. [HR Pages](#hr-pages)
11. [AI Pages](#ai-pages)

---

## Public Pages

### 1. Landing Page
- **Route**: `/`
- **Path**: `pages/LandingPage.jsx`
- **Purpose**: Welcome page for new visitors
- **Backend Data**: ❌ No
- **Features**: Navigation, CTAs, feature overview

### 2. Choose User Role
- **Route**: `/choose-user`
- **Path**: `pages/ChooseUser.jsx`
- **Purpose**: Select user role before login
- **Backend Data**: ❌ No
- **Features**: Role selection, navigation to login

### 3. Connection Test
- **Route**: `/connection-test`
- **Path**: `pages/ConnectionTest.jsx`
- **Purpose**: Test backend API connection
- **Backend Data**: ✅ Yes
- **Features**: Connection diagnostics, API status check

---

## Authentication

### Modern Login
- **Route**: `/login`
- **Path**: `pages/ModernLogin_Enhanced.jsx`
- **Purpose**: User authentication
- **Backend Data**: ✅ Yes (Credentials)
- **Features**: Email/password login, role detection, session management
- **Supported Roles**: Student, Teacher, Parent, Admin, SuperAdmin, HRTeam, TransportTeam, AccountsTeam

### Modern Signup
- **Route**: `/signup`
- **Path**: `pages/ModernSignup_Enhanced.jsx`
- **Purpose**: New user registration
- **Backend Data**: ✅ Yes (User creation)
- **Features**: Account creation, profile setup, email verification

### Simple Login (Debug)
- **Route**: `/simple-login`
- **Path**: `pages/SimpleLogin.jsx`
- **Purpose**: Debug/testing login
- **Backend Data**: ✅ Yes
- **Features**: Simplified login interface

---

## SuperAdmin Pages
**Access**: SuperAdmin role only  
**Protection**: ✅ ProtectedRoute enforced

### 1. SuperAdmin Dashboard
- **Route**: `/superadmin/dashboard`
- **Path**: `pages/superadmin/SuperAdminDashboard.jsx`
- **Purpose**: Main overview for system administration
- **Backend Data**: ✅ Yes (Analytics, colleges, admins)
- **Features**: KPI cards, system statistics, quick actions

### 2. Colleges Management
- **Route**: `/superadmin/colleges`
- **Path**: `pages/superadmin/CollegesList.jsx`
- **Purpose**: List and manage all colleges
- **Backend Data**: ✅ Yes (College data)
- **Features**: View, create, edit, delete colleges

### 3. Create College
- **Route**: `/superadmin/colleges/create`
- **Path**: `pages/superadmin/pages/CreateSchoolPage.jsx`
- **Purpose**: Add new college to system
- **Backend Data**: ✅ Yes
- **Features**: Multi-step form, configuration setup

### 4. Edit College
- **Route**: `/superadmin/colleges/edit/:id`
- **Path**: `pages/superadmin/pages/EditSchoolPage.jsx`
- **Purpose**: Modify college settings
- **Backend Data**: ✅ Yes
- **Features**: Form pre-fill, live updates

### 5. Plan Assignment
- **Route**: `/superadmin/colleges/plan`
- **Path**: `pages/superadmin/pages/AssignPlanPage.jsx`
- **Purpose**: Assign subscription plans to colleges
- **Backend Data**: ✅ Yes
- **Features**: Plan selection, pricing, activation

### 6. Storage Limits
- **Route**: `/superadmin/colleges/storage`
- **Path**: `pages/superadmin/pages/StorageLimitPage.jsx`
- **Purpose**: Manage storage quotas
- **Backend Data**: ✅ Yes
- **Features**: Quota setting, usage monitoring

### 7. Admin Management
- **Route**: `/superadmin/admins`
- **Path**: `pages/superadmin/pages/AdminManagementPage.jsx`
- **Purpose**: Create and manage admin accounts
- **Backend Data**: ✅ Yes
- **Features**: Admin CRUD, role assignment

### 8. System Monitoring
- **Route**: `/superadmin/monitoring`
- **Path**: `pages/superadmin/pages/MonitoringPage.jsx`
- **Purpose**: Monitor system health and performance
- **Backend Data**: ✅ Yes
- **Features**: Real-time metrics, logs, alerts

### 9. Security Management
- **Route**: `/superadmin/security`
- **Path**: `pages/superadmin/pages/SecurityPage.jsx`
- **Purpose**: System security settings
- **Backend Data**: ✅ Yes
- **Features**: Permissions, encryption, backup

### 10. College Status
- **Route**: `/superadmin/colleges/status`
- **Path**: `pages/superadmin/pages/CollegeStatusPage.jsx`
- **Purpose**: View college operational status
- **Backend Data**: ✅ Yes
- **Features**: Active/inactive status, last activity

### 11. College Deletion
- **Route**: `/superadmin/colleges/delete`
- **Path**: `pages/superadmin/pages/CollegeDeletePage.jsx`
- **Purpose**: Remove college from system
- **Backend Data**: ✅ Yes
- **Features**: Confirmation, data cleanup

### 12. Custom Domain
- **Route**: `/superadmin/colleges/domain`
- **Path**: `pages/superadmin/pages/CustomDomainPage.jsx`
- **Purpose**: Manage custom domain assignments
- **Backend Data**: ✅ Yes
- **Features**: Domain mapping, SSL management

### 13. White Label
- **Route**: `/superadmin/colleges/white-label`
- **Path**: `pages/superadmin/pages/WhiteLabelPage.jsx`
- **Purpose**: White label customization
- **Backend Data**: ✅ Yes
- **Features**: Branding, theme customization

### 14. SuperAdmin Profile
- **Route**: `/superadmin/profile`
- **Path**: `pages/superadmin/pages/ProfilePage.jsx`
- **Purpose**: SuperAdmin profile management
- **Backend Data**: ✅ Yes
- **Features**: Profile info, preferences, security

### 15. SuperAdmin Settings
- **Route**: `/superadmin/settings`
- **Path**: `pages/superadmin/pages/SettingsPage.jsx`
- **Purpose**: System-wide settings
- **Backend Data**: ✅ Yes
- **Features**: Configurations, preferences

---

## Admin Pages
**Access**: Admin, SuperAdmin  
**Protection**: ✅ ProtectedRoute enforced

### 1. Admin Dashboard
- **Route**: `/admin/dashboard`
- **Path**: `pages/admin/AdminDashboardModern.jsx`
- **Purpose**: Main admin interface
- **Backend Data**: ✅ Yes (Students, teachers, fees, attendance)
- **Features**: Overview cards, recent activities, quick actions

### 2. Teacher Management
- **Route**: `/admin/teachers`
- **Path**: `pages/admin/AdminTeachers.jsx`
- **Purpose**: Manage all teachers
- **Backend Data**: ✅ Yes
- **Features**: Add, edit, delete, assign classes

### 3. Student Management
- **Route**: `/admin/students`
- **Path**: `pages/admin/AdminStudents.jsx`
- **Purpose**: Manage student database
- **Backend Data**: ✅ Yes
- **Features**: CRUD operations, bulk import, search

### 4. Class Management
- **Route**: `/admin/classes`
- **Path**: `pages/admin/AdminClasses.jsx`
- **Purpose**: Create and manage classes
- **Backend Data**: ✅ Yes
- **Features**: Class creation, teacher assignment, capacity

### 5. Subject Management
- **Route**: `/admin/subjects`
- **Path**: `pages/admin/AdminSubjects.jsx`
- **Purpose**: Manage academic subjects
- **Backend Data**: ✅ Yes
- **Features**: Add/edit subjects, assign to classes

### 6. Fee Management (Legacy)
- **Route**: `/admin/fees`
- **Path**: `pages/admin/AdminFees.jsx`
- **Purpose**: Traditional fee management
- **Backend Data**: ✅ Yes
- **Features**: Fee structure, student fees

### 7. Fee Management (Modern)
- **Route**: `/admin/fee-management`
- **Path**: `pages/admin/FeeManagement.jsx`
- **Purpose**: Enhanced fee management system
- **Backend Data**: ✅ Yes
- **Features**: Advanced reporting, payment tracking

### 8. Receipts Management
- **Route**: `/admin/receipts`
- **Path**: `pages/admin/AdminReceipts.jsx`
- **Purpose**: Payment receipts management
- **Backend Data**: ✅ Yes
- **Features**: Receipt generation, viewing, printing

### 9. Analytics Dashboard
- **Route**: `/admin/analytics`
- **Path**: `pages/admin/AdminAnalytics.jsx`
- **Purpose**: System-wide analytics
- **Backend Data**: ✅ Yes
- **Features**: Charts, trends, insights

### 10. Team Management
- **Route**: `/admin/teams`
- **Path**: `pages/admin/TeamManagement.jsx`
- **Purpose**: Manage specialized teams
- **Backend Data**: ✅ Yes
- **Features**: Create teams, assign members

### 11. Transport Management
- **Route**: `/admin/transport`
- **Path**: `pages/admin/AdminTransport.jsx`
- **Purpose**: View transport operations
- **Backend Data**: ✅ Yes
- **Features**: Routes, buses, schedules

### 12. Reports
- **Route**: `/admin/reports`
- **Path**: `pages/admin/AdminReports.jsx`
- **Purpose**: Generate various reports
- **Backend Data**: ✅ Yes
- **Features**: Attendance, marks, fees reports

### 13. Results Management
- **Route**: `/admin/results`
- **Path**: `pages/admin/AdminResults.jsx`
- **Purpose**: Manage academic results
- **Backend Data**: ✅ Yes
- **Features**: Result entry, publication

### 14. Marks Upload (Enhanced)
- **Route**: `/admin/marks-upload`
- **Path**: `pages/admin/AdminMarksUploadEnhanced.jsx`
- **Purpose**: Upload student marks
- **Backend Data**: ✅ Yes
- **Features**: Form entry, CSV import, validation

### 15. CSV Results Upload
- **Route**: `/admin/results-csv-upload`
- **Path**: `pages/admin/AdminResultsCSVUpload.jsx`
- **Purpose**: Bulk upload results via CSV
- **Backend Data**: ✅ Yes
- **Features**: File parsing, validation, batch import

### 16. Send Marks Email
- **Route**: `/admin/send-marks-email`
- **Path**: `pages/admin/SendMarksEmail.jsx`
- **Purpose**: Email marks to students/parents
- **Backend Data**: ✅ Yes
- **Features**: Template selection, bulk send, tracking

### 17. Import Students
- **Route**: `/admin/import-students`
- **Path**: `pages/admin/ImportStudentsCSV.jsx`
- **Purpose**: Bulk student import
- **Backend Data**: ✅ Yes
- **Features**: CSV upload, validation, preview

### 18. Admissions Team Dashboard
- **Route**: `/admin/admissions`
- **Path**: `pages/admin/AdmissionsTeamDashboard.jsx`
- **Purpose**: Manage admissions workflow
- **Backend Data**: ✅ Yes
- **Features**: Application tracking, approval workflow

### 19. Admission Team Management
- **Route**: `/admin/admissions/team`
- **Path**: `pages/admin/AdmissionTeamManagement.jsx`
- **Purpose**: Manage admission team members
- **Backend Data**: ✅ Yes
- **Features**: Team member CRUD

### 20. Admin Settings
- **Route**: `/admin/settings`
- **Path**: `pages/admin/AdminSettings.jsx`
- **Purpose**: Admin-level settings
- **Backend Data**: ✅ Yes
- **Features**: Preferences, configurations

### 21. Admin Profile
- **Route**: `/admin/profile`
- **Path**: `pages/admin/AdminProfileModern.jsx`
- **Purpose**: Admin profile management
- **Backend Data**: ✅ Yes
- **Features**: Profile info, security settings

---

## Teacher Pages
**Access**: Teacher, SuperAdmin  
**Protection**: ✅ ProtectedRoute enforced

### 1. Teacher Dashboard
- **Route**: `/teacher/dashboard`
- **Path**: `pages/teacher/TeacherDashboardModern.jsx`
- **Purpose**: Main teacher interface
- **Backend Data**: ✅ Yes (Classes, students, attendance)
- **Features**: Today's schedule, class info, announcements

### 2. Classes Management
- **Route**: `/teacher/classes`
- **Path**: `pages/teacher/TeacherClassesModern.jsx`
- **Purpose**: View and manage assigned classes
- **Backend Data**: ✅ Yes
- **Features**: Class info, student list, schedules

### 3. Students List
- **Route**: `/teacher/students`
- **Path**: `pages/teacher/TeacherStudentsModern.jsx`
- **Purpose**: View all students in assigned classes
- **Backend Data**: ✅ Yes
- **Features**: Search, filter, profile view

### 4. Attendance Marking
- **Route**: `/teacher/attendance`
- **Path**: `pages/teacher/TeacherAttendance.jsx`
- **Purpose**: Mark student attendance
- **Backend Data**: ✅ Yes
- **Features**: Daily marking, attendance reports

### 5. Assignments Creation
- **Route**: `/teacher/assignments`
- **Path**: `pages/teacher/TeacherAssignments.jsx`
- **Purpose**: Create and manage assignments
- **Backend Data**: ✅ Yes
- **Features**: Create assignments, submission tracking, grading

### 6. Exam Management
- **Route**: `/teacher/exams`
- **Path**: `pages/teacher/TeacherExams.jsx`
- **Purpose**: Manage exams and tests
- **Backend Data**: ✅ Yes
- **Features**: Exam scheduling, question bank, result entry

### 7. Marks Entry
- **Route**: `/teacher/marks`
- **Path**: `pages/teacher/TeacherMarksModern.jsx`
- **Purpose**: Enter student marks
- **Backend Data**: ✅ Yes
- **Features**: Marks entry, grade calculation, publication

### 8. Reports
- **Route**: `/teacher/reports`
- **Path**: `pages/teacher/TeacherReports.jsx`
- **Purpose**: Generate teaching reports
- **Backend Data**: ✅ Yes
- **Features**: Attendance reports, marks analysis, performance

### 9. Teacher Profile
- **Route**: `/teacher/profile`
- **Path**: `pages/teacher/TeacherProfileModern.jsx`
- **Purpose**: Teacher profile management
- **Backend Data**: ✅ Yes
- **Features**: Profile info, qualifications, contact

### 10. Teacher Settings
- **Route**: `/teacher/settings`
- **Path**: `pages/teacher/TeacherSettingsModern.jsx`
- **Purpose**: Personal settings
- **Backend Data**: ✅ Yes
- **Features**: Preferences, notifications, security

### 11. Marks Upload (Teacher)
- **Route**: `/teacher/marks-upload`
- **Path**: `pages/teacher/TeacherMarksUpload.jsx`
- **Purpose**: Bulk upload marks via CSV
- **Backend Data**: ✅ Yes
- **Features**: CSV import, validation, batch processing

---

## Student Pages
**Access**: Student role  
**Protection**: ✅ ProtectedRoute enforced

### 1. Student Dashboard
- **Route**: `/student/dashboard`
- **Path**: `pages/student/StudentDashboardModern.jsx`
- **Purpose**: Main student interface
- **Backend Data**: ✅ Yes (Marks, attendance, fees, homework)
- **Features**: Academic info, announcements, quick actions

### 2. Marks Page
- **Route**: `/student/marks`
- **Path**: `pages/student/pages/MarksPage.jsx`
- **Purpose**: View academic marks
- **Backend Data**: ✅ Yes
- **Features**: Mark display, grade analysis, historical performance

### 3. Attendance Page
- **Route**: `/student/attendance`
- **Path**: `pages/student/pages/AttendancePage.jsx`
- **Purpose**: View attendance records
- **Backend Data**: ✅ Yes
- **Features**: Attendance percentage, history, status

### 4. Fees Page
- **Route**: `/student/fees`
- **Path**: `pages/student/pages/FeesPage.jsx`
- **Purpose**: View and pay fees
- **Backend Data**: ✅ Yes
- **Features**: Fee structure, payment status, payment gateway

### 5. Homework Page
- **Route**: `/student/homework`
- **Path**: `pages/student/pages/HomeworkPage.jsx`
- **Purpose**: View assigned homework
- **Backend Data**: ✅ Yes
- **Features**: Homework list, deadline tracking, submission

### 6. Tests/Exams Page
- **Route**: `/student/tests`
- **Path**: `pages/student/pages/TestPage.jsx`
- **Purpose**: View exam schedules and results
- **Backend Data**: ✅ Yes
- **Features**: Exam schedule, results display, performance

### 7. Complaints Page
- **Route**: `/student/complaints`
- **Path**: `pages/student/pages/ComplaintPage.jsx`
- **Purpose**: Submit and track complaints
- **Backend Data**: ✅ Yes
- **Features**: Complaint submission, status tracking, resolution

### 8. Student Profile
- **Route**: `/student/profile`
- **Path**: `pages/student/pages/StudentProfile.jsx`
- **Purpose**: View and edit profile
- **Backend Data**: ✅ Yes
- **Features**: Personal info, contact details, emergency info

### 9. Student Settings
- **Route**: `/student/settings`
- **Path**: `pages/student/pages/SettingsPage.jsx`
- **Purpose**: Personal preferences
- **Backend Data**: ✅ Yes
- **Features**: Notifications, privacy, security settings

---

## Parent Pages
**Access**: Parent role  
**Protection**: ✅ ProtectedRoute enforced

### 1. Parent Dashboard
- **Route**: `/parent/dashboard`
- **Path**: `pages/parent/ParentDashboardModern.jsx`
- **Purpose**: Main parent interface
- **Backend Data**: ✅ Yes (Child's data, fees, attendance)
- **Features**: Child info summary, quick updates, actions

### 2. Attendance Page
- **Route**: `/parent/attendance`
- **Path**: `pages/parent/pages/AttendancePage.jsx`
- **Purpose**: View child's attendance
- **Backend Data**: ✅ Yes
- **Features**: Attendance percentage, patterns, alerts

### 3. Homework Page
- **Route**: `/parent/homework`
- **Path**: `pages/parent/pages/HomeworkPage.jsx`
- **Purpose**: Track child's homework
- **Backend Data**: ✅ Yes
- **Features**: Homework list, completion status, notes

### 4. Exam Results Page
- **Route**: `/parent/exams`
- **Path**: `pages/parent/pages/ExamResultsPage.jsx`
- **Purpose**: View child's exam results
- **Backend Data**: ✅ Yes
- **Features**: Result display, performance analysis, trends

### 5. Fees Page
- **Route**: `/parent/fees`
- **Path**: `pages/parent/pages/FeesPage.jsx`
- **Purpose**: View fees and payment status
- **Backend Data**: ✅ Yes
- **Features**: Fee breakdown, pending amounts, payment option

### 6. Payment History
- **Route**: `/parent/payments`
- **Path**: `pages/parent/pages/PaymentHistory.jsx`
- **Purpose**: View payment history
- **Backend Data**: ✅ Yes
- **Features**: Transaction history, receipts, download

### 7. Child/Student Profile
- **Route**: `/parent/child-profile`
- **Path**: `pages/parent/pages/StudentProfile.jsx`
- **Purpose**: View child's profile
- **Backend Data**: ✅ Yes
- **Features**: Student info, contact details, emergency info

### 8. Feedback Page
- **Route**: `/parent/feedback`
- **Path**: `pages/parent/pages/FeedbackPage.jsx`
- **Purpose**: Submit feedback to school
- **Backend Data**: ✅ Yes
- **Features**: Feedback form, history, responses

### 9. Parent Settings
- **Route**: `/parent/settings`
- **Path**: `pages/parent/pages/SettingsPage.jsx`
- **Purpose**: Account preferences
- **Backend Data**: ✅ Yes
- **Features**: Notifications, privacy, communication prefs

---

## Transport Pages
**Access**: TransportTeam role  
**Protection**: ✅ ProtectedRoute enforced

### 1. Transport Dashboard
- **Route**: `/transport/dashboard`
- **Path**: `pages/transport/pages/TransportDashboard.jsx`
- **Purpose**: Main transport management interface
- **Backend Data**: ✅ Yes (Routes, buses, attendance)
- **Features**: Fleet overview, route info, attendance summary

### 2. Routes Management
- **Route**: `/transport/routes`
- **Path**: `pages/transport/pages/RoutesPage.jsx`
- **Purpose**: Manage bus routes
- **Backend Data**: ✅ Yes
- **Features**: Create routes, edit, assign stops

### 3. Assign Bus
- **Route**: `/transport/assign-bus`
- **Path**: `pages/transport/pages/AssignBusPage.jsx`
- **Purpose**: Assign buses to routes
- **Backend Data**: ✅ Yes
- **Features**: Bus selection, route mapping, scheduling

### 4. Bus Attendance
- **Route**: `/transport/attendance`
- **Path**: `pages/transport/pages/BusAttendancePage.jsx`
- **Purpose**: Mark student boarding/alighting
- **Backend Data**: ✅ Yes
- **Features**: Daily attendance, route-wise tracking

### 5. Bus Fees
- **Route**: `/transport/fees`
- **Path**: `pages/transport/pages/BusFeesPage.jsx`
- **Purpose**: Manage transport fees
- **Backend Data**: ✅ Yes
- **Features**: Fee structure, payments, defaulters

### 6. Transport Reports
- **Route**: `/transport/reports`
- **Path**: `pages/transport/pages/TransportReports.jsx`
- **Purpose**: Generate transport reports
- **Backend Data**: ✅ Yes
- **Features**: Route reports, attendance analytics, collections

### 7. Transport Profile
- **Route**: `/transport/profile`
- **Path**: `pages/transport/pages/ProfilePage.jsx`
- **Purpose**: Team member profile
- **Backend Data**: ✅ Yes
- **Features**: Personal info, contact, identification

### 8. Transport Settings
- **Route**: `/transport/settings`
- **Path**: `pages/transport/pages/SettingsPage.jsx`
- **Purpose**: Transport settings
- **Backend Data**: ✅ Yes
- **Features**: Configurations, preferences

---

## Accounts Pages
**Access**: AccountsTeam role  
**Protection**: ✅ ProtectedRoute enforced

### 1. Accounts Dashboard
- **Route**: `/accounts/dashboard`
- **Path**: `pages/accounts/pages/AccountsDashboard.jsx`
- **Purpose**: Main accounting interface
- **Backend Data**: ✅ Yes (Payments, revenues, collections)
- **Features**: Revenue summary, collection status, trends

### 2. All Payments
- **Route**: `/accounts/all-payments`
- **Path**: `pages/accounts/pages/AllPaymentsPage.jsx`
- **Purpose**: View all system payments
- **Backend Data**: ✅ Yes
- **Features**: Payment list, filter, search, export

### 3. Razorpay Transactions
- **Route**: `/accounts/razorpay`
- **Path**: `pages/accounts/pages/RazorpayTransactions.jsx`
- **Purpose**: View Razorpay payment gateway transactions
- **Backend Data**: ✅ Yes
- **Features**: Transaction list, reconciliation, settlement

### 4. Manual Payment Entry
- **Route**: `/accounts/manual-payment`
- **Path**: `pages/accounts/pages/ManualPaymentEntry.jsx`
- **Purpose**: Record offline payments
- **Backend Data**: ✅ Yes
- **Features**: Payment form, receipt generation

### 5. Refunds Management
- **Route**: `/accounts/refunds`
- **Path**: `pages/accounts/pages/RefundsPage.jsx`
- **Purpose**: Process and track refunds
- **Backend Data**: ✅ Yes
- **Features**: Refund requests, approval, processing

### 6. Payment Reports
- **Route**: `/accounts/reports`
- **Path**: `pages/accounts/pages/PaymentReports.jsx`
- **Purpose**: Generate financial reports
- **Backend Data**: ✅ Yes
- **Features**: Revenue reports, collection analysis, charts

### 7. CSV Export
- **Route**: `/accounts/export`
- **Path**: `pages/accounts/pages/ExportCSVPage.jsx`
- **Purpose**: Export financial data
- **Backend Data**: ✅ Yes
- **Features**: Selective export, format options, download

### 8. Accounts Profile
- **Route**: `/accounts/profile`
- **Path**: `pages/accounts/pages/ProfilePage.jsx`
- **Purpose**: Team member profile
- **Backend Data**: ✅ Yes
- **Features**: Personal info, bank details

### 9. Accounts Settings
- **Route**: `/accounts/settings`
- **Path**: `pages/accounts/pages/SettingsPage.jsx`
- **Purpose**: Accounting settings
- **Backend Data**: ✅ Yes
- **Features**: Bank details, payment gateway config

---

## HR Pages
**Access**: HRTeam, Admin, SuperAdmin  
**Protection**: ✅ ProtectedRoute enforced

### 1. HR Dashboard (Main)
- **Route**: `/hr/dashboard`
- **Path**: `pages/hr/HRDashboard.jsx`
- **Purpose**: Main HR management interface with sidebar navigation
- **Backend Data**: ✅ Yes (Employees, attendance, payroll)
- **Features**: 7-tab interface, KPI cards, professional sidebar
- **Sub-sections**: Dashboard, Employee Management, Attendance, Payroll, Payslips, Reports, AI Assistant

### HR Dashboard Sections:

#### Dashboard Overview
- **Features**: KPI cards, employee stats, attendance summary, department distribution
- **Backend Data**: ✅ Yes
- **Colors**: Green/brown-green professional palette

#### Employee Management
- **Path**: `pages/hr/sections/EmployeeManagement.jsx`
- **Features**: Add, edit, delete employees; profile management
- **Backend Data**: ✅ Yes

#### Attendance Management
- **Path**: `pages/hr/sections/AttendanceManagement.jsx`
- **Features**: Mark daily attendance, status tracking, statistics
- **Backend Data**: ✅ Yes

#### Payroll Management
- **Path**: `pages/hr/sections/PayrollManagement.jsx`
- **Features**: Calculate salaries, process payroll, CSV export
- **Backend Data**: ✅ Yes
- **Calculations**: PF (12%), ESI (4.75%), Professional Tax, LOP

#### Payslips Viewer
- **Path**: `pages/hr/sections/PayslipViewer.jsx`
- **Features**: View payslips, download, print
- **Backend Data**: ✅ Yes

#### Reports
- **Path**: `pages/hr/sections/ReportsSection.jsx`
- **Features**: Generate HR reports, analytics, insights
- **Backend Data**: ✅ Yes

#### AI Assistant
- **Path**: `pages/hr/sections/AIAssistant.jsx`
- **Features**: Chat-based HR queries, employee search, analytics
- **Backend Data**: ✅ Yes

---

## AI Pages
**Access**: Varies by role (Admin, Teacher, Student, Parent)  
**Protection**: ✅ ProtectedRoute enforced

### 1. Admin AI Dashboard
- **Route**: `/admin/ai`
- **Path**: `pages/ai/AdminAIDashboard.jsx`
- **Purpose**: AI analytics for admin
- **Backend Data**: ✅ Yes
- **Features**: 
  - AI Chat Assistant ("Total attendance report ivvu", "Fee pending students")
  - AI Analytics Dashboard (Performance, department stats, trends)
  - AI Risk Detection (Dropout risk, low attendance alerts)
  - AI Fee Intelligence (Defaulters prediction, collection trends)
  - AI Bulk Notification Generator
  - AI Decision Support

### 2. Teacher AI Dashboard
- **Route**: `/teacher/ai`
- **Path**: `pages/ai/TeacherAIDashboard.jsx`
- **Purpose**: AI support for teachers
- **Backend Data**: ✅ Yes
- **Features**:
  - AI Teaching Assistant (Lesson plan generate, topic explanation)
  - AI Question Paper Generator
  - AI Class Insights (Weak students, subject-wise analysis)
  - AI Auto Evaluation (Marks analysis, feedback generation)
  - AI Communication (Message to parents)

### 3. Student AI Dashboard
- **Route**: `/student/ai`
- **Path**: `pages/ai/StudentAIDashboard.jsx`
- **Purpose**: Personal AI chatbot for students
- **Backend Data**: ✅ Yes
- **Features**:
  - Personal AI Chatbot (Ask doubts, get explanations)
  - Performance Insights ("Nenu ela perform chesthunna?", Suggestions)
  - AI Study Planner (Daily schedule, exam prep)
  - Weak Area Detection (Subject-wise weak topics)
  - AI Notes Generator (Topic summary, quick revision)
  - AI Goal Tracker (Target marks, progress tracking)

### 4. Parent AI Dashboard
- **Route**: `/parent/ai`
- **Path**: `pages/ai/ParentAIDashboard.jsx`
- **Purpose**: AI support for parents
- **Backend Data**: ✅ Yes
- **Features**:
  - Child Performance AI (Marks summary, attendance summary)
  - AI Alerts (Low attendance, low marks)
  - AI Message System (Auto updates, personalized alerts)
  - AI Suggestions ("Mee child improve avvalante…")
  - Parent Chatbot (Ask about child, get reports)

---

## Data Requirements Summary

### Backend Data Needed ✅
- User authentication & roles
- Employee/Student/Teacher/Parent records
- Attendance records
- Marks/Grades data
- Fee structure & payments
- Payroll calculations
- Transaction history
- System analytics
- AI training data

### No Backend Needed ❌
- Landing page
- Choose user role
- Static information pages
- Debug/test pages

---

## Security Implementation

### Protected Routes
All routes are protected with role-based access control using `ProtectedRoute` component.

**Protected Roles**:
- `SuperAdmin`: Full system access
- `Admin`: College administration
- `Teacher`: Class/student management
- `Student`: Personal academic data
- `Parent`: Child information only
- `HRTeam`: HR management
- `TransportTeam`: Transport operations
- `AccountsTeam`: Financial management

### Authentication Flow
1. User logs in at `/login` or `/signup`
2. Credentials validated against backend
3. User role stored in localStorage
4. `ProtectedRoute` component checks role before rendering
5. Unauthorized access redirects to login

---

## Color Scheme

### HR Portal (Green/Brown-Green)
- Primary: Forest Green (#2E7D32)
- Accent: Light Green (#A5D6A7)
- Header: Soft Green (#66BB6A)
- Logout: Gold (#FFB74D)
- Border: Light Green (#C8E6C9)

### Dashboard KPIs
- Employees: Green (#4CAF50)
- Active: Blue (#2196F3)
- Attendance: Orange (#FF9800)
- Reports: Purple (#9C27B0)
- Payroll: Purple (#9C27B0)
- Payslips: Cyan (#00BCD4)
- AI: Deep Orange (#FF5722)

---

## Development Notes

### Running the Application
```bash
# Frontend
cd frontend
npm start  # Port 3000

# Backend
cd backend
npm start  # Port (configured)
```

### Key Dependencies
- React 18+
- Material-UI (MUI)
- React Router v6
- Axios (API calls)
- Razorpay (payments)
- Chart.js (analytics)

### File Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   ├── parent/
│   │   ├── transport/
│   │   ├── accounts/
│   │   ├── hr/
│   │   ├── ai/
│   │   └── superadmin/
│   ├── components/
│   ├── data/
│   └── App.js
```

---

**Last Updated**: March 29, 2026  
**Status**: ✅ All pages documented and functional

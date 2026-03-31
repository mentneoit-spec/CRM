# HR Management System - Complete Guide

## Overview
The HR Management System is a comprehensive module within the Gravity CRM that allows admins to manage HR operations and HR managers to handle employee records, salaries, and attendance.

## Features

### 1. **Admin Panel - HR Management**
Location: `/admin/hr`

#### Features:
- **Add HR Managers**: Create new HR Manager accounts with auto-generated credentials
- **View All HR Managers**: See list of all HR managers and their managed employees
- **Employee Directory**: View all employees across all departments
- **Salary Dashboard**: Monitor salary bills and payment status
- **Department Breakdown**: Analyze salary distribution by department
- **Attendance Tracking**: See today's attendance and recent records

#### How to Add an HR Manager:
1. Go to Admin Dashboard
2. Click "HR Management" in the sidebar
3. Go to "HR Managers" tab
4. Click "Add HR Manager" button
5. Fill in the form:
   - Full Name
   - Email
   - Phone (optional)
   - Designation
6. Click "Add HR Manager"
7. System will generate temporary password - share with the HR Manager

#### Credentials Shared with HR Manager:
- Email: (provided email)
- Temporary Password: (auto-generated)
- HR Manager should change password on first login

### 2. **HR Manager Dashboard**
Location: `/hr` or after HR Manager login

#### Main Features:

##### Employee Management Tab
- **Add New Employees**: Create employee records
- **Employee List**: View all managed employees
- **Edit/Delete**: Manage employee information
- **Fields for Employee**: 
  - Full Name
  - Email
  - Phone
  - Employee ID (unique)
  - Department
  - Designation
  - Salary
  - Date of Joining
  - Bank Account Details
  - Qualification
  - Address

##### Payroll Management Tab
- **Create Salary Records**: Monthly salary processing
- **Salary Components**:
  - Base Salary
  - Allowances
  - Deductions
  - Net Salary (auto-calculated)
  - Working Days
  - Attended Days
- **Status Tracking**: Pending/Processed status

##### Attendance Management Tab
- **Mark Attendance**: Daily attendance recording
- **Attendance Status**: Present, Absent, Half-Day, Leave (Paid/Unpaid)
- **Attendance Reports**: Historical records

##### AI Assistant Tab
- **Smart HR Suggestions**: AI-powered insights
- **Salary Recommendations**: Based on employee performance
- **Performance Analysis**: Team analytics
- **Leave Management Tips**: Best practices
- **Department Statistics**: Organizational insights
- **Quick Actions**: One-click analysis

### 3. **Data Models**

#### HRManager Model
```
- id: UUID
- name: String
- email: String (unique per college)
- phone: String (optional)
- designation: String
- department: String (default: "Human Resources")
- collegeId: UUID (references College)
- userId: UUID (references User)
- isActive: Boolean (default: true)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Employee Model
```
- id: UUID
- name: String
- email: String
- phone: String (optional)
- employeeId: String (unique per college)
- department: String
- designation: String
- dateOfJoining: DateTime (optional)
- dateOfBirth: DateTime (optional)
- gender: String (optional)
- qualification: String (optional)
- experience: Int (optional)
- salary: Float (default: 0)
- bankAccount: String (optional)
- bankName: String (optional)
- ifscCode: String (optional)
- address: String (optional)
- status: String (default: "Active")
- profileImage: String (optional)
- collegeId: UUID (references College)
- hrManagerId: UUID (references HRManager)
- createdAt: DateTime
- updatedAt: DateTime
```

#### EmployeeAttendance Model
```
- id: UUID
- date: DateTime
- status: String (Present, Absent, Half-Day, Paid-Leave, Unpaid-Leave)
- leaveType: String (optional)
- remarks: String (optional)
- employeeId: UUID (references Employee)
- collegeId: UUID (references College)
- createdAt: DateTime
- updatedAt: DateTime
```

#### EmployeeSalary Model
```
- id: UUID
- month: String (YYYY-MM format)
- year: Int
- baseSalary: Float
- allowances: Float (optional, default: 0)
- deductions: Float (optional, default: 0)
- netSalary: Float (auto-calculated)
- workingDays: Int (default: 30)
- attendedDays: Int (default: 30)
- status: String (Pending, Processed) (default: "Pending")
- remarks: String (optional)
- employeeId: UUID (references Employee)
- collegeId: UUID (references College)
- createdAt: DateTime
- updatedAt: DateTime
```

#### EmployeeLeave Model
```
- id: UUID
- leaveType: String (Vacation, Sick, Personal, etc.)
- startDate: DateTime
- endDate: DateTime
- reason: String (optional)
- status: String (Pending, Approved, Rejected) (default: "Pending")
- approvedBy: String (optional)
- approvedAt: DateTime (optional)
- employeeId: UUID (references Employee)
- collegeId: UUID (references College)
- createdAt: DateTime
- updatedAt: DateTime
```

### 4. **API Endpoints**

#### HR Manager Management (Admin Routes)
```
POST   /api/admin/hr/managers         - Add new HR Manager
GET    /api/admin/hr/managers         - Get all HR Managers
DELETE /api/admin/hr/managers/:id     - Delete HR Manager
```

#### Employee Management (HR Manager Routes)
```
POST   /api/hr/employees              - Add new employee
GET    /api/hr/employees              - Get all employees
GET    /api/hr/employees/:id          - Get single employee
PUT    /api/hr/employees/:id          - Update employee
DELETE /api/hr/employees/:id          - Delete employee

GET    /api/admin/hr/employees        - Admin view: All employees
GET    /api/admin/hr/employees/:id    - Admin view: Employee details
```

#### Attendance Management
```
POST   /api/hr/attendance             - Mark attendance
GET    /api/hr/attendance/:empId      - Get employee attendance
```

#### Salary Management
```
POST   /api/hr/salaries               - Create salary record
GET    /api/hr/salaries               - Get salary records
PUT    /api/hr/salaries/:id/status    - Update salary status
```

#### Dashboard
```
GET    /api/hr/dashboard/hr           - HR dashboard
GET    /api/admin/hr/dashboard        - Admin HR dashboard
```

### 5. **Workflow Example**

#### Step 1: Admin Adds HR Manager
```
1. Admin navigates to Admin Dashboard
2. Clicks "HR Management" in sidebar
3. Goes to "HR Managers" tab
4. Clicks "Add HR Manager"
5. Fills in:
   - Name: "Rajesh Kumar"
   - Email: "rajesh@company.com"
   - Phone: "9876543210"
   - Designation: "HR Manager"
6. Clicks "Add HR Manager"
7. System sends email with credentials
   - Email: rajesh@company.com
   - Password: TempPass123
```

#### Step 2: HR Manager Logs In
```
1. HR Manager receives email with credentials
2. Logs in to HR Dashboard
3. Changes temporary password
4. Navigates to HR Dashboard
```

#### Step 3: HR Manager Adds Employees
```
1. HR Manager clicks "Employees" tab
2. Clicks "Add Employee"
3. Fills in employee details:
   - Name: "Priya Sharma"
   - Email: "priya@company.com"
   - Employee ID: "EMP001"
   - Department: "Sales"
   - Designation: "Sales Executive"
   - Salary: 30000
4. Clicks "Add Employee"
5. Employee is saved to database
```

#### Step 4: HR Manager Creates Salary Records
```
1. HR Manager clicks "Salaries" tab
2. Clicks "Create Salary Record"
3. Fills in:
   - Employee: "Priya Sharma (EMP001)"
   - Month: "2024-03"
   - Base Salary: 30000
   - Allowances: 3000
   - Deductions: 500
4. System calculates Net Salary: 32500
5. Clicks "Create Record"
6. Salary record is saved with "Pending" status
```

#### Step 5: Admin Reviews All Data
```
1. Admin goes to HR Dashboard
2. Sees stats:
   - HR Managers: 1
   - Total Employees: 1
   - Active Employees: 1
   - Total Salary Bill: 30000
3. Clicks "Employees" tab
4. Sees all employees with their details
5. Can click on employee to view full profile
6. Can see salary records, attendance, leaves
```

#### Step 6: Using AI Assistant
```
1. HR Manager clicks "AI Assistant" tab
2. AI Assistant greets with available options
3. HR Manager types: "Show salary recommendations"
4. AI analyzes data and suggests:
   - Top performers for salary review
   - Average salary comparison
   - Department-wise distribution
5. HR Manager can follow AI suggestions
```

### 6. **Security & Access Control**

- **Admin Only**: Add/Delete HR Managers, View all employees department-wise
- **HR Manager Only**: Manage own employees, Create salary records, Mark attendance
- **Role-Based**: HR role identified by role field in User model
- **College-Scoped**: All data is isolated per college (multi-tenant)

### 7. **Best Practices**

1. **Regular Salary Processing**: Process salaries on a fixed date each month
2. **Accurate Attendance**: Mark attendance daily for better insights
3. **Updated Employee Info**: Keep employee information current
4. **AI Suggestions**: Use AI insights for data-driven decisions
5. **Backup Records**: Maintain copies of salary and attendance records
6. **Access Security**: Share HR Manager credentials only via secure channels

### 8. **Troubleshooting**

#### Issue: HR Manager can't log in
- **Solution**: Check if account is active. Admin can verify in HR Managers list.

#### Issue: Employee not saving
- **Solution**: Ensure Employee ID is unique and all required fields are filled.

#### Issue: Salary calculation error
- **Solution**: Verify that Base Salary + Allowances - Deductions = Net Salary

#### Issue: AI Assistant not responding
- **Solution**: Try rephrasing the question or use one of the quick action buttons.

### 9. **Integration with Existing System**

- Uses existing authentication system
- Multi-tenancy from College model
- Email notifications via email service
- Follows existing database schema patterns
- Integrates with admin dashboard navigation

### 10. **Future Enhancements**

- Performance reviews system
- Leave request workflow
- Overtime tracking
- Benefits management
- Payroll integration with accounting
- Employee self-service portal
- Advanced analytics and reporting

---

## Support

For issues or questions about the HR System, please contact the development team or refer to the system documentation.

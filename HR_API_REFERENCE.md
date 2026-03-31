# HR System - API Quick Reference

## Base URL
```
http://localhost:8000/api
```

## Authentication Header (All Requests)
```
Authorization: Bearer <YOUR_JWT_TOKEN>

Example:
curl -H "Authorization: Bearer eyJhbGc..."
```

---

## ADMIN HR MANAGER ENDPOINTS

### 1. Create HR Manager
```
POST /admin/hr/managers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "9876543210",
  "designation": "HR Manager",
  "department": "Human Resources"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@company.com",
    "tempPassword": "TempPass123!",
    "message": "HR Manager created. Credentials sent to email."
  }
}
```

### 2. Get All HR Managers
```
GET /admin/hr/managers

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@company.com",
      "phone": "9876543210",
      "designation": "HR Manager",
      "isActive": true,
      "employeeCount": 5
    }
  ]
}
```

### 3. Delete HR Manager
```
DELETE /admin/hr/managers/{id}

Response (200):
{
  "success": true,
  "message": "HR Manager deleted successfully"
}
```

---

## HR MANAGER EMPLOYEE ENDPOINTS

### 4. Create Employee
```
POST /hr/employees
Content-Type: application/json

{
  "name": "Priya Singh",
  "email": "priya@company.com",
  "phone": "8976543210",
  "employeeId": "EMP001",
  "department": "Sales",
  "designation": "Sales Executive",
  "salary": 30000,
  "dateOfJoining": "2024-01-15",
  "bankAccount": "9876543210",
  "bankName": "ICICI",
  "address": "123 Main St, City"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Priya Singh",
    "email": "priya@company.com",
    "employeeId": "EMP001",
    "department": "Sales",
    "designation": "Sales Executive",
    "salary": 30000,
    "status": "Active"
  }
}
```

### 5. Get All Employees (HR Manager's employees)
```
GET /hr/employees
GET /hr/employees?department=Sales
GET /hr/employees?status=Active

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Priya Singh",
      "employeeId": "EMP001",
      "email": "priya@company.com",
      "department": "Sales",
      "designation": "Sales Executive",
      "salary": 30000,
      "status": "Active"
    }
  ]
}
```

### 6. Get Single Employee
```
GET /hr/employees/{employeeId}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Priya Singh",
    "email": "priya@company.com",
    "phone": "8976543210",
    "employeeId": "EMP001",
    "department": "Sales",
    "designation": "Sales Executive",
    "salary": 30000,
    "dateOfJoining": "2024-01-15",
    "dateOfBirth": "1995-06-20",
    "bankAccount": "9876543210",
    "bankName": "ICICI",
    "address": "123 Main St, City",
    "status": "Active"
  }
}
```

### 7. Update Employee
```
PUT /hr/employees/{employeeId}
Content-Type: application/json

{
  "salary": 35000,
  "designation": "Senior Sales Executive",
  "status": "Active"
}

Response (200):
{
  "success": true,
  "data": { ...updated employee... }
}
```

### 8. Delete Employee
```
DELETE /hr/employees/{employeeId}

Response (200):
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

## ADMIN GET ALL EMPLOYEES

### 9. Get All Employees (Admin view - all HR managers)
```
GET /admin/hr/employees
GET /admin/hr/employees?department=Sales
GET /admin/hr/employees?status=Active
GET /admin/hr/employees?hrManagerId={managerId}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Priya Singh",
      "employeeId": "EMP001",
      "email": "priya@company.com",
      "department": "Sales",
      "designation": "Sales Executive",
      "salary": 30000,
      "hrManager": "John Doe",
      "status": "Active"
    }
  ]
}
```

### 10. Get Employee Details (Admin)
```
GET /admin/hr/employees/{employeeId}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Priya Singh",
    "email": "priya@company.com",
    "employeeId": "EMP001",
    "department": "Sales",
    "designation": "Sales Executive",
    "salary": 30000,
    "hrManager": "John Doe",
    "attendancePercentage": 95,
    "totalLeaves": 3,
    "totalPresent": 19,
    "totalAbsent": 1
  }
}
```

---

## ATTENDANCE ENDPOINTS

### 11. Mark Attendance
```
POST /hr/attendance
Content-Type: application/json

{
  "employeeId": "uuid",
  "date": "2024-03-31",
  "status": "Present",
  "remarks": "Present"
}

Alternative:
{
  "employeeId": "uuid",
  "date": "2024-03-31",
  "status": "Leave",
  "leaveType": "Sick Leave",
  "remarks": "Sick leave"
}

Status options: Present | Absent | Half-Day | Leave
Leaves: Sick Leave | Vacation | Personal | Others

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "date": "2024-03-31",
    "status": "Present",
    "remarks": "Present"
  }
}
```

### 12. Get Employee Attendance
```
GET /hr/attendance/{employeeId}
GET /hr/attendance/{employeeId}?month=3&year=2024

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2024-03-31",
      "status": "Present",
      "leaveType": null,
      "remarks": "Present"
    },
    {
      "id": "uuid",
      "date": "2024-03-30",
      "status": "Leave",
      "leaveType": "Sick Leave",
      "remarks": "Sick leave"
    }
  ],
  "summary": {
    "totalPresent": 20,
    "totalAbsent": 2,
    "totalLeaves": 3,
    "attendancePercentage": 87.5
  }
}
```

---

## SALARY ENDPOINTS

### 13. Create Salary Record
```
POST /hr/salaries
Content-Type: application/json

{
  "employeeId": "uuid",
  "month": 3,
  "year": 2024,
  "baseSalary": 30000,
  "allowances": 5000,
  "deductions": 2000,
  "workingDays": 20,
  "attendedDays": 20
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "month": 3,
    "year": 2024,
    "employeeId": "uuid",
    "baseSalary": 30000,
    "allowances": 5000,
    "deductions": 2000,
    "netSalary": 33000,
    "status": "Pending"
  }
}
```

### 14. Get Salary Records
```
GET /hr/salaries
GET /hr/salaries?month=3&year=2024
GET /hr/salaries?employeeId=uuid
GET /hr/salaries?status=Pending

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "employeeName": "Priya Singh",
      "month": 3,
      "year": 2024,
      "baseSalary": 30000,
      "allowances": 5000,
      "deductions": 2000,
      "netSalary": 33000,
      "status": "Pending"
    }
  ]
}
```

### 15. Update Salary Status
```
PUT /hr/salaries/{salaryId}/status
Content-Type: application/json

{
  "status": "Processed"
}

Status options: Pending | Processed

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "Processed",
    "processedAt": "2024-03-31T10:30:00Z"
  }
}
```

---

## DASHBOARD ENDPOINTS

### 16. HR Manager Dashboard
```
GET /hr/dashboard/hr

Response (200):
{
  "success": true,
  "data": {
    "totalEmployees": 10,
    "activeEmployees": 9,
    "totalSalary": 300000,
    "averageSalary": 30000,
    "departments": ["Sales", "Marketing", "HR"],
    "todayAttendance": {
      "present": 8,
      "absent": 1,
      "leave": 1
    }
  }
}
```

### 17. Admin HR Dashboard
```
GET /admin/hr/dashboard

Response (200):
{
  "success": true,
  "data": {
    "totalHRManagers": 3,
    "totalEmployees": 45,
    "totalSalaryBill": 1500000,
    "averageSalary": 33333,
    "departmentBreakdown": {
      "Sales": 20,
      "Marketing": 15,
      "HR": 10
    },
    "salaryBreakdown": {
      "Sales": 600000,
      "Marketing": 450000,
      "HR": 450000
    },
    "todayAttendance": {
      "present": 38,
      "absent": 5,
      "leave": 2
    }
  }
}
```

### 18. Get HR Managers List (Admin)
```
GET /admin/hr/managers

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@company.com",
      "phone": "9876543210",
      "designation": "HR Manager",
      "department": "Human Resources",
      "isActive": true,
      "employeeCount": 15
    }
  ]
}
```

---

## TESTING WITH CURL

### Test Add HR Manager
```bash
curl -X POST http://localhost:8000/api/admin/hr/managers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test HR",
    "email": "testhr@test.com",
    "phone": "9876543210",
    "designation": "HR Manager",
    "department": "HR"
  }'
```

### Test Get All Employees
```bash
curl -X GET http://localhost:8000/api/admin/hr/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Create Employee
```bash
curl -X POST http://localhost:8000/api/hr/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "phone": "8765432109",
    "employeeId": "EMP001",
    "department": "Sales",
    "designation": "Executive",
    "salary": 50000,
    "dateOfJoining": "2024-01-15",
    "bankAccount": "1234567890",
    "bankName": "ICICI",
    "address": "123 Main St"
  }'
```

### Test Mark Attendance
```bash
curl -X POST http://localhost:8000/api/hr/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "uuid",
    "date": "2024-03-31",
    "status": "Present",
    "remarks": "Present"
  }'
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "success": false,
  "error": "Email already exists",
  "details": "Employee with this email already registered"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access Denied",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Employee not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong on server"
}
```

---

## STATUS CODES

| Code | Meaning | Use Case |
|------|---------|----------|
| 200  | OK | Records fetched or updated |
| 201  | Created | New resource created |
| 400  | Bad Request | Validation error or invalid input |
| 401  | Unauthorized | Missing or invalid token |
| 403  | Forbidden | Role not authorized |
| 404  | Not Found | Resource doesn't exist |
| 500  | Server Error | Database or server issue |

---

## TIPS FOR TESTING

### 1. Get Your JWT Token
```bash
# Log in
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password"}'

# Copy the token from response
# Use in all subsequent requests
```

### 2. Use Postman for Testing
- Import collection from API docs
- Set Authorization to Bearer Token
- Use variables for {{base_url}} and {{token}}
- Save requests for future testing

### 3. Test Sequence
1. Add HR Manager
2. Get HR Manager list
3. Add Employee
4. Get All Employees
5. Create Salary Record
6. Mark Attendance
7. Get Dashboard

### 4. Common Headers
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## PAGINATION (Future Enhancement)

When implemented, use:
```
GET /hr/employees?page=1&limit=10
GET /admin/hr/employees?page=1&limit=20

Response includes:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

**Last Updated**: March 31, 2026
**API Version**: 1.0.0
**Status**: Production Ready

# Multi-Tenant College ERP & CRM API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourplatform.com/api
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication APIs

### 1.1 Login (Email/Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "collegeId": "uuid" // Optional for college users
}
```

### 1.2 Super Admin Login
```http
POST /api/auth/superadmin-login
Content-Type: application/json

{
  "email": "superadmin@platform.com",
  "password": "password123"
}
```

### 1.3 Request OTP
```http
POST /api/auth/otp/request-login
Content-Type: application/json

{
  "phone": "+919876543210",
  "collegeId": "uuid" // Optional
}
```

### 1.4 Verify OTP Login
```http
POST /api/auth/otp/verify-login
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456",
  "collegeId": "uuid" // Optional
}
```

### 1.5 Google OAuth URL
```http
GET /api/auth/google/url?collegeId=uuid
```

### 1.6 Google OAuth Callback
```http
GET /api/auth/google/callback?code=xxx&state=xxx
```

### 1.7 Setup 2FA
```http
POST /api/auth/2fa/setup
Authorization: Bearer <token>
```

### 1.8 Enable 2FA
```http
POST /api/auth/2fa/enable
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}
```

### 1.9 Disable 2FA
```http
POST /api/auth/2fa/disable
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}
```

### 1.10 Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "old123",
  "newPassword": "new123"
}
```

### 1.11 Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 2. Super Admin APIs

### 2.1 Create College
```http
POST /api/superadmin/colleges
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Gravity College",
  "domain": "gravity.com",
  "email": "admin@gravity.com",
  "phone": "+919876543210",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "400001"
}
```

### 2.2 Get All Colleges
```http
GET /api/superadmin/colleges?page=1&limit=10&status=active
Authorization: Bearer <token>
```

### 2.3 Get College Details
```http
GET /api/superadmin/colleges/:collegeId
Authorization: Bearer <token>
```

### 2.4 Update College
```http
PUT /api/superadmin/colleges/:collegeId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "active"
}
```

### 2.5 Suspend College
```http
POST /api/superadmin/colleges/:collegeId/suspend
Authorization: Bearer <token>
```

### 2.6 Create College Admin
```http
POST /api/superadmin/admins
Authorization: Bearer <token>
Content-Type: application/json

{
  "collegeId": "uuid",
  "name": "Admin Name",
  "email": "admin@college.com",
  "password": "password123",
  "phone": "+919876543210"
}
```

### 2.7 Get Platform Analytics
```http
GET /api/superadmin/analytics
Authorization: Bearer <token>
```

### 2.8 Get Audit Logs
```http
GET /api/superadmin/audit-logs?collegeId=uuid&page=1&limit=20
Authorization: Bearer <token>
```

---

## 3. College Admin APIs

### 3.1 Create Teacher
```http
POST /api/admin/teachers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Teacher Name",
  "email": "teacher@college.com",
  "phone": "+919876543210",
  "password": "password123",
  "qualification": "M.Sc",
  "specialization": "Mathematics"
}
```

### 3.2 Create Student
```http
POST /api/admin/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Student Name",
  "studentId": "STU001",
  "email": "student@college.com",
  "phone": "+919876543210",
  "password": "password123",
  "sclassId": "uuid",
  "dateOfBirth": "2005-01-01",
  "gender": "Male"
}
```

### 3.3 Create Class
```http
POST /api/admin/classes
Authorization: Bearer <token>
Content-Type: application/json

{
  "sclassName": "Class 10-A",
  "sclassCode": "10A",
  "academicYear": "2024-25",
  "sectionCount": 2
}
```

### 3.4 Create Subject
```http
POST /api/admin/subjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "subName": "Mathematics",
  "subCode": "MATH101",
  "sclassId": "uuid",
  "teacherId": "uuid",
  "maxMarks": 100,
  "passingMarks": 40
}
```

### 3.5 Define Fee Structure
```http
POST /api/admin/fees
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "uuid",
  "feeType": "tuition",
  "amount": 50000,
  "dueDate": "2024-04-30",
  "frequency": "yearly"
}
```

### 3.6 Get Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

---

## 4. Teacher APIs

### 4.1 Mark Attendance
```http
POST /api/teacher/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "uuid",
  "subjectId": "uuid",
  "date": "2024-03-05",
  "status": "present"
}
```

### 4.2 Upload Marks
```http
POST /api/teacher/marks
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "uuid",
  "subjectId": "uuid",
  "examId": "uuid",
  "marksObtained": 85,
  "grade": "A"
}
```

### 4.3 Create Homework
```http
POST /api/teacher/homework
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Chapter 5 Exercises",
  "description": "Complete all exercises",
  "dueDate": "2024-03-10",
  "subjectId": "uuid"
}
```

### 4.4 Get Students
```http
GET /api/teacher/students?sclassId=uuid
Authorization: Bearer <token>
```

---

## 5. Student APIs

### 5.1 Get Profile
```http
GET /api/student/profile
Authorization: Bearer <token>
```

### 5.2 Get Attendance
```http
GET /api/student/attendance?subjectId=uuid
Authorization: Bearer <token>
```

### 5.3 Get Marks
```http
GET /api/student/marks?examId=uuid
Authorization: Bearer <token>
```

### 5.4 Get Homework
```http
GET /api/student/homework?subjectId=uuid
Authorization: Bearer <token>
```

### 5.5 Get Fee Details
```http
GET /api/student/fees
Authorization: Bearer <token>
```

---

## 6. Parent APIs

### 6.1 Get Children
```http
GET /api/parent/children
Authorization: Bearer <token>
```

### 6.2 Get Child Attendance
```http
GET /api/parent/children/:studentId/attendance
Authorization: Bearer <token>
```

### 6.3 Get Child Marks
```http
GET /api/parent/children/:studentId/marks
Authorization: Bearer <token>
```

### 6.4 Pay Fees
```http
POST /api/parent/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "uuid",
  "feeId": "uuid",
  "amount": 50000,
  "paymentMethod": "razorpay"
}
```

### 6.5 Get Payment History
```http
GET /api/parent/payments?studentId=uuid
Authorization: Bearer <token>
```

---

## 7. Admission APIs

### 7.1 Submit Admission
```http
POST /api/admission/apply
Content-Type: application/json

{
  "applicantName": "Student Name",
  "applicantEmail": "student@example.com",
  "applicantPhone": "+919876543210",
  "dateOfBirth": "2005-01-01",
  "gender": "Male",
  "fatherName": "Father Name",
  "motherName": "Mother Name",
  "address": "123 Main St",
  "appliedFor": "Class 10",
  "collegeId": "uuid"
}
```

### 7.2 Get Admission Status
```http
GET /api/admission/:admissionNumber
```

### 7.3 Approve Admission (Admin)
```http
POST /api/admin/admissions/:admissionId/approve
Authorization: Bearer <token>
```

### 7.4 Reject Admission (Admin)
```http
POST /api/admin/admissions/:admissionId/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "Incomplete documents"
}
```

---

## 8. Accounts Team APIs

### 8.1 Get All Payments
```http
GET /api/accounts/payments?page=1&limit=20&status=completed
Authorization: Bearer <token>
```

### 8.2 Manual Payment Entry
```http
POST /api/accounts/payments/manual
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "uuid",
  "amount": 50000,
  "paymentMethod": "cash",
  "receiptNumber": "RCP001"
}
```

### 8.3 Process Refund
```http
POST /api/accounts/payments/:paymentId/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Duplicate payment"
}
```

### 8.4 Export Payments
```http
GET /api/accounts/payments/export?format=csv&startDate=2024-01-01&endDate=2024-03-31
Authorization: Bearer <token>
```

---

## 9. Transport APIs

### 9.1 Create Route
```http
POST /api/transport/routes
Authorization: Bearer <token>
Content-Type: application/json

{
  "routeName": "Route 1",
  "routeNumber": "R001",
  "startPoint": "Main Gate",
  "endPoint": "College",
  "fee": 5000
}
```

### 9.2 Create Bus
```http
POST /api/transport/buses
Authorization: Bearer <token>
Content-Type: application/json

{
  "busNumber": "BUS001",
  "regNumber": "MH01AB1234",
  "capacity": 50,
  "driverName": "Driver Name",
  "driverPhone": "+919876543210",
  "routeId": "uuid"
}
```

### 9.3 Get Routes
```http
GET /api/transport/routes
Authorization: Bearer <token>
```

---

## 10. File Upload APIs

### 10.1 Upload Profile Picture
```http
POST /api/upload/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file]
```

### 10.2 Upload Documents
```http
POST /api/upload/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file1, file2]
folder: "admissions"
```

### 10.3 Delete File
```http
DELETE /api/upload/:fileKey
Authorization: Bearer <token>
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ] // Optional validation errors
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

- 100 requests per 15 minutes per IP
- OTP requests: 5 per hour per phone number
- Login attempts: 5 per 15 minutes per email

---

## Pagination

All list endpoints support pagination:
```
?page=1&limit=20
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

---

## Multi-Tenancy

All college-specific requests automatically filter by `collegeId` from:
1. JWT token
2. Domain detection (custom domain)
3. Query parameter (development only)

---

## Webhooks

### Razorpay Payment Webhook
```http
POST /api/webhooks/razorpay
Content-Type: application/json

{
  "event": "payment.captured",
  "payload": { ... }
}
```

---

## Environment Variables Required

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

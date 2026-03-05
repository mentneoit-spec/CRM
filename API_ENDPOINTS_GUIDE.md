# API Endpoints Guide - College ERP System

## Base URLs

- **Backend API**: http://localhost:5001
- **Frontend**: http://localhost:3000

## Quick Test Commands

### 1. Root Endpoint
```bash
curl http://localhost:5001/
```

**Response:**
```json
{
  "success": true,
  "message": "College ERP & CRM API Server",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "documentation": "/api/docs"
  }
}
```

### 2. Health Check
```bash
curl http://localhost:5001/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-05T10:04:08.598Z",
  "uptime": 38.123934292,
  "database": "connected",
  "redis": "connected",
  "memory": {
    "used": "17 MB",
    "total": "19 MB"
  },
  "version": "1.0.0"
}
```

## Authentication Endpoints

### Register New User

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "role": "Student",
    "phone": "+91 9876543210",
    "dateOfBirth": "2000-01-15",
    "gender": "Male"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "Student"
    },
    "token": "jwt_token_here"
  }
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123",
    "role": "Student"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "Student"
    },
    "token": "jwt_token_here"
  }
}
```

### Request OTP

**Endpoint:** `POST /api/auth/otp/request-login`

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/otp/request-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+91 9876543210"
  }'
```

### Verify OTP

**Endpoint:** `POST /api/auth/otp/verify-login`

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/otp/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+91 9876543210",
    "otp": "123456"
  }'
```

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Request:**
```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Change Password

**Endpoint:** `POST /api/auth/change-password`

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

## Protected Endpoints (Require Authentication)

All protected endpoints require the `Authorization` header with a valid JWT token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Super Admin Endpoints

Base path: `/api/superadmin`

- `GET /api/superadmin/colleges` - List all colleges
- `POST /api/superadmin/colleges` - Create new college
- `GET /api/superadmin/colleges/:id` - Get college details
- `PUT /api/superadmin/colleges/:id` - Update college
- `POST /api/superadmin/colleges/:id/suspend` - Suspend college
- `GET /api/superadmin/analytics` - Platform analytics
- `GET /api/superadmin/audit-logs` - Audit logs

### Admin Endpoints

Base path: `/api/admin`

- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/teachers` - List teachers
- `POST /api/admin/teachers` - Create teacher
- `GET /api/admin/students` - List students
- `POST /api/admin/students` - Create student
- `GET /api/admin/classes` - List classes
- `POST /api/admin/classes` - Create class
- `GET /api/admin/subjects` - List subjects
- `POST /api/admin/subjects` - Create subject
- `GET /api/admin/notices` - List notices
- `POST /api/admin/notices` - Create notice
- `GET /api/admin/admissions` - List admissions
- `POST /api/admin/admissions/:id/approve` - Approve admission

### Teacher Endpoints

Base path: `/api/teacher`

- `GET /api/teacher/dashboard` - Teacher dashboard
- `GET /api/teacher/students` - List students
- `POST /api/teacher/attendance` - Mark attendance
- `GET /api/teacher/attendance` - Get attendance records
- `POST /api/teacher/marks` - Upload marks
- `GET /api/teacher/marks` - Get marks
- `POST /api/teacher/homework` - Create homework
- `GET /api/teacher/homework` - List homework

### Student Endpoints

Base path: `/api/student`

- `GET /api/student/profile` - Get student profile
- `PUT /api/student/profile` - Update profile
- `GET /api/student/attendance` - Get attendance
- `GET /api/student/marks` - Get marks
- `GET /api/student/homework` - Get homework
- `GET /api/student/fees` - Get fee details
- `GET /api/student/notices` - Get notices

### Parent Endpoints

Base path: `/api/parent`

- `GET /api/parent/children` - List children
- `GET /api/parent/children/:id/attendance` - Child attendance
- `GET /api/parent/children/:id/marks` - Child marks
- `GET /api/parent/children/:id/fees` - Child fees
- `POST /api/parent/payments` - Make payment
- `GET /api/parent/payments` - Payment history

### Accounts Endpoints

Base path: `/api/accounts`

- `GET /api/accounts/payments` - List all payments
- `POST /api/accounts/payments/manual` - Create manual payment
- `POST /api/accounts/payments/:id/refund` - Process refund
- `GET /api/accounts/payments/export` - Export payments

### Transport Endpoints

Base path: `/api/transport`

- `GET /api/transport/routes` - List routes
- `POST /api/transport/routes` - Create route
- `PUT /api/transport/routes/:id` - Update route
- `DELETE /api/transport/routes/:id` - Delete route
- `GET /api/transport/buses` - List buses
- `POST /api/transport/buses` - Create bus
- `PUT /api/transport/buses/:id` - Update bus
- `DELETE /api/transport/buses/:id` - Delete bus

## Public Endpoints (No Authentication Required)

### Admission Portal

Base path: `/api/admission`

- `POST /api/admission/apply` - Submit admission application
- `GET /api/admission/:admissionNumber` - Check admission status

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found",
  "path": "/api/invalid-route",
  "method": "GET"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Testing with Postman

### 1. Import Collection

Create a new Postman collection with the following structure:

```
College ERP API
├── Auth
│   ├── Register
│   ├── Login
│   ├── Request OTP
│   ├── Verify OTP
│   └── Get Current User
├── Super Admin
│   ├── List Colleges
│   └── Create College
├── Admin
│   ├── Dashboard
│   ├── Create Teacher
│   └── Create Student
├── Teacher
│   ├── Dashboard
│   └── Mark Attendance
├── Student
│   ├── Profile
│   └── Get Attendance
└── Parent
    ├── List Children
    └── Make Payment
```

### 2. Set Environment Variables

Create a Postman environment with:

```
API_URL: http://localhost:5001
TOKEN: (will be set after login)
COLLEGE_ID: (will be set after login)
```

### 3. Authentication Flow

1. Register a new user
2. Copy the token from response
3. Set it in environment variable
4. Use {{TOKEN}} in Authorization header for protected routes

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Applies to**: All `/api/*` routes

If you exceed the limit:
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

## CORS Configuration

Allowed origins:
- http://localhost:3000
- http://localhost:3001
- http://localhost:3002

## WebSocket Support

Currently not implemented. Future versions may include:
- Real-time notifications
- Live attendance updates
- Chat functionality

## API Versioning

Current version: `v1` (implicit)

Future versions will use path-based versioning:
- `/api/v1/...`
- `/api/v2/...`

## Support

For API issues:
1. Check server logs
2. Verify authentication token
3. Check request payload format
4. Review error messages
5. Consult API documentation

## Useful Commands

### Check if backend is running
```bash
curl http://localhost:5001/api/health
```

### Check if frontend is running
```bash
curl http://localhost:3000
```

### View backend logs
```bash
# If using PM2
pm2 logs college-erp

# If running with npm start
# Check the terminal where you ran npm start
```

### Restart backend
```bash
# Stop and start the backend process
# Or use PM2
pm2 restart college-erp
```

## Next Steps

1. Test the registration endpoint
2. Login with created credentials
3. Explore role-specific endpoints
4. Test CRUD operations
5. Implement frontend integration

Happy coding! 🚀

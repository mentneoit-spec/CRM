# Multi-Tenancy Implementation Guide

## Overview
The system is designed as a **multi-tenant SaaS platform** where:
- **Super Admin** manages multiple colleges (A, B, C, etc.)
- **Each College Admin** can only see and manage their own college's data
- **Data isolation** is enforced at the database and API levels

## Architecture

### User Hierarchy
```
Super Admin (Platform Level)
├── College A Admin
│   ├── Teachers (College A only)
│   ├── Students (College A only)
│   ├── Fees (College A only)
│   └── Classes (College A only)
├── College B Admin
│   ├── Teachers (College B only)
│   ├── Students (College B only)
│   ├── Fees (College B only)
│   └── Classes (College B only)
└── College C Admin
    ├── Teachers (College C only)
    ├── Students (College C only)
    ├── Fees (College C only)
    └── Classes (College C only)
```

## Database Structure

### Key Tables with College Isolation

```sql
-- Users table (multi-tenant)
CREATE TABLE "User" (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE,
    collegeId UUID REFERENCES "College"(id),
    role VARCHAR, -- SuperAdmin, Admin, Teacher, Student, Parent
    UNIQUE(email, collegeId) -- Email unique per college
);

-- College table
CREATE TABLE "College" (
    id UUID PRIMARY KEY,
    name VARCHAR,
    status VARCHAR,
    createdAt TIMESTAMP
);

-- Students table (college-specific)
CREATE TABLE "Student" (
    id UUID PRIMARY KEY,
    collegeId UUID REFERENCES "College"(id),
    userId UUID REFERENCES "User"(id),
    studentId VARCHAR,
    UNIQUE(collegeId, studentId) -- Student ID unique per college
);

-- Teachers table (college-specific)
CREATE TABLE "Teacher" (
    id UUID PRIMARY KEY,
    collegeId UUID REFERENCES "College"(id),
    userId UUID REFERENCES "User"(id),
    email VARCHAR
);

-- Fees table (college-specific)
CREATE TABLE "Fee" (
    id UUID PRIMARY KEY,
    collegeId UUID REFERENCES "College"(id),
    studentId UUID REFERENCES "Student"(id),
    amount DECIMAL
);

-- Classes table (college-specific)
CREATE TABLE "Sclass" (
    id UUID PRIMARY KEY,
    collegeId UUID REFERENCES "College"(id),
    sclassName VARCHAR
);
```

## API Endpoints - Data Isolation

### How Data Isolation Works

1. **Authentication** - User logs in
   ```javascript
   // Auth middleware extracts collegeId from user
   const user = await prisma.user.findUnique({
       where: { id: decoded.userId },
       include: { college: true }
   });
   req.collegeId = user.collegeId; // Set from user's college
   ```

2. **Authorization** - Check if user belongs to college
   ```javascript
   // authorizeCollege middleware
   if (req.user.collegeId !== req.collegeId) {
       return res.status(403).json({ message: 'Access denied' });
   }
   ```

3. **Data Filtering** - All queries filter by collegeId
   ```javascript
   // Get students - only for user's college
   const students = await prisma.student.findMany({
       where: {
           collegeId: req.collegeId, // Enforced filtering
           isDeleted: false
       }
   });
   ```

### Example Endpoints

#### Get All Students (College-Specific)
```
GET /api/admin/students
Authorization: Bearer <token>

Response: Only students from admin's college
{
    "data": [
        { "id": "...", "name": "Student A", "collegeId": "college-a-id" },
        { "id": "...", "name": "Student B", "collegeId": "college-a-id" }
    ]
}
```

#### Get All Teachers (College-Specific)
```
GET /api/admin/teachers
Authorization: Bearer <token>

Response: Only teachers from admin's college
{
    "data": [
        { "id": "...", "name": "Teacher A", "collegeId": "college-a-id" }
    ]
}
```

#### Get Dashboard (College-Specific)
```
GET /api/admin/dashboard
Authorization: Bearer <token>

Response: Only metrics for admin's college
{
    "data": {
        "studentCount": 150,      // College A students only
        "teacherCount": 25,       // College A teachers only
        "revenue": 500000,        // College A revenue only
        "admissionPending": 10    // College A admissions only
    }
}
```

## Implementation Details

### Backend Controllers

All admin endpoints follow this pattern:

```javascript
const getAllStudents = async (req, res) => {
    try {
        // collegeId is automatically set from authenticated user
        const collegeId = req.collegeId;
        
        // Filter by college
        const students = await prisma.student.findMany({
            where: {
                collegeId,        // ← Data isolation
                isDeleted: false
            },
            include: {
                sclass: true,
                section: true
            }
        });
        
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### Frontend Integration

The frontend automatically uses the user's college:

```javascript
// API calls automatically include user's college
const response = await adminAPI.getStudents();
// Backend automatically filters by req.collegeId from auth token
```

## Super Admin Access

Super Admin can access any college's data:

```javascript
// Super Admin bypass
if (req.user.role === 'SuperAdmin') {
    // Can access any college
    const collegeId = req.query.collegeId || req.user.collegeId;
}
```

## Data Isolation Enforcement

### 1. Database Level
- Foreign keys ensure data references correct college
- Unique constraints per college (e.g., `UNIQUE(collegeId, studentId)`)

### 2. API Level
- `authorizeCollege` middleware checks user belongs to college
- All queries filter by `collegeId`
- No cross-college data access

### 3. Application Level
- Frontend only shows user's college data
- No option to switch colleges (except Super Admin)

## Testing Multi-Tenancy

### Scenario: College A Admin tries to access College B data

1. **College A Admin logs in**
   ```
   Email: admin-a@demo.com
   College: College A
   Token: eyJhbGc...
   ```

2. **Tries to access College B students**
   ```
   GET /api/admin/students?collegeId=college-b-id
   Authorization: Bearer eyJhbGc...
   ```

3. **Result: Access Denied**
   ```json
   {
       "success": false,
       "message": "Access denied: Invalid college"
   }
   ```

## Creating New Colleges

### Super Admin Creates College A

```
POST /api/superadmin/colleges
{
    "name": "College A",
    "email": "admin@college-a.com",
    "phone": "9876543210",
    "address": "123 Main St"
}

Response:
{
    "id": "college-a-id",
    "name": "College A",
    "status": "active"
}
```

### Super Admin Creates Admin for College A

```
POST /api/superadmin/admins
{
    "collegeId": "college-a-id",
    "name": "Admin User",
    "email": "admin@college-a.com",
    "password": "SecurePassword123",
    "phone": "9876543210"
}

Response:
{
    "user": { "id": "user-id", "collegeId": "college-a-id" },
    "admin": { "id": "admin-id", "collegeId": "college-a-id" }
}
```

### College A Admin Creates Students

```
POST /api/admin/students
{
    "name": "Student A",
    "studentId": "STU001",
    "email": "student@college-a.com",
    "sclassId": "class-id",
    "password": "StudentPass123"
}

Response:
{
    "student": {
        "id": "student-id",
        "collegeId": "college-a-id",  // ← Automatically set
        "studentId": "STU001"
    }
}
```

## Verification Checklist

- [x] Users have `collegeId` field
- [x] All data tables have `collegeId` foreign key
- [x] Auth middleware sets `req.collegeId` from user
- [x] `authorizeCollege` middleware enforces college access
- [x] All queries filter by `collegeId`
- [x] Super Admin can access any college
- [x] College Admins can only access their college
- [x] Students/Teachers/Fees are college-specific
- [x] Unique constraints per college (not global)

## Security Notes

1. **Never trust client-provided collegeId** - Always use `req.collegeId` from authenticated user
2. **Always filter queries** - Every database query must include `where: { collegeId }`
3. **Check authorization** - Use `authorizeCollege` middleware on all admin routes
4. **Audit logging** - Log all cross-college access attempts

## Future Enhancements

1. **Row-Level Security (RLS)** - PostgreSQL RLS policies for additional security
2. **Audit Trails** - Track all data access per college
3. **Data Export** - Allow admins to export only their college's data
4. **Backup/Restore** - Per-college backup and restore functionality
5. **Usage Analytics** - Track storage and API usage per college

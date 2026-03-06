# 🔍 PostgreSQL Data Verification Guide - Complete Step-by-Step

## Table of Contents
1. [Quick Start - Check Data in 5 Minutes](#quick-start)
2. [Method 1: Using Prisma Studio (Easiest)](#method-1-prisma-studio)
3. [Method 2: Using SQL Queries](#method-2-sql-queries)
4. [Method 3: Using pgAdmin](#method-3-pgadmin)
5. [Method 4: Node.js Logging](#method-4-nodejs-logging)
6. [Method 5: Debugging Issues](#method-5-debugging)
7. [Common Problems & Solutions](#troubleshooting)

---

## Quick Start - Check Data in 5 Minutes {#quick-start}

### Step 1: Start Prisma Studio
```bash
cd backend
npx prisma studio
```
Opens at: http://localhost:5555

### Step 2: View Your Tables
- Click any table (User, Student, College, etc.)
- See all data visually
- Done! ✅

---

## Method 1: Using Prisma Studio (Easiest) {#method-1-prisma-studio}

### What is Prisma Studio?
A visual database browser - like Excel for your database.

### Step-by-Step:

**1. Open Terminal in Backend Folder**
```bash
cd backend
```

**2. Start Prisma Studio**
```bash
npx prisma studio
```

**3. Access in Browser**
- Automatically opens: http://localhost:5555
- Or manually open this URL

**4. Browse Your Data**
```
Left Sidebar:
├── User          ← Click to see all users
├── Student       ← Click to see all students
├── Teacher       ← Click to see all teachers
├── College       ← Click to see all colleges
├── Admission     ← Click to see admissions
├── Payment       ← Click to see payments
└── ... (30 tables total)
```

**5. View Record Details**
- Click any row to see full details
- See related data (relationships)
- Edit data directly if needed

**6. Search & Filter**
- Use search box to find records
- Filter by any column
- Sort by clicking column headers

### Advantages:
✅ No SQL knowledge needed
✅ Visual and intuitive
✅ Real-time updates
✅ Can edit data
✅ See relationships

---

## Method 2: Using SQL Queries {#method-2-sql-queries}

### A. Using PostgreSQL Command Line (psql)

**Step 1: Open Command Prompt/Terminal**

**Step 2: Connect to Database**
```bash
# Windows
psql -U postgres -d smsproject

# If PostgreSQL is not in PATH, use full path:
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d smsproject
```

**Step 3: Enter Password**
```
Password: Vineetha@17
```

**Step 4: Run SQL Queries**

### Essential SQL Queries:

#### 1. List All Tables
```sql
\dt
```

#### 2. View Table Structure
```sql
\d "User"
\d "Student"
\d "College"
```

#### 3. Count Records in Each Table
```sql
-- Count all users
SELECT COUNT(*) FROM "User";

-- Count all students
SELECT COUNT(*) FROM "Student";

-- Count all colleges
SELECT COUNT(*) FROM "College";

-- Count all admissions
SELECT COUNT(*) FROM "Admission";

-- Count all payments
SELECT COUNT(*) FROM "Payment";
```

#### 4. View All Records
```sql
-- View all users (limit 10)
SELECT * FROM "User" LIMIT 10;

-- View all students
SELECT * FROM "Student" LIMIT 10;

-- View all colleges
SELECT * FROM "College";

-- View all admissions
SELECT * FROM "Admission" LIMIT 10;
```

#### 5. View Specific Columns
```sql
-- View user basic info
SELECT id, name, email, role, "isActive", "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- View student info
SELECT id, name, email, "studentId", "sclassId", "createdAt"
FROM "Student"
ORDER BY "createdAt" DESC
LIMIT 10;

-- View college info
SELECT id, name, email, status, "maxUsers", "createdAt"
FROM "College"
ORDER BY "createdAt" DESC;
```

#### 6. Search for Specific Data
```sql
-- Find user by email
SELECT * FROM "User" WHERE email = 'test@example.com';

-- Find student by ID
SELECT * FROM "Student" WHERE "studentId" = 'STU001';

-- Find active users
SELECT * FROM "User" WHERE "isActive" = true;

-- Find users by role
SELECT * FROM "User" WHERE role = 'Student';

-- Find recent registrations (last 7 days)
SELECT * FROM "User" 
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY "createdAt" DESC;
```

#### 7. Join Tables (View Related Data)
```sql
-- View students with their class info
SELECT 
    s.name as student_name,
    s.email,
    s."studentId",
    c."sclassName" as class_name
FROM "Student" s
LEFT JOIN "Sclass" c ON s."sclassId" = c.id
LIMIT 10;

-- View users with their college
SELECT 
    u.name,
    u.email,
    u.role,
    col.name as college_name
FROM "User" u
LEFT JOIN "College" col ON u."collegeId" = col.id
LIMIT 10;

-- View payments with student info
SELECT 
    p."transactionId",
    p.amount,
    p.status,
    s.name as student_name,
    s.email
FROM "Payment" p
LEFT JOIN "Student" s ON p."studentId" = s.id
ORDER BY p."createdAt" DESC
LIMIT 10;
```

#### 8. Aggregate Queries
```sql
-- Total revenue
SELECT SUM(amount) as total_revenue 
FROM "Payment" 
WHERE status = 'completed';

-- Average fee amount
SELECT AVG(amount) as average_fee 
FROM "Fee";

-- Count by role
SELECT role, COUNT(*) as count 
FROM "User" 
GROUP BY role;

-- Count by college
SELECT 
    c.name as college_name,
    COUNT(u.id) as user_count
FROM "College" c
LEFT JOIN "User" u ON c.id = u."collegeId"
GROUP BY c.id, c.name;
```

#### 9. Check if Data Exists
```sql
-- Check if email exists
SELECT EXISTS(SELECT 1 FROM "User" WHERE email = 'test@example.com');

-- Check if student ID exists
SELECT EXISTS(SELECT 1 FROM "Student" WHERE "studentId" = 'STU001');
```

#### 10. View Recent Activity
```sql
-- Last 10 users created
SELECT name, email, role, "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Last 10 payments
SELECT "transactionId", amount, status, "createdAt"
FROM "Payment"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Last 10 admissions
SELECT "admissionNumber", "applicantName", status, "appliedDate"
FROM "Admission"
ORDER BY "appliedDate" DESC
LIMIT 10;
```

**Step 5: Exit psql**
```sql
\q
```

---

## Method 3: Using pgAdmin {#method-3-pgadmin}

### What is pgAdmin?
A graphical tool for PostgreSQL - like a file explorer for your database.

### Step-by-Step:

**1. Open pgAdmin**
- Should be installed with PostgreSQL
- Or download from: https://www.pgadmin.org/

**2. Connect to Server**
- Expand "Servers" in left panel
- Right-click on "PostgreSQL" → "Connect Server"
- Enter password: `Vineetha@17`

**3. Navigate to Your Database**
```
Servers
└── PostgreSQL 15
    └── Databases
        └── smsproject
            └── Schemas
                └── public
                    └── Tables
```

**4. View Table Data**
- Right-click on any table (e.g., "User")
- Select "View/Edit Data" → "All Rows"
- See data in spreadsheet format

**5. Run Custom Queries**
- Click "Tools" → "Query Tool"
- Write your SQL query
- Click "Execute" (F5)

**Example Queries in pgAdmin:**
```sql
-- View all users
SELECT * FROM "User" ORDER BY "createdAt" DESC;

-- View students with class
SELECT s.*, c."sclassName" 
FROM "Student" s
LEFT JOIN "Sclass" c ON s."sclassId" = c.id;

-- Count records
SELECT 
    'Users' as table_name, COUNT(*) FROM "User"
UNION ALL
SELECT 'Students', COUNT(*) FROM "Student"
UNION ALL
SELECT 'Teachers', COUNT(*) FROM "Teacher";
```

**6. Export Data**
- Right-click on table → "Import/Export"
- Choose format (CSV, JSON, etc.)
- Export to file

---

## Method 4: Node.js Logging {#method-4-nodejs-logging}

### A. Add Logging to Your Controllers

**Example 1: Student Controller with Logging**

Create/Edit: `backend/controllers/student-controller.js`

```javascript
const prisma = require('../lib/prisma');

// Get student profile with logging
const getProfile = async (req, res) => {
    try {
        console.log('📥 Request received for student profile');
        console.log('User ID:', req.user.id);
        console.log('College ID:', req.collegeId);

        const student = await prisma.student.findUnique({
            where: { userId: req.user.id },
            include: {
                sclass: true,
                section: true,
            },
        });

        // Log the result
        if (student) {
            console.log('✅ Student found:', {
                id: student.id,
                name: student.name,
                email: student.email,
                studentId: student.studentId,
            });
        } else {
            console.log('❌ Student not found for user:', req.user.id);
        }

        res.status(200).json({ 
            success: true, 
            data: student 
        });
    } catch (error) {
        console.error('❌ Error fetching student profile:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching profile' 
        });
    }
};

module.exports = { getProfile };
```

**Example 2: Auth Controller with Detailed Logging**

Add to: `backend/controllers/auth-controller.js`

```javascript
const login = async (req, res) => {
    try {
        const { email, password, collegeId } = req.body;

        console.log('🔐 Login attempt:', {
            email,
            collegeId,
            timestamp: new Date().toISOString(),
        });

        // Find user
        const user = await prisma.user.findUnique({
            where: collegeId 
                ? { email_collegeId: { email, collegeId } }
                : { email },
        });

        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        console.log('✅ User found:', {
            id: user.id,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
        });

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        console.log('✅ Login successful for:', email);

        // Generate token
        const token = generateToken(user.id, user.role, user.collegeId);

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        console.log('✅ Token generated and last login updated');

        res.status(200).json({
            success: true,
            data: { user, token },
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed' 
        });
    }
};
```

**Example 3: Create Student with Logging**

```javascript
const createStudent = async (req, res) => {
    try {
        const { name, email, studentId, password, sclassId } = req.body;
        const collegeId = req.collegeId;

        console.log('📝 Creating new student:', {
            name,
            email,
            studentId,
            collegeId,
        });

        // Check if student ID exists
        const existing = await prisma.student.findFirst({
            where: { studentId, collegeId },
        });

        if (existing) {
            console.log('❌ Student ID already exists:', studentId);
            return res.status(400).json({ 
                success: false, 
                message: 'Student ID already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed');

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'Student',
                collegeId,
            },
        });

        console.log('✅ User created:', user.id);

        // Create student
        const student = await prisma.student.create({
            data: {
                name,
                email,
                studentId,
                password: hashedPassword,
                collegeId,
                sclassId,
                userId: user.id,
            },
        });

        console.log('✅ Student created successfully:', {
            id: student.id,
            studentId: student.studentId,
            name: student.name,
        });

        // Verify data was stored
        const verification = await prisma.student.findUnique({
            where: { id: student.id },
        });

        console.log('✅ Verification - Student exists in DB:', !!verification);

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: { user, student },
        });
    } catch (error) {
        console.error('❌ Create student error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
        });
        res.status(500).json({ 
            success: false, 
            message: 'Error creating student' 
        });
    }
};
```

### B. Create a Test Script

Create: `backend/test-insert-and-verify.js`

```javascript
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function testInsertAndVerify() {
    console.log('🧪 Starting Insert and Verify Test\n');

    try {
        // Connect to database
        await prisma.$connect();
        console.log('✅ Database connected\n');

        // Test 1: Create a test college
        console.log('📝 Test 1: Creating test college...');
        const college = await prisma.college.create({
            data: {
                name: 'Test College ' + Date.now(),
                email: `test${Date.now()}@college.com`,
                status: 'active',
            },
        });
        console.log('✅ College created:', college.id);

        // Verify college was stored
        const verifyCollege = await prisma.college.findUnique({
            where: { id: college.id },
        });
        console.log('✅ Verification: College exists in DB:', !!verifyCollege);
        console.log('   College name:', verifyCollege.name);
        console.log('');

        // Test 2: Create a test user
        console.log('📝 Test 2: Creating test user...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: `testuser${Date.now()}@example.com`,
                password: hashedPassword,
                role: 'Student',
                collegeId: college.id,
            },
        });
        console.log('✅ User created:', user.id);

        // Verify user was stored
        const verifyUser = await prisma.user.findUnique({
            where: { id: user.id },
        });
        console.log('✅ Verification: User exists in DB:', !!verifyUser);
        console.log('   User name:', verifyUser.name);
        console.log('   User email:', verifyUser.email);
        console.log('   User role:', verifyUser.role);
        console.log('');

        // Test 3: Create a test class
        console.log('📝 Test 3: Creating test class...');
        const sclass = await prisma.sclass.create({
            data: {
                sclassName: 'Class 10A',
                sclassCode: 'C10A',
                collegeId: college.id,
            },
        });
        console.log('✅ Class created:', sclass.id);
        console.log('');

        // Test 4: Create a test student
        console.log('📝 Test 4: Creating test student...');
        const student = await prisma.student.create({
            data: {
                name: 'Test Student',
                studentId: 'STU' + Date.now(),
                email: `student${Date.now()}@example.com`,
                password: hashedPassword,
                collegeId: college.id,
                sclassId: sclass.id,
                userId: user.id,
            },
        });
        console.log('✅ Student created:', student.id);

        // Verify student with relations
        const verifyStudent = await prisma.student.findUnique({
            where: { id: student.id },
            include: {
                sclass: true,
                college: true,
                user: true,
            },
        });
        console.log('✅ Verification: Student exists in DB:', !!verifyStudent);
        console.log('   Student ID:', verifyStudent.studentId);
        console.log('   Student name:', verifyStudent.name);
        console.log('   Class:', verifyStudent.sclass.sclassName);
        console.log('   College:', verifyStudent.college.name);
        console.log('');

        // Test 5: Query the data
        console.log('📝 Test 5: Querying all data...');
        const allStudents = await prisma.student.findMany({
            where: { collegeId: college.id },
            include: { sclass: true },
        });
        console.log('✅ Total students in test college:', allStudents.length);
        console.log('');

        // Test 6: Update data
        console.log('📝 Test 6: Updating student...');
        const updated = await prisma.student.update({
            where: { id: student.id },
            data: { name: 'Updated Test Student' },
        });
        console.log('✅ Student updated:', updated.name);
        console.log('');

        // Test 7: Delete data (cleanup)
        console.log('📝 Test 7: Cleaning up test data...');
        await prisma.student.delete({ where: { id: student.id } });
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.sclass.delete({ where: { id: sclass.id } });
        await prisma.college.delete({ where: { id: college.id } });
        console.log('✅ Test data cleaned up');
        console.log('');

        console.log('🎉 All tests passed! Data is storing correctly in PostgreSQL.');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
        });
    } finally {
        await prisma.$disconnect();
        console.log('\n✅ Database disconnected');
    }
}

// Run the test
testInsertAndVerify();
```

**Run the test:**
```bash
cd backend
node test-insert-and-verify.js
```

### C. Add Middleware Logging

Create: `backend/middleware/logger.js`

```javascript
// Request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    console.log(`\n📥 ${req.method} ${req.path}`);
    console.log('Time:', new Date().toISOString());
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`📤 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms\n`);
    });
    
    next();
};

module.exports = { requestLogger };
```

**Use in your app:**

Edit: `backend/index.js`

```javascript
const { requestLogger } = require('./middleware/logger');

// Add after body parser
app.use(requestLogger);
```

---

## Method 5: Debugging Issues {#method-5-debugging}

### Common Issues and Solutions:

### Issue 1: Data Not Inserting

**Check 1: Database Connection**
```javascript
// Add to backend/index.js
const prisma = require('./lib/prisma');

prisma.$connect()
    .then(() => console.log('✅ Database connected'))
    .catch(err => console.error('❌ Database connection failed:', err));
```

**Check 2: Prisma Client Generated**
```bash
cd backend
npx prisma generate
```

**Check 3: Database Schema Synced**
```bash
cd backend
npx prisma db push
```

### Issue 2: Unique Constraint Errors

**SQL Query to Check:**
```sql
-- Check if email already exists
SELECT * FROM "User" WHERE email = 'test@example.com';

-- Check if student ID exists
SELECT * FROM "Student" WHERE "studentId" = 'STU001';
```

**Fix in Code:**
```javascript
// Always check before inserting
const existing = await prisma.user.findUnique({
    where: { email: req.body.email },
});

if (existing) {
    return res.status(400).json({ 
        message: 'Email already exists' 
    });
}
```

### Issue 3: Foreign Key Errors

**SQL Query to Check:**
```sql
-- Check if college exists
SELECT * FROM "College" WHERE id = 'your-college-id';

-- Check if class exists
SELECT * FROM "Sclass" WHERE id = 'your-class-id';
```

**Fix in Code:**
```javascript
// Verify foreign keys exist
const college = await prisma.college.findUnique({
    where: { id: collegeId },
});

if (!college) {
    return res.status(404).json({ 
        message: 'College not found' 
    });
}
```

### Issue 4: Transaction Rollback

**Use Transactions for Multiple Inserts:**
```javascript
const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
        data: { /* user data */ },
    });
    
    // Create student
    const student = await tx.student.create({
        data: { 
            userId: user.id,
            /* other data */
        },
    });
    
    return { user, student };
});

console.log('✅ Transaction completed:', result);
```

### Issue 5: Silent Failures

**Add Try-Catch Everywhere:**
```javascript
try {
    const result = await prisma.student.create({ data });
    console.log('✅ Created:', result);
} catch (error) {
    console.error('❌ Error:', error);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    throw error;
}
```

---

## Troubleshooting {#troubleshooting}

### Problem: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows: Open Services, look for "postgresql"

# Test connection
psql -U postgres -d smsproject

# Check DATABASE_URL in .env
cat backend/.env | grep DATABASE_URL
```

### Problem: "Table does not exist"

**Solution:**
```bash
cd backend
npx prisma db push
npx prisma generate
```

### Problem: "Data not showing in Prisma Studio"

**Solution:**
```bash
# Restart Prisma Studio
# Press Ctrl+C to stop
npx prisma studio

# Refresh browser (F5)
```

### Problem: "Permission denied"

**Solution:**
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE smsproject TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

---

## Quick Reference Commands

### Prisma Commands:
```bash
npx prisma studio          # Open visual database browser
npx prisma db push         # Sync schema to database
npx prisma generate        # Generate Prisma Client
npx prisma db seed         # Run seed data
```

### PostgreSQL Commands:
```bash
psql -U postgres -d smsproject    # Connect to database
\dt                                # List tables
\d "TableName"                     # Describe table
\q                                 # Quit
```

### SQL Queries:
```sql
SELECT * FROM "User" LIMIT 10;                    -- View users
SELECT COUNT(*) FROM "Student";                   -- Count students
SELECT * FROM "User" WHERE email = 'test@test';   -- Find by email
```

---

## Summary

**Easiest Method:** Prisma Studio
```bash
cd backend
npx prisma studio
# Open http://localhost:5555
```

**For SQL Queries:** Use psql or pgAdmin
```bash
psql -U postgres -d smsproject
SELECT * FROM "User";
```

**For Debugging:** Add console.log in controllers
```javascript
console.log('✅ Data inserted:', result);
```

**For Testing:** Run test script
```bash
node backend/test-insert-and-verify.js
```

---

*All methods work! Choose what's easiest for you.* 🎉

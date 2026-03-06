# 🔍 How to Check if Data is Stored in Backend Database

## 5 Easy Methods to Verify Data Storage

---

## Method 1: Prisma Studio (EASIEST - Visual Interface) ⭐ RECOMMENDED

### What is Prisma Studio?
A visual database browser that lets you see, edit, and manage your data with a nice GUI.

### How to Use:

**Step 1: Open Prisma Studio**
```bash
cd backend
npx prisma studio
```

**Step 2: Access the Interface**
- Opens automatically at: http://localhost:5555
- If not, manually open: http://localhost:5555 in your browser

**Step 3: Browse Your Data**
- You'll see all your tables on the left sidebar
- Click any table to view its data
- Examples:
  - Click "User" to see all users
  - Click "Student" to see all students
  - Click "College" to see all colleges
  - Click "Admission" to see admission applications
  - Click "Payment" to see payment records

**Step 4: View Details**
- Click on any row to see full details
- See all fields and their values
- See related data (relationships)

**Step 5: Search & Filter**
- Use the search box to find specific records
- Filter by any field
- Sort by any column

### Screenshots of What You'll See:
```
┌─────────────────────────────────────────────┐
│  Prisma Studio                              │
├─────────────┬───────────────────────────────┤
│ Tables      │  User Table                   │
│             │                               │
│ ☐ User      │  id    name      email        │
│ ☐ Student   │  123   John Doe  john@...     │
│ ☐ Teacher   │  456   Jane Doe  jane@...     │
│ ☐ College   │                               │
│ ☐ Admission │  [+ Add Record]               │
│ ☐ Payment   │                               │
└─────────────┴───────────────────────────────┘
```

### Advantages:
- ✅ Visual and easy to use
- ✅ No SQL knowledge needed
- ✅ Can edit data directly
- ✅ See relationships
- ✅ Real-time updates

---

## Method 2: Backend API Endpoints (Test with Browser/Postman)

### Using Browser Console (Quick Test)

**Step 1: Open Browser Console**
- Press F12 in your browser
- Go to "Console" tab

**Step 2: Test API Calls**

```javascript
// Check if backend is running
fetch('http://localhost:5000/api/auth/me')
  .then(res => res.json())
  .then(data => console.log(data));

// Expected: {"success":false,"message":"No token provided"}
// This means backend is working!
```

**Step 3: Test with Login (if you have test user)**

```javascript
// Login to get token
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    role: 'Student'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login Response:', data);
  if (data.token) {
    localStorage.setItem('token', data.token);
    console.log('Token saved!');
  }
});
```

**Step 4: Fetch Data with Token**

```javascript
// Get student profile
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/student/profile', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Profile:', data));
```

### Using Postman or Thunder Client

**Step 1: Install Postman**
- Download from: https://www.postman.com/downloads/
- Or use Thunder Client extension in VS Code

**Step 2: Create Request**
- Method: GET
- URL: http://localhost:5000/api/auth/me
- Click "Send"

**Step 3: Test Login**
- Method: POST
- URL: http://localhost:5000/api/auth/login
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123",
  "role": "Student"
}
```
- Click "Send"
- Copy the token from response

**Step 4: Test Protected Routes**
- Method: GET
- URL: http://localhost:5000/api/student/profile
- Headers:
  - Key: Authorization
  - Value: Bearer YOUR_TOKEN_HERE
- Click "Send"

---

## Method 3: Direct Database Query (PostgreSQL)

### Using Command Line (psql)

**Step 1: Connect to Database**
```bash
# Windows (if PostgreSQL is in PATH)
psql -U postgres -d smsproject

# Or with full path
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d smsproject
```

**Step 2: Enter Password**
- Enter your PostgreSQL password (Vineetha@17)

**Step 3: Run Queries**

```sql
-- See all tables
\dt

-- Count records in each table
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Students', COUNT(*) FROM "Student"
UNION ALL
SELECT 'Teachers', COUNT(*) FROM "Teacher"
UNION ALL
SELECT 'Colleges', COUNT(*) FROM "College"
UNION ALL
SELECT 'Admissions', COUNT(*) FROM "Admission";

-- View all users
SELECT id, name, email, role, "isActive", "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- View all students
SELECT id, name, email, "studentId", "createdAt" 
FROM "Student" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- View all colleges
SELECT id, name, email, status, "createdAt" 
FROM "College" 
ORDER BY "createdAt" DESC;

-- View recent admissions
SELECT "admissionNumber", "applicantName", "applicantEmail", status, "appliedDate"
FROM "Admission"
ORDER BY "appliedDate" DESC
LIMIT 10;

-- Search for specific user
SELECT * FROM "User" WHERE email = 'test@example.com';

-- Check if data exists
SELECT EXISTS(SELECT 1 FROM "User" WHERE email = 'test@example.com');
```

**Step 4: Exit**
```sql
\q
```

### Using pgAdmin (GUI Tool)

**Step 1: Open pgAdmin**
- Should be installed with PostgreSQL
- Or download from: https://www.pgadmin.org/

**Step 2: Connect to Server**
- Expand "Servers"
- Right-click → Connect
- Enter password

**Step 3: Navigate to Database**
- Servers → PostgreSQL → Databases → smsproject → Schemas → public → Tables

**Step 4: View Data**
- Right-click on any table (e.g., "User")
- Select "View/Edit Data" → "All Rows"
- See all records in a spreadsheet-like view

---

## Method 4: Backend Console Logs

### Check Backend Terminal Output

When backend is running, it logs all database operations:

```bash
# Start backend
cd backend
npm start

# Watch the console output
```

**What to Look For:**

```
POST /api/auth/login - 200 - 150ms
GET /api/student/profile - 200 - 50ms
POST /api/admission/apply - 201 - 200ms
```

- **200** = Success (data retrieved)
- **201** = Created (data stored)
- **400** = Bad request (validation error)
- **401** = Unauthorized (no token)
- **404** = Not found
- **500** = Server error

### Add Custom Logging

Edit your backend controllers to add console logs:

```javascript
// backend/controllers/student-controller.js
exports.getProfile = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });
    
    console.log('✅ Student data retrieved:', student); // ADD THIS
    
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('❌ Error fetching student:', error); // ADD THIS
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## Method 5: Create a Test Script

### Quick Database Check Script

Create this file: `backend/check-database.js`

```javascript
const prisma = require('./lib/prisma');

async function checkDatabase() {
  console.log('🔍 Checking Database...\n');

  try {
    // Connect
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // Count records
    const counts = {
      colleges: await prisma.college.count(),
      users: await prisma.user.count(),
      students: await prisma.student.count(),
      teachers: await prisma.teacher.count(),
      parents: await prisma.parent.count(),
      admissions: await prisma.admission.count(),
      payments: await prisma.payment.count(),
    };

    console.log('📊 Record Counts:');
    console.log('─────────────────');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`${table.padEnd(15)}: ${count}`);
    });
    console.log('');

    // Show recent users
    console.log('👥 Recent Users (Last 5):');
    console.log('─────────────────────────');
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (recentUsers.length === 0) {
      console.log('No users found');
    } else {
      recentUsers.forEach(user => {
        console.log(`- ${user.name} (${user.role})`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Created: ${user.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    // Show recent admissions
    console.log('📝 Recent Admissions (Last 5):');
    console.log('──────────────────────────────');
    const recentAdmissions = await prisma.admission.findMany({
      take: 5,
      orderBy: { appliedDate: 'desc' },
      select: {
        admissionNumber: true,
        applicantName: true,
        applicantEmail: true,
        status: true,
        appliedDate: true,
      },
    });
    
    if (recentAdmissions.length === 0) {
      console.log('No admissions found');
    } else {
      recentAdmissions.forEach(admission => {
        console.log(`- ${admission.applicantName}`);
        console.log(`  Number: ${admission.admissionNumber}`);
        console.log(`  Status: ${admission.status}`);
        console.log(`  Applied: ${admission.appliedDate.toLocaleString()}`);
        console.log('');
      });
    }

    console.log('✅ Database check complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
```

**Run it:**
```bash
cd backend
node check-database.js
```

**Output Example:**
```
🔍 Checking Database...

✅ Database connected

📊 Record Counts:
─────────────────
colleges       : 2
users          : 15
students       : 10
teachers       : 3
parents        : 5
admissions     : 8
payments       : 12

👥 Recent Users (Last 5):
─────────────────────────
- John Doe (Student)
  Email: john@example.com
  Created: 3/5/2026, 10:30:00 AM

- Jane Smith (Teacher)
  Email: jane@example.com
  Created: 3/5/2026, 9:15:00 AM

✅ Database check complete!
```

---

## 🎯 Quick Comparison

| Method | Difficulty | Speed | Best For |
|--------|-----------|-------|----------|
| **Prisma Studio** | ⭐ Easy | Fast | Visual browsing, editing data |
| **API Testing** | ⭐⭐ Medium | Fast | Testing endpoints, debugging |
| **SQL Queries** | ⭐⭐⭐ Hard | Fast | Complex queries, bulk operations |
| **Backend Logs** | ⭐ Easy | Real-time | Debugging, monitoring |
| **Test Script** | ⭐⭐ Medium | Fast | Quick checks, automation |

---

## 🚀 Recommended Workflow

### For Daily Development:
1. **Use Prisma Studio** for quick visual checks
2. **Check Backend Logs** while testing
3. **Use Browser Console** for API testing

### For Debugging:
1. **Check Backend Logs** first
2. **Use Prisma Studio** to verify data
3. **Run SQL Queries** for complex issues

### For Testing:
1. **Use Test Script** for automated checks
2. **Use Postman** for API testing
3. **Check Prisma Studio** to verify results

---

## ✅ Step-by-Step: Check Your First Data

### Let's verify if data is being stored:

**Step 1: Start Backend**
```bash
cd backend
npm start
```

**Step 2: Open Prisma Studio**
```bash
# In a new terminal
cd backend
npx prisma studio
```

**Step 3: Open Browser**
- Go to: http://localhost:5555
- You should see Prisma Studio interface

**Step 4: Check Tables**
- Click on "User" table
- Click on "Student" table
- Click on "College" table
- See if any data exists

**Step 5: Test from Frontend**
- Go to: http://localhost:3000/login
- Try to login or signup
- Go back to Prisma Studio
- Refresh the page
- Check if new data appeared

**Step 6: Verify**
- If you see new records → ✅ Data is storing!
- If no records → Check backend logs for errors

---

## 🐛 Troubleshooting

### "No data showing in Prisma Studio"
- Check if backend is running
- Check if database is connected
- Run the test script to verify connection
- Check backend logs for errors

### "Can't connect to Prisma Studio"
- Make sure port 5555 is not in use
- Try: `npx prisma studio --port 5556`
- Check if Prisma Client is generated: `npx prisma generate`

### "Database connection error"
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Test connection: `npx prisma db push`

---

## 📝 Summary

**Easiest Way:** Use Prisma Studio
```bash
cd backend
npx prisma studio
# Open http://localhost:5555
```

**Quick Check:** Run test script
```bash
cd backend
node check-database.js
```

**Real-time Monitoring:** Watch backend logs
```bash
cd backend
npm start
# Watch console output
```

**All methods work! Choose what's easiest for you.** 🎉

---

*Pro Tip: Keep Prisma Studio open while developing. It auto-refreshes when data changes!*

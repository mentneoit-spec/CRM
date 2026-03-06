# 🚀 Quick Start: Verify PostgreSQL Data Storage

## 3 Simple Methods to Check Your Data

---

## Method 1: Prisma Studio (Recommended - 2 Minutes) ⭐

### Step 1: Open Terminal
```bash
cd backend
```

### Step 2: Start Prisma Studio
```bash
npx prisma studio
```

### Step 3: Open Browser
- Automatically opens at: **http://localhost:5555**
- Or manually open this URL

### Step 4: Click Any Table
- Click "User" to see all users
- Click "Student" to see all students
- Click "Payment" to see all payments
- Click "College" to see all colleges

### Step 5: View Your Data
- See all records in a nice table
- Click any row to see details
- Search and filter easily

**Done! ✅ You can now see all your data visually.**

---

## Method 2: Run Test Script (3 Minutes)

### Step 1: Open Terminal
```bash
cd backend
```

### Step 2: Run Test Script
```bash
node test-insert-and-verify.js
```

### Step 3: Watch the Output
The script will:
- ✅ Create test data
- ✅ Verify it's stored
- ✅ Query the data
- ✅ Update records
- ✅ Delete test data
- ✅ Show you everything works!

**Example Output:**
```
🧪 Starting PostgreSQL Insert and Verify Test

✅ Database connected successfully

📝 TEST 1: Creating Test College
✅ College created successfully
   ID: abc-123-def
   Name: Test College 1234567890

🔍 Verification:
   College exists in DB: true
   Data matches: true

📝 TEST 2: Creating Test Class
✅ Class created successfully

... (more tests)

🎉 ALL TESTS PASSED SUCCESSFULLY!

✅ PostgreSQL is working correctly
✅ Data is being stored properly
✅ Relationships are working
```

---

## Method 3: SQL Queries (5 Minutes)

### Step 1: Connect to Database
```bash
psql -U postgres -d smsproject
```

### Step 2: Enter Password
```
Password: Vineetha@17
```

### Step 3: Run Queries

**Count all records:**
```sql
SELECT 'Users' as table, COUNT(*) FROM "User"
UNION ALL
SELECT 'Students', COUNT(*) FROM "Student"
UNION ALL
SELECT 'Colleges', COUNT(*) FROM "College";
```

**View recent users:**
```sql
SELECT id, name, email, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

**View all students:**
```sql
SELECT * FROM "Student" LIMIT 10;
```

**Search by email:**
```sql
SELECT * FROM "User" WHERE email = 'test@example.com';
```

### Step 4: Exit
```sql
\q
```

---

## Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows: Open Services, look for "postgresql"

# Test connection
psql -U postgres
```

### Problem: "Prisma Studio won't open"

**Solution:**
```bash
# Stop any running instance (Ctrl+C)
# Then restart
cd backend
npx prisma studio
```

### Problem: "No data showing"

**Solution:**
```bash
# Sync database schema
cd backend
npx prisma db push
npx prisma generate

# Then check again
npx prisma studio
```

---

## What to Check

### ✅ After User Registration:
1. Open Prisma Studio
2. Click "User" table
3. Look for the new user's email
4. Verify the data is there

### ✅ After Student Creation:
1. Open Prisma Studio
2. Click "Student" table
3. Look for the student ID
4. Check if class is linked

### ✅ After Payment:
1. Open Prisma Studio
2. Click "Payment" table
3. Look for transaction ID
4. Verify amount and status

---

## Quick Commands Reference

```bash
# Start Prisma Studio
cd backend && npx prisma studio

# Run test script
cd backend && node test-insert-and-verify.js

# Connect to database
psql -U postgres -d smsproject

# Sync database
cd backend && npx prisma db push

# Generate Prisma Client
cd backend && npx prisma generate
```

---

## Need More Help?

📖 **Full Guide:** See `POSTGRESQL_DATA_VERIFICATION_GUIDE.md`

📝 **SQL Queries:** See `backend/SQL_QUERIES_REFERENCE.sql`

🔍 **Database Check:** See `HOW_TO_CHECK_DATABASE_DATA.md`

---

## Summary

**Easiest:** Prisma Studio
```bash
cd backend
npx prisma studio
# Open http://localhost:5555
```

**For Testing:** Run test script
```bash
cd backend
node test-insert-and-verify.js
```

**For SQL:** Use psql
```bash
psql -U postgres -d smsproject
SELECT * FROM "User";
```

---

*Choose the method that works best for you!* 🎉


# 📖 STEP-BY-STEP: How to View Data in Neon Dashboard

## 🎯 Goal
See your 7 users in the Neon PostgreSQL web dashboard

---

## 📋 Method 1: SQL Editor (EASIEST - 2 MINUTES)

### Step 1: Open Neon Console
1. Open your web browser
2. Go to: **https://console.neon.tech**
3. Login with your Neon account credentials

### Step 2: Select Your Project
1. You'll see a list of projects
2. Look for project with endpoint: **ep-gentle-thunder-aioue7ye**
3. Click on it to open

### Step 3: Check Branch
1. At the top of the page, you'll see a branch selector
2. Make sure it says **"main"** (not dev or preview)
3. If it's on a different branch, click and select "main"

### Step 4: Open SQL Editor
1. Look at the left sidebar
2. Find and click **"SQL Editor"** (it has a code icon)
3. A query editor will open

### Step 5: Run Query
1. In the query box, type or paste:
   ```sql
   SELECT * FROM "User";
   ```
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait 1-2 seconds

### Step 6: See Results
1. Below the query box, you'll see a results table
2. You should see **7 rows** (7 users)
3. Each row shows: id, name, email, phone, role, etc.

### ✅ Success!
If you see 7 users, your data is there! The dashboard is working correctly.

---

## 📋 Method 2: Tables View (ALTERNATIVE)

### Step 1-3: Same as Method 1
Follow steps 1-3 from Method 1 above

### Step 4: Open Tables
1. In the left sidebar, click **"Tables"**
2. You'll see a list of all 31 tables

### Step 5: Find User Table
1. Scroll down to find **"User"** table
2. Click on it

### Step 6: View Data
1. You should see the table structure
2. Click **"Browse"** or **"Data"** tab
3. You should see 7 rows

### Note:
Sometimes the Tables view doesn't refresh automatically. If you don't see data:
- Click the **"Refresh"** button (circular arrow icon)
- Or use Method 1 (SQL Editor) instead

---

## 📋 Method 3: Prisma Studio (LOCAL - NO INTERNET NEEDED)

### Step 1: Open Terminal
1. Open your terminal/command prompt
2. Navigate to backend folder:
   ```bash
   cd collegedata/backend
   ```

### Step 2: Start Prisma Studio
```bash
npx prisma studio
```

### Step 3: Open Browser
1. Prisma Studio will automatically open in your browser
2. Or manually go to: **http://localhost:5555**

### Step 4: View Data
1. You'll see a list of all tables on the left
2. Click on **"User"** table
3. You'll see all 7 users with full details
4. You can even edit, add, or delete records here!

### Step 5: Close When Done
1. Go back to terminal
2. Press **Ctrl+C** to stop Prisma Studio

---

## 🔍 TROUBLESHOOTING

### Problem: "No data found" or "0 rows"

**Solution 1: Check Branch**
- Make sure you're on the **"main"** branch
- Neon has multiple branches like Git
- Data might be on a different branch

**Solution 2: Refresh**
- Click the refresh button in Neon
- Or press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- This clears the cache

**Solution 3: Verify Project**
- Make sure you're in the correct Neon project
- Look for endpoint: **ep-gentle-thunder-aioue7ye**
- You might have multiple projects

**Solution 4: Use SQL Editor**
- The Tables view sometimes has issues
- SQL Editor is more reliable
- Use Method 1 above

**Solution 5: Check Connection String**
- Open `backend/.env`
- Verify DATABASE_URL contains: **ep-gentle-thunder-aioue7ye**
- If different, you're connected to a different database

### Problem: "Table doesn't exist"

**Solution:**
- Run migrations again:
  ```bash
  cd backend
  npx prisma db push
  ```

### Problem: "Connection error"

**Solution:**
- Check if Neon database is active (not paused)
- Neon free tier pauses after inactivity
- Go to Neon dashboard and wake it up

---

## 📊 WHAT YOU SHOULD SEE

When you run `SELECT * FROM "User";` you should see:

| name | email | role | isActive |
|------|-------|------|----------|
| Test User 4:55:36 PM | test-1772709936224@example.com | Student | true |
| Super Admin | superadmin@system.com | SuperAdmin | true |
| Admin User | admin@college.com | Admin | true |
| Michael Parent | parent@college.com | Parent | true |
| Sarah Teacher | teacher@college.com | Teacher | true |
| John Student | student@college.com | Student | true |
| Neon Test User | neon@test.com | Student | true |

**Total: 7 users**

---

## 🎯 QUICK VERIFICATION

Want to verify data is there without opening Neon dashboard?

```bash
cd backend
node show-all-data.js
```

This will show all 7 users in your terminal instantly!

---

## 📝 USEFUL SQL QUERIES

Copy these into Neon SQL Editor:

```sql
-- Count users
SELECT COUNT(*) FROM "User";

-- View by role
SELECT role, COUNT(*) FROM "User" GROUP BY role;

-- Latest users
SELECT name, email, role FROM "User" ORDER BY "createdAt" DESC LIMIT 5;

-- Search by email
SELECT * FROM "User" WHERE email = 'admin@college.com';
```

More queries available in: `NEON_SQL_QUERIES.sql`

---

## ✅ CONFIRMATION

After following Method 1, you should:
1. ✅ See 7 users in the results
2. ✅ See their names, emails, and roles
3. ✅ Confirm data is in Neon PostgreSQL

If you see this, **problem solved!** Your data is there and visible.

---

## 🆘 STILL HAVING ISSUES?

If you still can't see data after trying all methods:

1. **Run verification script:**
   ```bash
   cd backend
   node verify-neon-data.js
   ```

2. **Check if you're looking at the right database:**
   - Your endpoint: **ep-gentle-thunder-aioue7ye**
   - Your database: **neondb**
   - Your user: **neondb_owner**

3. **Verify connection:**
   ```bash
   cd backend
   node check-database.js
   ```

4. **Contact Neon Support:**
   - If scripts show data but dashboard doesn't
   - It might be a Neon dashboard issue
   - Contact: https://neon.tech/docs/introduction/support

---

**Last Updated**: March 5, 2026  
**Status**: Data confirmed in database ✅  
**Users**: 7 records  
**Tables**: 31 tables

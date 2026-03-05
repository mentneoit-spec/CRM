# Connect Your PostgreSQL Tool to Neon Database

## ✅ DATA IS CONFIRMED IN NEON!

**6 Users are saved in Neon database**

The issue: Your PostgreSQL tool is connected to **localhost**, but your data is in **Neon cloud**.

---

## 🔧 Step-by-Step: Connect to Neon

### Which PostgreSQL Tool Are You Using?

Choose your tool below:

---

## Option 1: pgAdmin

### Steps:

1. **Open pgAdmin**

2. **Right-click "Servers"** → **Create** → **Server**

3. **General Tab**:
   - Name: `Neon College ERP`

4. **Connection Tab**:
   ```
   Host name/address: ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech
   Port: 5432
   Maintenance database: neondb
   Username: neondb_owner
   Password: npg_sJTQ78eqbyCD
   ```

5. **SSL Tab**:
   - SSL mode: `Require`

6. **Click "Save"**

7. **Expand the server** → **Databases** → **neondb** → **Schemas** → **public** → **Tables**

8. **Right-click "User" table** → **View/Edit Data** → **All Rows**

9. **You'll see all 6 users!** ✅

---

## Option 2: DBeaver

### Steps:

1. **Open DBeaver**

2. **Click "New Database Connection"** (plug icon)

3. **Select "PostgreSQL"** → **Next**

4. **Main Tab**:
   ```
   Host: ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech
   Port: 5432
   Database: neondb
   Username: neondb_owner
   Password: npg_sJTQ78eqbyCD
   ```

5. **SSL Tab**:
   - Check "Use SSL"
   - SSL mode: `require`

6. **Click "Test Connection"**
   - Should show "Connected" ✅

7. **Click "Finish"**

8. **Expand connection** → **neondb** → **Schemas** → **public** → **Tables**

9. **Double-click "User" table**

10. **Click "Data" tab**

11. **You'll see all 6 users!** ✅

---

## Option 3: TablePlus

### Steps:

1. **Open TablePlus**

2. **Click "Create a new connection"** (+ button)

3. **Select "PostgreSQL"**

4. **Fill in details**:
   ```
   Name: Neon College ERP
   Host: ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech
   Port: 5432
   User: neondb_owner
   Password: npg_sJTQ78eqbyCD
   Database: neondb
   ```

5. **Enable SSL**:
   - Check "Over SSL"
   - SSL Mode: `require`

6. **Click "Test"**
   - Should show success ✅

7. **Click "Connect"**

8. **In left sidebar**, expand **public** → **Tables**

9. **Click "User" table**

10. **You'll see all 6 users!** ✅

---

## Option 4: Command Line (psql)

### Steps:

1. **Open Terminal**

2. **Run this command**:
   ```bash
   psql "postgresql://neondb_owner:npg_sJTQ78eqbyCD@ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

3. **You'll be connected to Neon!**

4. **Run queries**:
   ```sql
   -- View all users
   SELECT * FROM "User";
   
   -- Count users
   SELECT COUNT(*) FROM "User";
   
   -- View by role
   SELECT name, email, role FROM "User" ORDER BY role;
   ```

5. **You'll see all 6 users!** ✅

---

## Option 5: VS Code PostgreSQL Extension

### Steps:

1. **Install Extension**:
   - Open VS Code
   - Go to Extensions (Cmd+Shift+X or Ctrl+Shift+X)
   - Search: "PostgreSQL" by Chris Kolkman
   - Click "Install"

2. **Add Connection**:
   - Click PostgreSQL icon in left sidebar
   - Click "+" (Add Connection)

3. **Enter Connection Details**:
   ```
   Hostname: ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech
   Port: 5432
   Username: neondb_owner
   Password: npg_sJTQ78eqbyCD
   Database: neondb
   SSL: Enabled
   ```

4. **Connect**

5. **Browse Tables**:
   - Expand connection
   - Expand "public" schema
   - Click "User" table
   - View data

6. **You'll see all 6 users!** ✅

---

## 🎯 Connection Details (Copy-Paste Ready)

```
Host: ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech
Port: 5432
Database: neondb
Username: neondb_owner
Password: npg_sJTQ78eqbyCD
SSL Mode: require
```

**Full Connection String**:
```
postgresql://neondb_owner:npg_sJTQ78eqbyCD@ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## ⚠️ Common Mistakes

### Mistake 1: Using localhost
```
❌ Host: localhost
✅ Host: ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech
```

### Mistake 2: Wrong database name
```
❌ Database: college_erp
✅ Database: neondb
```

### Mistake 3: Wrong username
```
❌ Username: yeduruabhiram
✅ Username: neondb_owner
```

### Mistake 4: SSL not enabled
```
❌ SSL: Disabled
✅ SSL: Required/Enabled
```

---

## 🧪 Test Your Connection

### Quick Test Query:

Once connected, run this:
```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'Student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'Teacher' THEN 1 END) as teachers,
    COUNT(CASE WHEN role = 'Admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'Parent' THEN 1 END) as parents,
    COUNT(CASE WHEN role = 'SuperAdmin' THEN 1 END) as superadmins
FROM "User";
```

**Expected Result**:
```
total_users: 6
students: 2
teachers: 1
admins: 1
parents: 1
superadmins: 1
```

---

## 📊 What You'll See

### User Table Data:

| name | email | role |
|------|-------|------|
| Super Admin | superadmin@system.com | SuperAdmin |
| Admin User | admin@college.com | Admin |
| Michael Parent | parent@college.com | Parent |
| Sarah Teacher | teacher@college.com | Teacher |
| John Student | student@college.com | Student |
| Neon Test User | neon@test.com | Student |

---

## 🔍 Troubleshooting

### Can't Connect?

**Check 1: Internet Connection**
- Neon is cloud-based, needs internet

**Check 2: SSL Enabled**
- Must enable SSL/TLS
- SSL Mode: `require`

**Check 3: Correct Credentials**
- Double-check host, username, password
- Copy-paste from above to avoid typos

**Check 4: Firewall**
- Check if firewall blocking connection
- Port 5432 should be open

### Still Not Working?

**Try Prisma Studio** (Always works):
```
http://localhost:5555
```

**Or Neon Web Console**:
```
https://console.neon.tech
```

---

## 🎓 Understanding the Setup

### Your Old Setup (Local):
```
PostgreSQL Tool → localhost:5432 → college_erp
```

### Your New Setup (Neon):
```
PostgreSQL Tool → Neon Cloud → neondb
```

**You need to update your tool's connection to point to Neon!**

---

## ✅ Verification Checklist

After connecting, verify:

- [ ] Can see "User" table
- [ ] Table shows 6 rows
- [ ] Can see user names and emails
- [ ] Can run SELECT queries
- [ ] Can see other tables (College, Student, Teacher, etc.)

---

## 🚀 Quick Start

**Fastest way to see your data**:

1. **Open Prisma Studio**:
   ```
   http://localhost:5555
   ```
   
2. **Or use psql**:
   ```bash
   psql "postgresql://neondb_owner:npg_sJTQ78eqbyCD@ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```
   
3. **Then run**:
   ```sql
   SELECT * FROM "User";
   ```

---

## 📝 Summary

**Problem**: PostgreSQL tool showing empty
**Reason**: Connected to localhost, not Neon
**Solution**: Update connection to use Neon details above

**Your data IS there!** Just need to connect to the right place. ✅

---

## 🔗 Quick Links

**Prisma Studio**: http://localhost:5555
**Neon Console**: https://console.neon.tech
**Check Script**: `node check-database.js` (in backend folder)

---

**Follow the steps above for your PostgreSQL tool and you'll see all your data!** 🎉

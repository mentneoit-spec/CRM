# How to View PostgreSQL Database

## Database Connection Details

**Database Name**: `college_erp`
**User**: `yeduruabhiram`
**Host**: `localhost`
**Port**: `5432`
**Connection String**: `postgresql://yeduruabhiram@localhost:5432/college_erp`

---

## Method 1: Prisma Studio (Easiest - Visual Interface) ✅ RECOMMENDED

Prisma Studio provides a beautiful web interface to view and edit your database.

### Steps:

1. **Open Terminal**

2. **Navigate to backend folder**:
```bash
cd collegedata/backend
```

3. **Run Prisma Studio**:
```bash
npx prisma studio
```

4. **Open in Browser**:
- Prisma Studio will automatically open at: http://localhost:5555
- Or manually open: http://localhost:5555

### What You'll See:
- All tables listed on the left
- Click any table to view data
- Add, edit, delete records
- Beautiful visual interface
- No SQL knowledge needed!

---

## Method 2: Command Line (psql)

### Quick View Commands:

**1. Connect to database**:
```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d college_erp
```

**2. View all tables**:
```sql
\dt
```

**3. View all users**:
```sql
SELECT id, name, email, role, "createdAt" FROM "User";
```

**4. Count users**:
```sql
SELECT COUNT(*) FROM "User";
```

**5. View specific user**:
```sql
SELECT * FROM "User" WHERE email = 'testuser@example.com';
```

**6. Exit psql**:
```sql
\q
```

### Useful psql Commands:

| Command | Description |
|---------|-------------|
| `\dt` | List all tables |
| `\d "User"` | Describe User table structure |
| `\l` | List all databases |
| `\du` | List all users |
| `\conninfo` | Show connection info |
| `\q` | Quit psql |

---

## Method 3: Using GUI Tools

### Option A: pgAdmin (Free)

1. **Download**: https://www.pgadmin.org/download/
2. **Install** pgAdmin
3. **Add Server**:
   - Host: localhost
   - Port: 5432
   - Database: college_erp
   - Username: yeduruabhiram
   - Password: (leave empty if no password)

### Option B: DBeaver (Free)

1. **Download**: https://dbeaver.io/download/
2. **Install** DBeaver
3. **Create Connection**:
   - Database: PostgreSQL
   - Host: localhost
   - Port: 5432
   - Database: college_erp
   - Username: yeduruabhiram

### Option C: TablePlus (Paid, but has free trial)

1. **Download**: https://tableplus.com/
2. **Create Connection**:
   - Type: PostgreSQL
   - Host: localhost
   - Port: 5432
   - Database: college_erp
   - User: yeduruabhiram

---

## Method 4: VS Code Extension

### Install PostgreSQL Extension:

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "PostgreSQL" by Chris Kolkman
4. Install it
5. Add connection:
   - Host: localhost
   - Port: 5432
   - Database: college_erp
   - Username: yeduruabhiram

---

## Quick Database Queries

### View All Data:

```bash
# Users
/opt/homebrew/opt/postgresql@14/bin/psql -d college_erp -c 'SELECT * FROM "User";'

# Colleges
/opt/homebrew/opt/postgresql@14/bin/psql -d college_erp -c 'SELECT * FROM "College";'

# Students
/opt/homebrew/opt/postgresql@14/bin/psql -d college_erp -c 'SELECT * FROM "Student";'

# Teachers
/opt/homebrew/opt/postgresql@14/bin/psql -d college_erp -c 'SELECT * FROM "Teacher";'
```

### Count Records:

```bash
# Count all users
/opt/homebrew/opt/postgresql@14/bin/psql -d college_erp -c 'SELECT COUNT(*) as total FROM "User";'

# Count by role
/opt/homebrew/opt/postgresql@14/bin/psql -d college_erp -c 'SELECT role, COUNT(*) as count FROM "User" GROUP BY role;'
```

---

## Current Database Status

Run this to see what's in your database:

```bash
cd collegedata/backend
npx prisma studio
```

Then open: http://localhost:5555

You'll see:
- ✅ 3 Users registered
- ✅ 30 Tables created
- ✅ All data is being saved

---

## Troubleshooting

### Can't connect to database?

**Check if PostgreSQL is running**:
```bash
brew services list | grep postgresql
```

**Start PostgreSQL if stopped**:
```bash
brew services start postgresql@14
```

### Prisma Studio not opening?

**Make sure you're in backend folder**:
```bash
cd collegedata/backend
npx prisma studio
```

**If port 5555 is busy**:
```bash
npx prisma studio --port 5556
```

---

## Best Method for You

**For viewing data visually**: Use **Prisma Studio** (Method 1)
- Easiest
- No installation needed
- Beautiful interface
- Already included in project

**Command**:
```bash
cd collegedata/backend
npx prisma studio
```

**Then open**: http://localhost:5555

---

## Sample Queries to Try

Once in psql or Prisma Studio:

### 1. View all registered users:
```sql
SELECT name, email, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;
```

### 2. Find a specific user:
```sql
SELECT * FROM "User" 
WHERE email = 'testuser@example.com';
```

### 3. Count users by role:
```sql
SELECT role, COUNT(*) as count 
FROM "User" 
GROUP BY role;
```

### 4. View recent registrations:
```sql
SELECT name, email, role, "createdAt" 
FROM "User" 
WHERE "createdAt" > NOW() - INTERVAL '1 day';
```

---

## Summary

**Easiest Way**: 
```bash
cd collegedata/backend
npx prisma studio
```
Then open: http://localhost:5555

This will show you all your data in a beautiful web interface! 🎉

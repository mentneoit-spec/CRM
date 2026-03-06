# 🔧 Login Troubleshooting Guide

## Quick Fix Steps

### Step 1: Create Test Users
```bash
cd backend
node create-test-user.js
```

This will create test users for all roles with these credentials:
- **Email:** student@test.com, teacher@test.com, parent@test.com, admin@test.com
- **Password:** password123

### Step 2: Make Sure Backend is Running
```bash
cd backend
npm start
```

Should show:
```
✓ Connected to PostgreSQL via Prisma
Server running on port 5000
```

### Step 3: Make Sure Frontend is Running
```bash
cd frontend
npm start
```

Should open at: http://localhost:3000

### Step 4: Try Login
1. Go to http://localhost:3000/login
2. Select role (Student, Teacher, Parent, Admin)
3. Enter email: `student@test.com`
4. Enter password: `password123`
5. Click "Sign In"

---

## Common Login Errors & Solutions

### Error: "Invalid email or password"

**Cause:** User doesn't exist in database or wrong credentials

**Solution:**
```bash
# Create test users
cd backend
node create-test-user.js

# Or check if user exists
npx prisma studio
# Click "User" table and search for the email
```

### Error: "Network Error" or "Cannot connect"

**Cause:** Backend is not running or wrong port

**Solution:**
```bash
# Check if backend is running
# Open http://localhost:5000/api/auth/me in browser
# Should show: {"success":false,"message":"No token provided"}

# If not working, start backend:
cd backend
npm start
```

### Error: "User account is inactive"

**Cause:** User's `isActive` field is false

**Solution:**
```bash
# Open Prisma Studio
cd backend
npx prisma studio

# Go to User table
# Find the user
# Set isActive to true
# Save
```

### Error: "College is not active"

**Cause:** College status is not 'active'

**Solution:**
```bash
# Open Prisma Studio
cd backend
npx prisma studio

# Go to College table
# Find the college
# Set status to 'active'
# Save
```

### Error: "CORS Error" in browser console

**Cause:** Frontend and backend ports don't match

**Solution:**
```bash
# Check frontend .env
cat frontend/.env
# Should have: REACT_APP_API_URL=http://localhost:5000/api

# Check backend is on port 5000
# Backend should show: Server running on port 5000
```

### Error: "Token is not valid" or "Unauthorized"

**Cause:** JWT secret mismatch or expired token

**Solution:**
```bash
# Check backend .env has JWT_SECRET
cat backend/.env | grep JWT_SECRET

# If missing, add:
echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" >> backend/.env

# Restart backend
cd backend
npm start
```

---

## Debug Mode

### Enable Detailed Logging

**Backend:** Already has logging in `backend/index.js`

**Frontend:** Check browser console (F12)
- Should see: "Login response: {...}"
- Check the response structure

### Test Backend Directly

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "Test Student",
      "email": "student@test.com",
      "role": "Student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Using Browser Console:**
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@test.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Check Database

### Method 1: Prisma Studio
```bash
cd backend
npx prisma studio
```
- Open http://localhost:5555
- Click "User" table
- Check if test users exist

### Method 2: SQL Query
```bash
psql -U postgres -d smsproject
```
```sql
-- Check if users exist
SELECT id, name, email, role, "isActive" FROM "User";

-- Check specific user
SELECT * FROM "User" WHERE email = 'student@test.com';

-- Check password hash exists
SELECT email, LENGTH(password) as password_length FROM "User";
```

---

## Verify API Configuration

### Check Frontend API Config

**File:** `frontend/src/config/api.js`

Should have:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Check Frontend .env

**File:** `frontend/.env`

Should have:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Check Backend Port

**File:** `backend/.env`

Should have:
```
PORT=5000
```

---

## Test Login Flow Step-by-Step

### 1. Check Backend is Running
```bash
curl http://localhost:5000/api/auth/me
```
Expected: `{"success":false,"message":"No token provided"}`

### 2. Create Test User
```bash
cd backend
node create-test-user.js
```

### 3. Verify User Created
```bash
cd backend
npx prisma studio
```
- Click "User" table
- Look for student@test.com

### 4. Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'
```

### 5. Test Frontend Login
- Go to http://localhost:3000/login
- Enter credentials
- Check browser console (F12) for errors

---

## Password Issues

### Reset User Password

**Using Prisma Studio:**
1. Open Prisma Studio: `npx prisma studio`
2. Go to User table
3. Find the user
4. Copy this hash: `$2a$10$YourHashHere`
5. Or generate new hash:

**Generate New Password Hash:**
```javascript
// In Node.js console or create a file
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('password123', 10);
console.log(hash);
```

**Update in Database:**
```sql
UPDATE "User" 
SET password = '$2a$10$...' 
WHERE email = 'student@test.com';
```

---

## Common Mistakes

### ❌ Wrong: Using 'role' in login request
The backend doesn't use the 'role' field from the request. It gets the role from the database.

### ✅ Correct: Just send email and password
```javascript
authAPI.login({
  email: 'student@test.com',
  password: 'password123'
})
```

### ❌ Wrong: Accessing response.token directly
```javascript
if (response.token) { ... }
```

### ✅ Correct: Access from response.data
```javascript
if (response.success && response.data) {
  const { token, user } = response.data;
}
```

---

## Still Not Working?

### Check All Services

**1. PostgreSQL:**
```bash
# Windows: Check Services
# Look for "postgresql" service
# Should be "Running"
```

**2. Backend:**
```bash
cd backend
npm start
# Should show: Server running on port 5000
```

**3. Frontend:**
```bash
cd frontend
npm start
# Should open browser at http://localhost:3000
```

### Check Logs

**Backend Terminal:**
- Look for errors
- Should show: `POST /api/auth/login - 200 - 150ms`

**Browser Console (F12):**
- Look for red errors
- Check Network tab for failed requests

### Get Help

**Check these files:**
1. `backend/.env` - Has all required variables
2. `frontend/.env` - Has correct API URL
3. `backend/index.js` - Backend is running
4. `frontend/src/config/api.js` - API config is correct

**Run diagnostics:**
```bash
# Backend
cd backend
node test-insert-and-verify.js

# Check database
npx prisma studio
```

---

## Quick Reference

### Test Credentials
```
Student:  student@test.com  / password123
Teacher:  teacher@test.com  / password123
Parent:   parent@test.com   / password123
Admin:    admin@test.com    / password123
SuperAdmin: superadmin@test.com / password123
```

### Important URLs
```
Frontend:      http://localhost:3000
Backend:       http://localhost:5000
Prisma Studio: http://localhost:5555
Login Page:    http://localhost:3000/login
```

### Important Commands
```bash
# Create test users
cd backend && node create-test-user.js

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm start

# Open database
cd backend && npx prisma studio

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'
```

---

## Success Checklist

- [ ] PostgreSQL is running
- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Test users created (run create-test-user.js)
- [ ] Users exist in database (check Prisma Studio)
- [ ] Backend .env has JWT_SECRET
- [ ] Frontend .env has REACT_APP_API_URL
- [ ] No CORS errors in browser console
- [ ] Login API returns success response

---

*If you've checked everything and it still doesn't work, share the exact error message from the browser console (F12) and backend terminal.*

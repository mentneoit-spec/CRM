# 🚀 START SYSTEM - Quick Guide

## ⚡ Quick Start (2 Steps)

### Step 1: Start Backend
```bash
cd backend
npm start
```
Wait for: `✅ Server running on port 5001`

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm start
```
Wait for: Browser opens at http://localhost:3000

## 🔐 Login

Go to: http://localhost:3000/login

**Student Login:**
```
Email: john.student@testcollege.edu
Password: password123
```

## ✅ What You'll See

### Student Dashboard:
- **Attendance**: 85% (128/150 days)
- **Homework**: 5 pending assignments
- **Fees**: ₹57,000 due
- **Recent Marks**: Math (80), Science (93), English (74)
- **Upcoming Homework**: 5 assignments with due dates

## 🎯 Test Other Roles

### Teacher:
```
Email: sarah.teacher@testcollege.edu
Password: password123
```

### Parent:
```
Email: michael.parent@testcollege.edu
Password: password123
```

### Admin:
```
Email: admin.user@testcollege.edu
Password: password123
```

## 📊 Verify Data

### Check Database:
```bash
cd backend
node verify-role-tables.js
```

### View in Neon:
1. Go to: https://console.neon.tech
2. Click "SQL Editor"
3. Run: `SELECT * FROM "Student";`

## 🔧 If Something Doesn't Work

### Backend won't start:
```bash
cd backend
npm install
npm start
```

### Frontend won't start:
```bash
cd frontend
npm install
npm start
```

### No data showing:
```bash
cd backend
node add-test-data.js
```

### Can't login:
- Check backend is running (port 5001)
- Check credentials are correct
- Open browser console (F12) for errors

## 📝 Quick Commands

```bash
# Verify everything is set up
cd backend && node verify-role-tables.js

# Add more test data
cd backend && node add-test-data.js

# Check database connection
cd backend && node check-database.js

# View all data
cd backend && node show-all-data.js
```

## ✅ System Status

- ✅ Backend: http://localhost:5001
- ✅ Frontend: http://localhost:3000
- ✅ Database: Neon PostgreSQL (Cloud)
- ✅ Test Data: 150+ records
- ✅ Users: 5 (Student, Teacher, Parent, Admin, SuperAdmin)

## 🎉 You're Ready!

Your College ERP system is fully operational with real data!

**Next**: Login and explore the dashboard 🚀

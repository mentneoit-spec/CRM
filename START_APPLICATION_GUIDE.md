# 🚀 How to Start Your Application

## Quick Start (3 Steps)

### Step 1: Start Backend
```bash
# Open Terminal/Command Prompt
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\backend

# Start the backend server
npm start
```

**Expected Output:**
```
✓ Connected to PostgreSQL via Prisma
╔══════════════════════════════════════════════════════════╗
║  Multi-Tenant College ERP & CRM SaaS Platform            ║
║  Server running on port 5000                             ║
║  Environment: development                                ║
╚══════════════════════════════════════════════════════════╝
```

### Step 2: Start Frontend (New Terminal)
```bash
# Open NEW Terminal/Command Prompt
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\frontend

# Start the frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### Step 3: Open Browser
- Automatically opens at: **http://localhost:3000**
- Or manually open: **http://localhost:3000**

---

## Using VS Code (Recommended)

### Method 1: Split Terminal
1. Open VS Code
2. Open your project folder
3. Press `` Ctrl + ` `` to open terminal
4. Click the **Split Terminal** button (or press `Ctrl + Shift + 5`)
5. In **Terminal 1**: `cd backend && npm start`
6. In **Terminal 2**: `cd frontend && npm start`

### Method 2: Two Separate Terminals
1. Press `` Ctrl + ` `` to open terminal
2. Type: `cd backend && npm start`
3. Press `Ctrl + Shift + ` ` to open new terminal
4. Type: `cd frontend && npm start`

---

## Using Windows Command Prompt

### Option 1: Two Command Prompts
**Terminal 1 (Backend):**
```cmd
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\backend
npm start
```

**Terminal 2 (Frontend):**
```cmd
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\frontend
npm start
```

### Option 2: One Command (Background)
```cmd
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System

# Start backend in background
start cmd /k "cd backend && npm start"

# Start frontend in background
start cmd /k "cd frontend && npm start"
```

---

## Using PowerShell

### Two PowerShell Windows
**Window 1 (Backend):**
```powershell
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\backend
npm start
```

**Window 2 (Frontend):**
```powershell
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\frontend
npm start
```

---

## Create Startup Scripts

### Windows Batch File
Create `start-app.bat` in project root:

```batch
@echo off
echo Starting College ERP Application...
echo.

echo Starting Backend...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 5

echo Starting Frontend...
start "Frontend App" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
```

**Usage:** Double-click `start-app.bat`

### PowerShell Script
Create `start-app.ps1` in project root:

```powershell
Write-Host "Starting College ERP Application..." -ForegroundColor Green

Write-Host "`nStarting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

Start-Sleep -Seconds 5

Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "`nBoth servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
```

**Usage:** Right-click → Run with PowerShell

---

## Verify Everything is Running

### Check Backend
Open browser: **http://localhost:5000/api/auth/me**

**Expected Response:**
```json
{
  "success": false,
  "message": "No token provided"
}
```
✅ This means backend is working!

### Check Frontend
Open browser: **http://localhost:3000**

Should show your landing page.

### Check Database
```bash
cd backend
npx prisma studio
```
Opens at: **http://localhost:5555**

---

## Troubleshooting

### Problem: "Port 5000 is already in use"

**Solution 1: Kill the process**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or use PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

**Solution 2: Change port**
Edit `backend/.env`:
```
PORT=5001
```

Then update `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5001/api
```

### Problem: "Port 3000 is already in use"

**Solution:**
When prompted, press `Y` to run on different port (3001)

Or kill the process:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Problem: "Cannot connect to database"

**Check PostgreSQL is running:**
1. Press `Win + R`
2. Type `services.msc`
3. Find "postgresql" service
4. Make sure it's "Running"

**Or restart it:**
```bash
# Windows (as Administrator)
net stop postgresql-x64-15
net start postgresql-x64-15
```

### Problem: "Module not found"

**Solution:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Problem: "npm: command not found"

**Solution:**
Install Node.js from: https://nodejs.org/

---

## First Time Setup

If this is your first time running:

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Setup Database
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 3. Create Test Users
```bash
cd backend
node create-test-user.js
```

### 4. Start Application
Follow the "Quick Start" steps above.

---

## Development Workflow

### Daily Routine:

**Morning:**
```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm start
```

**During Development:**
- Backend auto-restarts on file changes (nodemon)
- Frontend auto-reloads on file changes (React)
- Just save your files and see changes!

**End of Day:**
- Press `Ctrl + C` in both terminals to stop
- Or just close the terminal windows

---

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

Creates optimized production build in `frontend/build/`

### Start Backend (Production)
```bash
cd backend
NODE_ENV=production npm start
```

---

## Useful Commands

### Backend Commands
```bash
cd backend

# Start server
npm start

# Start with auto-restart
npm run dev

# Check database
npx prisma studio

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Create test users
node create-test-user.js

# Test database
node test-insert-and-verify.js
```

### Frontend Commands
```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Check for issues
npm run lint
```

---

## Quick Reference

### URLs
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Prisma Studio:** http://localhost:5555
- **API Docs:** http://localhost:5000/api

### Test Credentials
```
Student:    student@test.com    / password123
Teacher:    teacher@test.com    / password123
Parent:     parent@test.com     / password123
Admin:      admin@test.com      / password123
SuperAdmin: superadmin@test.com / password123
```

### Stop Servers
- Press `Ctrl + C` in terminal
- Or close terminal window

### Restart Servers
- Press `Ctrl + C` to stop
- Press `↑` (up arrow) to get last command
- Press `Enter` to run again

---

## VS Code Extensions (Recommended)

Install these for better development experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **Prettier - Code formatter**
3. **ESLint**
4. **Prisma**
5. **Thunder Client** (API testing)
6. **GitLens**

---

## Monitoring

### Watch Backend Logs
Backend terminal shows:
```
POST /api/auth/login - 200 - 150ms
GET /api/admin/students - 200 - 50ms
```

### Watch Frontend Logs
Frontend terminal shows:
```
Compiled successfully!
webpack compiled with 1 warning
```

### Browser Console
Press `F12` to see:
- Network requests
- Console logs
- Errors

---

## Summary

**To start your application:**

1. Open 2 terminals
2. Terminal 1: `cd backend && npm start`
3. Terminal 2: `cd frontend && npm start`
4. Open http://localhost:3000
5. Login with test credentials

**That's it!** 🎉

---

## Need Help?

### Check if services are running:
```bash
# Check backend
curl http://localhost:5000/api/auth/me

# Check frontend
curl http://localhost:3000

# Check database
psql -U postgres -d smsproject
```

### Common Issues:
- Port already in use → Kill process or change port
- Cannot connect → Check if service is running
- Module not found → Run `npm install`
- Database error → Check PostgreSQL is running

---

*Keep both terminals open while developing. They'll show you real-time logs and errors!*

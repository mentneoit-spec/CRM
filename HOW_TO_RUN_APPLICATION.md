# 🎮 How to Run Your Application - Visual Guide

## 🎯 Three Simple Ways to Start

---

## Method 1: Double-Click Batch File ⭐ EASIEST

### Step 1: Find the File
Look for `start-app.bat` in your project folder:
```
C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\
└── start-app.bat  ← Double-click this!
```

### Step 2: Double-Click It
- Two black windows will open
- One says "Backend Server - Port 5000"
- One says "Frontend App - Port 3000"

### Step 3: Wait
- Backend takes 5-10 seconds to start
- Frontend takes 20-30 seconds to start
- Browser will open automatically at http://localhost:3000

### Step 4: Login
- Email: `admin@test.com`
- Password: `password123`
- Click "Sign In"

**Done! ✅**

---

## Method 2: VS Code Terminal (For Developers)

### Step 1: Open VS Code
- Open your project folder in VS Code
- File → Open Folder → Select `MERN-School-Management-System`

### Step 2: Open Terminal
- Press `` Ctrl + ` `` (backtick key, below Esc)
- Terminal opens at bottom

### Step 3: Split Terminal
- Click the **Split Terminal** icon (looks like two rectangles)
- Or press `Ctrl + Shift + 5`
- Now you have two terminals side by side

### Step 4: Start Backend (Left Terminal)
```bash
cd backend
npm start
```

Wait for:
```
✓ Connected to PostgreSQL via Prisma
Server running on port 5000
```

### Step 5: Start Frontend (Right Terminal)
```bash
cd frontend
npm start
```

Wait for:
```
Compiled successfully!
Local: http://localhost:3000
```

### Step 6: Browser Opens Automatically
- If not, manually open: http://localhost:3000

**Done! ✅**

---

## Method 3: Command Prompt (Windows)

### Step 1: Open First Command Prompt
- Press `Win + R`
- Type `cmd`
- Press Enter

### Step 2: Navigate and Start Backend
```cmd
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\backend
npm start
```

**Keep this window open!**

### Step 3: Open Second Command Prompt
- Press `Win + R` again
- Type `cmd`
- Press Enter

### Step 4: Navigate and Start Frontend
```cmd
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System\frontend
npm start
```

**Keep this window open too!**

### Step 5: Browser Opens
- Opens automatically at http://localhost:3000
- Or manually open it

**Done! ✅**

---

## 🎬 What You'll See

### Backend Terminal Output:
```
> college-erp-backend@1.0.0 start
> node index.js

✓ Connected to PostgreSQL via Prisma
⚠ Redis connection failed. Continuing without cache
╔══════════════════════════════════════════════════════════╗
║  Multi-Tenant College ERP & CRM SaaS Platform            ║
║  Server running on port 5000                             ║
║  Environment: development                                ║
╚══════════════════════════════════════════════════════════╝
```

### Frontend Terminal Output:
```
> frontend@0.1.0 start
> react-scripts start

Starting the development server...

Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled with 1 warning
```

### Browser:
- Landing page loads
- Click "Login" or go to http://localhost:3000/login
- Enter credentials
- Dashboard loads

---

## 🔍 Verify Everything is Working

### Test 1: Backend is Running
Open in browser: http://localhost:5000/api/auth/me

**Expected:**
```json
{
  "success": false,
  "message": "No token provided"
}
```
✅ Backend is working!

### Test 2: Frontend is Running
Open in browser: http://localhost:3000

**Expected:**
- Landing page loads
- No errors in console (F12)

✅ Frontend is working!

### Test 3: Database is Connected
In backend terminal, you should see:
```
✓ Connected to PostgreSQL via Prisma
```

✅ Database is connected!

### Test 4: Login Works
1. Go to http://localhost:3000/login
2. Email: `admin@test.com`
3. Password: `password123`
4. Click "Sign In"
5. Should redirect to dashboard

✅ Login is working!

---

## 🛑 How to Stop

### If Using Batch File:
- Close both black windows (Backend & Frontend)

### If Using VS Code:
- Click in terminal
- Press `Ctrl + C`
- Do this for both terminals

### If Using Command Prompt:
- Click in each window
- Press `Ctrl + C`
- Type `Y` if asked
- Close windows

---

## 🔄 How to Restart

### Quick Restart:
1. Press `Ctrl + C` in terminal
2. Press `↑` (up arrow) to get last command
3. Press `Enter`

### Full Restart:
1. Stop both servers (`Ctrl + C`)
2. Close terminals
3. Start again using any method above

---

## 📱 Access from Phone/Tablet

### Step 1: Find Your Computer's IP
```bash
# Windows
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

### Step 2: Open on Phone
- Make sure phone is on same WiFi
- Open browser on phone
- Go to: `http://YOUR_IP:3000`
- Example: `http://192.168.1.100:3000`

---

## 🐛 Common Issues

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Port 5000 is already in use"
**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Issue: "Cannot connect to database"
**Solution:**
1. Open Services (Win + R → `services.msc`)
2. Find "postgresql" service
3. Right-click → Start

### Issue: "Module not found"
**Solution:**
```bash
cd backend
npm install

cd ../frontend
npm install
```

### Issue: "Blank page in browser"
**Solution:**
- Wait 30 seconds for compilation
- Check terminal for errors
- Press F12 in browser, check console
- Try refreshing page (F5)

---

## 📊 Monitoring

### Backend Logs
Watch the backend terminal for:
```
POST /api/auth/login - 200 - 150ms  ← Successful login
GET /api/admin/students - 200 - 50ms  ← API call
```

### Frontend Logs
Watch the frontend terminal for:
```
Compiled successfully!  ← Good
webpack compiled with 1 warning  ← Normal
```

### Browser Console (F12)
- No red errors = Good
- Yellow warnings = Usually okay
- Red errors = Need to fix

---

## 🎯 Success Indicators

You know everything is working when:
- ✅ Backend terminal shows "Server running on port 5000"
- ✅ Frontend terminal shows "Compiled successfully!"
- ✅ Browser opens at http://localhost:3000
- ✅ Landing page loads without errors
- ✅ Can navigate to login page
- ✅ Can login with test credentials
- ✅ Dashboard loads after login

---

## 📞 Quick Help

### Backend Not Starting?
```bash
cd backend
npm install
npx prisma generate
npm start
```

### Frontend Not Starting?
```bash
cd frontend
npm install
npm start
```

### Database Issues?
```bash
cd backend
npx prisma db push
npx prisma generate
```

### Create Test Users?
```bash
cd backend
node create-test-user.js
```

---

## 🎉 You're All Set!

**To start your application right now:**

### Option 1 (Easiest):
Double-click `start-app.bat`

### Option 2 (VS Code):
1. Open VS Code
2. Open terminal (Ctrl + `)
3. Split terminal (Ctrl + Shift + 5)
4. Left: `cd backend && npm start`
5. Right: `cd frontend && npm start`

### Option 3 (Manual):
1. Open 2 command prompts
2. First: `cd backend && npm start`
3. Second: `cd frontend && npm start`

**Then:**
- Open http://localhost:3000
- Login with admin@test.com / password123
- Start using your application!

---

## 📚 More Help

- **Detailed Guide:** `START_APPLICATION_GUIDE.md`
- **Login Issues:** `LOGIN_TROUBLESHOOTING_GUIDE.md`
- **Database Help:** `POSTGRESQL_DATA_VERIFICATION_GUIDE.md`
- **Quick Reference:** `QUICK_START.md`

---

**Ready? Let's start your application!** 🚀

*Tip: Keep both terminal windows open while developing. They show real-time logs and errors.*

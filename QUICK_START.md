# ⚡ Quick Start Guide

## 🚀 Start Application (3 Ways)

### Method 1: Double-Click Batch File (Easiest)
1. Double-click `start-app.bat` in project root
2. Two windows will open (Backend & Frontend)
3. Wait for "Compiled successfully!" message
4. Open http://localhost:3000

### Method 2: PowerShell Script
1. Right-click `start-app.ps1`
2. Select "Run with PowerShell"
3. Two windows will open
4. Open http://localhost:3000

### Method 3: Manual (Two Terminals)
**Terminal 1:**
```bash
cd backend
npm start
```

**Terminal 2:**
```bash
cd frontend
npm start
```

---

## 🔑 Test Login

**URL:** http://localhost:3000/login

**Credentials:**
```
Admin:      admin@test.com      / password123
Student:    student@test.com    / password123
Teacher:    teacher@test.com    / password123
Parent:     parent@test.com     / password123
SuperAdmin: superadmin@test.com / password123
```

---

## 🛠️ First Time Setup

If you haven't set up yet:

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Setup database
cd backend
npx prisma generate
npx prisma db push

# 3. Create test users
node create-test-user.js

# 4. Start application
# Use one of the methods above
```

---

## 📊 Check Services

### Backend Running?
Open: http://localhost:5000/api/auth/me
Should show: `{"success":false,"message":"No token provided"}`

### Frontend Running?
Open: http://localhost:3000
Should show: Landing page

### Database Running?
```bash
cd backend
npx prisma studio
```
Opens: http://localhost:5555

---

## 🛑 Stop Application

- Press `Ctrl + C` in both terminals
- Or close the terminal windows

---

## 🐛 Troubleshooting

### Port 5000 already in use?
```bash
# Kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Port 3000 already in use?
Press `Y` when prompted to use port 3001

### Cannot connect to database?
1. Open Services (Win + R → services.msc)
2. Find "postgresql" service
3. Start it if stopped

### Module not found?
```bash
cd backend && npm install
cd frontend && npm install
```

---

## 📁 Project Structure

```
MERN-School-Management-System/
├── backend/              # Node.js + Express + Prisma
│   ├── controllers/      # Business logic
│   ├── routes/          # API routes
│   ├── prisma/          # Database schema
│   └── utils/           # Helper functions
├── frontend/            # React + Material-UI
│   ├── src/
│   │   ├── pages/       # All pages
│   │   ├── components/  # Reusable components
│   │   └── config/      # API configuration
├── start-app.bat        # Windows startup script
└── start-app.ps1        # PowerShell startup script
```

---

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend | http://localhost:5000 | API server |
| Prisma Studio | http://localhost:5555 | Database viewer |
| API Test | http://localhost:5000/api/auth/me | Check backend |

---

## 📝 Common Commands

```bash
# Backend
cd backend
npm start              # Start server
npx prisma studio      # Open database viewer
node create-test-user.js  # Create test users

# Frontend
cd frontend
npm start              # Start dev server
npm run build          # Build for production

# Database
cd backend
npx prisma generate    # Generate Prisma Client
npx prisma db push     # Sync database
npx prisma studio      # View database
```

---

## ✅ Checklist

Before starting development:
- [ ] Node.js installed
- [ ] PostgreSQL running
- [ ] Dependencies installed (`npm install`)
- [ ] Database synced (`npx prisma db push`)
- [ ] Test users created (`node create-test-user.js`)
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login with test credentials

---

## 🎯 Next Steps

1. **Start the application** using one of the methods above
2. **Login** with test credentials
3. **Explore** the existing features
4. **Review** the implementation plan
5. **Start building** following the patterns provided

---

## 💡 Pro Tips

- Keep both terminals open while developing
- Backend auto-restarts on file changes
- Frontend auto-reloads on file changes
- Use Prisma Studio to view/edit database
- Check browser console (F12) for errors
- Check terminal logs for backend errors

---

## 📞 Need Help?

1. Check `START_APPLICATION_GUIDE.md` for detailed instructions
2. Check `LOGIN_TROUBLESHOOTING_GUIDE.md` for login issues
3. Check `POSTGRESQL_DATA_VERIFICATION_GUIDE.md` for database issues
4. Check browser console (F12) for frontend errors
5. Check terminal logs for backend errors

---

**Ready to start? Double-click `start-app.bat` or run the commands above!** 🚀

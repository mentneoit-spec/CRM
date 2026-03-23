# ⚡ Quick Start Guide

Get the app running in 5 minutes!

## 1️⃣ Install Dependencies

```bash
# Backend
cd marks-email-feature/backend
npm install

# Frontend (new terminal)
cd marks-email-feature/frontend
npm install
```

## 2️⃣ Setup Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to https://myaccount.google.com/apppasswords
4. Generate password for "Mail"
5. Copy the 16-character password

## 3️⃣ Create Backend .env

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/student_marks_db
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

## 4️⃣ Start MongoDB

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) - update MONGO_URI
```

## 5️⃣ Run the App

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## 6️⃣ Create Test Student

Open browser console at http://localhost:3000 and run:

```javascript
fetch('http://localhost:5000/api/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'STU001',
    name: 'Test Student',
    email: 'your-test-email@gmail.com',
    class: '10th Grade'
  })
}).then(r => r.json()).then(console.log);
```

## 7️⃣ Test the Feature

1. Refresh the page
2. Select student from dropdown
3. Enter marks
4. Click "Send Marks & Email"
5. Check email inbox!

---

## 🎯 URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Backend server running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Gmail App Password configured
- [ ] Test student created
- [ ] Email received successfully

---

**That's it! You're ready to go! 🚀**

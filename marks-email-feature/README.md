# 📊 Student Marks Email System - Full Stack MERN

A complete full-stack application where admins can enter student marks and automatically send them via email to students' registered email addresses.

## 🎯 Features

- Admin form to enter student marks
- Automatic email notification to students
- Beautiful HTML email template with grades
- Student management
- Marks history tracking
- Responsive UI design

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Nodemailer (Gmail SMTP)

### Frontend
- React.js
- Axios
- CSS3

## 📁 Folder Structure

```
marks-email-feature/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── email.js           # Nodemailer configuration
│   ├── models/
│   │   ├── Student.js         # Student schema
│   │   └── Marks.js           # Marks schema
│   ├── routes/
│   │   └── marks.js           # API routes
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Express server
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarksForm.js   # Form to enter marks
│   │   │   └── StudentsList.js # Display students
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🚀 Step-by-Step Setup

### Prerequisites

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/

2. **MongoDB** (Local or Cloud)
   - Local: https://www.mongodb.com/try/download/community
   - Cloud (MongoDB Atlas): https://www.mongodb.com/cloud/atlas

3. **Gmail Account** (for sending emails)
   - You'll need to generate an App Password

---

## 📧 Gmail SMTP Setup (IMPORTANT!)

Before running the app, you need to configure Gmail:

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Student Marks App"
4. Click "Generate"
5. Copy the 16-character password (you'll use this in .env)

---

## 🔧 Backend Setup

### 1. Navigate to backend folder
```bash
cd marks-email-feature/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
Create a file named `.env` in the backend folder:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/student_marks_db

# Server Port
PORT=5000

# Gmail SMTP Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `your-16-char-app-password` with the App Password from Gmail

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student_marks_db?retryWrites=true&w=majority
```

### 4. Start the backend server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
✓ MongoDB Connected: localhost
╔════════════════════════════════════════╗
║  Student Marks Email API               ║
║  Server running on port 5000           ║
║  Environment: development              ║
╚════════════════════════════════════════╝
```

---

## 🎨 Frontend Setup

### 1. Open a NEW terminal and navigate to frontend folder
```bash
cd marks-email-feature/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the frontend
```bash
npm start
```

The app will automatically open at http://localhost:3000

---

## 🧪 Testing the Application

### Step 1: Create a Test Student

Use Postman, Thunder Client, or curl:

```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "name": "John Doe",
    "email": "student@example.com",
    "phone": "1234567890",
    "class": "10th Grade"
  }'
```

Or use this JavaScript in browser console:
```javascript
fetch('http://localhost:5000/api/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'STU001',
    name: 'John Doe',
    email: 'your-test-email@gmail.com',
    phone: '1234567890',
    class: '10th Grade'
  })
}).then(r => r.json()).then(console.log);
```

**Important:** Use a real email address you can access to test!

### Step 2: Send Marks via Frontend

1. Open http://localhost:3000
2. Select the student from dropdown
3. Enter subject (e.g., "Mathematics")
4. Enter marks (e.g., 85)
5. Enter total marks (e.g., 100)
6. Select exam type
7. Click "Send Marks & Email"

### Step 3: Check Email

Check the student's email inbox for the results email!

---

## 📡 API Endpoints

### 1. Create Student
```http
POST /api/students
Content-Type: application/json

{
  "studentId": "STU001",
  "name": "John Doe",
  "email": "student@example.com",
  "phone": "1234567890",
  "class": "10th Grade"
}
```

### 2. Get All Students
```http
GET /api/students
```

### 3. Send Marks (Main Feature)
```http
POST /api/send-marks
Content-Type: application/json

{
  "studentId": "STU001",
  "subject": "Mathematics",
  "marks": 85,
  "totalMarks": 100,
  "examType": "Final"
}
```

### 4. Get Student Marks History
```http
GET /api/marks/STU001
```

---

## 🎨 Email Template Preview

The email sent to students includes:
- Beautiful gradient header
- Student name and subject
- Marks obtained and total marks
- Percentage calculation
- Automatic grade assignment (A+, A, B+, B, C, D, F)
- Congratulatory or motivational message
- Professional footer

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Email Not Sending
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:** 
1. Make sure you're using App Password, not regular Gmail password
2. Enable 2-Factor Authentication first
3. Generate new App Password
4. Check EMAIL_USER and EMAIL_PASSWORD in .env

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in backend/.env to 5001 or kill the process using port 5000

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Make sure backend is running and cors is enabled (already configured)

---

## 🔒 Security Notes

1. **Never commit .env file** - It contains sensitive credentials
2. **Use App Passwords** - Never use your actual Gmail password
3. **Validate Input** - All inputs are validated on backend
4. **Rate Limiting** - Consider adding rate limiting for production
5. **Environment Variables** - Always use .env for sensitive data

---

## 🚀 Production Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables in hosting platform
2. Use MongoDB Atlas for database
3. Deploy from GitHub

### Frontend (Netlify/Vercel)
1. Build: `npm run build`
2. Deploy build folder
3. Set API URL environment variable

---

## 📝 Additional Features You Can Add

- [ ] Multiple recipients (CC to parents)
- [ ] PDF attachment of marks
- [ ] SMS notification
- [ ] Bulk marks upload via CSV
- [ ] Student login to view marks history
- [ ] Analytics dashboard
- [ ] Email templates customization
- [ ] Scheduled email sending

---

## 🤝 Contributing

Feel free to fork and improve this project!

---

## 📄 License

MIT License - Free to use for educational purposes

---

## 👨‍💻 Author

Built with ❤️ for educational purposes

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all environment variables
3. Check MongoDB connection
4. Verify Gmail App Password setup

---

**Happy Coding! 🎉**

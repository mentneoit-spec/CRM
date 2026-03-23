# ⚡ Quick Test - Marks Email Feature

## Step 1: Configure Email

Edit `backend/.env` and add:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

Get App Password from: https://myaccount.google.com/apppasswords

---

## Step 2: Restart Backend

```bash
cd backend
npm start
```

---

## Step 3: Test the API

### Option 1: Using Postman/Thunder Client

1. **Login as Admin:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@college.com",
  "password": "admin123"
}
```

Copy the `token` from response.

2. **Get a Student:**
```http
GET http://localhost:5000/api/admin/students
Authorization: Bearer YOUR_TOKEN
```

Copy a `student.id` and verify they have an email.

3. **Get a Subject:**
```http
GET http://localhost:5000/api/admin/subjects
Authorization: Bearer YOUR_TOKEN
```

Copy a `subject.id`.

4. **Send Marks Email:**
```http
POST http://localhost:5000/api/admin/marks/send-email
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "studentId": "paste-student-id-here",
  "subjectId": "paste-subject-id-here",
  "marks": 85,
  "totalMarks": 100,
  "remarks": "Excellent work!"
}
```

5. **Check the student's email inbox!**

---

### Option 2: Using Browser Console

1. Open your frontend at http://localhost:3001
2. Login as admin
3. Open browser console (F12)
4. Run this:

```javascript
// Get your auth token from localStorage
const token = localStorage.getItem('token');

// Replace these with actual IDs from your database
const studentId = 'your-student-uuid';
const subjectId = 'your-subject-uuid';

fetch('http://localhost:5000/api/admin/marks/send-email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentId: studentId,
    subjectId: subjectId,
    marks: 92,
    totalMarks: 100,
    remarks: 'Great job!'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## Expected Result

✅ API Response:
```json
{
  "success": true,
  "message": "Marks saved and email sent successfully",
  "data": {
    "student": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "marks": {
      "subject": "Mathematics",
      "marks": 85,
      "totalMarks": 100,
      "percentage": "85.00",
      "grade": "A"
    }
  }
}
```

✅ Email received in student's inbox with:
- Subject: "Exam Results - Mathematics"
- Beautiful HTML template
- Marks, percentage, and grade
- Motivational message

---

## Troubleshooting

❌ **"Email configuration not found"**
- Add EMAIL_USER and EMAIL_PASSWORD to backend/.env
- Restart backend server

❌ **"Student not found"**
- Use correct student UUID
- Make sure student belongs to your college

❌ **"Subject not found"**
- Use correct subject UUID
- Make sure subject exists in database

❌ **Email not received**
- Check spam folder
- Verify EMAIL_PASSWORD is correct App Password
- Check backend console for errors

---

**That's it! Your marks email feature is ready to use! 🎉**

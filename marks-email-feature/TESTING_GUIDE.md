# 🧪 Testing Guide

Complete guide to test the Student Marks Email System.

## Prerequisites

✅ Backend running on http://localhost:5000  
✅ Frontend running on http://localhost:3000  
✅ MongoDB connected  
✅ Gmail App Password configured in .env  

---

## Method 1: Using the Frontend (Recommended)

### Step 1: Seed Sample Data

```bash
cd backend
node seed-data.js
```

This creates 5 sample students.

### Step 2: Update Email Addresses

Before testing, update at least one student's email to your real email:

```javascript
// Run in browser console at http://localhost:3000
fetch('http://localhost:5000/api/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'TEST001',
    name: 'Your Name',
    email: 'your-real-email@gmail.com',
    class: '10th Grade'
  })
}).then(r => r.json()).then(console.log);
```

### Step 3: Send Marks via UI

1. Open http://localhost:3000
2. Select student from dropdown
3. Fill in the form:
   - Subject: Mathematics
   - Marks: 85
   - Total Marks: 100
   - Exam Type: Final
4. Click "Send Marks & Email"
5. Wait for success message
6. Check your email!

---

## Method 2: Using Test Script

```bash
cd backend
node test-api.js
```

**Before running:** Edit `test-api.js` and change the email to your real email address.

---

## Method 3: Using Postman/Thunder Client

### 1. Create Student

```http
POST http://localhost:5000/api/students
Content-Type: application/json

{
  "studentId": "STU999",
  "name": "Test Student",
  "email": "your-email@gmail.com",
  "phone": "9876543210",
  "class": "10th Grade"
}
```

### 2. Send Marks

```http
POST http://localhost:5000/api/send-marks
Content-Type: application/json

{
  "studentId": "STU999",
  "subject": "Physics",
  "marks": 92,
  "totalMarks": 100,
  "examType": "Final"
}
```

### 3. Get All Students

```http
GET http://localhost:5000/api/students
```

### 4. Get Student Marks History

```http
GET http://localhost:5000/api/marks/STU999
```

---

## Method 4: Using cURL

### Create Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU888",
    "name": "Curl Test",
    "email": "your-email@gmail.com",
    "class": "11th Grade"
  }'
```

### Send Marks
```bash
curl -X POST http://localhost:5000/api/send-marks \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU888",
    "subject": "Chemistry",
    "marks": 78,
    "totalMarks": 100
  }'
```

---

## 📧 Email Testing Checklist

After sending marks, check:

- [ ] Email received in inbox (check spam folder too)
- [ ] Subject line: "Exam Results - [Subject Name]"
- [ ] Student name displayed correctly
- [ ] Marks and percentage calculated correctly
- [ ] Grade assigned correctly (A+, A, B+, B, C, D, F)
- [ ] Email formatting looks good
- [ ] Motivational message displayed

---

## 🎯 Expected Email Content

You should receive an email with:

```
Subject: Exam Results - Mathematics

Dear [Student Name],

Your exam results for Mathematics have been published.

┌─────────────────────────────┐
│ Subject: Mathematics        │
│ Marks Obtained: 85 / 100    │
│ Percentage: 85.00%          │
└─────────────────────────────┘

Grade: A

🎉 Congratulations! Keep up the good work!
```

---

## 🐛 Troubleshooting

### Email Not Received?

1. **Check spam folder**
2. **Verify Gmail settings:**
   ```bash
   # Check .env file
   cat backend/.env
   ```
3. **Test email configuration:**
   ```javascript
   // Add this to backend/server.js temporarily
   const { sendMarksEmail } = require('./config/email');
   sendMarksEmail('your-email@gmail.com', 'Test', 'Math', 85, 100);
   ```

### "Student not found" error?

```bash
# Check if student exists
curl http://localhost:5000/api/students
```

### Database connection error?

```bash
# Check MongoDB status
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl status mongod
```

---

## 📊 Test Scenarios

### Scenario 1: High Marks (A+ Grade)
```json
{
  "studentId": "STU001",
  "subject": "Mathematics",
  "marks": 95,
  "totalMarks": 100
}
```
Expected: Grade A+, Congratulations message

### Scenario 2: Passing Marks (C Grade)
```json
{
  "studentId": "STU001",
  "subject": "Science",
  "marks": 55,
  "totalMarks": 100
}
```
Expected: Grade C, Motivational message

### Scenario 3: Failing Marks (F Grade)
```json
{
  "studentId": "STU001",
  "subject": "English",
  "marks": 35,
  "totalMarks": 100
}
```
Expected: Grade F, Encouragement message

### Scenario 4: Different Total Marks
```json
{
  "studentId": "STU001",
  "subject": "Practical",
  "marks": 40,
  "totalMarks": 50
}
```
Expected: 80%, Grade A

---

## 🔍 Validation Tests

### Test Invalid Data

1. **Missing required fields:**
```json
{
  "studentId": "STU001"
  // Missing subject and marks
}
```
Expected: 400 error

2. **Marks out of range:**
```json
{
  "studentId": "STU001",
  "subject": "Math",
  "marks": 150,
  "totalMarks": 100
}
```
Expected: 400 error

3. **Non-existent student:**
```json
{
  "studentId": "INVALID",
  "subject": "Math",
  "marks": 85,
  "totalMarks": 100
}
```
Expected: 404 error

---

## 📈 Performance Testing

Send multiple marks in sequence:

```bash
# Run this script
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/send-marks \
    -H "Content-Type: application/json" \
    -d "{
      \"studentId\": \"STU001\",
      \"subject\": \"Subject $i\",
      \"marks\": $((RANDOM % 100)),
      \"totalMarks\": 100
    }"
  sleep 2
done
```

Check:
- All emails received
- No duplicates
- Correct order

---

## ✅ Final Checklist

Before considering testing complete:

- [ ] Created at least 3 students
- [ ] Sent marks to all students
- [ ] Received all emails
- [ ] Verified email formatting
- [ ] Tested different grade ranges
- [ ] Tested error scenarios
- [ ] Checked marks history API
- [ ] Verified database records

---

## 🎉 Success Criteria

Your system is working correctly if:

1. ✅ Students can be created via API
2. ✅ Frontend displays all students
3. ✅ Marks can be submitted via form
4. ✅ Emails are sent successfully
5. ✅ Email content is formatted correctly
6. ✅ Grades are calculated accurately
7. ✅ Marks are saved to database
8. ✅ History can be retrieved

---

**Happy Testing! 🚀**

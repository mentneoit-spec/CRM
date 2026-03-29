# 📧 How to Find the Send Marks Email Page

## Step-by-Step Guide

### Step 1: Look at the Left Sidebar
You should see a menu item called **"Academics"** with an Assignment icon (📋).

### Step 2: Click on "Academics"
When you click on it, it will expand to show these sub-items:
- ✓ Attendance
- ✓ Homework
- ✓ Exams
- ✓ Results
- ✓ **Send Marks Email** ← Click this one!

### Step 3: Access the Page
Click on "Send Marks Email" and you'll be taken to:
```
http://localhost:3002/admin/send-marks-email
```

---

## Direct Access

You can also directly type this URL in your browser:
```
http://localhost:3002/admin/send-marks-email
```

---

## What You'll See

Once you're on the page, you'll see:
- 📧 **Send Marks via Email** heading
- Form with dropdowns for:
  - Select Student
  - Select Subject
  - Select Exam (Optional)
  - Marks Obtained
  - Total Marks
  - Remarks (Optional)
- **Send Marks & Email** button
- Email preview on the right side

---

## Menu Location in Sidebar

```
📊 Dashboard
📚 Academic
   ├─ Classes & Sections
   ├─ Subjects
   ├─ Teachers
   └─ Students
📋 Academics ← CLICK HERE FIRST
   ├─ Attendance
   ├─ Homework
   ├─ Exams
   ├─ Results
   └─ 📧 Send Marks Email ← THEN CLICK HERE
⚖️ Admissions
💰 Finance
🚌 Transport
🔔 Communication
👥 Organization
📊 Reports ← You are currently here
⚙️ Settings
```

---

## Troubleshooting

### If you don't see "Academics" menu:
1. Scroll up in the sidebar
2. It should be near the top, after "Dashboard"

### If "Academics" doesn't expand:
1. Make sure you're clicking directly on "Academics"
2. Try refreshing the page (F5)

### If the page shows an error:
1. Make sure both servers are running:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3002
2. Check that you're logged in as Admin

---

## Quick Test

Once you're on the page, try this:
1. Select student: **Rohan Singh**
2. Select subject: **Biology**
3. Enter marks: **85**
4. Total marks: **100**
5. Click **Send Marks & Email**

You should see a success message! ✅

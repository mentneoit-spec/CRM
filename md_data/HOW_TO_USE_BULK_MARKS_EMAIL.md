# 🚀 How to Use Bulk Marks Email Feature

## Overview
The "Send Marks Email" page now has **2 tabs**:
1. **Single Entry** - Send to one student at a time
2. **Bulk Upload (CSV)** - Send to many students at once

---

## Visual Guide

### Page Layout
```
┌─────────────────────────────────────────────────────────┐
│  📧 Send Marks via Email                                 │
│  Send marks to students individually or in bulk via CSV  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [📝 Single Entry]  [📤 Bulk Upload (CSV)]              │
│   ← Click tabs to switch                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Tab 1: Single Entry (Same as Before)

```
┌──────────────────────────────────────┐
│  Select Student: [Dropdown]          │
│  Select Subject: [Dropdown]          │
│  Select Exam: [Dropdown] (Optional)  │
│  Marks Obtained: [___]               │
│  Total Marks: [100]                  │
│  Remarks: [Text area]                │
│                                      │
│  [Send Marks & Email]                │
└──────────────────────────────────────┘
```

---

## Tab 2: Bulk Upload (NEW!)

```
┌──────────────────────────────────────┐
│  Step 1: Download Template           │
│  [Download CSV Template]             │
│                                      │
│  Step 2: Upload CSV File             │
│  [Select CSV File]                   │
│  Selected: marks.csv (2.5 KB)       │
│                                      │
│  [Upload & Send Emails to All]       │
└──────────────────────────────────────┘
```

---

## Step-by-Step: Bulk Upload

### 1. Click "Bulk Upload (CSV)" Tab
```
[📝 Single Entry]  [📤 Bulk Upload (CSV)] ← Click here
                    ^^^^^^^^^^^^^^^^^^^^
```

### 2. Download Template
```
Click: [Download CSV Template]
↓
File downloaded: marks_email_template.csv
```

### 3. Open in Excel
```
student_email              | subject_code | marks_obtained | total_marks
---------------------------|--------------|----------------|------------
john.doe@student.edu       | MATH101      | 85             | 100
jane.smith@student.edu     | MATH101      | 92             | 100
```

### 4. Fill Your Data
Add your students' marks:
```
student_email              | subject_code | exam_name  | marks_obtained | total_marks | remarks
---------------------------|--------------|------------|----------------|-------------|------------------
rohan.singh@student.edu    | BIO10        | Mid Term   | 85             | 100         | Good work
aditya.verma@student.edu   | CHEM12       | Mid Term   | 92             | 100         | Excellent
aryan.singh@student.edu    | CS12         | Mid Term   | 78             | 100         | Keep practicing
```

### 5. Save the File
Save as: `my_marks.csv`

### 6. Upload
```
Click: [Select CSV File]
↓
Choose: my_marks.csv
↓
Click: [Upload & Send Emails to All]
```

### 7. See Results
```
┌─────────────────────────────────────┐
│  Upload Results                      │
├─────────────────────────────────────┤
│  ✅ Emails Sent: 3                  │
│  ⚠️  Skipped: 0                     │
│  ❌ Errors: 0                       │
└─────────────────────────────────────┘
```

---

## What Students See

### 1. Email Notification
```
From: Your College <noreply@college.com>
To: rohan.singh@student.edu
Subject: Exam Results - Biology

📊 Exam Results
Your College

Dear Rohan Singh,

Your exam results for Biology have been published.

Class: 10B
Subject: Biology
Marks Obtained: 85 / 100
Percentage: 85.00%

Grade: A

🎉 Congratulations! Keep up the good work!
```

### 2. Student Portal
Students login and see:
```
┌─────────────────────────────────────┐
│  My Results                          │
├─────────────────────────────────────┤
│  Subject    | Marks  | Grade | %    │
│  Biology    | 85/100 | A     | 85%  │
│  Chemistry  | 92/100 | A+    | 92%  │
│  Comp Sci   | 78/100 | B+    | 78%  │
└─────────────────────────────────────┘
```

---

## CSV Format Rules

### ✅ Required Columns
```
student_email     - Must be valid email
subject_code      - Must exist in system
marks_obtained    - Number (0 to total_marks)
total_marks       - Number (greater than 0)
```

### ⭐ Optional Columns
```
exam_name         - Name of the exam
remarks           - Teacher's comments
```

### ❌ Common Mistakes
```
❌ Wrong: student_email = "john"
✅ Right: student_email = "john@student.edu"

❌ Wrong: marks_obtained = "85 marks"
✅ Right: marks_obtained = "85"

❌ Wrong: subject_code = "Mathematics"
✅ Right: subject_code = "MATH101"
```

---

## Example: Complete Workflow

### Scenario
Send Mid Term marks for Biology to 5 students

### Step 1: Prepare CSV
```csv
student_email,subject_code,exam_name,marks_obtained,total_marks,remarks
rohan.singh@student.edu,BIO10,Mid Term,85,100,Good understanding
aditya.verma@student.edu,BIO10,Mid Term,92,100,Excellent work
aryan.singh@student.edu,BIO10,Mid Term,78,100,Needs improvement
zara.khan@student.edu,BIO10,Mid Term,88,100,Very good
sakshi.nair@student.edu,BIO10,Mid Term,95,100,Outstanding
```

### Step 2: Upload
1. Go to Send Marks Email page
2. Click "Bulk Upload (CSV)" tab
3. Click "Select CSV File"
4. Choose your file
5. Click "Upload & Send Emails to All"

### Step 3: Results
```
✅ 5 emails sent successfully
⚠️  0 skipped
❌ 0 errors

All students received their marks via email!
```

### Step 4: Verification
- Check student portal
- All 5 students can see their marks
- Grades calculated automatically
- Results available immediately

---

## Benefits

### Time Saving
- **Before**: 5 minutes per student × 100 students = 500 minutes (8+ hours)
- **After**: 5 minutes total for 100 students = 5 minutes
- **Saved**: 495 minutes (8+ hours)!

### Accuracy
- No manual typing errors
- Automatic calculations
- Consistent formatting
- Validated data

### Convenience
- Upload once, email all
- Works offline (prepare CSV)
- Bulk processing
- Instant results

---

## Troubleshooting

### "Student not found"
- Check email is correct
- Verify student exists in system
- Check for typos

### "Subject not found"
- Use subject CODE not name
- Check subject exists
- Verify spelling

### "Invalid marks"
- Marks must be number
- Must be between 0 and total_marks
- No text or symbols

---

## Quick Reference

### Access Page
Dashboard → Quick Actions → "Send Marks Email" (purple button)

### Switch Modes
Click tabs at top: "Single Entry" or "Bulk Upload (CSV)"

### Download Template
Bulk Upload tab → "Download CSV Template" button

### Upload File
Bulk Upload tab → "Select CSV File" → "Upload & Send Emails to All"

### Check Results
Results appear automatically after upload

---

Ready to send marks to hundreds of students in seconds! 🚀

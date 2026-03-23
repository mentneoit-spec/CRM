# Data Visibility Map - Where to Find Everything

## Quick Navigation Guide

---

## 📊 STUDENT DASHBOARD
**URL**: `/student/dashboard`
**Login**: Any student email

### What You'll See
```
┌─────────────────────────────────────────┐
│ Student Profile Card                    │
│ ├─ Name, ID, Class, Section            │
│ ├─ Email, Phone, DOB, Gender           │
│ └─ Parent Info, Address                │
├─────────────────────────────────────────┤
│ Student Details Grid                    │
│ ├─ Student ID: STU001-STU004           │
│ ├─ Class: Class 10-A, 10-B, 11-A       │
│ ├─ Section: A, B, C                    │
│ ├─ Roll Number                         │
│ ├─ Email & Phone                       │
│ ├─ DOB & Gender                        │
│ ├─ Board & Group                       │
│ └─ Parent/Guardian Info                │
├─────────────────────────────────────────┤
│ Quick Actions                           │
│ ├─ Homework                            │
│ ├─ Tests                               │
│ ├─ Marks                               │
│ └─ Attendance                          │
├─────────────────────────────────────────┤
│ Today's Homework                        │
│ └─ Latest assignment due today         │
├─────────────────────────────────────────┤
│ Today's Attendance                      │
│ └─ Present/Absent/Leave/Sick           │
├─────────────────────────────────────────┤
│ Next Exam                               │
│ └─ Upcoming exam date and subject      │
├─────────────────────────────────────────┤
│ Recent Payments (Last 5)                │
│ ├─ Amount: ₹1000-₹5000                 │
│ ├─ Date: Payment date                  │
│ ├─ Status: Completed/Pending           │
│ └─ Download Receipt Button              │
└─────────────────────────────────────────┘
```

**Data Count**: 1 student profile + 5 recent payments

---

## 📚 STUDENT MARKS PAGE
**URL**: `/student/marks`
**Login**: Any student email

### What You'll See
```
┌─────────────────────────────────────────┐
│ Marks Overview                          │
├─────────────────────────────────────────┤
│ Summary Statistics                      │
│ ├─ Total Subjects: 3                   │
│ ├─ Marks Obtained: XX / 300             │
│ └─ Overall Percentage: XX%              │
├─────────────────────────────────────────┤
│ Exam Results Table                      │
│ ├─ Exam Name                           │
│ ├─ Subject Name                        │
│ ├─ Marks Obtained / Max Marks          │
│ ├─ Percentage                          │
│ └─ Grade (A+, A, B, C)                 │
└─────────────────────────────────────────┘
```

**Data Count**: 6 exam results per student (2 exams × 3 subjects)

---

## 📅 STUDENT ATTENDANCE PAGE
**URL**: `/student/attendance`
**Login**: Any student email

### What You'll See
```
┌─────────────────────────────────────────┐
│ Attendance Calendar                     │
├─────────────────────────────────────────┤
│ Monthly Summary                         │
│ ├─ Total Days: 20                      │
│ ├─ Present: 17                         │
│ ├─ Absent: 3                           │
│ └─ Percentage: 85%                     │
└─────────────────────────────────────────┘
```

**Data Count**: 60 attendance records per student (3 subjects × 20 days)

---

## 📝 STUDENT HOMEWORK PAGE
**URL**: `/student/homework`
**Login**: Any student email

### What You'll See
```
┌─────────────────────────────────────────┐
│ Homework Assignments                    │
├─────────────────────────────────────────┤
│ Pending Homework                        │
│ ├─ Title: Chapter 1 - Introduction     │
│ ├─ Subject: Mathematics                │
│ ├─ Due Date: Future date               │
│ ├─ Description: Assignment details     │
│ └─ Attachments: Files/Images           │
├─────────────────────────────────────────┤
│ Overdue Homework                        │
│ ├─ Title: Practice Problems Set A      │
│ ├─ Subject: English                    │
│ ├─ Due Date: Past date                 │
│ └─ Status: Overdue                     │
└─────────────────────────────────────────┘
```

**Data Count**: 36 homework assignments total (all students see their assigned homework)

---

## 💰 STUDENT FEES PAGE
**URL**: `/student/fees`
**Login**: Any student email

### What You'll See
```
┌─────────────────────────────────────────┐
│ Fees Overview                           │
├─────────────────────────────────────────┤
│ Fee Summary                             │
│ ├─ Total Fees: ₹XXXX                   │
│ ├─ Amount Paid: ₹XXXX                  │
│ ├─ Amount Pending: ₹XXXX               │
│ └─ Payment Percentage: XX%             │
├─────────────────────────────────────────┤
│ Fees List                               │
│ ├─ Fee Type: Tuition/Transport/Hostel  │
│ ├─ Amount: ₹1000-₹5000                 │
│ ├─ Due Date: Date                      │
│ ├─ Status: Paid/Pending                │
│ └─ Pay Now Button (Razorpay)           │
├─────────────────────────────────────────┤
│ Payment History                         │
│ ├─ Amount: ₹XXXX                       │
│ ├─ Date: Payment date                  │
│ ├─ Status: Completed/Pending           │
│ └─ Download Receipt                    │
└─────────────────────────────────────────┘
```

**Data Count**: 11 fees total + 7 payments (distributed across 4 students)

---

## 👨‍🏫 TEACHER ASSIGNMENTS PAGE
**URL**: `/teacher/assignments`
**Login**: Any teacher email

### What You'll See
```
┌─────────────────────────────────────────┐
│ Assignments / Homework                  │
├─────────────────────────────────────────┤
│ Create Button                           │
├─────────────────────────────────────────┤
│ Homework Table                          │
│ ├─ Title: Chapter 1 - Introduction     │
│ ├─ Subject: Mathematics                │
│ ├─ Section: A / All                    │
│ ├─ Due Date: Date                      │
│ ├─ View Button                         │
│ ├─ Edit Button                         │
│ └─ Delete Button                       │
├─────────────────────────────────────────┤
│ View Dialog                             │
│ ├─ Title                               │
│ ├─ Subject                             │
│ ├─ Section                             │
│ ├─ Due Date                            │
│ ├─ Description                         │
│ └─ Attachments (Images/PDFs)           │
├─────────────────────────────────────────┤
│ Edit Dialog                             │
│ ├─ Subject Dropdown                    │
│ ├─ Section Dropdown                    │
│ ├─ Title Input                         │
│ ├─ Description Textarea                │
│ ├─ Due Date Picker                     │
│ ├─ Upload Attachments                  │
│ └─ Save Button                         │
└─────────────────────────────────────────┘
```

**Data Count**: 36 homework assignments (18 per teacher)

---

## 📊 ADMIN ANALYTICS DASHBOARD
**URL**: `/admin/analytics`
**Login**: `abhiyeduru@gmail.com` / `abhiyeduru`

### What You'll See
```
┌─────────────────────────────────────────┐
│ Analytics Dashboard                     │
├─────────────────────────────────────────┤
│ Summary Cards                           │
│ ├─ Total Students: 4                   │
│ ├─ Total Teachers: 2                   │
│ ├─ Total Classes: 3                    │
│ ├─ Total Subjects: 3                   │
│ └─ Total Exams: 2                      │
├─────────────────────────────────────────┤
│ Charts & Graphs                         │
│ ├─ Student Distribution                │
│ ├─ Exam Results Overview               │
│ ├─ Class-wise Breakdown                │
│ └─ Subject Performance                 │
└─────────────────────────────────────────┘
```

**Data Count**: 4 students + 2 teachers + 3 classes + 3 subjects + 2 exams

---

## 📋 ADMIN RESULTS PAGE
**URL**: `/admin/results`
**Login**: `abhiyeduru@gmail.com` / `abhiyeduru`

### What You'll See
```
┌─────────────────────────────────────────┐
│ Exam Results                            │
├─────────────────────────────────────────┤
│ Filters                                 │
│ ├─ Student Filter                      │
│ ├─ Exam Filter                         │
│ └─ Subject Filter                      │
├─────────────────────────────────────────┤
│ Results Table                           │
│ ├─ Student Name: STU001-STU004         │
│ ├─ Exam Name: Mid-Term / Final         │
│ ├─ Subject: Mathematics / English / Science
│ ├─ Marks Obtained: 60-100              │
│ ├─ Grade: A+ / A / B / C               │
│ └─ Percentage: XX%                     │
└─────────────────────────────────────────┘
```

**Data Count**: 24 exam results (2 exams × 3 subjects × 4 students)

---

## 💳 ADMIN RECEIPTS PAGE
**URL**: `/admin/receipts`
**Login**: `abhiyeduru@gmail.com` / `abhiyeduru`

### What You'll See
```
┌─────────────────────────────────────────┐
│ Receipts & Payments                     │
├─────────────────────────────────────────┤
│ Tab 1: All Receipts                     │
│ ├─ Student Name                        │
│ ├─ Amount: ₹1000-₹5000                 │
│ ├─ Payment Date                        │
│ ├─ Status: Completed/Pending           │
│ └─ Payment Method: Razorpay/Cash/Bank  │
├─────────────────────────────────────────┤
│ Tab 2: Student Payments                 │
│ ├─ Student Name: STU001-STU004         │
│ ├─ Total Fees: ₹XXXX                   │
│ ├─ Amount Paid: ₹XXXX                  │
│ ├─ Amount Pending: ₹XXXX               │
│ └─ Payment Percentage: XX%             │
└─────────────────────────────────────────┘
```

**Data Count**: 7 payments (5 completed, 2 pending)

---

## 💵 ADMIN FEES PAGE
**URL**: `/admin/fees`
**Login**: `abhiyeduru@gmail.com` / `abhiyeduru`

### What You'll See
```
┌─────────────────────────────────────────┐
│ Fees Management                         │
├─────────────────────────────────────────┤
│ Fees Table                              │
│ ├─ Student Name: STU001-STU004         │
│ ├─ Fee Type: Tuition/Transport/Hostel  │
│ ├─ Amount: ₹1000-₹5000                 │
│ ├─ Due Date: Date                      │
│ ├─ Frequency: Yearly/Monthly/One-time  │
│ └─ Status: Active/Inactive             │
└─────────────────────────────────────────┘
```

**Data Count**: 11 fees (distributed across 4 students)

---

## 👥 ADMIN STUDENTS PAGE
**URL**: `/admin/students`
**Login**: `abhiyeduru@gmail.com` / `abhiyeduru`

### What You'll See
```
┌─────────────────────────────────────────┐
│ Students Management                     │
├─────────────────────────────────────────┤
│ Students Table                          │
│ ├─ Student ID: STU001-STU004           │
│ ├─ Name: Student names                 │
│ ├─ Email: Student emails               │
│ ├─ Class: Class 10-A, 10-B, 11-A       │
│ ├─ Section: A, B, C                    │
│ ├─ Roll Number                         │
│ ├─ Phone                               │
│ └─ Status: Active/Inactive             │
└─────────────────────────────────────────┘
```

**Data Count**: 4 students

---

## 👨‍🏫 ADMIN TEACHERS PAGE
**URL**: `/admin/teachers`
**Login**: `abhiyeduru@gmail.com` / `abhiyeduru`

### What You'll See
```
┌─────────────────────────────────────────┐
│ Teachers Management                     │
├─────────────────────────────────────────┤
│ Teachers Table                          │
│ ├─ Name: Teacher names                 │
│ ├─ Email: Teacher emails               │
│ ├─ Phone                               │
│ ├─ Subjects: Assigned subjects         │
│ ├─ Classes: Assigned classes           │
│ ├─ Qualification                       │
│ ├─ Experience                          │
│ └─ Status: Active/Inactive             │
└─────────────────────────────────────────┘
```

**Data Count**: 2 teachers

---

## 📊 Data Distribution Summary

### By Role
```
Student Views:
├─ Dashboard: 1 profile + 5 payments
├─ Marks: 6 exam results
├─ Attendance: 60 records
├─ Homework: 36 assignments
└─ Fees: 11 fees + 7 payments

Teacher Views:
├─ Dashboard: Overview
├─ Assignments: 36 homework
├─ Classes: Students list
├─ Attendance: Student tracking
└─ Marks: Student results

Admin Views:
├─ Analytics: 4 students + 2 teachers + 3 classes + 3 subjects + 2 exams
├─ Results: 24 exam results
├─ Receipts: 7 payments
├─ Fees: 11 fees
├─ Students: 4 students
└─ Teachers: 2 teachers
```

### By Data Type
```
Academic:
├─ Exam Results: 24
├─ Homework: 36
└─ Attendance: 243

Financial:
├─ Fees: 11
└─ Payments: 7

Total: 321 records
```

---

## 🔍 How to Verify Data

1. **Login as Student**
   - Go to Dashboard → See profile and payments
   - Go to Marks → See 6 exam results
   - Go to Attendance → See 60 attendance records
   - Go to Homework → See 36 homework assignments
   - Go to Fees → See 11 fees and 7 payments

2. **Login as Teacher**
   - Go to Assignments → See 36 homework assignments
   - Create new assignment → Test creation
   - Edit assignment → Test editing
   - Delete assignment → Test deletion

3. **Login as Admin**
   - Go to Analytics → See statistics
   - Go to Results → See 24 exam results
   - Go to Receipts → See 7 payments
   - Go to Fees → See 11 fees
   - Go to Students → See 4 students
   - Go to Teachers → See 2 teachers

---

**Last Updated**: March 23, 2026
**Status**: ✅ All data visible and accessible


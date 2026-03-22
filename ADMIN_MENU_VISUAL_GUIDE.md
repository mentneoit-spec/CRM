# Admin Menu - Visual Guide

## Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  College ERP                                    [Notifications] [Profile]
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ☰ ADMIN MENU          │  MAIN CONTENT AREA                │
│  ├─ Home               │                                    │
│  ├─ Classes            │  Dashboard / Classes / Students    │
│  ├─ Subjects           │  Teachers / Notices / Complaints   │
│  ├─ Teachers           │                                    │
│  ├─ Students           │  [Refresh] [Import CSV] [Add New]  │
│  ├─ Notices            │                                    │
│  ├─ Complaints         │  ┌──────────────────────────────┐ │
│  ├─ ─────────────────  │  │ Data Table / Form / Details  │ │
│  ├─ Profile            │  │                              │ │
│  └─ Logout             │  │                              │ │
│                        │  └──────────────────────────────┘ │
│                        │                                    │
└─────────────────────────────────────────────────────────────┘
```

## Menu Options

### 1. Home (Dashboard)
```
Home
├─ College Metrics
│  ├─ Total Students: 50
│  ├─ Total Teachers: 10
│  ├─ Total Classes: 5
│  └─ Revenue: $50,000
├─ Recent Payments
├─ Revenue Chart
├─ Admissions Status
└─ Students by Class
```

### 2. Classes
```
Classes
├─ View All Classes
│  ├─ Class 10A
│  ├─ Class 10B
│  ├─ Class 12A
│  └─ ...
├─ Add New Class
│  ├─ Class Name
│  └─ [Add Button]
├─ Class Details
│  ├─ Students in class
│  ├─ Subjects
│  ├─ Teachers
│  └─ Add Students
└─ Delete Class
```

### 3. Subjects
```
Subjects
├─ View All Subjects
│  ├─ English
│  ├─ Mathematics
│  ├─ Science
│  └─ ...
├─ Add New Subject
│  ├─ Subject Code
│  ├─ Subject Name
│  ├─ Select Class
│  ├─ Max Marks
│  └─ [Add Button]
├─ Subject Details
│  ├─ Classes
│  ├─ Teachers
│  └─ Students
└─ Delete Subject
```

### 4. Teachers
```
Teachers
├─ View All Teachers
│  ├─ Teacher 1
│  ├─ Teacher 2
│  ├─ Teacher 3
│  └─ ...
├─ Add New Teacher
│  ├─ Name
│  ├─ Email
│  ├─ Phone
│  ├─ Experience
│  ├─ Specialization
│  └─ [Add Button]
├─ Teacher Details
│  ├─ Subjects Assigned
│  ├─ Sections Assigned
│  ├─ Classes
│  └─ Edit / Delete
├─ Assign Subjects
├─ Assign Sections
└─ Import CSV
```

### 5. Students
```
Students
├─ View All Students
│  ├─ Student 1
│  ├─ Student 2
│  ├─ Student 3
│  └─ ...
├─ Add New Student
│  ├─ Name
│  ├─ Roll Number
│  ├─ Password
│  └─ [Add Button]
├─ Student Details
│  ├─ Profile Information
│  ├─ Class Assignment
│  ├─ Attendance
│  ├─ Marks
│  ├─ Fees
│  └─ Edit / Delete
├─ Student Attendance
│  ├─ Mark Attendance
│  └─ View Reports
├─ Student Marks
│  ├─ Enter Marks
│  └─ View Reports
└─ Import CSV
   ├─ Upload CSV
   ├─ Generate Credentials
   └─ Download Credentials
```

### 6. Notices
```
Notices
├─ View All Notices
│  ├─ Notice 1
│  ├─ Notice 2
│  ├─ Notice 3
│  └─ ...
├─ Add New Notice
│  ├─ Title
│  ├─ Content
│  ├─ Date
│  └─ [Add Button]
├─ Notice Details
│  ├─ View Content
│  ├─ View Date
│  └─ Delete
└─ Delete Notice
```

### 7. Complaints
```
Complaints
├─ View All Complaints
│  ├─ Complaint 1
│  ├─ Complaint 2
│  ├─ Complaint 3
│  └─ ...
├─ Complaint Details
│  ├─ Complaint Text
│  ├─ Status (Pending/In Progress/Resolved)
│  ├─ Comments
│  ├─ Update Status
│  └─ Add Comment
└─ Filter by Status
```

### 8. Profile
```
Profile
├─ View Admin Profile
│  ├─ Name
│  ├─ Email
│  ├─ Phone
│  ├─ College
│  └─ Role
├─ Edit Profile
│  ├─ Update Name
│  ├─ Update Email
│  ├─ Update Phone
│  └─ [Save Button]
└─ Change Password
```

## Data Creation Flow

### Creating a Class

```
Classes Menu
    ↓
Click "Add Class"
    ↓
┌─────────────────────────┐
│ Add Class Form          │
├─────────────────────────┤
│ Class Name: [10A      ] │
│                         │
│ [Add Button]            │
└─────────────────────────┘
    ↓
Submit Form
    ↓
Backend validates
    ↓
Save to Database
    ↓
Show success message
    ↓
Class appears in list
```

### Creating a Student

```
Students Menu
    ↓
Click "Add Student"
    ↓
┌─────────────────────────┐
│ Add Student Form        │
├─────────────────────────┤
│ Name: [John Doe      ]  │
│ Roll Number: [1      ]  │
│ Password: [****     ]   │
│                         │
│ [Add Button]            │
└─────────────────────────┘
    ↓
Submit Form
    ↓
Backend validates
    ↓
Auto-generate email
    ↓
Hash password
    ↓
Save to Database
    ↓
Show credentials
    ↓
Student appears in list
```

### Bulk Import Students

```
Students Menu
    ↓
Click "Import CSV"
    ↓
┌─────────────────────────┐
│ Import Students         │
├─────────────────────────┤
│ Select CSV File: [...]  │
│                         │
│ [Upload Button]         │
└─────────────────────────┘
    ↓
Upload CSV
    ↓
Backend validates CSV
    ↓
Parse CSV data
    ↓
Create students
    ↓
Generate credentials
    ↓
Show credentials table
    ↓
Students appear in list
```

## Data Visibility

### After Creating Data

```
Admin Creates Class "10A"
    ↓
Data saved to Database
    ↓
Visible in:
├─ Classes List
├─ Student Profile (when assigning)
├─ Teacher Dashboard (when assigning)
├─ Admin Dashboard (in metrics)
├─ Reports
└─ Bulk Import (can reference)
```

### After Creating Student

```
Admin Creates Student "John Doe"
    ↓
Data saved to Database
    ↓
Visible in:
├─ Students List
├─ Class Details (if assigned)
├─ Teacher Dashboard (if in their class)
├─ Admin Dashboard (in metrics)
├─ Reports
├─ Attendance Tracking
├─ Marks Entry
└─ Student Dashboard (when student logs in)
```

### After Creating Teacher

```
Admin Creates Teacher "Mr. Smith"
    ↓
Data saved to Database
    ↓
Visible in:
├─ Teachers List
├─ Subject Assignment (can assign)
├─ Section Assignment (can assign)
├─ Admin Dashboard (in metrics)
├─ Reports
└─ Teacher Dashboard (when teacher logs in)
```

## Quick Actions

### From Classes Page
```
Classes List
├─ [Refresh] - Reload data
├─ [Add New Class] - Create class
├─ [Import CSV] - Bulk import
└─ For each class:
   ├─ View Details
   ├─ Add Students
   ├─ Edit
   └─ Delete
```

### From Students Page
```
Students List
├─ [Refresh] - Reload data
├─ [Add New Student] - Create student
├─ [Import CSV] - Bulk import
└─ For each student:
   ├─ View Details
   ├─ View Attendance
   ├─ View Marks
   ├─ Edit
   └─ Delete
```

### From Teachers Page
```
Teachers List
├─ [Refresh] - Reload data
├─ [Add New Teacher] - Create teacher
├─ [Import CSV] - Bulk import
└─ For each teacher:
   ├─ View Details
   ├─ Assign Subjects
   ├─ Assign Sections
   ├─ Edit
   └─ Delete
```

## Navigation Paths

### To Add a Class
```
Home → Classes → [Add New Class] → Fill Form → Submit
```

### To Add a Student
```
Home → Students → [Add New Student] → Fill Form → Submit
```

### To Add a Teacher
```
Home → Teachers → [Add New Teacher] → Fill Form → Submit
```

### To Add a Subject
```
Home → Subjects → [Add New Subject] → Fill Form → Submit
```

### To Create a Notice
```
Home → Notices → [Add New Notice] → Fill Form → Submit
```

### To Import Students
```
Home → Students → [Import CSV] → Select File → Upload
```

### To View Student Details
```
Home → Students → Click Student → View Details
```

### To Manage Complaints
```
Home → Complaints → View List → Click Complaint → Update Status
```

## Summary

✅ **All admin features are accessible from the menu**

- Home: Dashboard and metrics
- Classes: Create and manage classes
- Subjects: Create and manage subjects
- Teachers: Create and manage teachers
- Students: Create and manage students
- Notices: Create and manage notices
- Complaints: View and manage complaints
- Profile: View and edit admin profile

All data is saved to database and visible everywhere it's needed.

---

**Last Updated**: March 21, 2026

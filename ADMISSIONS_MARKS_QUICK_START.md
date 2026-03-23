# Admissions & Marks Upload - Quick Start Guide

## New Features Overview

### 1. Admissions Team Dashboard
- Manage student admission applications
- Approve/Reject applications
- Auto-generate login credentials
- Track admission statistics

### 2. Enhanced Marks Upload
- Manual entry for individual students
- CSV bulk upload for multiple students
- Automatic grade calculation
- Error reporting and validation

---

## How to Use

### Admissions Dashboard

**Access:** Admin Sidebar → "Admissions" or `/admin/admissions`

**Steps:**
1. View all pending applications
2. Use filters to find specific applications
3. Click "Review" on an application
4. Add comments (optional)
5. Click "Approve" or "Reject"
6. If approved:
   - User account created automatically
   - Student can login with auto-generated password
   - Default password: part before @ in email

**Example:**
- Email: john.doe@example.com
- Auto-generated password: john.doe

---

### Marks Upload - Manual Entry

**Access:** Admin Sidebar → "Upload Marks" or `/admin/marks-upload`

**Steps:**
1. Select "Manual Entry" tab
2. Select Class
3. Select Subject (filtered by class)
4. Select Exam (filtered by subject)
5. Students in class appear
6. Click "Edit" on each student
7. Enter marks (0-100)
8. Click "Save" in dialog
9. Repeat for all students
10. Click "Save All Marks"
11. Grades calculated automatically

**Grades:**
- 90-100% → A+
- 80-89% → A
- 70-79% → B
- 60-69% → C
- 50-59% → D
- 0-49% → F

---

### Marks Upload - CSV Import

**Access:** Admin Sidebar → "Upload Marks" → "CSV Import" tab

**Steps:**
1. Select "CSV Import" tab
2. Read format instructions
3. Select Class, Subject, Exam
4. Click "Choose CSV File"
5. Select your CSV file
6. Preview shows first 5 rows
7. Click "Upload CSV"
8. System processes file
9. Success message shows count

**CSV Format:**
```csv
student_id,marks,remarks
STU001,85,Good
STU002,92,Excellent
STU003,78,Average
```

**Supported Column Names:**
- Student ID: `student_id`, `studentId`, `email`, `id`
- Marks: `marks`, `marks_obtained`, `score`
- Remarks: `remarks`, `note`, `comments` (optional)

---

## Auto-Login Credentials

### When Created
- When admin approves an admission application
- Automatically in the background
- No manual action needed

### How to Use
1. Student receives approval notification
2. Student goes to login page
3. Email: applicant's email
4. Password: part before @ in email
5. Student can change password after login

### Example
- Applicant Email: john.doe@example.com
- Login Email: john.doe@example.com
- Login Password: john.doe
- After login: Student can change password

---

## Data Flow

### Admission Approval
```
Admin reviews application
    ↓
Admin clicks "Approve"
    ↓
System creates:
  - User account
  - Student profile
  - Login credentials
    ↓
Student can login immediately
```

### Marks Upload (Manual)
```
Admin selects Class → Subject → Exam
    ↓
Students displayed
    ↓
Admin enters marks for each student
    ↓
Admin clicks "Save All Marks"
    ↓
System:
  - Validates marks
  - Calculates percentage
  - Assigns grade
  - Saves to database
    ↓
Success message
```

### Marks Upload (CSV)
```
Admin uploads CSV file
    ↓
System:
  - Parses CSV
  - Validates student IDs
  - Validates marks (0-100)
  - Calculates grades
  - Creates/updates results
    ↓
Shows statistics:
  - Created count
  - Updated count
  - Error count (if any)
```

---

## API Endpoints

### Admissions
```
GET  /api/admin/admissions
POST /api/admin/admissions/:id/approve
POST /api/admin/admissions/:id/reject
```

### Marks Upload
```
POST /api/admin/marks/upload (manual)
POST /api/admin/marks/csv-upload (CSV)
```

---

## Troubleshooting

### Admissions Issues

**Q: Can't see admissions dashboard?**
- Check if you're logged in as Admin
- Navigate to `/admin/admissions`
- Check browser console for errors

**Q: Approval not working?**
- Verify all required fields are filled
- Check if email already exists in system
- Check browser console for error messages

**Q: Student can't login after approval?**
- Verify user account was created
- Check email and password
- Try resetting password

### Marks Upload Issues

**Q: CSV upload failing?**
- Check CSV format (see examples above)
- Verify student IDs exist in system
- Verify marks are 0-100
- Check for special characters in CSV

**Q: Marks not saving?**
- Verify class, subject, exam are selected
- Check if marks are entered (0-100)
- Verify students exist in class
- Check browser console for errors

**Q: Grades not calculated?**
- Grades calculated automatically
- Refresh page to see updated grades
- Check if subject has maxMarks defined

---

## Testing Credentials

**Admin Account:**
- Email: admin@school.com
- Password: admin123

**Test Admission:**
1. Go to Admissions dashboard
2. Find a pending application
3. Click "Review"
4. Click "Approve"
5. Check if user account created

**Test Marks Upload:**
1. Go to Upload Marks
2. Select Class, Subject, Exam
3. Enter marks for students
4. Click "Save All Marks"
5. Check if marks saved with grades

---

## Features Summary

✅ **Admissions Management**
- View all applications
- Filter by status
- Search by name/email/phone
- Approve/Reject with comments
- Auto-generate login credentials
- Track statistics

✅ **Marks Upload**
- Manual entry for individual students
- CSV bulk upload
- Automatic grade calculation
- Error reporting
- Pagination support

✅ **Auto-Login**
- Created automatically on approval
- Default password from email
- Student can change password
- Immediate access to system

---

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify all required fields are filled
3. Check network tab in DevTools
4. Review API response for details
5. Contact system administrator

---

## Next Steps

1. Test admissions approval workflow
2. Test marks upload (manual and CSV)
3. Verify auto-login credentials work
4. Train staff on new features
5. Set up regular backup procedures

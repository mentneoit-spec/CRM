# Marks Upload Feature - Quick Start Guide

## Overview
Admin and Teachers can now upload student marks through the web interface. The system automatically calculates grades based on marks obtained.

---

## For Admin Users

### Access Points
1. **Sidebar Menu** → "Upload Marks" (under Admin section)
2. **Direct URL** → `/admin/marks-upload`
3. **Results Page** → `/admin/results` (view all results)
4. **CSV Upload** → `/admin/results-csv-upload` (bulk import)

### How to Upload Marks

1. **Select Class**
   - Choose a class from the dropdown
   - Only subjects for that class will appear

2. **Select Subject**
   - Choose a subject from the filtered list
   - Only exams for that subject will appear

3. **Select Exam**
   - Choose an exam from the filtered list
   - All students in the class will be loaded

4. **Enter Marks**
   - Click on a student row to open the edit dialog
   - Enter marks (0-100)
   - Click "Save" in the dialog

5. **Save All Marks**
   - Click "Save All Marks" button
   - System will upload all entered marks
   - Success message shows count of created/updated records

### View Results
- Go to `/admin/results`
- Filter by class, subject, exam, or student
- View marks, percentage, and grade
- Export to CSV if needed

---

## For Teacher Users

### Access Points
1. **Sidebar Menu** → "Upload Marks" (under Teacher section)
2. **Direct URL** → `/teacher/marks-upload`

### How to Upload Marks

Same process as Admin:
1. Select class (only your assigned classes)
2. Select subject (only your subjects)
3. Select exam
4. Enter marks for students
5. Save all marks

---

## Grade Calculation

Grades are automatically calculated based on percentage:

| Percentage | Grade |
|-----------|-------|
| 90-100%   | A+    |
| 80-89%    | A     |
| 70-79%    | B     |
| 60-69%    | C     |
| 50-59%    | D     |
| 0-49%     | F     |

---

## API Endpoints

### Admin Endpoints
```bash
# Upload marks
POST /api/admin/marks/upload
Body: {
  "examId": "exam-id",
  "subjectId": "subject-id",
  "marks": [
    { "studentId": "student-id", "marksObtained": 85 },
    { "studentId": "student-id", "marksObtained": 92 }
  ]
}

# Get results
GET /api/admin/results?classId=X&subjectId=Y&examId=Z&page=1&limit=50

# Upload CSV
POST /api/admin/results/csv-upload
Body: FormData with file
```

### Teacher Endpoints
```bash
# Upload marks
POST /api/teacher/marks/upload
Body: {
  "examId": "exam-id",
  "subjectId": "subject-id",
  "marks": [
    { "studentId": "student-id", "marksObtained": 85 }
  ]
}

# Get marks
GET /api/teacher/marks?classId=X&subjectId=Y
```

---

## CSV Format for Bulk Upload

For `/admin/results-csv-upload`, use this format:

```csv
student_id,marks,remarks
STU001,85,Good performance
STU002,92,Excellent
STU003,78,Average
```

Supported column names:
- Student ID: `student_id`, `studentId`, `email`, `id`
- Marks: `marks`, `marks_obtained`, `score`
- Remarks: `remarks`, `note`, `comments`

---

## Features

✅ **Automatic Grade Calculation** - Grades calculated based on percentage
✅ **Batch Upload** - Upload marks for multiple students at once
✅ **Edit Dialog** - Easy editing with confirmation
✅ **Filtering** - Filter results by class, subject, exam, student
✅ **CSV Export** - Export results to CSV file
✅ **CSV Import** - Bulk import marks from CSV
✅ **Validation** - Marks validated (0-100 range)
✅ **Pagination** - Results paginated for performance
✅ **Role-Based Access** - Admin and Teacher access control

---

## Troubleshooting

### Marks not saving?
- Check if all required fields are selected (class, subject, exam)
- Verify marks are in valid range (0-100)
- Check browser console for error messages

### Students not appearing?
- Make sure a class is selected
- Make sure an exam is selected for that class
- Verify students are enrolled in the selected class

### Grades not calculated?
- Grades are calculated automatically when marks are saved
- Refresh the page to see updated grades
- Check if subject has maxMarks defined

---

## Testing Credentials

Use these credentials to test the feature:

**Admin Login:**
- Email: admin@school.com
- Password: admin123

**Teacher Login:**
- Email: teacher@school.com
- Password: teacher123

---

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all required fields are filled
3. Check network tab in browser DevTools
4. Review API response for detailed error messages

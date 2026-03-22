# Student Login Credentials Auto-Generation Feature

## Overview
When admins create students (manually or via CSV import), the system now automatically:
1. **Creates login credentials** for each student
2. **Auto-generates email** if not provided (format: `studentid@collegename.student`)
3. **Uses roll number as password** (or student ID as fallback)
4. **Displays credentials** in the admin interface after import

## Implementation Details

### Backend Changes

#### 1. `createStudent` Endpoint (Manual Creation)
**File**: `gravity-crm/backend/controllers/admin-controller.js`

**Changes**:
- Auto-generates email if not provided
- Uses `rollNum` as password if provided, otherwise uses provided password
- Returns login credentials in response

**Response**:
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "user": { ... },
    "student": { ... },
    "loginCredentials": {
      "email": "stu001@democollege.student",
      "password": "1",
      "note": "Student can use these credentials to login"
    }
  }
}
```

#### 2. `bulkImportStudents` Endpoint (CSV Import)
**File**: `gravity-crm/backend/controllers/admin-controller.js`

**Changes**:
- Reads `roll_number` column from CSV
- Uses roll number as password (or student ID as fallback)
- Auto-generates email for students without email in CSV
- Returns array of created students with login credentials

**CSV Columns Supported**:
- `roll_number` / `roll_num` / `rollnumber` / `rollnum` / `roll` - **Used as password**
- `email` / `student_email` / `mail` / `e_mail` - Optional, auto-generated if missing
- `student_id` / `studentid` / `roll_no` / `id` - Required
- `name` / `student_name` / `full_name` - Required
- `class` / `class_name` / `sclass` / `sclass_name` - Required
- `section` / `section_name` - Optional
- And other standard fields (parent_name, phone, board, etc.)

**Response**:
```json
{
  "success": true,
  "message": "Bulk import completed",
  "data": {
    "created": 10,
    "updated": 0,
    "skipped": 0,
    "errorCount": 0,
    "createdStudents": [
      {
        "studentId": "STU001",
        "name": "Arjun Kumar",
        "email": "stu001@democollege.student",
        "password": "1",
        "rollNum": "1"
      },
      ...
    ],
    "note": "Students created without email were auto-generated with format: studentid@collegename.student. Password is the roll number or student ID."
  }
}
```

### Frontend Changes

#### BulkStudentImportDialog Component
**File**: `gravity-crm/frontend/src/components/admin/BulkStudentImportDialog.js`

**Changes**:
- Displays table of created students with login credentials
- Shows columns: Student ID, Name, Email, Password
- Displays helpful info message about auto-generated emails
- Increased dialog width to `md` for better table display

**UI Features**:
- ✅ Login credentials table for all created students
- ✅ Email auto-generation explanation
- ✅ Password (roll number) display
- ✅ Error handling and display
- ✅ Summary statistics (created, updated, skipped, errors)

## Usage Examples

### Example 1: Manual Student Creation
```javascript
POST /api/admin/student
{
  "name": "Arjun Kumar",
  "studentId": "STU001",
  "rollNum": 1,
  "sclassId": "class-id-123",
  "sectionId": "section-id-456"
}

Response:
{
  "loginCredentials": {
    "email": "stu001@democollege.student",
    "password": "1"
  }
}
```

### Example 2: CSV Import
**CSV Content**:
```
student_id,name,roll_number,class,section
STU001,Arjun Kumar,1,10A,A
STU002,Priya Sharma,2,10A,A
STU003,Rahul Patel,3,10A,B
```

**Result**:
- Student 1: Email = `stu001@democollege.student`, Password = `1`
- Student 2: Email = `stu002@democollege.student`, Password = `2`
- Student 3: Email = `stu003@democollege.student`, Password = `3`

All credentials displayed in admin interface after import.

## Password Strategy

### Why Roll Number as Password?
1. **Easy to remember** - Students already know their roll number
2. **Unique per student** - Each student has different roll number
3. **Secure enough** - Combined with email, provides basic security
4. **Practical** - No need to share complex passwords separately

### Fallback Strategy
- If roll number not provided → Use student ID as password
- If email not provided → Auto-generate from student ID and college name

## CSV Template

See `gravity-crm/backend/STUDENT_CSV_TEMPLATE.md` for complete CSV template and examples.

## Security Notes

1. **Email Format**: `studentid@collegename.student` (not a real email, just for login)
2. **Password**: Roll number (simple but memorable)
3. **Recommendation**: Advise students to change password after first login
4. **Admin Responsibility**: Admin should securely communicate credentials to students

## Testing

### Test Case 1: Manual Creation
1. Go to Admin → Students → Add Student
2. Fill form with roll number
3. Check response for login credentials
4. Verify email is auto-generated

### Test Case 2: CSV Import
1. Go to Admin → Students → Bulk Import
2. Upload CSV with roll numbers
3. Check import result for credentials table
4. Verify all students have email and password

### Test Case 3: CSV Without Email
1. Upload CSV without email column
2. Verify emails are auto-generated
3. Check format: `studentid@collegename.student`

## Files Modified

1. `gravity-crm/backend/controllers/admin-controller.js`
   - Updated `createStudent()` function
   - Updated `bulkImportStudents()` function

2. `gravity-crm/frontend/src/components/admin/BulkStudentImportDialog.js`
   - Added login credentials table display
   - Added info message about auto-generated emails
   - Improved UI layout

3. `gravity-crm/backend/STUDENT_CSV_TEMPLATE.md` (NEW)
   - CSV template and examples
   - Column descriptions
   - Usage guide

## Future Enhancements

1. **Email Notifications**: Send credentials to student email
2. **Password Reset**: Allow students to reset password on first login
3. **Bulk Email Export**: Export credentials as CSV for printing/distribution
4. **QR Code**: Generate QR code with login credentials
5. **SMS Notification**: Send credentials via SMS to parent phone

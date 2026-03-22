# CSV Upload Guide - Student Import

**Date**: March 21, 2026  
**Status**: ✅ **READY TO UPLOAD**

## CSV File Created

**File**: `gravity-crm/sample-students-import.csv`

**Headers**:
- Student ID
- Roll No
- Name
- Class
- Section
- Contact
- Parent Info
- Actions

**Sample Data**: 10 students with complete information

## How to Upload CSV

### Step 1: Login as Admin

```
URL: http://localhost:3000
Email: abhiyeduru@gmail.com
Password: Test@123
```

### Step 2: Go to Students Page

1. Click **Students** in the left menu
2. You'll see the Students list page

### Step 3: Click Import CSV

1. Look for **Import CSV** button (usually at the top right)
2. Click on it
3. A dialog or file picker will appear

### Step 4: Select CSV File

1. Click "Choose File" or "Select File"
2. Navigate to: `gravity-crm/sample-students-import.csv`
3. Select the file
4. Click "Open"

### Step 5: Upload

1. Click **Upload** or **Import** button
2. Wait for processing
3. You'll see a success message
4. Login credentials will be displayed

### Step 6: View Imported Students

1. The page will show the imported students
2. You'll see a table with:
   - Student ID
   - Name
   - Email (auto-generated)
   - Password (auto-generated)
3. Copy the credentials for sharing with students

## CSV File Format

### Headers (Required)

```
Student ID,Roll No,Name,Class,Section,Contact,Parent Info,Actions
```

### Data Format

```
STU001,1,Arjun Kumar,10A,A,9876543210,Father: Rajesh Kumar - 9876543211,Active
```

### Field Descriptions

| Field | Description | Example |
|-------|-------------|---------|
| Student ID | Unique student identifier | STU001 |
| Roll No | Roll number | 1 |
| Name | Student name | Arjun Kumar |
| Class | Class name | 10A |
| Section | Section name | A |
| Contact | Student phone number | 9876543210 |
| Parent Info | Parent details | Father: Name - Phone |
| Actions | Status | Active |

## Sample CSV Content

```
Student ID,Roll No,Name,Class,Section,Contact,Parent Info,Actions
STU001,1,Arjun Kumar,10A,A,9876543210,Father: Rajesh Kumar - 9876543211,Active
STU002,2,Priya Sharma,10A,A,9876543212,Mother: Anjali Sharma - 9876543213,Active
STU003,3,Neha Gupta,10A,B,9876543214,Father: Amit Gupta - 9876543215,Active
STU004,4,Rohan Singh,10B,A,9876543216,Mother: Priya Singh - 9876543217,Active
STU005,5,Ananya Patel,10B,B,9876543218,Father: Vikram Patel - 9876543219,Active
STU006,6,Aditya Verma,12A,A,9876543220,Mother: Deepa Verma - 9876543221,Active
STU007,7,Divya Nair,12A,B,9876543222,Father: Suresh Nair - 9876543223,Active
STU008,8,Karan Malhotra,12B,A,9876543224,Mother: Kavya Malhotra - 9876543225,Active
STU009,9,Sneha Desai,12B,B,9876543226,Father: Ramesh Desai - 9876543227,Active
STU010,10,Varun Chopra,10A,A,9876543228,Mother: Sunita Chopra - 9876543229,Active
```

## What Happens After Upload

### 1. CSV Processing
- Backend reads CSV file
- Validates each row
- Checks for required fields
- Checks for duplicates

### 2. Student Creation
- Creates user account for each student
- Auto-generates email: `studentid@collegename.student`
- Auto-generates password: Roll number
- Hashes password securely

### 3. Data Storage
- Saves to PostgreSQL database
- Assigns to college (multi-tenancy)
- Links to class and section
- Stores contact and parent info

### 4. Credentials Display
- Shows table with:
  - Student ID
  - Name
  - Email
  - Password
- Can be copied or downloaded

### 5. Data Visibility
- Students appear in Students list
- Students appear in Class details
- Students appear in Dashboard metrics
- Students can login with credentials

## Login Credentials Generated

After upload, each student gets:

```
Email: auto-generated (e.g., stu001@college.student)
Password: Roll number (e.g., 1)
```

**Example**:
```
Student: Arjun Kumar
Email: stu001@college.student
Password: 1
```

## Verification Steps

### Step 1: Check Students List
1. Go to **Students**
2. Verify all 10 students appear
3. Check names, roll numbers, classes

### Step 2: Check Class Details
1. Go to **Classes**
2. Click on a class (e.g., 10A)
3. Verify students assigned to that class

### Step 3: Check Dashboard
1. Go to **Home** (Dashboard)
2. Verify student count increased
3. Check metrics updated

### Step 4: Check Database
1. Run verification script:
   ```bash
   cd gravity-crm/backend
   node verify-multi-tenancy.js
   ```
2. Verify students appear in database

## Troubleshooting

### Issue: Upload fails

**Solution**:
1. Check CSV format (headers must match exactly)
2. Check for special characters in data
3. Verify file is not corrupted
4. Check backend logs for errors

### Issue: Students not appearing

**Solution**:
1. Refresh page
2. Check browser console
3. Verify upload completed
4. Check database directly

### Issue: Credentials not displayed

**Solution**:
1. Check backend response
2. Verify students were created
3. Check network tab for errors
4. Try uploading again

### Issue: Students not in class

**Solution**:
1. Verify class name in CSV matches existing class
2. If class doesn't exist, create it first
3. Re-upload CSV with correct class name

## CSV Template

You can use this template to create your own CSV:

```
Student ID,Roll No,Name,Class,Section,Contact,Parent Info,Actions
STU###,#,Name,Class,Section,Phone,Parent Details,Active
```

## Tips

1. **Student ID**: Use format STU001, STU002, etc.
2. **Roll No**: Use sequential numbers (1, 2, 3, etc.)
3. **Name**: Use full names
4. **Class**: Must match existing class (10A, 10B, 12A, etc.)
5. **Section**: Use A, B, C, etc.
6. **Contact**: Use valid phone numbers
7. **Parent Info**: Use format "Father/Mother: Name - Phone"
8. **Actions**: Use "Active" or "Inactive"

## File Location

The sample CSV file is located at:
```
gravity-crm/sample-students-import.csv
```

You can:
1. Download it from the repository
2. Edit it with your own data
3. Upload it through the admin panel

## Next Steps

1. ✅ CSV file created: `sample-students-import.csv`
2. ✅ Login as admin: `abhiyeduru@gmail.com`
3. ✅ Go to Students page
4. ✅ Click Import CSV
5. ✅ Select `sample-students-import.csv`
6. ✅ Click Upload
7. ✅ View imported students
8. ✅ Copy credentials
9. ✅ Share with students

## Summary

✅ **CSV file is ready to upload**

- File: `gravity-crm/sample-students-import.csv`
- Headers: Student ID, Roll No, Name, Class, Section, Contact, Parent Info, Actions
- Data: 10 sample students
- Ready to import into admin panel
- Credentials will be auto-generated
- Data will be saved to database

---

**Last Updated**: March 21, 2026  
**Status**: Ready to Upload

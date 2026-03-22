# CSV Upload - Step by Step

## File Ready

**File**: `gravity-crm/sample-students-import.csv`

**Contains**: 10 students with all required information

## Step-by-Step Instructions

### Step 1: Login

```
URL: http://localhost:3000
Email: abhiyeduru@gmail.com
Password: Test@123
Click Login
```

### Step 2: Go to Students

```
After login, you'll see the admin dashboard
Click "Students" in the left menu
```

### Step 3: Find Import Button

```
On the Students page, look for:
- "Import CSV" button (usually top right)
- Or "Upload CSV" button
- Or similar import option
```

### Step 4: Click Import CSV

```
Click the Import CSV button
A file picker dialog will appear
```

### Step 5: Select File

```
In the file picker:
1. Navigate to the project folder
2. Find: gravity-crm/sample-students-import.csv
3. Click on it
4. Click "Open" or "Select"
```

### Step 6: Upload

```
After selecting file:
1. Click "Upload" button
2. Wait for processing (may take a few seconds)
3. You'll see a success message
```

### Step 7: View Results

```
After upload completes:
1. You'll see a table with imported students
2. Table shows:
   - Student ID
   - Name
   - Email (auto-generated)
   - Password (auto-generated)
3. Copy the credentials
```

### Step 8: Verify

```
1. Go back to Students list
2. Verify all 10 students appear
3. Check their details
4. Go to Classes to verify class assignments
5. Go to Dashboard to verify count updated
```

## CSV File Content

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

## Expected Results

### After Upload

```
✅ 10 students created
✅ Auto-generated emails
✅ Auto-generated passwords
✅ Assigned to classes
✅ Assigned to sections
✅ Contact info saved
✅ Parent info saved
✅ Credentials displayed
```

### In Students List

```
All 10 students visible:
- Arjun Kumar (10A, Roll: 1)
- Priya Sharma (10A, Roll: 2)
- Neha Gupta (10A, Roll: 3)
- Rohan Singh (10B, Roll: 4)
- Ananya Patel (10B, Roll: 5)
- Aditya Verma (12A, Roll: 6)
- Divya Nair (12A, Roll: 7)
- Karan Malhotra (12B, Roll: 8)
- Sneha Desai (12B, Roll: 9)
- Varun Chopra (10A, Roll: 10)
```

### In Classes

```
Class 10A:
- Arjun Kumar (Roll: 1)
- Priya Sharma (Roll: 2)
- Neha Gupta (Roll: 3)
- Varun Chopra (Roll: 10)

Class 10B:
- Rohan Singh (Roll: 4)
- Ananya Patel (Roll: 5)

Class 12A:
- Aditya Verma (Roll: 6)
- Divya Nair (Roll: 7)

Class 12B:
- Karan Malhotra (Roll: 8)
- Sneha Desai (Roll: 9)
```

### In Dashboard

```
Metrics Updated:
- Total Students: 10 (or more if existing)
- Student count increased
- Charts updated
```

## Login Credentials for Students

After upload, students can login with:

```
Student 1: Arjun Kumar
Email: stu001@college.student
Password: 1

Student 2: Priya Sharma
Email: stu002@college.student
Password: 2

Student 3: Neha Gupta
Email: stu003@college.student
Password: 3

... and so on
```

## Troubleshooting

### If upload fails:

1. Check file format (must be CSV)
2. Check headers match exactly
3. Check for special characters
4. Try uploading again
5. Check browser console for errors

### If students don't appear:

1. Refresh page
2. Check Students list
3. Check database
4. Check backend logs

### If classes don't match:

1. Verify classes exist (10A, 10B, 12A, 12B)
2. If not, create them first
3. Then upload CSV again

## File Location

```
gravity-crm/sample-students-import.csv
```

## Admin Login

```
Email: abhiyeduru@gmail.com
Password: Test@123
```

## Summary

✅ CSV file created with 10 students  
✅ Headers: Student ID, Roll No, Name, Class, Section, Contact, Parent Info, Actions  
✅ Ready to upload  
✅ Follow steps above to import  
✅ Credentials will be auto-generated  
✅ Data will be saved to database  

---

**Last Updated**: March 21, 2026

# Quick Test Guide - Student Login Credentials Feature

## 🚀 Quick Start

### Prerequisites
- Backend running on port 5001
- Frontend running on port 3000
- Database populated with dummy data

### Run Automated Tests
```bash
cd gravity-crm/backend
node test-student-credentials.js
```

Expected output: ✅ All 4 tests passed

---

## 📋 Manual Testing Steps

### Test 1: Manual Student Creation via UI

1. **Login as Admin**
   - URL: http://localhost:3000
   - Email: `admin@demo.com`
   - Password: `Test@123`

2. **Navigate to Students**
   - Click: Admin → Students → Add Student

3. **Fill Form**
   - Name: `Test Student 001`
   - Student ID: `TEST001`
   - Roll Number: `42`
   - Class: `10A`
   - Section: `A`
   - Phone: `9999999999`

4. **Submit**
   - Click "Create Student"

5. **Verify Response**
   - Should see success message
   - Check browser console for response data
   - Look for login credentials in response

6. **Expected Credentials**
   - Email: `test001@democollege.student`
   - Password: `42`

---

### Test 2: CSV Bulk Import via UI

1. **Login as Admin**
   - Email: `admin@demo.com`
   - Password: `Test@123`

2. **Navigate to Bulk Import**
   - Click: Admin → Students → Bulk Import

3. **Select CSV File**
   - Click: "Choose CSV File"
   - Select: `gravity-crm/backend/sample-students.csv`

4. **Configure Import**
   - Mode: "Skip if Student ID exists"
   - Click: "Start Import"

5. **View Results**
   - Should see import summary
   - Table showing created students with:
     - Student ID
     - Name
     - Email (auto-generated)
     - Password (roll number)

6. **Expected Output**
   ```
   Created: 8
   Updated: 0
   Skipped: 0
   Errors: 0
   
   Students Table:
   STU001 | Arjun Kumar | stu001@democollege.student | 1
   STU002 | Priya Sharma | stu002@democollege.student | 2
   STU003 | Rahul Patel | stu003@democollege.student | 3
   ... (and more)
   ```

---

### Test 3: Login with Generated Credentials

1. **Logout from Admin**
   - Click: Profile → Logout

2. **Go to Login Page**
   - URL: http://localhost:3000

3. **Login as Student**
   - Email: `stu001@democollege.student`
   - Password: `1` (roll number)

4. **Verify**
   - Should successfully login
   - Should see Student Dashboard
   - Should see student details

---

### Test 4: Verify Email Auto-Generation

1. **Create Student Without Email**
   - Name: `Test No Email`
   - Student ID: `TEST_NO_EMAIL`
   - Roll Number: `99`
   - Class: `10A`
   - **Leave Email field empty**

2. **Submit**
   - Click "Create Student"

3. **Check Response**
   - Email should be auto-generated
   - Format: `test_no_email@democollege.student`

---

### Test 5: Verify Roll Number as Password

1. **Create Multiple Students**
   - Student 1: Roll Number = 10
   - Student 2: Roll Number = 20
   - Student 3: Roll Number = 30

2. **Try Logging In**
   - Student 1: Email = `stu_xxx@democollege.student`, Password = `10`
   - Student 2: Email = `stu_yyy@democollege.student`, Password = `20`
   - Student 3: Email = `stu_zzz@democollege.student`, Password = `30`

3. **Verify**
   - Each student should login with their roll number as password

---

## 📊 Test Checklist

### Backend Tests
- [ ] Manual student creation creates user and student records
- [ ] Auto-generated email format is correct
- [ ] Roll number is used as password
- [ ] Password is properly hashed with bcrypt
- [ ] CSV import creates multiple students
- [ ] CSV import returns credentials in response
- [ ] Email generation works for all student ID formats
- [ ] Database transactions work correctly

### Frontend Tests
- [ ] Add Student form displays all fields
- [ ] Add Student form submits successfully
- [ ] Bulk Import dialog displays file selector
- [ ] Bulk Import shows results table
- [ ] Results table shows Student ID, Name, Email, Password
- [ ] Results table is scrollable for many students
- [ ] Error messages display correctly
- [ ] Success messages display correctly

### Integration Tests
- [ ] Created students can login with generated credentials
- [ ] Email format is consistent across all students
- [ ] Password works for all students
- [ ] Student dashboard displays correctly after login
- [ ] Student profile shows all details

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Terminal where backend is running
# Look for POST /api/admin/students requests
# Check for any error messages
```

### Check Browser Console
```javascript
// Open DevTools (F12)
// Go to Console tab
// Look for API response data
// Check for any JavaScript errors
```

### Check Database
```bash
# Connect to Neon database
# Query: SELECT * FROM "Student" WHERE "studentId" LIKE 'TEST%'
# Verify email and password fields
```

### Test CSV Format
```bash
# Verify CSV file format
# Check column headers match expected names
# Ensure no special characters in data
# Verify class names exist in system
```

---

## 📝 Sample Test Data

### Manual Creation
```
Name: Test Student 001
Student ID: TEST001
Roll Number: 42
Class: 10A
Section: A
Phone: 9999999999

Expected Credentials:
Email: test001@democollege.student
Password: 42
```

### CSV Import
```csv
student_id,name,roll_number,email,phone,class,section,parent_name,parent_phone,board
STU001,Arjun Kumar,1,arjun@example.com,9876543210,10A,A,Mr. Vikram Kumar,9222222222,CBSE
STU002,Priya Sharma,2,,9876543211,10A,A,Mrs. Anjali Sharma,9222222223,CBSE
STU003,Rahul Patel,3,,9876543212,10A,B,Mr. Rajesh Patel,9222222224,CBSE
```

---

## ✅ Success Criteria

### Manual Creation
- ✅ Student created in database
- ✅ User created in database
- ✅ Email auto-generated correctly
- ✅ Password set to roll number
- ✅ Response includes login credentials

### CSV Import
- ✅ All students created successfully
- ✅ Emails auto-generated for students without email
- ✅ Passwords set to roll numbers
- ✅ Results table displays all credentials
- ✅ Students can login with generated credentials

### Login
- ✅ Student can login with generated email
- ✅ Student can login with roll number as password
- ✅ Student dashboard displays correctly
- ✅ Student profile shows all details

---

## 🐛 Common Issues & Solutions

### Issue: "Required fields missing" error
**Solution**: Ensure all required fields are filled:
- Name
- Student ID
- Class
- Roll Number (for password generation)

### Issue: Email not auto-generated
**Solution**: Check that email field is empty/null
- If email is provided, it will be used instead of auto-generating

### Issue: CSV import fails
**Solution**: Verify CSV format:
- Check column headers match expected names
- Ensure class names exist in system
- Verify no special characters in data

### Issue: Cannot login with generated credentials
**Solution**: Check:
- Email format: `studentid@collegename.student`
- Password: Roll number (not student ID)
- Student is active in database

---

## 📞 Support

For issues or questions:
1. Check the test results: `gravity-crm/TEST_RESULTS_STUDENT_CREDENTIALS.md`
2. Review the feature documentation: `gravity-crm/STUDENT_LOGIN_CREDENTIALS_FEATURE.md`
3. Check the CSV template: `gravity-crm/backend/STUDENT_CSV_TEMPLATE.md`
4. Run the test suite: `node test-student-credentials.js`

---

**Last Updated**: March 21, 2026  
**Status**: ✅ Ready for Testing

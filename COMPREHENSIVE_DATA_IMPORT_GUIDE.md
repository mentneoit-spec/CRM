# Comprehensive Data Import Guide for College Admin

## Overview
This guide explains how to import all the realistic sample data for the college admin `abhiyeduru@gmail.com`:
- 20 Students
- 10 Teachers
- 20 Subjects
- 10 Bus Routes
- 10 Team Members
- 60 Fee Records

## Method 1: Direct Database Import (Recommended - Fastest)

### Step 1: Run the Import Script
```bash
cd gravity-crm/backend
node import-college-data.js
```

This will:
✅ Create 4 classes (10A, 10B, 12A, 12B)
✅ Create 8 sections (A & B for each class)
✅ Create 10 teachers with realistic data
✅ Create 20 students distributed across classes
✅ Create 20 subjects assigned to teachers
✅ Create 10 bus routes with full details
✅ Create 10 team members (Accounts, Transport, Admin, HR, IT)
✅ Create 60 fee records (3 fees per student)

### Step 2: Login to Admin Dashboard
- Email: `abhiyeduru@gmail.com`
- Password: (your existing password)

### Step 3: Verify Data in Admin Pages
- **Classes**: Admin → Classes (should show 10A, 10B, 12A, 12B)
- **Students**: Admin → Students (should show 20 students)
- **Teachers**: Admin → Teachers (should show 10 teachers)
- **Subjects**: Admin → Subjects (should show 20 subjects)
- **Bus Routes**: Admin → Transport → Routes (should show 10 routes)
- **Team Members**: Admin → Teams (should show 10 members)
- **Fees**: Admin → Fees (should show 60 fee records)

---

## Method 2: CSV Import via Admin UI (Alternative)

### Step 1: Import Teachers
1. Go to Admin → Teachers
2. Click "Import CSV"
3. Upload: `sample-teachers-import.csv`
4. Select Mode: "Skip if exists"
5. Click "Start Import"

**File**: `gravity-crm/sample-teachers-import.csv`
**Contains**: 10 teachers with qualifications and experience

### Step 2: Import Students
1. Go to Admin → Students
2. Click "Import CSV"
3. Upload: `sample-students-20.csv`
4. Select Mode: "Skip if exists"
5. Click "Start Import"

**File**: `gravity-crm/sample-students-20.csv`
**Contains**: 20 students with class, section, contact info

### Step 3: Import Subjects
1. Go to Admin → Subjects
2. Click "Import CSV"
3. Upload: `sample-subjects-import.csv`
4. Select Mode: "Skip if exists"
5. Click "Start Import"

**File**: `gravity-crm/sample-subjects-import.csv`
**Contains**: 20 subjects assigned to teachers and classes

### Step 4: Import Fees
1. Go to Admin → Fees
2. Click "Import CSV"
3. Upload: `sample-fees-import.csv`
4. Select Mode: "Update if exists"
5. Click "Start Import"

**File**: `gravity-crm/sample-fees-import.csv`
**Contains**: 60 fee records (3 per student)

### Step 5: Import Bus Routes
1. Go to Admin → Transport → Routes
2. Click "Import CSV"
3. Upload: `sample-bus-routes-import.csv`
4. Select Mode: "Skip if exists"
5. Click "Start Import"

**File**: `gravity-crm/sample-bus-routes-import.csv`
**Contains**: 10 bus routes with drivers and conductors

### Step 6: Import Team Members
1. Go to Admin → Teams
2. Click "Import CSV"
3. Upload: `sample-teams-import.csv`
4. Select Mode: "Skip if exists"
5. Click "Start Import"

**File**: `gravity-crm/sample-teams-import.csv`
**Contains**: 10 team members (Accounts, Transport, Admin, HR, IT)

---

## Sample Data Details

### Classes
- 10A, 10B (Grade 10)
- 12A, 12B (Grade 12)
- Each class has 2 sections: A and B

### Students (20 Total)
- 5 students in 10A-A
- 5 students in 10B-A/B
- 5 students in 12A-A/B
- 5 students in 12B-A/B
- All have realistic names, emails, phone numbers
- Parent information included
- Password = Roll Number (1-20)

### Teachers (10 Total)
- Subjects: Mathematics, Physics, Chemistry, English, Biology, Economics, History, Geography, Computer Science, IT
- Experience: 4-12 years
- Qualifications: B.Tech, M.Sc, B.A, B.Sc, M.Tech, B.Com, B.Ed, M.A
- Password: Teacher@123

### Subjects (20 Total)
- 5 subjects for 10A
- 5 subjects for 10B
- 5 subjects for 12A
- 5 subjects for 12B
- Each assigned to a teacher
- Max Marks: 100, Passing Marks: 40

### Bus Routes (10 Total)
- Route A-J covering different areas
- Distance: 8-30 km
- Capacity: 50 students per bus
- Fee: ₹1000-2000 per month
- Driver and conductor details included

### Team Members (10 Total)
- Accounts Team: 2 members
- Transport Team: 2 members
- Admin: 2 members
- HR: 2 members
- IT: 2 members
- Password: Team@123

### Fees (60 Total)
- 3 fees per student:
  1. Tuition Fee: ₹5000 (Grade 10) / ₹6000 (Grade 12)
  2. Transport Fee: ₹1500
  3. Activity Fee: ₹500 (Grade 10) / ₹600 (Grade 12)
- Status: Mix of Paid and Pending
- Due Date: 2024-06-30

---

## Login Credentials

### Admin
- Email: `abhiyeduru@gmail.com`
- Password: (your existing password)

### Sample Student Logins
- Email: `arjun.kumar@student.edu` | Password: `1`
- Email: `priya.sharma@student.edu` | Password: `2`
- Email: `neha.gupta@student.edu` | Password: `3`
- (Pattern: email = name@student.edu, password = roll number)

### Sample Teacher Logins
- Email: `rajesh.kumar@school.edu` | Password: `Teacher@123`
- Email: `priya.sharma@school.edu` | Password: `Teacher@123`
- (All teachers use: Teacher@123)

### Sample Team Member Logins
- Email: `ramesh.accounts@school.edu` | Password: `Team@123`
- Email: `vikram.transport@school.edu` | Password: `Team@123`
- (All team members use: Team@123)

---

## Verification Checklist

After import, verify the following in the admin dashboard:

- [ ] Classes page shows 4 classes (10A, 10B, 12A, 12B)
- [ ] Students page shows 20 students with correct class/section
- [ ] Teachers page shows 10 teachers with specializations
- [ ] Subjects page shows 20 subjects with assigned teachers
- [ ] Fees page shows 60 fee records
- [ ] Transport Routes page shows 10 routes
- [ ] Teams page shows 10 team members
- [ ] Student can login with email and roll number as password
- [ ] Teacher can login with email and "Teacher@123"
- [ ] Team member can login with email and "Team@123"

---

## Troubleshooting

### Issue: "Class not found" error during import
**Solution**: Run the import script first to create classes, or create classes manually before importing students.

### Issue: "Email already exists" error
**Solution**: This is normal if you're re-importing. Use "Update if exists" mode to overwrite.

### Issue: Data not visible after import
**Solution**: 
1. Refresh the page (F5)
2. Click the "Refresh" button in the admin page
3. Check browser console for errors (F12)

### Issue: Import takes too long
**Solution**: This is normal for large imports. Wait for completion. Don't close the browser.

---

## File Locations

All CSV files are located in the project root:
- `gravity-crm/sample-teachers-import.csv`
- `gravity-crm/sample-students-20.csv`
- `gravity-crm/sample-subjects-import.csv`
- `gravity-crm/sample-fees-import.csv`
- `gravity-crm/sample-bus-routes-import.csv`
- `gravity-crm/sample-teams-import.csv`

Import script:
- `gravity-crm/backend/import-college-data.js`

---

## Next Steps

After importing data:
1. ✅ Login as admin
2. ✅ Verify all data is visible
3. ✅ Test student login
4. ✅ Test teacher login
5. ✅ Create exams and mark attendance
6. ✅ Upload marks for students
7. ✅ Generate reports

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the browser console (F12) for error messages
3. Check the backend logs for API errors
4. Verify the database connection is working

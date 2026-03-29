# 🎓 How to Use the Admission Workflow

## Your Project Already Has This Feature!

The Student Admission Approval Workflow is already fully implemented in your project. Here's how to use it:

---

## Quick Access

### For Admission Team:
**URL:** http://localhost:3002/admin/admissions

### For Admin:
**URL:** http://localhost:3002/admin/admissions

---

## Step-by-Step Guide

### 1. Admission Team Creates Application

#### Access the Page:
1. Login as Admission Team member
2. Click "Admissions" in sidebar
3. You'll see the admissions dashboard

#### Create New Admission:
1. Click "Add New Admission" or "Create Admission" button
2. Fill in the form:
   - Applicant Name
   - Email
   - Phone
   - Applied For (Class/Grade)
   - Date of Birth
   - Father/Mother Name
   - Address
   - Previous School
   - Documents (optional)
3. Click "Submit"
4. Status automatically set to **"pending"**

---

### 2. Admin Reviews Pending Admissions

#### View Pending List:
1. Login as Admin
2. Go to "Admissions" page
3. You'll see tabs or filters:
   - All
   - Pending ← Click here
   - Approved
   - Rejected

#### Pending Admissions Table:
```
┌─────────────────────────────────────────────────────────┐
│  Admission Number | Name      | Email     | Status      │
├─────────────────────────────────────────────────────────┤
│  ADM2025-001      | John Doe  | john@...  | Pending     │
│  [Approve] [Reject]                                     │
├─────────────────────────────────────────────────────────┤
│  ADM2025-002      | Jane Smith| jane@...  | Pending     │
│  [Approve] [Reject]                                     │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Admin Approves Admission

#### Approve Process:
1. Find the admission in pending list
2. Click **"Approve"** button
3. Confirmation dialog may appear
4. Click "Confirm"
5. Status changes to **"approved"**
6. Success message appears
7. Admission moves to "Approved" tab

#### What Happens:
- Status: "pending" → "approved"
- approvedDate: Set to current date
- Can now be converted to Student

---

### 4. Admin Rejects Admission

#### Reject Process:
1. Find the admission in pending list
2. Click **"Reject"** button
3. Dialog appears asking for reason
4. Enter rejection reason:
   - "Incomplete documents"
   - "Does not meet criteria"
   - "Age requirement not met"
   - etc.
5. Click "Confirm"
6. Status changes to **"rejected"**
7. Admission moves to "Rejected" tab

#### What Happens:
- Status: "pending" → "rejected"
- rejectionReason: Saved
- Applicant can be notified

---

### 5. Convert Approved to Student (Optional)

#### Conversion Process:
1. Go to "Approved" admissions
2. Find the admission
3. Click **"Convert to Student"** or **"Enroll"**
4. Student record created automatically
5. Status changes to **"enrolled"**
6. Student can now login

#### Auto-Generated:
- Student ID
- Email (if not provided)
- Password (default or generated)
- User account
- Login credentials

---

## API Testing (For Developers)

### Create Admission
```bash
POST http://localhost:5000/api/admissions/form
Content-Type: application/json

{
  "applicantName": "John Doe",
  "applicantEmail": "john@example.com",
  "applicantPhone": "9876543210",
  "appliedFor": "Grade 10",
  "address": "123 Main St",
  "collegeId": "your-college-id"
}
```

### Get Pending Admissions
```bash
GET http://localhost:5000/api/admissions?status=pending
Authorization: Bearer <admin-token>
```

### Approve Admission
```bash
PUT http://localhost:5000/api/admissions/:admissionId/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "comments": "Approved for admission"
}
```

### Reject Admission
```bash
PUT http://localhost:5000/api/admissions/:admissionId/reject
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "rejectionReason": "Incomplete documents",
  "comments": "Please resubmit with all required documents"
}
```

---

## Status Flow Diagram

```
┌─────────────────┐
│  Admission Team │
│  Creates Form   │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ PENDING │ ← Default status
    └────┬────┘
         │
    ┌────┴────┐
    │  Admin  │
    │ Reviews │
    └────┬────┘
         │
    ┌────┴─────────┐
    │              │
    ▼              ▼
┌──────────┐  ┌──────────┐
│ APPROVED │  │ REJECTED │
└────┬─────┘  └──────────┘
     │
     ▼
┌──────────┐
│ ENROLLED │ ← Converted to Student
└──────────┘
```

---

## Features Available

### Admission Team Can:
- ✅ Create new admissions
- ✅ View all admissions
- ✅ Update admission details
- ✅ Upload documents
- ✅ Add comments
- ✅ Filter by status
- ✅ Search admissions
- ❌ Cannot approve/reject

### Admin Can:
- ✅ View all admissions
- ✅ Filter by status (pending/approved/rejected)
- ✅ Approve admissions
- ✅ Reject admissions (with reason)
- ✅ Convert to students
- ✅ View statistics
- ✅ Bulk operations
- ✅ Export data

---

## Filters and Search

### Available Filters:
- Status: All, Pending, Approved, Rejected, Enrolled
- Date Range: Last 7 days, Last 30 days, Custom
- Applied For: Grade 10, Grade 11, Grade 12, etc.

### Search By:
- Admission Number
- Applicant Name
- Email
- Phone

---

## Statistics Dashboard

### Admin Can View:
- Total Admissions
- Pending Count
- Approved Count
- Rejected Count
- Enrolled Count
- Approval Rate
- Monthly Trends
- Class-wise Distribution

---

## Notifications (If Configured)

### Email Notifications:
- Admission received (to applicant)
- Admission approved (to applicant)
- Admission rejected (to applicant with reason)
- Documents required (to applicant)

### In-App Notifications:
- New admission (to Admin)
- Pending approvals (to Admin)
- Status updates (to Admission Team)

---

## Bulk Operations

### Bulk Import:
1. Download CSV template
2. Fill with admission data
3. Upload CSV file
4. All admissions created with status="pending"

### Bulk Approve:
1. Select multiple pending admissions
2. Click "Bulk Approve"
3. All selected admissions approved

### Bulk Reject:
1. Select multiple pending admissions
2. Click "Bulk Reject"
3. Enter common reason
4. All selected admissions rejected

---

## Common Workflows

### Workflow 1: Standard Admission
```
1. Admission Team creates admission
2. Status: pending
3. Admin reviews
4. Admin approves
5. Status: approved
6. Admin converts to student
7. Status: enrolled
8. Student can login
```

### Workflow 2: Rejected Admission
```
1. Admission Team creates admission
2. Status: pending
3. Admin reviews
4. Admin rejects (with reason)
5. Status: rejected
6. Applicant notified
7. Can reapply later
```

### Workflow 3: Bulk Processing
```
1. Admission Team imports CSV
2. Multiple admissions created
3. All status: pending
4. Admin bulk approves qualified ones
5. Admin bulk rejects unqualified ones
6. Batch conversion to students
```

---

## Troubleshooting

### "Cannot approve admission"
- Check you're logged in as Admin
- Verify admission status is "pending"
- Check authorization token

### "Admission not found"
- Verify admission ID is correct
- Check college ID matches
- Ensure admission exists

### "Missing required fields"
- Check all required fields filled
- Verify email format
- Check phone number format

---

## Quick Reference

### URLs:
- Admissions List: `/admin/admissions`
- Create Admission: `/admin/admissions/create`
- Admission Details: `/admin/admissions/:id`

### API Endpoints:
- Create: `POST /api/admissions/form`
- List: `GET /api/admissions`
- Approve: `PUT /api/admissions/:id/approve`
- Reject: `PUT /api/admissions/:id/reject`

### Roles:
- AdmissionTeam: Create, View, Update
- Admin: All operations + Approve/Reject

---

## Everything is Ready!

Your admission workflow is fully functional. Just:
1. Login to the system
2. Navigate to Admissions page
3. Start creating and approving admissions!

No setup or configuration needed. 🎉

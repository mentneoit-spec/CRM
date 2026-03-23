# 📍 Where to Find Teams - Complete Guide

## ⚠️ IMPORTANT: You Need Admin Access!

Currently, you're logged in as **"Student"** (visible in top-left corner).

To access Team Management, you MUST login as **Admin**.

---

## 🔐 Step 1: Login as Admin

### Option A: Logout and Login
1. Click your profile icon (bottom-left)
2. Click "Logout"
3. Login with Admin credentials

### Option B: Direct Login URL
Go to: http://localhost:3002/login

---

## 📂 Step 2: Navigate to Teams

Once logged in as Admin, you have 3 ways to access Teams:

### Method 1: Via Sidebar (Recommended)
```
1. Look for "Organization" menu in left sidebar
2. Click "Organization" to expand
3. You'll see:
   - Admission Team
   - Accounts Team
   - Transport Team
4. Click any team to manage
```

### Method 2: Direct URLs
```
Admission Team:  http://localhost:3002/admin/admission-team
Accounts Team:   http://localhost:3002/admin/accounts-team
Transport Team:  http://localhost:3002/admin/transport-team
```

### Method 3: From Dashboard
```
1. Go to Admin Dashboard
2. Look for "Quick Actions" or "Teams" section
3. Click team management link
```

---

## 🗂️ Complete Sidebar Structure

When logged in as Admin, your sidebar should look like this:

```
📊 Dashboard
📚 Academic
   ├─ Classes & Sections
   ├─ Subjects
   ├─ Teachers
   ├─ Students
   └─ Import Students CSV
📋 Academics
   ├─ Attendance
   ├─ Homework
   ├─ Exams
   ├─ Results
   └─ Send Marks Email
⚖️ Admissions  ← You are here (wrong page!)
💰 Finance
   ├─ Fees Management
   ├─ Payments
   └─ Receipts
🚌 Transport
   ├─ Routes
   ├─ Buses
   └─ Drivers
🔔 Communication
   ├─ Notices
   ├─ Complaints
   └─ Messages
👥 Organization  ← TEAMS ARE HERE!
   ├─ Admission Team  ← Click here for Admission Team
   ├─ Accounts Team   ← Click here for Accounts Team
   └─ Transport Team  ← Click here for Transport Team
📊 Reports
⚙️ Settings
```

---

## 🎯 What You're Looking For

### Current Page (Wrong):
- **URL:** `/admin/admissions`
- **Page:** "Admissions Team Dashboard"
- **Shows:** Admission applications (pending, approved, rejected)
- **Purpose:** Manage student admission applications

### Correct Page (What You Need):
- **URL:** `/admin/admission-team`
- **Page:** "Admission Team Management"
- **Shows:** Team members list with Add/Edit/Delete buttons
- **Purpose:** Manage team members who can create admissions

---

## 📸 Visual Difference

### Wrong Page (Where You Are):
```
┌─────────────────────────────────────┐
│  Admissions Team Dashboard          │
├─────────────────────────────────────┤
│  Total Applications: 0              │
│  Pending: 0                         │
│  Approved: 0                        │
│                                     │
│  [Search by name, email, phone]     │
│  [Status dropdown]                  │
│                                     │
│  Name | Email | Phone | Status      │
│  No admissions found                │
└─────────────────────────────────────┘
```

### Correct Page (What You Need):
```
┌─────────────────────────────────────┐
│  Admission Team Management          │
│                  [+ Add Team Member]│
├─────────────────────────────────────┤
│  Total Members: 2                   │
│  Active: 2                          │
│                                     │
│  Name | Email | Phone | Status      │
│  ABHI YEDURU | abhi@... | Active    │
│  [Edit] [Delete]                    │
└─────────────────────────────────────┘
```

---

## 🔑 Quick Access URLs

### Team Management Pages:
```
Admission Team Management:
http://localhost:3002/admin/admission-team

Accounts Team Management:
http://localhost:3002/admin/accounts-team

Transport Team Management:
http://localhost:3002/admin/transport-team
```

### Admission Applications Page (Current):
```
Admissions Dashboard:
http://localhost:3002/admin/admissions
```

---

## ✅ Step-by-Step Instructions

### To Access Admission Team Management:

1. **Check Your Role**
   - Look at top-left corner
   - Should say "Admin" not "Student"
   - If it says "Student", logout and login as Admin

2. **Find Organization Menu**
   - Scroll down in left sidebar
   - Look for "Organization" with 👥 icon
   - It's below "Communication" and above "Reports"

3. **Expand Organization**
   - Click on "Organization"
   - Menu expands to show 3 options

4. **Click Admission Team**
   - Click "Admission Team"
   - You'll be taken to `/admin/admission-team`
   - You'll see the team members list

5. **Add Team Member**
   - Click blue "+ Add Team Member" button
   - Fill in the form
   - Click "Create"

---

## 🚨 Common Issues

### Issue 1: "Organization" Menu Not Visible
**Cause:** Logged in as Student, not Admin
**Solution:** Logout and login as Admin

### Issue 2: Can't Find "Organization" in Sidebar
**Cause:** Sidebar not scrolled down enough
**Solution:** Scroll down in the sidebar

### Issue 3: "Access Denied" Error
**Cause:** Don't have Admin role
**Solution:** Contact system administrator

---

## 🎓 Understanding the Difference

### Admissions (Applications):
- **Purpose:** Manage student admission applications
- **Who uses:** Admin and Admission Team
- **What it shows:** List of students who applied
- **Actions:** Approve, Reject, View details

### Admission Team (Members):
- **Purpose:** Manage team members who handle admissions
- **Who uses:** Admin only
- **What it shows:** List of team members
- **Actions:** Add, Edit, Delete team members

---

## 📝 Summary

**You are currently at:** `/admin/admissions` (Admission Applications)
**You need to go to:** `/admin/admission-team` (Team Management)

**How to get there:**
1. Login as Admin (not Student)
2. Find "Organization" in sidebar
3. Click "Admission Team"
4. You'll see team members with Add/Edit/Delete buttons

---

## 🔗 Quick Links

Copy and paste these URLs directly:

**Team Management:**
- http://localhost:3002/admin/admission-team
- http://localhost:3002/admin/accounts-team
- http://localhost:3002/admin/transport-team

**Login Page:**
- http://localhost:3002/login

---

## ✨ Once You're There

When you successfully reach the Admission Team Management page, you'll see:
- ✅ "Admission Team Management" as the page title
- ✅ "+ Add Team Member" button in top-right
- ✅ List of existing team members
- ✅ Edit and Delete buttons for each member
- ✅ Total Members and Active count

That's the correct page! 🎉

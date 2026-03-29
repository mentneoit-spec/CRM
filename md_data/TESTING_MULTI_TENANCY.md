# Quick Testing Guide - Multi-Tenancy

## Prerequisites

1. Backend running on port 5001
2. Frontend running on port 3000
3. Database connected (Neon PostgreSQL)

## Quick Start

### 1. Create Test Data (if not already created)

```bash
cd gravity-crm/backend
node create-dummy-data.js
```

This creates:
- 3 colleges: College A, College B, College C
- 3 admins: admin-a@college-a.com, admin-b@college-b.com, admin-c@college-c.com
- 4 students per college
- 2 teachers per college
- All with password: `Test@123`

### 2. Verify Database Data

```bash
node verify-multi-tenancy.js
```

Should show:
- ✅ 3 colleges
- ✅ 3 admins (each assigned to their college)
- ✅ 12 students (4 per college)
- ✅ 6 teachers (2 per college)
- ✅ All data properly isolated

### 3. Test API Endpoints

```bash
node test-multi-tenancy-api.js
```

Should show:
- ✅ Admin A can access College A data
- ✅ Admin B can access College B data
- ✅ Admin A cannot access College B data
- ✅ Super Admin can access all colleges

## Manual Testing in Browser

### Test 1: Admin A Dashboard

1. Go to `http://localhost:3000`
2. Login:
   - Email: `admin-a@college-a.com`
   - Password: `Test@123`
3. Click "Students" in sidebar
4. **Expected**: See only College A students
5. Note the student names and count

### Test 2: Admin B Dashboard

1. Logout (click Account Menu → Logout)
2. Login:
   - Email: `admin-b@college-b.com`
   - Password: `Test@123`
3. Click "Students" in sidebar
4. **Expected**: See different students (College B only)
5. **Verify**: Student names are different from Admin A's list

### Test 3: Admin C Dashboard

1. Logout
2. Login:
   - Email: `admin-c@college-c.com`
   - Password: `Test@123`
3. Click "Students" in sidebar
4. **Expected**: See different students (College C only)
5. **Verify**: Student names are different from Admin A and B

### Test 4: Super Admin Dashboard

1. Logout
2. Login:
   - Email: `superadmin@demo.com`
   - Password: `Test@123`
3. Go to Super Admin Dashboard
4. **Expected**: See all colleges and platform-wide metrics

## What to Check

### ✅ Data Isolation

- [ ] Admin A sees only College A students
- [ ] Admin B sees only College B students
- [ ] Admin C sees only College C students
- [ ] Super Admin sees all colleges

### ✅ Student Count

- [ ] Admin A: 4 students
- [ ] Admin B: 4 students
- [ ] Admin C: 4 students
- [ ] Total: 12 students

### ✅ Teacher Count

- [ ] Admin A: 2 teachers
- [ ] Admin B: 2 teachers
- [ ] Admin C: 2 teachers
- [ ] Total: 6 teachers

### ✅ Class Count

- [ ] Admin A: 3 classes
- [ ] Admin B: 3 classes
- [ ] Admin C: 3 classes
- [ ] Total: 9 classes

## Browser DevTools Verification

### Check API Responses

1. Open DevTools (F12)
2. Go to Network tab
3. Login as Admin A
4. Click "Students"
5. Find the API request (should be `/api/admin/students`)
6. Click on it and check Response
7. **Expected**: All students have `collegeId` matching Admin A's college

### Check Request Headers

1. In Network tab, click on the students request
2. Go to "Headers" tab
3. Look for `Authorization: Bearer <token>`
4. The token contains the user's collegeId

## Test Scenarios

### Scenario 1: Cross-College Access Prevention

**Goal**: Verify Admin A cannot access Admin B's data

**Steps**:
1. Login as Admin A
2. Open DevTools → Network tab
3. Try to manually fetch Admin B's college data:
   ```javascript
   // In browser console
   fetch('http://localhost:5001/api/admin/students?collegeId=<admin-b-college-id>', {
       headers: { 'Authorization': 'Bearer <admin-a-token>' }
   }).then(r => r.json()).then(console.log)
   ```
4. **Expected**: Either 403 Forbidden or only Admin A's data returned

### Scenario 2: Super Admin Access

**Goal**: Verify Super Admin can see all colleges

**Steps**:
1. Login as Super Admin
2. Go to Colleges page
3. **Expected**: See all 3 colleges (A, B, C)
4. Click on each college
5. **Expected**: Can view each college's details

### Scenario 3: Create Student in College A

**Goal**: Verify new student is assigned to correct college

**Steps**:
1. Login as Admin A
2. Go to Students → Add Student
3. Fill form and submit
4. **Expected**: Student appears in Admin A's student list
5. Logout and login as Admin B
6. Go to Students
7. **Expected**: New student does NOT appear in Admin B's list

## Troubleshooting

### Issue: All admins see the same students

**Check**:
1. Run `node verify-multi-tenancy.js`
2. Verify each admin has different collegeId
3. Check middleware/auth.js - ensure `req.collegeId` is set correctly

### Issue: Admin can see other colleges' data

**Check**:
1. Verify `authorizeCollege` middleware is applied to route
2. Check controller - ensure query filters by `req.collegeId`
3. Run `node test-multi-tenancy-api.js` to identify which endpoint is broken

### Issue: Super Admin cannot see all colleges

**Check**:
1. Verify Super Admin role is set correctly
2. Check superadmin-controller.js - ensure no collegeId filter
3. Verify route doesn't use `authorizeCollege` middleware

## Success Criteria

✅ **Multi-tenancy is working correctly if**:

1. Each admin sees only their college's data
2. Admins cannot access other colleges' data
3. Super Admin can see all colleges
4. New data is created in the correct college
5. API tests pass without errors
6. Database verification shows proper isolation

## Next Steps

If all tests pass:
1. ✅ Multi-tenancy is verified and working
2. ✅ System is ready for production
3. ✅ Can safely add more colleges and admins

If tests fail:
1. Check the error messages
2. Review the troubleshooting section
3. Check the relevant controller/middleware files
4. Run verification scripts to identify the issue

## Test Data Credentials

### College A
- Admin: `admin-a@college-a.com` / `Test@123`
- Students: Student A1, A2, A3, A4

### College B
- Admin: `admin-b@college-b.com` / `Test@123`
- Students: Student B1, B2, B3, B4

### College C
- Admin: `admin-c@college-c.com` / `Test@123`
- Students: Student C1, C2, C3, C4

### Super Admin
- Email: `superadmin@demo.com` / `Test@123`
- Can access all colleges

## Commands Reference

```bash
# Create test data
node create-dummy-data.js

# Verify database isolation
node verify-multi-tenancy.js

# Test API endpoints
node test-multi-tenancy-api.js

# Clear old data (if needed)
node clear-old-data.js
```

---

**Last Updated**: March 21, 2026
**Status**: ✅ Multi-Tenancy Verified and Working

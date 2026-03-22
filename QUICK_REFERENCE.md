# Quick Reference Guide

## Start the System

```bash
# Terminal 1 - Backend
cd gravity-crm/backend
npm start

# Terminal 2 - Frontend
cd gravity-crm/frontend
npm start
```

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@demo.com | Test@123 |
| College Admin | admin@demo.com | Test@123 |
| Student | auto-generated | roll number |

## Verify Multi-Tenancy

```bash
cd gravity-crm/backend

# Check database data
node verify-multi-tenancy.js

# Check admin users
node check-admins.js

# Test API endpoints
node test-multi-tenancy-api.js
```

## Create Test Data

```bash
cd gravity-crm/backend
node create-dummy-data.js
```

## Key Features

### ✅ Multi-Tenancy
- Super Admin creates colleges
- Each college has its own admin
- Admins only see their college's data
- Complete data isolation

### ✅ Student Management
- Create students manually or via CSV
- Auto-generate login credentials
- Student profiles with all details
- Student dashboard

### ✅ Teacher Management
- Create teachers manually or via CSV
- Teacher profiles
- Subject assignments

### ✅ Class Management
- Create classes per college
- Create sections per class
- Manual entry option

### ✅ Admin Dashboard
- College-specific metrics
- Student, teacher, class counts
- Revenue tracking
- Charts and analytics

### ✅ Super Admin Dashboard
- Platform-wide analytics
- All colleges overview
- Admin management

## Database

- **Type**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Schema**: `gravity-crm/backend/prisma/schema.prisma`

## API Endpoints

### Admin Endpoints
```
GET    /api/admin/students
GET    /api/admin/teachers
GET    /api/admin/classes
GET    /api/admin/subjects
GET    /api/admin/fees
GET    /api/admin/dashboard
POST   /api/admin/students
POST   /api/admin/teachers
POST   /api/admin/classes
```

### Super Admin Endpoints
```
GET    /api/superadmin/colleges
POST   /api/superadmin/colleges
GET    /api/superadmin/analytics
GET    /api/superadmin/audit-logs
POST   /api/superadmin/admins
```

## File Structure

```
gravity-crm/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── prisma/
│   ├── index.js
│   └── create-dummy-data.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── App.js
│   └── package.json
└── Documentation files
```

## Documentation

- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete overview
- `MULTI_TENANCY_STATUS_REPORT.md` - Current status
- `MULTI_TENANCY_VERIFICATION_GUIDE.md` - Testing guide
- `TESTING_MULTI_TENANCY.md` - Quick testing
- `README_CURRENT_STATE.md` - Current state
- `PERFORMANCE_OPTIMIZATION.md` - Performance details

## Common Commands

```bash
# Create test data
node create-dummy-data.js

# Verify multi-tenancy
node verify-multi-tenancy.js

# Check admins
node check-admins.js

# Test API
node test-multi-tenancy-api.js

# Clear old data
node clear-old-data.js

# Run database migrations
npx prisma migrate dev

# View database
npx prisma studio
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot login | Check email/password, verify user exists |
| Admin sees other college's data | Run verify-multi-tenancy.js, check collegeId |
| Dashboard is slow | Check database connection, verify indexes |
| Student credentials not generated | Check student has email, verify roll number |
| API returns 403 | Check user's collegeId, verify JWT token |

## Status

✅ **System is fully functional and production ready**

- Multi-tenancy verified
- All features working
- Performance optimized
- Security implemented

---

**Last Updated**: March 21, 2026  
**Version**: 1.0.0

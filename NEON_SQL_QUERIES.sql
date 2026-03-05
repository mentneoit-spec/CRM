-- ============================================
-- NEON SQL QUERIES - Copy and paste these into Neon SQL Editor
-- Go to: https://console.neon.tech → SQL Editor
-- ============================================

-- 1. VIEW ALL USERS (Should show 7 users)
SELECT * FROM "User" ORDER BY "createdAt" DESC;

-- 2. COUNT USERS
SELECT COUNT(*) as total_users FROM "User";

-- 3. VIEW USERS BY ROLE
SELECT role, COUNT(*) as count 
FROM "User" 
GROUP BY role 
ORDER BY count DESC;

-- 4. VIEW USER DETAILS (Names and Emails)
SELECT 
    name, 
    email, 
    role, 
    "isActive",
    "createdAt"
FROM "User" 
ORDER BY "createdAt" DESC;

-- 5. CHECK ACTIVE USERS
SELECT 
    name, 
    email, 
    role 
FROM "User" 
WHERE "isActive" = true;

-- 6. VIEW ALL TABLES IN DATABASE
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 7. COUNT RECORDS IN ALL TABLES
SELECT 
    'User' as table_name, COUNT(*) as records FROM "User"
UNION ALL
SELECT 'College', COUNT(*) FROM "College"
UNION ALL
SELECT 'Student', COUNT(*) FROM "Student"
UNION ALL
SELECT 'Teacher', COUNT(*) FROM "Teacher"
UNION ALL
SELECT 'Parent', COUNT(*) FROM "Parent"
UNION ALL
SELECT 'Admin', COUNT(*) FROM "Admin"
UNION ALL
SELECT 'SuperAdmin', COUNT(*) FROM "SuperAdmin"
ORDER BY records DESC;

-- 8. VIEW LATEST 5 USERS
SELECT 
    name, 
    email, 
    role, 
    "createdAt"
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- 9. SEARCH USER BY EMAIL
-- Replace 'admin@college.com' with any email you want to search
SELECT * FROM "User" WHERE email = 'admin@college.com';

-- 10. VIEW DATABASE VERSION
SELECT version();

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- Query 1: Should show 7 users
-- Query 2: Should show total_users = 7
-- Query 3: Should show breakdown by role
-- Query 6: Should show 31 tables
-- Query 7: Should show User table has 7 records
-- ============================================

-- ============================================
-- TROUBLESHOOTING:
-- ============================================
-- If you see 0 results:
-- 1. Check you're on the "main" branch (top of page)
-- 2. Verify correct project (ep-gentle-thunder-aioue7ye)
-- 3. Click "Refresh" button
-- 4. Try Ctrl+Shift+R to clear cache
-- ============================================

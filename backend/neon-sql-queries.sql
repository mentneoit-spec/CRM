-- ============================================================
-- NEON SQL EDITOR QUERIES
-- Copy and paste these into Neon Console > SQL Editor
-- ============================================================

-- 1. CHECK IF TABLES EXIST
-- This shows all tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================

-- 2. COUNT ALL RECORDS IN MAIN TABLES
-- This shows how many records are in each table
SELECT 
  'User' as table_name, COUNT(*) as record_count FROM "User"
UNION ALL
SELECT 'College', COUNT(*) FROM "College"
UNION ALL
SELECT 'Student', COUNT(*) FROM "Student"
UNION ALL
SELECT 'Teacher', COUNT(*) FROM "Teacher"
UNION ALL
SELECT 'Admin', COUNT(*) FROM "Admin"
UNION ALL
SELECT 'Parent', COUNT(*) FROM "Parent"
UNION ALL
SELECT 'Sclass', COUNT(*) FROM "Sclass"
UNION ALL
SELECT 'Subject', COUNT(*) FROM "Subject"
ORDER BY record_count DESC;

-- ============================================================

-- 3. SHOW ALL USERS
-- This displays all users with their details
SELECT 
  id,
  name,
  email,
  role,
  "isActive",
  "createdAt",
  "updatedAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 20;

-- ============================================================

-- 4. SHOW RECENT USERS (LAST 10)
-- This shows the most recently created users
SELECT 
  name,
  email,
  role,
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;

-- ============================================================

-- 5. COUNT USERS BY ROLE
-- This shows how many users of each role type
SELECT 
  role,
  COUNT(*) as count
FROM "User"
GROUP BY role
ORDER BY count DESC;

-- ============================================================

-- 6. CHECK DATABASE CONNECTION INFO
-- This shows which database you're connected to
SELECT 
  current_database() as database_name,
  current_user as connected_user,
  inet_server_addr() as server_ip,
  version() as postgres_version;

-- ============================================================

-- 7. SHOW ALL COLLEGES
-- This displays all colleges in the system
SELECT 
  id,
  name,
  email,
  status,
  "subscriptionPlan",
  "createdAt"
FROM "College"
ORDER BY "createdAt" DESC;

-- ============================================================

-- 8. SHOW ALL STUDENTS WITH CLASS INFO
-- This shows students with their class details
SELECT 
  s.name as student_name,
  s.email,
  s."studentId",
  sc."sclassName" as class_name,
  c.name as college_name,
  s."createdAt"
FROM "Student" s
LEFT JOIN "Sclass" sc ON s."sclassId" = sc.id
LEFT JOIN "College" c ON s."collegeId" = c.id
ORDER BY s."createdAt" DESC
LIMIT 20;

-- ============================================================

-- 9. CHECK IF DATA EXISTS (QUICK CHECK)
-- This is a quick way to see if you have any data
SELECT 
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "College") as colleges,
  (SELECT COUNT(*) FROM "Student") as students,
  (SELECT COUNT(*) FROM "Teacher") as teachers;

-- ============================================================

-- 10. SHOW TABLE SIZES
-- This shows how much space each table is using
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================

-- 11. INSERT TEST USER (IF NEEDED)
-- Run this to insert a test user directly in Neon
INSERT INTO "User" (
  id,
  name,
  email,
  password,
  role,
  "isActive",
  "isEmailVerified",
  "isPhoneVerified",
  "twoFAEnabled",
  "isDeleted",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Neon SQL Test User',
  'neon-test-' || extract(epoch from now()) || '@test.com',
  'test-password-hash',
  'Admin',
  true,
  false,
  false,
  false,
  false,
  NOW(),
  NOW()
)
RETURNING id, name, email, "createdAt";

-- ============================================================

-- 12. DELETE TEST USERS (CLEANUP)
-- Run this to remove test users created during debugging
DELETE FROM "User" 
WHERE email LIKE '%test%@%' 
  OR email LIKE '%verify%@%'
  OR email LIKE '%neon-test%@%'
RETURNING name, email;

-- ============================================================

-- 13. SHOW USERS CREATED TODAY
-- This shows users created in the last 24 hours
SELECT 
  name,
  email,
  role,
  "createdAt"
FROM "User"
WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
ORDER BY "createdAt" DESC;

-- ============================================================

-- 14. CHECK FOR DUPLICATE EMAILS
-- This finds any duplicate email addresses
SELECT 
  email,
  COUNT(*) as count
FROM "User"
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- ============================================================

-- 15. VERIFY SCHEMA VERSION
-- This checks if Prisma migrations are applied
SELECT * FROM "_prisma_migrations"
ORDER BY "finished_at" DESC
LIMIT 5;

-- ============================================================
-- INSTRUCTIONS:
-- 1. Go to https://console.neon.tech
-- 2. Select your project
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Copy and paste any query above
-- 5. Click "Run" or press Ctrl+Enter
-- 6. View the results below
-- ============================================================

-- MOST IMPORTANT QUERY TO RUN FIRST:
-- This will tell you if you have any data at all
SELECT COUNT(*) as total_users FROM "User";

-- If this returns 0, your data is not in this database
-- If this returns > 0, your data IS here, just not visible in Tables view
-- ============================================================

-- ============================================================
-- PostgreSQL Data Verification Queries
-- Database: smsproject
-- ============================================================

-- ============================================================
-- BASIC QUERIES
-- ============================================================

-- List all tables
\dt

-- Describe table structure
\d "User"
\d "Student"
\d "College"
\d "Teacher"
\d "Payment"

-- Count all records in each table
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Students', COUNT(*) FROM "Student"
UNION ALL
SELECT 'Teachers', COUNT(*) FROM "Teacher"
UNION ALL
SELECT 'Colleges', COUNT(*) FROM "College"
UNION ALL
SELECT 'Admissions', COUNT(*) FROM "Admission"
UNION ALL
SELECT 'Payments', COUNT(*) FROM "Payment"
UNION ALL
SELECT 'Fees', COUNT(*) FROM "Fee"
UNION ALL
SELECT 'Classes', COUNT(*) FROM "Sclass"
UNION ALL
SELECT 'Subjects', COUNT(*) FROM "Subject"
UNION ALL
SELECT 'Parents', COUNT(*) FROM "Parent";

-- ============================================================
-- VIEW ALL RECORDS (Limited to 10)
-- ============================================================

-- View all users
SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 10;

-- View all students
SELECT * FROM "Student" ORDER BY "createdAt" DESC LIMIT 10;

-- View all teachers
SELECT * FROM "Teacher" ORDER BY "createdAt" DESC LIMIT 10;

-- View all colleges
SELECT * FROM "College" ORDER BY "createdAt" DESC;

-- View all admissions
SELECT * FROM "Admission" ORDER BY "appliedDate" DESC LIMIT 10;

-- View all payments
SELECT * FROM "Payment" ORDER BY "createdAt" DESC LIMIT 10;

-- ============================================================
-- VIEW SPECIFIC COLUMNS
-- ============================================================

-- User basic info
SELECT 
    id, 
    name, 
    email, 
    role, 
    "isActive", 
    "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Student basic info
SELECT 
    id, 
    name, 
    email, 
    "studentId", 
    "sclassId", 
    "isActive",
    "createdAt"
FROM "Student"
ORDER BY "createdAt" DESC
LIMIT 10;

-- College info
SELECT 
    id, 
    name, 
    email, 
    status, 
    "maxUsers", 
    "subscriptionPlan",
    "createdAt"
FROM "College"
ORDER BY "createdAt" DESC;

-- Payment info
SELECT 
    id,
    "transactionId",
    amount,
    status,
    "paymentMethod",
    "paymentDate",
    "createdAt"
FROM "Payment"
ORDER BY "createdAt" DESC
LIMIT 10;

-- ============================================================
-- SEARCH QUERIES
-- ============================================================

-- Find user by email
SELECT * FROM "User" WHERE email = 'test@example.com';

-- Find student by student ID
SELECT * FROM "Student" WHERE "studentId" = 'STU001';

-- Find active users
SELECT * FROM "User" WHERE "isActive" = true;

-- Find users by role
SELECT * FROM "User" WHERE role = 'Student';
SELECT * FROM "User" WHERE role = 'Teacher';
SELECT * FROM "User" WHERE role = 'Admin';

-- Find users by college
SELECT * FROM "User" WHERE "collegeId" = 'your-college-id-here';

-- Find recent registrations (last 7 days)
SELECT * FROM "User" 
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY "createdAt" DESC;

-- Find pending admissions
SELECT * FROM "Admission" WHERE status = 'pending';

-- Find completed payments
SELECT * FROM "Payment" WHERE status = 'completed';

-- Find students in a specific class
SELECT * FROM "Student" WHERE "sclassId" = 'your-class-id-here';

-- ============================================================
-- JOIN QUERIES (View Related Data)
-- ============================================================

-- Students with their class info
SELECT 
    s.id,
    s.name as student_name,
    s.email,
    s."studentId",
    c."sclassName" as class_name,
    c."sclassCode" as class_code
FROM "Student" s
LEFT JOIN "Sclass" c ON s."sclassId" = c.id
ORDER BY s."createdAt" DESC
LIMIT 10;

-- Users with their college
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    col.name as college_name,
    col.status as college_status
FROM "User" u
LEFT JOIN "College" col ON u."collegeId" = col.id
ORDER BY u."createdAt" DESC
LIMIT 10;

-- Payments with student info
SELECT 
    p.id,
    p."transactionId",
    p.amount,
    p.status,
    p."paymentDate",
    s.name as student_name,
    s.email as student_email,
    s."studentId"
FROM "Payment" p
LEFT JOIN "Student" s ON p."studentId" = s.id
ORDER BY p."createdAt" DESC
LIMIT 10;

-- Students with all their details
SELECT 
    s.id,
    s.name as student_name,
    s."studentId",
    s.email,
    c."sclassName" as class_name,
    col.name as college_name,
    u.role as user_role
FROM "Student" s
LEFT JOIN "Sclass" c ON s."sclassId" = c.id
LEFT JOIN "College" col ON s."collegeId" = col.id
LEFT JOIN "User" u ON s."userId" = u.id
ORDER BY s."createdAt" DESC
LIMIT 10;

-- Teachers with their subjects
SELECT 
    t.id,
    t.name as teacher_name,
    t.email,
    t.qualification,
    COUNT(sub.id) as subject_count
FROM "Teacher" t
LEFT JOIN "Subject" sub ON sub."teacherId" = t.id
GROUP BY t.id, t.name, t.email, t.qualification
ORDER BY subject_count DESC;

-- ============================================================
-- AGGREGATE QUERIES
-- ============================================================

-- Total revenue
SELECT SUM(amount) as total_revenue 
FROM "Payment" 
WHERE status = 'completed';

-- Average fee amount
SELECT AVG(amount) as average_fee 
FROM "Fee";

-- Count users by role
SELECT 
    role, 
    COUNT(*) as count 
FROM "User" 
GROUP BY role
ORDER BY count DESC;

-- Count students by college
SELECT 
    c.name as college_name,
    COUNT(s.id) as student_count
FROM "College" c
LEFT JOIN "Student" s ON c.id = s."collegeId"
GROUP BY c.id, c.name
ORDER BY student_count DESC;

-- Count students by class
SELECT 
    sc."sclassName" as class_name,
    COUNT(s.id) as student_count
FROM "Sclass" sc
LEFT JOIN "Student" s ON sc.id = s."sclassId"
GROUP BY sc.id, sc."sclassName"
ORDER BY student_count DESC;

-- Payment statistics by status
SELECT 
    status,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM "Payment"
GROUP BY status;

-- Admission statistics by status
SELECT 
    status,
    COUNT(*) as count
FROM "Admission"
GROUP BY status;

-- ============================================================
-- DATE-BASED QUERIES
-- ============================================================

-- Records created today
SELECT * FROM "User" 
WHERE DATE("createdAt") = CURRENT_DATE;

-- Records created this week
SELECT * FROM "User" 
WHERE "createdAt" >= DATE_TRUNC('week', CURRENT_DATE);

-- Records created this month
SELECT * FROM "User" 
WHERE "createdAt" >= DATE_TRUNC('month', CURRENT_DATE);

-- Payments in last 30 days
SELECT * FROM "Payment"
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
ORDER BY "createdAt" DESC;

-- Admissions by month
SELECT 
    DATE_TRUNC('month', "appliedDate") as month,
    COUNT(*) as admission_count
FROM "Admission"
GROUP BY month
ORDER BY month DESC;

-- ============================================================
-- CHECK IF DATA EXISTS
-- ============================================================

-- Check if email exists
SELECT EXISTS(SELECT 1 FROM "User" WHERE email = 'test@example.com');

-- Check if student ID exists
SELECT EXISTS(SELECT 1 FROM "Student" WHERE "studentId" = 'STU001');

-- Check if college has students
SELECT EXISTS(
    SELECT 1 FROM "Student" 
    WHERE "collegeId" = 'your-college-id-here'
);

-- ============================================================
-- RECENT ACTIVITY
-- ============================================================

-- Last 10 users created
SELECT 
    name, 
    email, 
    role, 
    "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Last 10 payments
SELECT 
    "transactionId", 
    amount, 
    status, 
    "paymentDate",
    "createdAt"
FROM "Payment"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Last 10 admissions
SELECT 
    "admissionNumber", 
    "applicantName", 
    status, 
    "appliedDate"
FROM "Admission"
ORDER BY "appliedDate" DESC
LIMIT 10;

-- Last 10 students enrolled
SELECT 
    name,
    "studentId",
    email,
    "admissionYear",
    "createdAt"
FROM "Student"
ORDER BY "createdAt" DESC
LIMIT 10;

-- ============================================================
-- COMPLEX QUERIES
-- ============================================================

-- Students with pending fees
SELECT 
    s.name as student_name,
    s."studentId",
    f."feeType",
    f.amount,
    f."dueDate",
    COALESCE(SUM(p.amount), 0) as paid_amount,
    f.amount - COALESCE(SUM(p.amount), 0) as pending_amount
FROM "Student" s
JOIN "Fee" f ON s.id = f."studentId"
LEFT JOIN "Payment" p ON f.id = p."feeId" AND p.status = 'completed'
GROUP BY s.id, s.name, s."studentId", f.id, f."feeType", f.amount, f."dueDate"
HAVING f.amount > COALESCE(SUM(p.amount), 0);

-- College dashboard statistics
SELECT 
    c.name as college_name,
    COUNT(DISTINCT s.id) as total_students,
    COUNT(DISTINCT t.id) as total_teachers,
    COUNT(DISTINCT sc.id) as total_classes,
    COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_revenue
FROM "College" c
LEFT JOIN "Student" s ON c.id = s."collegeId"
LEFT JOIN "Teacher" t ON c.id = t."collegeId"
LEFT JOIN "Sclass" sc ON c.id = sc."collegeId"
LEFT JOIN "Payment" p ON c.id = p."collegeId"
WHERE c.id = 'your-college-id-here'
GROUP BY c.id, c.name;

-- Student performance summary
SELECT 
    s.name as student_name,
    s."studentId",
    COUNT(DISTINCT er.id) as total_exams,
    AVG(er."marksObtained") as average_marks,
    AVG(er.percentage) as average_percentage
FROM "Student" s
LEFT JOIN "ExamResult" er ON s.id = er."studentId"
WHERE s.id = 'your-student-id-here'
GROUP BY s.id, s.name, s."studentId";

-- Teacher workload
SELECT 
    t.name as teacher_name,
    t.email,
    COUNT(DISTINCT sub.id) as subjects_teaching,
    COUNT(DISTINCT hw.id) as homework_assigned,
    COUNT(DISTINCT ct.id) as classes_as_class_teacher
FROM "Teacher" t
LEFT JOIN "Subject" sub ON t.id = sub."teacherId"
LEFT JOIN "Homework" hw ON t.id = hw."teacherId"
LEFT JOIN "Sclass" ct ON t.id = ct."classTeacherId"
GROUP BY t.id, t.name, t.email;

-- ============================================================
-- DATA VALIDATION QUERIES
-- ============================================================

-- Find users without profiles
SELECT u.* 
FROM "User" u
LEFT JOIN "Student" s ON u.id = s."userId"
LEFT JOIN "Teacher" t ON u.id = t."userId"
LEFT JOIN "Parent" p ON u.id = p."userId"
LEFT JOIN "Admin" a ON u.id = a."userId"
WHERE u.role = 'Student' AND s.id IS NULL
   OR u.role = 'Teacher' AND t.id IS NULL
   OR u.role = 'Parent' AND p.id IS NULL
   OR u.role = 'Admin' AND a.id IS NULL;

-- Find students without classes
SELECT * FROM "Student" WHERE "sclassId" IS NULL;

-- Find orphaned records (students without users)
SELECT s.* 
FROM "Student" s
LEFT JOIN "User" u ON s."userId" = u.id
WHERE u.id IS NULL;

-- Find duplicate emails
SELECT email, COUNT(*) as count
FROM "User"
GROUP BY email
HAVING COUNT(*) > 1;

-- Find duplicate student IDs
SELECT "studentId", COUNT(*) as count
FROM "Student"
GROUP BY "studentId"
HAVING COUNT(*) > 1;

-- ============================================================
-- MAINTENANCE QUERIES
-- ============================================================

-- Delete test data (BE CAREFUL!)
-- DELETE FROM "Student" WHERE name LIKE 'Test%';
-- DELETE FROM "User" WHERE email LIKE 'test%';

-- Update user status
-- UPDATE "User" SET "isActive" = true WHERE id = 'user-id-here';

-- Update payment status
-- UPDATE "Payment" SET status = 'completed' WHERE id = 'payment-id-here';

-- ============================================================
-- PERFORMANCE QUERIES
-- ============================================================

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================================
-- BACKUP QUERIES
-- ============================================================

-- Export data to CSV (run in psql)
-- \copy "User" TO 'users_backup.csv' CSV HEADER;
-- \copy "Student" TO 'students_backup.csv' CSV HEADER;
-- \copy "Payment" TO 'payments_backup.csv' CSV HEADER;

-- ============================================================
-- NOTES
-- ============================================================

-- 1. Always use double quotes for table and column names in PostgreSQL
--    Example: "User", "createdAt", "isActive"
--
-- 2. Use single quotes for string values
--    Example: WHERE email = 'test@example.com'
--
-- 3. Be careful with DELETE and UPDATE queries
--    Always test with SELECT first
--
-- 4. Use LIMIT to avoid overwhelming results
--    Example: SELECT * FROM "User" LIMIT 10;
--
-- 5. Use transactions for multiple operations
--    BEGIN;
--    -- your queries here
--    COMMIT; -- or ROLLBACK;
--
-- 6. To exit psql: \q
--
-- 7. To get help: \?
--
-- 8. To list databases: \l
--
-- 9. To connect to database: \c smsproject
--
-- 10. To show current database: SELECT current_database();

-- ============================================================
-- END OF SQL QUERIES REFERENCE
-- ============================================================

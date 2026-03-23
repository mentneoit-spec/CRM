const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function verifyNeonConnection() {
  console.log('\n🔍 COMPREHENSIVE NEON CONNECTION VERIFICATION\n');
  console.log('='.repeat(70));
  
  try {
    // STEP 1: Check DATABASE_URL
    console.log('\n📋 STEP 1: DATABASE_URL Configuration');
    console.log('-'.repeat(70));
    const dbUrl = process.env.DATABASE_URL;
    console.log('Full URL:', dbUrl);
    
    const isNeon = dbUrl.includes('neon.tech');
    const isPooler = dbUrl.includes('-pooler');
    const hasSsl = dbUrl.includes('sslmode=require');
    
    console.log(`✓ Is Neon: ${isNeon ? 'YES ✅' : 'NO ❌'}`);
    console.log(`✓ Using Pooler: ${isPooler ? 'YES ⚠️' : 'NO'}`);
    console.log(`✓ SSL Enabled: ${hasSsl ? 'YES ✅' : 'NO ❌'}`);
    
    if (isPooler) {
      console.log('\n⚠️  WARNING: You are using connection pooler endpoint!');
      console.log('   Pooler URL: Good for serverless, but may cause dashboard sync issues');
      console.log('   Direct URL: Better for development and dashboard visibility');
    }
    
    // STEP 2: Connect and verify
    console.log('\n📋 STEP 2: Testing Connection');
    console.log('-'.repeat(70));
    await prisma.$connect();
    console.log('✅ Successfully connected to database');
    
    // STEP 3: Get actual database details
    console.log('\n📋 STEP 3: Database Server Information');
    console.log('-'.repeat(70));
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as connected_user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port,
        pg_backend_pid() as backend_pid,
        version() as postgres_version
    `;
    
    console.log('Database Name:', dbInfo[0].database_name);
    console.log('Connected User:', dbInfo[0].connected_user);
    console.log('Server IP:', dbInfo[0].server_ip || 'Cloud (Neon)');
    console.log('Server Port:', dbInfo[0].server_port);
    console.log('Backend PID:', dbInfo[0].backend_pid);
    console.log('PostgreSQL Version:', dbInfo[0].postgres_version.split(',')[0]);
    
    // STEP 4: Check existing data
    console.log('\n📋 STEP 4: Current Data Count');
    console.log('-'.repeat(70));
    const counts = {
      users: await prisma.user.count(),
      colleges: await prisma.college.count(),
      students: await prisma.student.count(),
      teachers: await prisma.teacher.count(),
      admins: await prisma.admin.count(),
    };
    
    console.log('Users:', counts.users);
    console.log('Colleges:', counts.colleges);
    console.log('Students:', counts.students);
    console.log('Teachers:', counts.teachers);
    console.log('Admins:', counts.admins);
    
    // STEP 5: Insert test data
    console.log('\n📋 STEP 5: Inserting Test Data');
    console.log('-'.repeat(70));
    
    const testEmail = `test-${Date.now()}@neon-verify.com`;
    const testUser = await prisma.user.create({
      data: {
        name: 'Neon Test User',
        email: testEmail,
        password: 'test-password-hash',
        role: 'Admin',
        isActive: true,
      }
    });
    
    console.log('✅ Test user created successfully!');
    console.log('   ID:', testUser.id);
    console.log('   Name:', testUser.name);
    console.log('   Email:', testUser.email);
    console.log('   Created At:', testUser.createdAt.toISOString());
    
    // STEP 6: Verify the data was written
    console.log('\n📋 STEP 6: Verifying Data Was Written');
    console.log('-'.repeat(70));
    
    const verifyUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    
    if (verifyUser) {
      console.log('✅ Data verified in database!');
      console.log('   User found with ID:', verifyUser.id);
    } else {
      console.log('❌ ERROR: Data not found after insert!');
    }
    
    // STEP 7: Check all users
    console.log('\n📋 STEP 7: All Users in Database');
    console.log('-'.repeat(70));
    
    const allUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    
    console.log(`Total users found: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
    });
    
    // STEP 8: Direct SQL query to verify
    console.log('\n📋 STEP 8: Direct SQL Verification');
    console.log('-'.repeat(70));
    
    const sqlResult = await prisma.$queryRaw`
      SELECT COUNT(*) as total_users FROM "User"
    `;
    console.log('Total users (via SQL):', Number(sqlResult[0].total_users));
    
    // STEP 9: Check table structure
    console.log('\n📋 STEP 9: Database Tables');
    console.log('-'.repeat(70));
    
    const tables = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    console.log(`Total tables: ${tables.length}`);
    console.log('Tables:', tables.map(t => t.tablename).join(', '));
    
    // STEP 10: Final verdict
    console.log('\n📋 STEP 10: FINAL VERDICT');
    console.log('='.repeat(70));
    
    if (isNeon && verifyUser) {
      console.log('✅ SUCCESS: Prisma IS writing to Neon database!');
      console.log('✅ Test data was successfully inserted and verified');
      console.log('✅ Database connection is working correctly');
      
      if (isPooler) {
        console.log('\n⚠️  IMPORTANT NOTE ABOUT POOLER:');
        console.log('   - You are using the connection pooler endpoint');
        console.log('   - Data IS being written to Neon');
        console.log('   - If Neon dashboard shows 0 rows, try:');
        console.log('     1. Refresh the Neon dashboard');
        console.log('     2. Check you\'re viewing the correct branch (main/production)');
        console.log('     3. Use Neon SQL Editor to run: SELECT COUNT(*) FROM "User";');
        console.log('     4. Wait a few seconds for dashboard to sync');
      }
      
      console.log('\n📝 TO VIEW DATA IN NEON DASHBOARD:');
      console.log('   1. Go to: https://console.neon.tech');
      console.log('   2. Select your project');
      console.log('   3. Go to "SQL Editor" tab');
      console.log('   4. Run: SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 10;');
      console.log('   5. You should see your data there!');
      
    } else {
      console.log('❌ ERROR: Something is wrong with the connection');
      console.log('   Please check your DATABASE_URL in .env file');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Verification complete!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('\nFull error:', error);
    
    console.log('\n💡 TROUBLESHOOTING STEPS:');
    console.log('1. Verify DATABASE_URL in .env is correct');
    console.log('2. Check if Neon database is active (not paused)');
    console.log('3. Ensure sslmode=require is in the connection string');
    console.log('4. Try running: npx prisma db push');
    console.log('5. Check Neon dashboard for connection limits');
    
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database\n');
  }
}

// Run the verification
verifyNeonConnection();

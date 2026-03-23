const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugConnection() {
  console.log('🔍 DEBUGGING PRISMA CONNECTION\n');
  console.log('=' .repeat(60));
  
  // 1. Check environment variable
  console.log('\n1️⃣ DATABASE_URL from .env:');
  console.log(process.env.DATABASE_URL);
  console.log('=' .repeat(60));
  
  // 2. Parse connection details
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
    if (match) {
      console.log('\n2️⃣ Parsed Connection Details:');
      console.log(`   User: ${match[1]}`);
      console.log(`   Host: ${match[3]}`);
      console.log(`   Database: ${match[4]}`);
      console.log(`   SSL: ${dbUrl.includes('sslmode=require') ? 'Required ✅' : 'Not Required ❌'}`);
      console.log('=' .repeat(60));
    }
  }
  
  try {
    // 3. Test connection
    console.log('\n3️⃣ Testing Database Connection...');
    await prisma.$connect();
    console.log('   ✅ Successfully connected to database');
    console.log('=' .repeat(60));
    
    // 4. Get database info
    console.log('\n4️⃣ Database Information:');
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        version() as version
    `;
    console.log('   Database:', result[0].database);
    console.log('   User:', result[0].user);
    console.log('   Server IP:', result[0].server_ip || 'N/A (Cloud)');
    console.log('   Version:', result[0].version.split(',')[0]);
    console.log('=' .repeat(60));
    
    // 5. Check if it's Neon
    console.log('\n5️⃣ Verifying Neon Connection:');
    const isNeon = dbUrl.includes('neon.tech');
    const isPooler = dbUrl.includes('pooler');
    console.log(`   Is Neon: ${isNeon ? '✅ YES' : '❌ NO'}`);
    console.log(`   Using Pooler: ${isPooler ? '✅ YES' : '❌ NO'}`);
    console.log('=' .repeat(60));
    
    // 6. Count records
    console.log('\n6️⃣ Data in Database:');
    const userCount = await prisma.user.count();
    const collegeCount = await prisma.college.count();
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Colleges: ${collegeCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Teachers: ${teacherCount}`);
    console.log('=' .repeat(60));
    
    // 7. Show recent users
    if (userCount > 0) {
      console.log('\n7️⃣ Recent Users (Last 5):');
      const users = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      });
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.role})`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Created: ${user.createdAt.toISOString()}`);
      });
      console.log('=' .repeat(60));
    }
    
    // 8. Check table existence
    console.log('\n8️⃣ Checking Tables:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log(`   Total Tables: ${tables.length}`);
    console.log(`   Tables: ${tables.map(t => t.table_name).join(', ')}`);
    console.log('=' .repeat(60));
    
    // 9. Final verdict
    console.log('\n9️⃣ VERDICT:');
    if (isNeon && userCount > 0) {
      console.log('   ✅ Prisma IS connected to Neon database');
      console.log('   ✅ Data exists in the database');
      console.log('   ✅ Everything is working correctly!');
      console.log('\n   📝 Note: If you can\'t see data in Neon dashboard,');
      console.log('   you need to connect your PostgreSQL client to Neon,');
      console.log('   not to localhost.');
    } else if (isNeon && userCount === 0) {
      console.log('   ⚠️  Prisma IS connected to Neon');
      console.log('   ⚠️  But no data found');
      console.log('   💡 Try registering a user to test');
    } else {
      console.log('   ❌ Prisma might NOT be connected to Neon');
      console.log('   💡 Check your .env file');
    }
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if DATABASE_URL in .env is correct');
    console.log('   2. Ensure SSL mode is set to "require"');
    console.log('   3. Verify Neon database is accessible');
    console.log('   4. Check if firewall is blocking connection');
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Disconnected from database\n');
  }
}

debugConnection();

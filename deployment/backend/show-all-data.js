require('dotenv').config();
const prisma = require('./lib/prisma');

async function showAllData() {
  try {
    console.log('\n📊 ALL DATA IN NEON DATABASE\n');
    console.log('='.repeat(80));
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        collegeId: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`\n👥 USERS TABLE (${users.length} records):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   College ID: ${user.collegeId || 'N/A'}`);
      console.log(`   Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log('');
    });
    
    console.log('='.repeat(80));
    
    // Check other tables
    const colleges = await prisma.college.count();
    const students = await prisma.student.count();
    const teachers = await prisma.teacher.count();
    const parents = await prisma.parent.count();
    const admins = await prisma.admin.count();
    
    console.log('\n📈 OTHER TABLES:\n');
    console.log(`   Colleges: ${colleges}`);
    console.log(`   Students: ${students}`);
    console.log(`   Teachers: ${teachers}`);
    console.log(`   Parents: ${parents}`);
    console.log(`   Admins: ${admins}`);
    
    console.log('\n='.repeat(80));
    console.log('\n✅ This data is stored in your Neon PostgreSQL database!');
    console.log('   Database: neondb');
    console.log('   Host: ep-gentle-thunder-aioue7ye-pooler.c-4.us-east-1.aws.neon.tech\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showAllData();

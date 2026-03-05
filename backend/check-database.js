const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking Neon Database...\n');
    
    // Check connection
    await prisma.$connect();
    console.log('✅ Connected to database\n');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total Users: ${userCount}\n`);
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('👥 Users in Database:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Check other tables
    const collegeCount = await prisma.college.count();
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    
    console.log('📈 Other Tables:');
    console.log(`   Colleges: ${collegeCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Teachers: ${teacherCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

require('dotenv').config();
const prisma = require('./lib/prisma');

async function testSignupFlow() {
  try {
    console.log('\n🧪 TESTING SIGNUP FLOW - ROLE-SPECIFIC RECORD CREATION\n');
    console.log('='.repeat(80));

    // Get the most recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        StudentProfile: true,
        TeacherProfile: true,
        ParentProfile: true,
        AdminProfile: true,
      }
    });

    console.log('\n📋 RECENT SIGNUPS (Last 5):\n');
    
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      
      // Check if role-specific record exists
      let hasRoleRecord = false;
      let roleTableName = '';
      
      if (user.role === 'Student' && user.StudentProfile) {
        hasRoleRecord = true;
        roleTableName = 'Student';
        console.log(`   ✅ Student Record: ${user.StudentProfile.studentId}`);
      } else if (user.role === 'Teacher' && user.TeacherProfile) {
        hasRoleRecord = true;
        roleTableName = 'Teacher';
        console.log(`   ✅ Teacher Record: ID ${user.TeacherProfile.id}`);
      } else if (user.role === 'Parent' && user.ParentProfile) {
        hasRoleRecord = true;
        roleTableName = 'Parent';
        console.log(`   ✅ Parent Record: ID ${user.ParentProfile.id}`);
      } else if (user.role === 'Admin' && user.AdminProfile) {
        hasRoleRecord = true;
        roleTableName = 'Admin';
        console.log(`   ✅ Admin Record: ID ${user.AdminProfile.id}`);
      }
      
      if (!hasRoleRecord && user.role !== 'SuperAdmin') {
        console.log(`   ❌ MISSING ${user.role} record in ${user.role} table!`);
      }
      
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n✅ TEST COMPLETE!\n');
    console.log('📊 Summary:');
    console.log('   • All new signups should have records in both User table AND role-specific table');
    console.log('   • Students → Student table');
    console.log('   • Teachers → Teacher table');
    console.log('   • Parents → Parent table');
    console.log('   • Admins → Admin table');
    console.log('   • SuperAdmins → SuperAdmin table (separate from User)\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSignupFlow();

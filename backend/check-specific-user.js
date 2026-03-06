require('dotenv').config();
const prisma = require('./lib/prisma');

async function checkUser() {
  try {
    const name = process.argv[2] || 'Uppada Vineetha';
    
    console.log(`\n🔍 Searching for user: "${name}"\n`);
    console.log('='.repeat(80));
    
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      include: {
        StudentProfile: true,
        TeacherProfile: true,
        ParentProfile: true,
        AdminProfile: true,
      }
    });
    
    if (!user) {
      console.log(`\n❌ User "${name}" not found in database\n`);
      return;
    }
    
    console.log('\n✅ USER FOUND IN USER TABLE:\n');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`College ID: ${user.collegeId || 'None'}`);
    console.log(`Created: ${user.createdAt}`);
    console.log(`User ID: ${user.id}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 ROLE-SPECIFIC RECORD CHECK:\n');
    
    let hasRoleRecord = false;
    
    if (user.role === 'Student') {
      if (user.StudentProfile) {
        console.log('✅ STUDENT RECORD FOUND:');
        console.log(`   Student ID: ${user.StudentProfile.studentId}`);
        console.log(`   Email: ${user.StudentProfile.email}`);
        console.log(`   Phone: ${user.StudentProfile.phone || 'N/A'}`);
        console.log(`   Class: ${user.StudentProfile.sclassId || 'Not assigned'}`);
        hasRoleRecord = true;
      } else {
        console.log('❌ STUDENT RECORD MISSING!');
        console.log('   This user is in User table but NOT in Student table');
      }
    } else if (user.role === 'Teacher') {
      if (user.TeacherProfile) {
        console.log('✅ TEACHER RECORD FOUND');
        hasRoleRecord = true;
      } else {
        console.log('❌ TEACHER RECORD MISSING!');
      }
    } else if (user.role === 'Parent') {
      if (user.ParentProfile) {
        console.log('✅ PARENT RECORD FOUND');
        hasRoleRecord = true;
      } else {
        console.log('❌ PARENT RECORD MISSING!');
      }
    } else if (user.role === 'Admin') {
      if (user.AdminProfile) {
        console.log('✅ ADMIN RECORD FOUND');
        hasRoleRecord = true;
      } else {
        console.log('❌ ADMIN RECORD MISSING!');
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (!hasRoleRecord && user.role !== 'SuperAdmin') {
      console.log('\n⚠️  ISSUE IDENTIFIED:\n');
      console.log(`This user was created in the User table but the corresponding`);
      console.log(`${user.role} record was NOT created in the ${user.role} table.`);
      console.log('\nPossible causes:');
      console.log('1. Signup was done without collegeId');
      console.log('2. Backend register function had an error');
      console.log('3. Database transaction failed');
      console.log('\n💡 Solution:');
      console.log('The signup has been fixed. New signups will create both records.');
      console.log('For this existing user, you can either:');
      console.log('1. Delete and re-signup');
      console.log('2. Manually create the Student record in database');
    } else if (hasRoleRecord) {
      console.log('\n✅ ALL GOOD! User has records in both tables.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

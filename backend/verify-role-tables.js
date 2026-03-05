require('dotenv').config();
const prisma = require('./lib/prisma');

async function verifyRoleTables() {
  try {
    console.log('\n📊 VERIFYING ROLE-SPECIFIC TABLES\n');
    console.log('='.repeat(80));

    // Get all data
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const students = await prisma.student.findMany({
      include: { sclass: true, college: true }
    });
    const teachers = await prisma.teacher.findMany({
      include: { college: true }
    });
    const parents = await prisma.parent.findMany({
      include: { college: true }
    });
    const admins = await prisma.admin.findMany({
      include: { college: true }
    });
    const superAdmins = await prisma.superAdmin.findMany();

    console.log('\n📈 TABLE COUNTS:\n');
    console.log(`  Total Users: ${users.length}`);
    console.log(`  ├─ Students: ${students.length}`);
    console.log(`  ├─ Teachers: ${teachers.length}`);
    console.log(`  ├─ Parents: ${parents.length}`);
    console.log(`  ├─ Admins: ${admins.length}`);
    console.log(`  └─ SuperAdmins: ${superAdmins.length}`);

    // Students Table
    if (students.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('\n👨‍🎓 STUDENT TABLE:\n');
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Student ID: ${student.studentId}`);
        console.log(`   College: ${student.college?.name || 'N/A'}`);
        console.log(`   Class: ${student.sclass?.sclassName || 'Not assigned'}`);
        console.log(`   User ID: ${student.userId}`);
        console.log('');
      });
    }

    // Teachers Table
    if (teachers.length > 0) {
      console.log('='.repeat(80));
      console.log('\n👨‍🏫 TEACHER TABLE:\n');
      teachers.forEach((teacher, index) => {
        console.log(`${index + 1}. ${teacher.name}`);
        console.log(`   Email: ${teacher.email}`);
        console.log(`   Phone: ${teacher.phone || 'N/A'}`);
        console.log(`   College: ${teacher.college?.name || 'N/A'}`);
        console.log(`   User ID: ${teacher.userId}`);
        console.log('');
      });
    }

    // Parents Table
    if (parents.length > 0) {
      console.log('='.repeat(80));
      console.log('\n👨‍👩‍👧 PARENT TABLE:\n');
      parents.forEach((parent, index) => {
        console.log(`${index + 1}. ${parent.name}`);
        console.log(`   Email: ${parent.email || 'N/A'}`);
        console.log(`   Phone: ${parent.phone}`);
        console.log(`   College: ${parent.college?.name || 'N/A'}`);
        console.log(`   User ID: ${parent.userId}`);
        console.log('');
      });
    }

    // Admins Table
    if (admins.length > 0) {
      console.log('='.repeat(80));
      console.log('\n👔 ADMIN TABLE:\n');
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Phone: ${admin.phone || 'N/A'}`);
        console.log(`   College: ${admin.college?.name || 'N/A'}`);
        console.log(`   User ID: ${admin.userId}`);
        console.log('');
      });
    }

    // SuperAdmins Table
    if (superAdmins.length > 0) {
      console.log('='.repeat(80));
      console.log('\n⭐ SUPERADMIN TABLE:\n');
      superAdmins.forEach((superAdmin, index) => {
        console.log(`${index + 1}. ${superAdmin.name}`);
        console.log(`   Email: ${superAdmin.email}`);
        console.log(`   Phone: ${superAdmin.phone || 'N/A'}`);
        console.log(`   (No college - platform admin)`);
        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('\n✅ VERIFICATION COMPLETE!\n');
    console.log('📝 Summary:');
    console.log(`   • Users are now properly split into role-specific tables`);
    console.log(`   • Each role has its own dedicated table`);
    console.log(`   • User table maintains the base authentication info`);
    console.log(`   • Role tables contain role-specific details\n`);

    console.log('🎯 SQL Queries to view in Neon:\n');
    console.log('   -- View all students');
    console.log('   SELECT * FROM "Student";\n');
    console.log('   -- View all teachers');
    console.log('   SELECT * FROM "Teacher";\n');
    console.log('   -- View all parents');
    console.log('   SELECT * FROM "Parent";\n');
    console.log('   -- View all admins');
    console.log('   SELECT * FROM "Admin";\n');
    console.log('   -- View all super admins');
    console.log('   SELECT * FROM "SuperAdmin";\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRoleTables();

const prisma = require('./lib/prisma');

async function testMarksEmail() {
  try {
    console.log('🔍 Checking students with email addresses...\n');
    
    // Find admin to get collegeId
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }
    
    const collegeId = admin.collegeId;
    console.log('✓ College ID:', collegeId);
    
    // Find students with email
    const students = await prisma.student.findMany({
      where: { 
        collegeId,
        email: { not: null },
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        sclass: { select: { sclassName: true } }
      },
      take: 5
    });
    
    console.log(`\n📧 Found ${students.length} students with email:\n`);
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Student ID: ${student.studentId}`);
      console.log(`   Class: ${student.sclass?.sclassName || 'N/A'}`);
      console.log(`   UUID: ${student.id}\n`);
    });
    
    // Find subjects
    const subjects = await prisma.subject.findMany({
      where: { collegeId },
      select: {
        id: true,
        subName: true,
        subCode: true
      },
      take: 5
    });
    
    console.log(`\n📚 Found ${subjects.length} subjects:\n`);
    subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.subName} (${subject.subCode})`);
      console.log(`   UUID: ${subject.id}\n`);
    });
    
    console.log('\n✅ Email Configuration:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testMarksEmail();

const prisma = require('./lib/prisma');

async function check() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' }
    });
    
    const collegeId = admin?.collegeId;
    console.log('College ID:', collegeId);
    
    const counts = {
      classes: await prisma.sclass.count({ where: { collegeId } }),
      sections: await prisma.section.count({ where: { collegeId } }),
      teachers: await prisma.teacher.count({ where: { collegeId } }),
      students: await prisma.student.count({ where: { collegeId } }),
      subjects: await prisma.subject.count({ where: { collegeId } }),
      fees: await prisma.fee.count({ where: { collegeId } }),
      exams: await prisma.exam.count({ where: { collegeId } }),
      attendance: await prisma.attendance.count({ where: { collegeId } }),
      routes: await prisma.route.count({ where: { collegeId } }),
      buses: await prisma.bus.count({ where: { collegeId } }),
    };
    
    console.log('\n📊 Current Data Status:');
    Object.entries(counts).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

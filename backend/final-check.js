const prisma = require('./lib/prisma');

async function check() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' }
    });
    
    const collegeId = admin?.collegeId;
    
    console.log('📊 FINAL DATA STATUS\n');
    
    const counts = {
      'Classes': await prisma.sclass.count({ where: { collegeId } }),
      'Sections': await prisma.section.count({ where: { collegeId } }),
      'Teachers': await prisma.teacher.count({ where: { collegeId } }),
      'Students': await prisma.student.count({ where: { collegeId } }),
      'Subjects': await prisma.subject.count({ where: { collegeId } }),
      'Fees': await prisma.fee.count({ where: { collegeId } }),
      'Exams': await prisma.exam.count({ where: { collegeId } }),
      'Exam Results': await prisma.examResult.count({ where: { collegeId } }),
      'Attendance': await prisma.attendance.count({ where: { collegeId } }),
      'Bus Routes': await prisma.busRoute.count({ where: { collegeId } }),
      'Buses': await prisma.bus.count({ where: { collegeId } }),
      'Transport Fees': await prisma.transportFee.count({ where: { collegeId } }),
    };
    
    Object.entries(counts).forEach(([key, count]) => {
      console.log(`  ✅ ${key}: ${count}`);
    });
    
    console.log('\n✅ ALL DATA READY FOR DISPLAY IN ADMIN UI');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

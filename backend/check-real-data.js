const prisma = require('./lib/prisma');

async function checkData() {
  try {
    // Get first college
    const college = await prisma.college.findFirst();
    if (!college) {
      console.log('No colleges found');
      return;
    }
    
    const collegeId = college.id;
    console.log('College ID:', collegeId);
    console.log('College Name:', college.name);
    
    const stats = {
      students: await prisma.student.count({ where: { collegeId, isDeleted: false } }),
      teachers: await prisma.teacher.count({ where: { collegeId, isActive: true } }),
      classes: await prisma.sclass.count({ where: { collegeId } }),
      subjects: await prisma.subject.count({ where: { collegeId } }),
      fees: await prisma.fee.count({ where: { collegeId } }),
      payments: await prisma.payment.count({ where: { collegeId } }),
      admissions: await prisma.admission.count({ where: { collegeId } }),
      exams: await prisma.exam.count({ where: { collegeId } }),
    };
    
    console.log('\n=== Database Stats ===');
    console.log(JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

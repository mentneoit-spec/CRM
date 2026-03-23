const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const collegeId = 'b75f1021-e248-4d5f-a185-7eebd84a8294';
  
  const classes = await prisma.sclass.findMany({ where: { collegeId } });
  const sections = await prisma.section.findMany({ where: { collegeId } });
  const teachers = await prisma.teacher.findMany({ where: { collegeId } });
  const students = await prisma.student.findMany({ where: { collegeId } });
  
  console.log('\n📊 Current Data Status:');
  console.log('  Classes:', classes.length);
  console.log('  Sections:', sections.length);
  console.log('  Teachers:', teachers.length);
  console.log('  Students:', students.length);
  
  if (teachers.length > 0) {
    console.log('\n👨‍🏫 Teachers:');
    teachers.forEach(t => console.log(`  - ${t.name} (${t.email})`));
  }
  
  if (students.length > 0) {
    console.log('\n👨‍🎓 Students:');
    students.forEach(s => console.log(`  - ${s.name} (${s.studentId})`));
  }
  
  await prisma.$disconnect();
}

check();

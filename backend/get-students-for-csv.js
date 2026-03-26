const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getStudents() {
  try {
    const students = await prisma.student.findMany({
      where: { isDeleted: false },
      select: { 
        studentId: true, 
        name: true, 
        sclass: { select: { sclassName: true } } 
      },
      take: 15
    });
    
    console.log('Students available for CSV:');
    students.forEach(s => {
      console.log(`${s.studentId} - ${s.name} (${s.sclass?.sclassName || 'N/A'})`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

getStudents();
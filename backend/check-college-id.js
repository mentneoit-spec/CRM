const prisma = require('./lib/prisma');

async function check() {
  try {
    // Get abhiyeduru admin by finding first
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' },
      include: { college: true }
    });
    
    console.log('Admin:', admin?.email, 'College ID:', admin?.collegeId, 'College:', admin?.college?.name);
    
    if (admin?.collegeId) {
      // Get teachers with this collegeId
      const teachers = await prisma.teacher.findMany({
        where: { collegeId: admin.collegeId },
        take: 5,
        select: { id: true, name: true, email: true, collegeId: true }
      });
      
      console.log('\nTeachers for this college:');
      teachers.forEach(t => console.log(`  ${t.name} (${t.email}) - College: ${t.collegeId}`));
      
      // Get students with this collegeId
      const students = await prisma.student.findMany({
        where: { collegeId: admin.collegeId },
        take: 5,
        select: { id: true, name: true, email: true, collegeId: true }
      });
      
      console.log('\nStudents for this college:');
      students.forEach(s => console.log(`  ${s.name} (${s.email}) - College: ${s.collegeId}`));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

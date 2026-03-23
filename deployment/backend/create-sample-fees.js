const prisma = require('./lib/prisma');

async function createSampleFees() {
  try {
    // Get the college
    const college = await prisma.college.findFirst();
    if (!college) {
      console.log('No college found');
      return;
    }

    const collegeId = college.id;
    console.log('Creating fees for college:', college.name);

    // Get all students
    const students = await prisma.student.findMany({
      where: { collegeId, isDeleted: false },
      take: 10
    });

    console.log(`Found ${students.length} students`);

    const feeTypes = ['Tuition', 'Transport', 'Hostel', 'Exam', 'Library'];
    const amounts = [5000, 2000, 3000, 1000, 500];

    let createdCount = 0;

    for (const student of students) {
      // Create 2-3 fees per student
      const feeCount = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < feeCount; i++) {
        const feeType = feeTypes[i % feeTypes.length];
        const amount = amounts[i % amounts.length];
        
        const fee = await prisma.fee.create({
          data: {
            collegeId,
            studentId: student.id,
            feeType,
            amount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            isActive: true
          }
        });
        
        console.log(`Created fee: ${student.name} - ${feeType} - ₹${amount}`);
        createdCount++;
      }
    }

    console.log(`\nTotal fees created: ${createdCount}`);

    // Show summary
    const totalFees = await prisma.fee.count({ where: { collegeId } });
    console.log(`Total fees in database: ${totalFees}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleFees();

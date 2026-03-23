const prisma = require('./lib/prisma');

async function createStudentMarks() {
  try {
    const college = await prisma.college.findFirst();
    if (!college) {
      console.log('No college found');
      return;
    }

    const collegeId = college.id;
    console.log('Creating marks for all students...\n');

    // Get all students, exams, and subjects
    const students = await prisma.student.findMany({
      where: { collegeId, isDeleted: false }
    });

    const exams = await prisma.exam.findMany({
      where: { collegeId }
    });

    const subjects = await prisma.subject.findMany({
      where: { collegeId }
    });

    console.log(`Found: ${students.length} students, ${exams.length} exams, ${subjects.length} subjects\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const exam of exams) {
      for (const subject of subjects) {
        for (const student of students) {
          try {
            // Check if result already exists
            const existing = await prisma.examResult.findUnique({
              where: {
                studentId_subjectId_examId: {
                  studentId: student.id,
                  subjectId: subject.id,
                  examId: exam.id,
                }
              }
            });

            if (existing) {
              skippedCount++;
              continue;
            }

            // Generate random marks (40-100)
            const marksObtained = Math.floor(Math.random() * 60) + 40;
            const maxMarks = subject.maxMarks || 100;
            const percentage = (marksObtained / maxMarks) * 100;

            // Determine grade
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            const result = await prisma.examResult.create({
              data: {
                collegeId,
                examId: exam.id,
                studentId: student.id,
                subjectId: subject.id,
                marksObtained,
                percentage: Math.round(percentage * 100) / 100,
                grade,
                remarks: percentage >= 70 ? 'Good' : percentage >= 50 ? 'Average' : 'Needs Improvement',
                isAbsent: false
              }
            });

            createdCount++;
          } catch (e) {
            // Skip duplicates
          }
        }
      }
    }

    console.log(`✓ Created ${createdCount} exam results`);
    console.log(`✓ Skipped ${skippedCount} existing results`);
    console.log(`\n✓ Total marks created: ${createdCount}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createStudentMarks();

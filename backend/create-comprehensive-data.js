const prisma = require('./lib/prisma');

async function createComprehensiveData() {
  try {
    const college = await prisma.college.findFirst();
    if (!college) {
      console.log('No college found');
      return;
    }

    const collegeId = college.id;
    console.log('Creating comprehensive data for:', college.name);

    // Get students, teachers, classes, and subjects
    const students = await prisma.student.findMany({
      where: { collegeId, isDeleted: false }
    });

    const teachers = await prisma.teacher.findMany({
      where: { collegeId, isActive: true }
    });

    const subjects = await prisma.subject.findMany({
      where: { collegeId }
    });

    const exams = await prisma.exam.findMany({
      where: { collegeId }
    });

    const sections = await prisma.section.findMany({
      where: { collegeId }
    });

    console.log(`Found: ${students.length} students, ${teachers.length} teachers, ${subjects.length} subjects, ${exams.length} exams\n`);

    // 1. CREATE EXAM RESULTS
    console.log('Creating exam results...');
    let resultCount = 0;
    for (const exam of exams) {
      for (const subject of subjects) {
        for (const student of students) {
          const marksObtained = Math.floor(Math.random() * 40) + 60; // 60-100
          try {
            const result = await prisma.examResult.create({
              data: {
                collegeId,
                examId: exam.id,
                studentId: student.id,
                subjectId: subject.id,
                marksObtained,
                percentage: marksObtained,
                grade: marksObtained >= 90 ? 'A+' : marksObtained >= 80 ? 'A' : marksObtained >= 70 ? 'B' : 'C',
                remarks: marksObtained >= 80 ? 'Excellent' : marksObtained >= 70 ? 'Good' : 'Average',
                isAbsent: false
              }
            });
            resultCount++;
          } catch (e) {
            // Skip duplicates
          }
        }
      }
    }
    console.log(`✓ Created ${resultCount} exam results\n`);

    // 2. CREATE HOMEWORK
    console.log('Creating homework assignments...');
    let homeworkCount = 0;
    const homeworkTopics = [
      'Chapter 1 - Introduction',
      'Chapter 2 - Fundamentals',
      'Chapter 3 - Advanced Concepts',
      'Practice Problems Set A',
      'Practice Problems Set B'
    ];

    for (const teacher of teachers) {
      for (const subject of subjects) {
        for (let i = 0; i < 3; i++) {
          const homework = await prisma.homework.create({
            data: {
              collegeId,
              teacherId: teacher.id,
              subjectId: subject.id,
              sectionId: sections.length > 0 ? sections[0].id : null,
              title: `${homeworkTopics[i % homeworkTopics.length]} - Week ${i + 1}`,
              description: `Complete the assigned ${homeworkTopics[i % homeworkTopics.length]} and submit by the due date.`,
              dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
              totalMarks: 10
            }
          });
          homeworkCount++;
        }
      }
    }
    console.log(`✓ Created ${homeworkCount} homework assignments\n`);

    // 3. CREATE ATTENDANCE
    console.log('Creating attendance records...');
    let attendanceCount = 0;
    const statuses = ['present', 'absent', 'leave', 'sick'];
    
    for (const student of students) {
      for (const subject of subjects) {
        for (let i = 0; i < 20; i++) {
          const status = Math.random() > 0.15 ? 'present' : statuses[Math.floor(Math.random() * (statuses.length - 1)) + 1];
          try {
            const attendance = await prisma.attendance.create({
              data: {
                collegeId,
                studentId: student.id,
                subjectId: subject.id,
                date: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000),
                status,
                remarks: status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : status === 'leave' ? 'On Leave' : 'Sick Leave'
              }
            });
            attendanceCount++;
          } catch (e) {
            // Skip duplicates
          }
        }
      }
    }
    console.log(`✓ Created ${attendanceCount} attendance records\n`);

    // SUMMARY
    console.log('=== DATA CREATION SUMMARY ===');
    console.log(`✓ Exam Results: ${resultCount}`);
    console.log(`✓ Homework: ${homeworkCount}`);
    console.log(`✓ Attendance: ${attendanceCount}`);
    console.log(`\nTotal records created: ${resultCount + homeworkCount + attendanceCount}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createComprehensiveData();

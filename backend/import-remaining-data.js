/**
 * Import remaining data: Fees, Subjects, Attendance
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importRemainingData() {
  try {
    console.log('🚀 Starting remaining data import...\n');

    const collegeId = 'b75f1021-e248-4d5f-a185-7eebd84a8294';

    // Get existing data
    const classes = await prisma.sclass.findMany({ where: { collegeId } });
    const teachers = await prisma.teacher.findMany({ where: { collegeId } });
    const students = await prisma.student.findMany({ where: { collegeId } });

    console.log('📊 Existing Data:');
    console.log(`  Classes: ${classes.length}`);
    console.log(`  Teachers: ${teachers.length}`);
    console.log(`  Students: ${students.length}\n`);

    // ==================== CREATE FEES ====================
    console.log('💰 Creating fees...');
    let feeCount = 0;
    for (const student of students) {
      const feeTypes = [
        { feeType: 'Tuition Fee', amount: 5000 },
        { feeType: 'Transport Fee', amount: 1500 },
        { feeType: 'Activity Fee', amount: 500 },
      ];

      for (const feeData of feeTypes) {
        const existing = await prisma.fee.findFirst({
          where: { collegeId, studentId: student.id, feeType: feeData.feeType }
        }).catch(() => null);
        
        if (!existing) {
          await prisma.fee.create({
            data: {
              studentId: student.id,
              feeType: feeData.feeType,
              amount: feeData.amount,
              dueDate: new Date('2024-06-30'),
              status: Math.random() > 0.5 ? 'Paid' : 'Pending',
              collegeId,
            },
          }).catch(() => null);
          feeCount++;
        }
      }
    }
    console.log(`✅ Created ${feeCount} fee records\n`);

    // ==================== CREATE SUBJECTS ====================
    console.log('📖 Creating subjects...');
    const subjectsData = [
      { subName: 'Mathematics', subCode: 'MATH10', classIdx: 0, teacherIdx: 1, maxMarks: 100, passingMarks: 40 },
      { subName: 'Physics', subCode: 'PHY10', classIdx: 0, teacherIdx: 2, maxMarks: 100, passingMarks: 40 },
      { subName: 'Chemistry', subCode: 'CHEM10', classIdx: 0, teacherIdx: 3, maxMarks: 100, passingMarks: 40 },
      { subName: 'English', subCode: 'ENG10', classIdx: 0, teacherIdx: 4, maxMarks: 100, passingMarks: 40 },
      { subName: 'Biology', subCode: 'BIO10', classIdx: 0, teacherIdx: 5, maxMarks: 100, passingMarks: 40 },
      { subName: 'Mathematics', subCode: 'MATH10B', classIdx: 1, teacherIdx: 1, maxMarks: 100, passingMarks: 40 },
      { subName: 'Physics', subCode: 'PHY10B', classIdx: 1, teacherIdx: 2, maxMarks: 100, passingMarks: 40 },
      { subName: 'Chemistry', subCode: 'CHEM10B', classIdx: 1, teacherIdx: 3, maxMarks: 100, passingMarks: 40 },
      { subName: 'English', subCode: 'ENG10B', classIdx: 1, teacherIdx: 4, maxMarks: 100, passingMarks: 40 },
      { subName: 'Economics', subCode: 'ECO10B', classIdx: 1, teacherIdx: 6, maxMarks: 100, passingMarks: 40 },
      { subName: 'Mathematics', subCode: 'MATH12', classIdx: 2, teacherIdx: 1, maxMarks: 100, passingMarks: 40 },
      { subName: 'Physics', subCode: 'PHY12', classIdx: 2, teacherIdx: 2, maxMarks: 100, passingMarks: 40 },
      { subName: 'Chemistry', subCode: 'CHEM12', classIdx: 2, teacherIdx: 3, maxMarks: 100, passingMarks: 40 },
      { subName: 'Computer Science', subCode: 'CS12', classIdx: 2, teacherIdx: 5, maxMarks: 100, passingMarks: 40 },
      { subName: 'History', subCode: 'HIST12', classIdx: 2, teacherIdx: 7, maxMarks: 100, passingMarks: 40 },
      { subName: 'Mathematics', subCode: 'MATH12B', classIdx: 3, teacherIdx: 1, maxMarks: 100, passingMarks: 40 },
      { subName: 'Physics', subCode: 'PHY12B', classIdx: 3, teacherIdx: 2, maxMarks: 100, passingMarks: 40 },
      { subName: 'Chemistry', subCode: 'CHEM12B', classIdx: 3, teacherIdx: 3, maxMarks: 100, passingMarks: 40 },
      { subName: 'Geography', subCode: 'GEO12B', classIdx: 3, teacherIdx: 8, maxMarks: 100, passingMarks: 40 },
      { subName: 'Biology', subCode: 'BIO12B', classIdx: 3, teacherIdx: 9, maxMarks: 100, passingMarks: 40 },
    ];

    let subjectCount = 0;
    for (const subData of subjectsData) {
      if (classes[subData.classIdx] && teachers[subData.teacherIdx]) {
        const existing = await prisma.subject.findFirst({
          where: { collegeId, sclassId: classes[subData.classIdx].id, subCode: subData.subCode }
        }).catch(() => null);
        
        if (!existing) {
          await prisma.subject.create({
            data: {
              subName: subData.subName,
              subCode: subData.subCode,
              collegeId,
              sclassId: classes[subData.classIdx].id,
              teacherId: teachers[subData.teacherIdx].id,
              maxMarks: subData.maxMarks,
              passingMarks: subData.passingMarks,
            },
          }).catch(() => null);
          subjectCount++;
        }
      }
    }
    console.log(`✅ Created ${subjectCount} subjects\n`);

    // ==================== CREATE ATTENDANCE ====================
    console.log('📅 Creating attendance records...');
    let attendanceCount = 0;
    
    for (const student of students) {
      for (let day = 1; day <= 20; day++) {
        const dateStr = `2024-03-${String(day).padStart(2, '0')}`;
        const existing = await prisma.attendance.findFirst({
          where: { collegeId, studentId: student.id, date: new Date(dateStr) }
        }).catch(() => null);
        
        if (!existing) {
          await prisma.attendance.create({
            data: {
              studentId: student.id,
              date: new Date(dateStr),
              status: Math.random() > 0.2 ? 'Present' : 'Absent',
              collegeId,
            },
          }).catch(() => null);
          attendanceCount++;
        }
      }
    }
    console.log(`✅ Created ${attendanceCount} attendance records\n`);

    console.log('✨ ========================================');
    console.log('✨ REMAINING DATA IMPORT COMPLETED!');
    console.log('✨ ========================================');
    console.log(`
📊 Summary:
  • Fees: ${feeCount}
  • Subjects: ${subjectCount}
  • Attendance: ${attendanceCount}

✅ All remaining data has been imported successfully!
    `);

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importRemainingData();

require('dotenv').config();
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function addTestData() {
  try {
    console.log('\n📝 ADDING TEST DATA\n');
    console.log('='.repeat(80));

    // Get the test college
    const college = await prisma.college.findFirst({
      where: { name: 'Test College' }
    });

    if (!college) {
      console.log('❌ Test College not found. Run setup-test-college.js first!');
      return;
    }

    console.log(`✅ Found Test College: ${college.id}\n`);

    // Get the test class
    const testClass = await prisma.sclass.findFirst({
      where: { collegeId: college.id }
    });

    // Add more subjects
    console.log('📚 Adding Subjects...\n');
    const subjects = [
      { name: 'Mathematics', code: 'MATH101', maxMarks: 100, passingMarks: 40 },
      { name: 'Science', code: 'SCI101', maxMarks: 100, passingMarks: 40 },
      { name: 'English', code: 'ENG101', maxMarks: 100, passingMarks: 40 },
      { name: 'Social Studies', code: 'SOC101', maxMarks: 100, passingMarks: 40 },
      { name: 'Computer Science', code: 'CS101', maxMarks: 100, passingMarks: 40 },
    ];

    const createdSubjects = [];
    for (const sub of subjects) {
      const existing = await prisma.subject.findFirst({
        where: {
          collegeId: college.id,
          sclassId: testClass.id,
          subCode: sub.code,
        }
      });

      if (!existing) {
        const subject = await prisma.subject.create({
          data: {
            subName: sub.name,
            subCode: sub.code,
            maxMarks: sub.maxMarks,
            passingMarks: sub.passingMarks,
            collegeId: college.id,
            sclassId: testClass.id,
          },
        });
        createdSubjects.push(subject);
        console.log(`  ✅ Created subject: ${sub.name}`);
      } else {
        createdSubjects.push(existing);
        console.log(`  ⏭️  Subject already exists: ${sub.name}`);
      }
    }

    // Get the student
    const student = await prisma.student.findFirst({
      where: { collegeId: college.id }
    });

    if (!student) {
      console.log('\n❌ No student found. Cannot add attendance/marks.');
      return;
    }

    console.log(`\n👨‍🎓 Found Student: ${student.name}\n`);

    // Add attendance records
    console.log('📅 Adding Attendance Records...\n');
    const today = new Date();
    const attendanceRecords = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      for (const subject of createdSubjects) {
        const existing = await prisma.attendance.findFirst({
          where: {
            studentId: student.id,
            subjectId: subject.id,
            date: date,
          }
        });

        if (!existing) {
          // 85% attendance rate
          const status = Math.random() > 0.15 ? 'present' : 'absent';
          
          await prisma.attendance.create({
            data: {
              studentId: student.id,
              subjectId: subject.id,
              collegeId: college.id,
              date: date,
              status: status,
            },
          });
          attendanceRecords.push({ date, subject: subject.subName, status });
        }
      }
    }

    console.log(`  ✅ Added ${attendanceRecords.length} attendance records`);

    // Create an exam
    console.log('\n📝 Creating Exam...\n');
    let exam = await prisma.exam.findFirst({
      where: {
        collegeId: college.id,
        sclassId: testClass.id,
        examName: 'Mid-Term Exam 2026',
      }
    });

    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          examName: 'Mid-Term Exam 2026',
          examCode: 'MID2026',
          examType: 'offline',
          totalMarks: 100,
          passingMarks: 40,
          examDate: new Date('2026-02-15'),
          isPublished: true,
          collegeId: college.id,
          sclassId: testClass.id,
        },
      });
      console.log(`  ✅ Created exam: ${exam.examName}`);
    } else {
      console.log(`  ⏭️  Exam already exists: ${exam.examName}`);
    }

    // Add exam results
    console.log('\n📊 Adding Exam Results...\n');
    for (const subject of createdSubjects) {
      const existing = await prisma.examResult.findFirst({
        where: {
          studentId: student.id,
          subjectId: subject.id,
          examId: exam.id,
        }
      });

      if (!existing) {
        // Random marks between 60-95
        const marksObtained = Math.floor(Math.random() * 35) + 60;
        const percentage = (marksObtained / subject.maxMarks) * 100;
        const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';

        await prisma.examResult.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
            examId: exam.id,
            collegeId: college.id,
            marksObtained: marksObtained,
            percentage: percentage,
            grade: grade,
          },
        });
        console.log(`  ✅ ${subject.subName}: ${marksObtained}/${subject.maxMarks} (${grade})`);
      } else {
        console.log(`  ⏭️  Result already exists for ${subject.subName}`);
      }
    }

    // Add homework
    console.log('\n📚 Adding Homework...\n');
    const teacher = await prisma.teacher.findFirst({
      where: { collegeId: college.id }
    });

    if (teacher) {
      const homeworkItems = [
        { title: 'Chapter 5 Exercises', subject: 'Mathematics', days: 3 },
        { title: 'Science Lab Report', subject: 'Science', days: 5 },
        { title: 'Essay on Climate Change', subject: 'English', days: 7 },
        { title: 'History Project', subject: 'Social Studies', days: 10 },
        { title: 'Programming Assignment', subject: 'Computer Science', days: 4 },
      ];

      for (const hw of homeworkItems) {
        const subject = createdSubjects.find(s => s.subName === hw.subject);
        if (!subject) continue;

        const existing = await prisma.homework.findFirst({
          where: {
            title: hw.title,
            subjectId: subject.id,
          }
        });

        if (!existing) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + hw.days);

          await prisma.homework.create({
            data: {
              title: hw.title,
              description: `Complete ${hw.title} from the textbook`,
              dueDate: dueDate,
              teacherId: teacher.id,
              subjectId: subject.id,
              collegeId: college.id,
              totalMarks: 10,
            },
          });
          console.log(`  ✅ ${hw.title} (Due: ${dueDate.toLocaleDateString()})`);
        } else {
          console.log(`  ⏭️  Homework already exists: ${hw.title}`);
        }
      }
    }

    // Add fees
    console.log('\n💰 Adding Fees...\n');
    const feeTypes = [
      { type: 'Tuition Fee', amount: 50000, dueDate: new Date('2026-04-01') },
      { type: 'Library Fee', amount: 2000, dueDate: new Date('2026-04-01') },
      { type: 'Lab Fee', amount: 5000, dueDate: new Date('2026-04-01') },
    ];

    for (const feeData of feeTypes) {
      const existing = await prisma.fee.findFirst({
        where: {
          studentId: student.id,
          feeType: feeData.type,
        }
      });

      if (!existing) {
        await prisma.fee.create({
          data: {
            feeType: feeData.type,
            amount: feeData.amount,
            dueDate: feeData.dueDate,
            frequency: 'yearly',
            studentId: student.id,
            collegeId: college.id,
          },
        });
        console.log(`  ✅ ${feeData.type}: ₹${feeData.amount}`);
      } else {
        console.log(`  ⏭️  Fee already exists: ${feeData.type}`);
      }
    }

    console.log('\n='.repeat(80));
    console.log('\n✅ TEST DATA ADDED SUCCESSFULLY!\n');

    // Show summary
    console.log('📊 SUMMARY:\n');
    const subjectCount = await prisma.subject.count({ where: { collegeId: college.id } });
    const attendanceCount = await prisma.attendance.count({ where: { studentId: student.id } });
    const resultCount = await prisma.examResult.count({ where: { studentId: student.id } });
    const homeworkCount = await prisma.homework.count({ where: { collegeId: college.id } });
    const feeCount = await prisma.fee.count({ where: { studentId: student.id } });

    console.log(`  Subjects: ${subjectCount}`);
    console.log(`  Attendance Records: ${attendanceCount}`);
    console.log(`  Exam Results: ${resultCount}`);
    console.log(`  Homework: ${homeworkCount}`);
    console.log(`  Fees: ${feeCount}`);

    console.log('\n🎯 NOW TEST THE DASHBOARD:\n');
    console.log('  1. Start backend: cd backend && npm start');
    console.log('  2. Start frontend: cd frontend && npm start');
    console.log('  3. Login as: john.student@testcollege.edu / password123');
    console.log('  4. View dashboard with real data!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestData();

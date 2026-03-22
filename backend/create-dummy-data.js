const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DUMMY_PASSWORD = 'Test@123'; // Default password for all dummy users

async function createDummyData() {
  try {
    console.log('🚀 Starting dummy data creation...\n');

    // Create a college
    const college = await prisma.college.create({
      data: {
        name: 'Demo College',
        email: 'demo@college.com',
        phone: '9999999999',
        address: '123 Education Street, City',
      },
    });
    console.log('✅ College created:', college.name);

    // Create classes
    const classes = await Promise.all([
      prisma.sclass.create({
        data: {
          sclassName: '10A',
          collegeId: college.id,
        },
      }),
      prisma.sclass.create({
        data: {
          sclassName: '10B',
          collegeId: college.id,
        },
      }),
      prisma.sclass.create({
        data: {
          sclassName: '12A',
          collegeId: college.id,
        },
      }),
    ]);
    console.log('✅ Classes created:', classes.map(c => c.sclassName).join(', '));

    // Create sections
    const sections = await Promise.all([
      prisma.section.create({
        data: {
          sectionName: 'A',
          collegeId: college.id,
          sclassId: classes[0].id,
        },
      }),
      prisma.section.create({
        data: {
          sectionName: 'B',
          collegeId: college.id,
          sclassId: classes[0].id,
        },
      }),
      prisma.section.create({
        data: {
          sectionName: 'A',
          collegeId: college.id,
          sclassId: classes[1].id,
        },
      }),
    ]);
    console.log('✅ Sections created:', sections.map(s => s.sectionName).join(', '));

    // Create subjects
    const subjects = await Promise.all([
      prisma.subject.create({
        data: {
          subCode: 'ENG',
          subName: 'English',
          sclassId: classes[0].id,
          collegeId: college.id,
          maxMarks: 100,
        },
      }),
      prisma.subject.create({
        data: {
          subCode: 'MATH',
          subName: 'Mathematics',
          sclassId: classes[0].id,
          collegeId: college.id,
          maxMarks: 100,
        },
      }),
      prisma.subject.create({
        data: {
          subCode: 'SCI',
          subName: 'Science',
          sclassId: classes[0].id,
          collegeId: college.id,
          maxMarks: 100,
        },
      }),
    ]);
    console.log('✅ Subjects created:', subjects.map(s => s.subName).join(', '));

    // Create teachers
    const hashedPassword = await bcrypt.hash(DUMMY_PASSWORD, 10);
    const teacherUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'teacher1@demo.com',
          password: hashedPassword,
          name: 'Mr. Rajesh Kumar',
          phone: '9876543210',
          role: 'Teacher',
          collegeId: college.id,
        },
      }),
      prisma.user.create({
        data: {
          email: 'teacher2@demo.com',
          password: hashedPassword,
          name: 'Ms. Priya Singh',
          phone: '9876543211',
          role: 'Teacher',
          collegeId: college.id,
        },
      }),
    ]);

    const teachers = await Promise.all([
      prisma.teacher.create({
        data: {
          name: 'Mr. Rajesh Kumar',
          email: 'teacher1@demo.com',
          password: hashedPassword,
          collegeId: college.id,
          userId: teacherUsers[0].id,
          experience: 5,
          specialization: 'Mathematics',
        },
      }),
      prisma.teacher.create({
        data: {
          name: 'Ms. Priya Singh',
          email: 'teacher2@demo.com',
          password: hashedPassword,
          collegeId: college.id,
          userId: teacherUsers[1].id,
          experience: 3,
          specialization: 'English',
        },
      }),
    ]);
    console.log('✅ Teachers created:', teachers.map(t => t.name).join(', '));

    // Update subjects with teacher IDs
    await prisma.subject.update({
      where: { id: subjects[0].id },
      data: { teacherId: teachers[1].id },
    });
    await prisma.subject.update({
      where: { id: subjects[1].id },
      data: { teacherId: teachers[0].id },
    });

    // Create students
    const studentUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'student1@demo.com',
          password: hashedPassword,
          name: 'Arjun Kumar',
          phone: '9111111111',
          role: 'Student',
          collegeId: college.id,
        },
      }),
      prisma.user.create({
        data: {
          email: 'student2@demo.com',
          password: hashedPassword,
          name: 'Priya Sharma',
          phone: '9111111112',
          role: 'Student',
          collegeId: college.id,
        },
      }),
      prisma.user.create({
        data: {
          email: 'student3@demo.com',
          password: hashedPassword,
          name: 'Rahul Patel',
          phone: '9111111113',
          role: 'Student',
          collegeId: college.id,
        },
      }),
      prisma.user.create({
        data: {
          email: 'student4@demo.com',
          password: hashedPassword,
          name: 'Neha Gupta',
          phone: '9111111114',
          role: 'Student',
          collegeId: college.id,
        },
      }),
    ]);

    const students = await Promise.all([
      prisma.student.create({
        data: {
          name: 'Arjun Kumar',
          studentId: 'STU001',
          email: 'student1@demo.com',
          rollNum: 1,
          password: hashedPassword,
          collegeId: college.id,
          userId: studentUsers[0].id,
          sclassId: classes[0].id,
          sectionId: sections[0].id,
          dateOfBirth: new Date('2008-05-15'),
          gender: 'Male',
          board: 'CBSE',
          customClassName: null,
          customSectionName: null,
        },
      }),
      prisma.student.create({
        data: {
          name: 'Priya Sharma',
          studentId: 'STU002',
          email: 'student2@demo.com',
          rollNum: 2,
          password: hashedPassword,
          collegeId: college.id,
          userId: studentUsers[1].id,
          sclassId: classes[0].id,
          sectionId: sections[0].id,
          dateOfBirth: new Date('2008-08-22'),
          gender: 'Female',
          board: 'CBSE',
          customClassName: null,
          customSectionName: null,
        },
      }),
      prisma.student.create({
        data: {
          name: 'Rahul Patel',
          studentId: 'STU003',
          email: 'student3@demo.com',
          rollNum: 3,
          password: hashedPassword,
          collegeId: college.id,
          userId: studentUsers[2].id,
          sclassId: classes[0].id,
          sectionId: sections[1].id,
          dateOfBirth: new Date('2008-03-10'),
          gender: 'Male',
          board: 'CBSE',
          customClassName: null,
          customSectionName: null,
        },
      }),
      prisma.student.create({
        data: {
          name: 'Neha Gupta',
          studentId: 'STU004',
          email: 'student4@demo.com',
          rollNum: 1,
          password: hashedPassword,
          collegeId: college.id,
          userId: studentUsers[3].id,
          sclassId: classes[2].id,
          sectionId: sections[2].id,
          dateOfBirth: new Date('2006-12-05'),
          gender: 'Female',
          board: 'CBSE',
          group: 'BIPC',
          integratedCourse: 'NEET FOUNDATION',
          customClassName: null,
          customSectionName: null,
        },
      }),
    ]);
    console.log('✅ Students created:', students.map(s => s.studentId).join(', '));

    // Create parents
    const parentUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'parent1@demo.com',
          password: hashedPassword,
          name: 'Mr. Vikram Kumar',
          phone: '9222222222',
          role: 'Parent',
          collegeId: college.id,
        },
      }),
      prisma.user.create({
        data: {
          email: 'parent2@demo.com',
          password: hashedPassword,
          name: 'Mrs. Anjali Sharma',
          phone: '9222222223',
          role: 'Parent',
          collegeId: college.id,
        },
      }),
    ]);

    const parents = await Promise.all([
      prisma.parent.create({
        data: {
          name: 'Mr. Vikram Kumar',
          email: 'parent1@demo.com',
          phone: '9222222222',
          password: hashedPassword,
          collegeId: college.id,
          userId: parentUsers[0].id,
          relation: 'Father',
          occupation: 'Engineer',
        },
      }),
      prisma.parent.create({
        data: {
          name: 'Mrs. Anjali Sharma',
          email: 'parent2@demo.com',
          phone: '9222222223',
          password: hashedPassword,
          collegeId: college.id,
          userId: parentUsers[1].id,
          relation: 'Mother',
          occupation: 'Doctor',
        },
      }),
    ]);
    console.log('✅ Parents created:', parents.map(p => p.name).join(', '));

    // Create admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        password: hashedPassword,
        name: 'Admin User',
        phone: '9333333333',
        role: 'Admin',
        collegeId: college.id,
      },
    });

    const admin = await prisma.admin.create({
      data: {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: hashedPassword,
        collegeId: college.id,
        userId: adminUser.id,
      },
    });
    console.log('✅ Admin created:', admin.name);

    // Create super admin
    const superAdmin = await prisma.superAdmin.create({
      data: {
        name: 'Super Admin',
        email: 'superadmin@demo.com',
        password: hashedPassword,
        phone: '9555555555',
      },
    });
    console.log('✅ Super Admin created:', superAdmin.name);

    // Create exams
    const exams = await Promise.all([
      prisma.exam.create({
        data: {
          examName: 'Mid Term Exam',
          examDate: new Date('2026-04-15'),
          sclassId: classes[0].id,
          collegeId: college.id,
        },
      }),
      prisma.exam.create({
        data: {
          examName: 'Final Exam',
          examDate: new Date('2026-05-20'),
          sclassId: classes[0].id,
          collegeId: college.id,
        },
      }),
    ]);
    console.log('✅ Exams created:', exams.map(e => e.examName).join(', '));

    // Create exam results
    await Promise.all([
      prisma.examResult.create({
        data: {
          studentId: students[0].id,
          subjectId: subjects[0].id,
          examId: exams[0].id,
          collegeId: college.id,
          marksObtained: 85,
          percentage: 85,
          grade: 'A',
        },
      }),
      prisma.examResult.create({
        data: {
          studentId: students[0].id,
          subjectId: subjects[1].id,
          examId: exams[0].id,
          collegeId: college.id,
          marksObtained: 92,
          percentage: 92,
          grade: 'A+',
        },
      }),
      prisma.examResult.create({
        data: {
          studentId: students[1].id,
          subjectId: subjects[0].id,
          examId: exams[0].id,
          collegeId: college.id,
          marksObtained: 78,
          percentage: 78,
          grade: 'B',
        },
      }),
    ]);
    console.log('✅ Exam results created');

    // Create attendance records
    const today = new Date();
    await Promise.all([
      prisma.attendance.create({
        data: {
          studentId: students[0].id,
          subjectId: subjects[0].id,
          collegeId: college.id,
          date: today,
          status: 'Present',
        },
      }),
      prisma.attendance.create({
        data: {
          studentId: students[1].id,
          subjectId: subjects[0].id,
          collegeId: college.id,
          date: today,
          status: 'Present',
        },
      }),
      prisma.attendance.create({
        data: {
          studentId: students[2].id,
          subjectId: subjects[0].id,
          collegeId: college.id,
          date: today,
          status: 'Absent',
        },
      }),
    ]);
    console.log('✅ Attendance records created');

    // Create fees for students
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    await Promise.all([
      prisma.fee.create({
        data: {
          studentId: students[0].id,
          collegeId: college.id,
          feeType: 'Tuition',
          amount: 50000,
          dueDate: nextYear,
          frequency: 'yearly',
          isActive: true,
        },
      }),
      prisma.fee.create({
        data: {
          studentId: students[1].id,
          collegeId: college.id,
          feeType: 'Tuition',
          amount: 50000,
          dueDate: nextYear,
          frequency: 'yearly',
          isActive: true,
        },
      }),
      prisma.fee.create({
        data: {
          studentId: students[2].id,
          collegeId: college.id,
          feeType: 'Tuition',
          amount: 50000,
          dueDate: nextYear,
          frequency: 'yearly',
          isActive: true,
        },
      }),
      prisma.fee.create({
        data: {
          studentId: students[3].id,
          collegeId: college.id,
          feeType: 'Tuition',
          amount: 60000,
          dueDate: nextYear,
          frequency: 'yearly',
          isActive: true,
        },
      }),
    ]);
    console.log('✅ Fees created for students');

    console.log('\n✨ Dummy data created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log(`  Email: superadmin@demo.com`);
    console.log(`  Password: ${DUMMY_PASSWORD}`);
    console.log('');
    console.log('College Admin:');
    console.log(`  Email: admin@demo.com`);
    console.log(`  Password: ${DUMMY_PASSWORD}`);
    console.log('');
    console.log('Teachers:');
    teachers.forEach((t, i) => {
      console.log(`  Email: teacher${i + 1}@demo.com`);
      console.log(`  Password: ${DUMMY_PASSWORD}`);
    });
    console.log('');
    console.log('Students:');
    students.forEach((s, i) => {
      console.log(`  Email: student${i + 1}@demo.com`);
      console.log(`  Password: ${DUMMY_PASSWORD}`);
    });
    console.log('');
    console.log('Parents:');
    parents.forEach((p, i) => {
      console.log(`  Email: parent${i + 1}@demo.com`);
      console.log(`  Password: ${DUMMY_PASSWORD}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error creating dummy data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyData();

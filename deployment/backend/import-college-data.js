/**
 * Import comprehensive college data for admin: abhiyeduru@gmail.com
 * Includes: 20 students, 10 teachers, subjects, fees, bus routes, teams
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function importCollegeData() {
  try {
    console.log('🚀 Starting comprehensive college data import...\n');

    // Find the college for abhiyeduru@gmail.com
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' },
    });

    if (!admin) {
      console.error('❌ Admin user not found: abhiyeduru@gmail.com');
      process.exit(1);
    }

    const collegeId = admin.collegeId;
    console.log(`✅ Found college: ${collegeId}\n`);

    // ==================== CREATE CLASSES ====================
    console.log('📚 Creating classes...');
    const classes = [];
    const classNames = ['10A', '10B', '12A', '12B'];
    
    for (const className of classNames) {
      const existing = await prisma.sclass.findFirst({
        where: { collegeId, sclassName: className }
      });
      
      if (existing) {
        classes.push(existing);
      } else {
        const sclass = await prisma.sclass.create({
          data: {
            sclassName: className,
            sclassCode: className,
            academicYear: '2024',
            collegeId,
          },
        });
        classes.push(sclass);
      }
    }
    console.log(`✅ Created ${classes.length} classes\n`);

    // ==================== CREATE SECTIONS ====================
    console.log('📋 Creating sections...');
    const sections = [];
    for (const cls of classes) {
      for (const sectionName of ['A', 'B']) {
        const existing = await prisma.section.findFirst({
          where: { collegeId, sclassId: cls.id, sectionName }
        });
        
        if (existing) {
          sections.push(existing);
        } else {
          const section = await prisma.section.create({
            data: { sectionName, sclassId: cls.id, collegeId },
          });
          sections.push(section);
        }
      }
    }
    console.log(`✅ Created ${sections.length} sections\n`);

    // ==================== CREATE TEACHERS ====================
    console.log('👨‍🏫 Creating teachers...');
    const teachersData = [
      { name: 'Rajesh Kumar', email: 'rajesh.kumar@school.edu', phone: '9876543210', qualification: 'B.Tech', experience: 8, specialization: 'Mathematics' },
      { name: 'Priya Sharma', email: 'priya.sharma@school.edu', phone: '9876543211', qualification: 'M.Sc', experience: 6, specialization: 'Physics' },
      { name: 'Amit Patel', email: 'amit.patel@school.edu', phone: '9876543212', qualification: 'B.A', experience: 10, specialization: 'English' },
      { name: 'Deepa Verma', email: 'deepa.verma@school.edu', phone: '9876543213', qualification: 'B.Sc', experience: 5, specialization: 'Chemistry' },
      { name: 'Suresh Nair', email: 'suresh.nair@school.edu', phone: '9876543214', qualification: 'M.Tech', experience: 12, specialization: 'Computer Science' },
      { name: 'Anjali Singh', email: 'anjali.singh@school.edu', phone: '9876543215', qualification: 'B.Com', experience: 7, specialization: 'Economics' },
      { name: 'Vikram Desai', email: 'vikram.desai@school.edu', phone: '9876543216', qualification: 'B.Ed', experience: 9, specialization: 'History' },
      { name: 'Kavya Malhotra', email: 'kavya.malhotra@school.edu', phone: '9876543217', qualification: 'M.A', experience: 4, specialization: 'Geography' },
      { name: 'Ramesh Chopra', email: 'ramesh.chopra@school.edu', phone: '9876543218', qualification: 'B.Sc', experience: 11, specialization: 'Biology' },
      { name: 'Sunita Gupta', email: 'sunita.gupta@school.edu', phone: '9876543219', qualification: 'B.Tech', experience: 6, specialization: 'Information Technology' },
    ];

    const teachers = [];
    for (const teacherData of teachersData) {
      const hashedPassword = await bcrypt.hash('Teacher@123', 10);
      
      const existingUser = await prisma.user.findFirst({
        where: { email: teacherData.email, collegeId }
      });
      
      let user = existingUser;
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: teacherData.name,
            email: teacherData.email,
            password: hashedPassword,
            phone: teacherData.phone,
            role: 'Teacher',
            collegeId,
            isActive: true,
          },
        });
      }

      const existingTeacher = await prisma.teacher.findFirst({
        where: { collegeId, email: teacherData.email }
      });
      
      let teacher = existingTeacher;
      if (!teacher) {
        teacher = await prisma.teacher.create({
          data: {
            name: teacherData.name,
            email: teacherData.email,
            phone: teacherData.phone,
            password: hashedPassword,
            qualification: teacherData.qualification,
            experience: teacherData.experience,
            specialization: teacherData.specialization,
            collegeId,
            userId: user.id,
          },
        });
      }
      teachers.push(teacher);
    }
    console.log(`✅ Created ${teachers.length} teachers\n`);

    // ==================== CREATE STUDENTS ====================
    console.log('👨‍🎓 Creating students...');
    const studentsData = [
      { studentId: 'STU001', name: 'Arjun Kumar', rollNum: 1, classIdx: 0, sectionIdx: 0, email: 'arjun.kumar@student.edu', phone: '9876543220', parentName: 'Rajesh Kumar', parentPhone: '9876543221' },
      { studentId: 'STU002', name: 'Priya Sharma', rollNum: 2, classIdx: 0, sectionIdx: 0, email: 'priya.sharma@student.edu', phone: '9876543222', parentName: 'Anjali Sharma', parentPhone: '9876543223' },
      { studentId: 'STU003', name: 'Neha Gupta', rollNum: 3, classIdx: 0, sectionIdx: 1, email: 'neha.gupta@student.edu', phone: '9876543224', parentName: 'Amit Gupta', parentPhone: '9876543225' },
      { studentId: 'STU004', name: 'Rohan Singh', rollNum: 4, classIdx: 1, sectionIdx: 0, email: 'rohan.singh@student.edu', phone: '9876543226', parentName: 'Priya Singh', parentPhone: '9876543227' },
      { studentId: 'STU005', name: 'Ananya Patel', rollNum: 5, classIdx: 1, sectionIdx: 1, email: 'ananya.patel@student.edu', phone: '9876543228', parentName: 'Vikram Patel', parentPhone: '9876543229' },
      { studentId: 'STU006', name: 'Aditya Verma', rollNum: 6, classIdx: 2, sectionIdx: 0, email: 'aditya.verma@student.edu', phone: '9876543230', parentName: 'Deepa Verma', parentPhone: '9876543231' },
      { studentId: 'STU007', name: 'Divya Nair', rollNum: 7, classIdx: 2, sectionIdx: 1, email: 'divya.nair@student.edu', phone: '9876543232', parentName: 'Suresh Nair', parentPhone: '9876543233' },
      { studentId: 'STU008', name: 'Karan Malhotra', rollNum: 8, classIdx: 3, sectionIdx: 0, email: 'karan.malhotra@student.edu', phone: '9876543234', parentName: 'Kavya Malhotra', parentPhone: '9876543235' },
      { studentId: 'STU009', name: 'Sneha Desai', rollNum: 9, classIdx: 3, sectionIdx: 1, email: 'sneha.desai@student.edu', phone: '9876543236', parentName: 'Ramesh Desai', parentPhone: '9876543237' },
      { studentId: 'STU010', name: 'Varun Chopra', rollNum: 10, classIdx: 0, sectionIdx: 0, email: 'varun.chopra@student.edu', phone: '9876543238', parentName: 'Sunita Chopra', parentPhone: '9876543239' },
      { studentId: 'STU011', name: 'Isha Reddy', rollNum: 11, classIdx: 1, sectionIdx: 0, email: 'isha.reddy@student.edu', phone: '9876543240', parentName: 'Rajesh Reddy', parentPhone: '9876543241' },
      { studentId: 'STU012', name: 'Nikhil Joshi', rollNum: 12, classIdx: 2, sectionIdx: 0, email: 'nikhil.joshi@student.edu', phone: '9876543242', parentName: 'Priya Joshi', parentPhone: '9876543243' },
      { studentId: 'STU013', name: 'Pooja Saxena', rollNum: 13, classIdx: 3, sectionIdx: 1, email: 'pooja.saxena@student.edu', phone: '9876543244', parentName: 'Vikram Saxena', parentPhone: '9876543245' },
      { studentId: 'STU014', name: 'Rahul Verma', rollNum: 14, classIdx: 0, sectionIdx: 1, email: 'rahul.verma@student.edu', phone: '9876543246', parentName: 'Deepa Verma', parentPhone: '9876543247' },
      { studentId: 'STU015', name: 'Sakshi Nair', rollNum: 15, classIdx: 1, sectionIdx: 1, email: 'sakshi.nair@student.edu', phone: '9876543248', parentName: 'Suresh Nair', parentPhone: '9876543249' },
      { studentId: 'STU016', name: 'Aryan Singh', rollNum: 16, classIdx: 2, sectionIdx: 1, email: 'aryan.singh@student.edu', phone: '9876543250', parentName: 'Priya Singh', parentPhone: '9876543251' },
      { studentId: 'STU017', name: 'Zara Khan', rollNum: 17, classIdx: 3, sectionIdx: 0, email: 'zara.khan@student.edu', phone: '9876543252', parentName: 'Ahmed Khan', parentPhone: '9876543253' },
      { studentId: 'STU018', name: 'Vikram Patel', rollNum: 18, classIdx: 0, sectionIdx: 0, email: 'vikram.patel@student.edu', phone: '9876543254', parentName: 'Anjali Patel', parentPhone: '9876543255' },
      { studentId: 'STU019', name: 'Nisha Gupta', rollNum: 19, classIdx: 1, sectionIdx: 0, email: 'nisha.gupta@student.edu', phone: '9876543256', parentName: 'Amit Gupta', parentPhone: '9876543257' },
      { studentId: 'STU020', name: 'Sanjay Desai', rollNum: 20, classIdx: 2, sectionIdx: 0, email: 'sanjay.desai@student.edu', phone: '9876543258', parentName: 'Ramesh Desai', parentPhone: '9876543259' },
    ];

    const students = [];
    for (const studentData of studentsData) {
      const hashedPassword = await bcrypt.hash(String(studentData.rollNum), 10);
      
      const existingUser = await prisma.user.findFirst({
        where: { email: studentData.email, collegeId }
      });
      
      let user = existingUser;
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: studentData.name,
            email: studentData.email,
            password: hashedPassword,
            phone: studentData.phone,
            role: 'Student',
            collegeId,
            isActive: true,
          },
        });
      }

      const existingStudent = await prisma.student.findFirst({
        where: { collegeId, studentId: studentData.studentId }
      });
      
      let student = existingStudent;
      if (!student) {
        student = await prisma.student.create({
          data: {
            name: studentData.name,
            studentId: studentData.studentId,
            email: studentData.email,
            phone: studentData.phone,
            password: hashedPassword,
            rollNum: studentData.rollNum,
            parentName: studentData.parentName,
            parentPhone: studentData.parentPhone,
            collegeId,
            sclassId: classes[studentData.classIdx].id,
            sectionId: sections[studentData.classIdx * 2 + studentData.sectionIdx].id,
            userId: user.id,
          },
        });
      }
      students.push(student);
    }
    console.log(`✅ Created ${students.length} students\n`);

    // ==================== CREATE SUBJECTS ====================
    console.log('📖 Creating subjects...');
    const subjectsData = [
      { subName: 'Mathematics', subCode: 'MATH10', classIdx: 0, teacherIdx: 0, maxMarks: 100, passingMarks: 40 },
      { subName: 'Physics', subCode: 'PHY10', classIdx: 0, teacherIdx: 1, maxMarks: 100, passingMarks: 40 },
      { subName: 'Chemistry', subCode: 'CHEM10', classIdx: 0, teacherIdx: 3, maxMarks: 100, passingMarks: 40 },
      { subName: 'English', subCode: 'ENG10', classIdx: 0, teacherIdx: 2, maxMarks: 100, passingMarks: 40 },
      { subName: 'Biology', subCode: 'BIO10', classIdx: 0, teacherIdx: 8, maxMarks: 100, passingMarks: 40 },
      { subName: 'Mathematics', subCode: 'MATH10B', classIdx: 1, teacherIdx: 0, maxMarks: 100, passingMarks: 40 },
      { subName: 'Physics', subCode: 'PHY10B', classIdx: 1, teacherIdx: 1, maxMarks: 100, passingMarks: 40 },
      { subName: 'Chemistry', subCode: 'CHEM10B', classIdx: 1, teacherIdx: 3, maxMarks: 100, passingMarks: 40 },
      { subName: 'English', subCode: 'ENG10B', classIdx: 1, teacherIdx: 2, maxMarks: 100, passingMarks: 40 },
      { subName: 'Economics', subCode: 'ECO10B', classIdx: 1, teacherIdx: 5, maxMarks: 100, passingMarks: 40 },
      { subName: 'Mathematics', subCode: 'MATH12', classIdx: 2, teacherIdx: 0, maxMarks: 100, passingMarks: 40 },
      { subName: 'Physics', subCode: 'PHY12', classIdx: 2, teacherIdx: 1, maxMarks: 100, passingMarks: 40 },
      { subName: 'Chemistry', subCode: 'CHEM12', classIdx: 2, teacherIdx: 3, maxMarks: 100, passingMarks: 40 },
      { subName: 'Computer Science', subCode: 'CS12', classIdx: 2, teacherIdx: 4, maxMarks: 100, passingMarks: 40 },
      { subName: 'History', subCode: 'HIST12', classIdx: 2, teacherIdx: 6, maxMarks: 100, passingMarks: 40 },
      { subName: 'Mathematics', subCode: 'MATH12B', classIdx: 3, teacherIdx: 0, maxMarks: 100, passingMarks: 40 },
      { subName: 'Physics', subCode: 'PHY12B', classIdx: 3, teacherIdx: 1, maxMarks: 100, passingMarks: 40 },
      { subName: 'Chemistry', subCode: 'CHEM12B', classIdx: 3, teacherIdx: 3, maxMarks: 100, passingMarks: 40 },
      { subName: 'Geography', subCode: 'GEO12B', classIdx: 3, teacherIdx: 7, maxMarks: 100, passingMarks: 40 },
      { subName: 'Biology', subCode: 'BIO12B', classIdx: 3, teacherIdx: 8, maxMarks: 100, passingMarks: 40 },
    ];

    const subjects = [];
    for (const subData of subjectsData) {
      const existing = await prisma.subject.findFirst({
        where: { collegeId, sclassId: classes[subData.classIdx].id, subCode: subData.subCode }
      });
      
      let subject = existing;
      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            subName: subData.subName,
            subCode: subData.subCode,
            collegeId,
            sclassId: classes[subData.classIdx].id,
            teacherId: teachers[subData.teacherIdx].id,
            maxMarks: subData.maxMarks,
            passingMarks: subData.passingMarks,
          },
        });
      }
      subjects.push(subject);
    }
    console.log(`✅ Created ${subjects.length} subjects\n`);

    // ==================== CREATE BUS ROUTES ====================
    console.log('🚌 Creating bus routes...');
    const routesData = [
      { routeName: 'Route A - North', routeCode: 'RT001', startingPoint: 'City Center', endingPoint: 'North Residential Area', distance: 15, stops: 8, capacity: 50, fee: 1500 },
      { routeName: 'Route B - South', routeCode: 'RT002', startingPoint: 'City Center', endingPoint: 'South Residential Area', distance: 18, stops: 10, capacity: 50, fee: 1500 },
      { routeName: 'Route C - East', routeCode: 'RT003', startingPoint: 'City Center', endingPoint: 'East Residential Area', distance: 12, stops: 6, capacity: 50, fee: 1500 },
      { routeName: 'Route D - West', routeCode: 'RT004', startingPoint: 'City Center', endingPoint: 'West Residential Area', distance: 20, stops: 12, capacity: 50, fee: 1500 },
      { routeName: 'Route E - Airport', routeCode: 'RT005', startingPoint: 'City Center', endingPoint: 'Airport Road', distance: 25, stops: 15, capacity: 50, fee: 2000 },
      { routeName: 'Route F - Industrial', routeCode: 'RT006', startingPoint: 'City Center', endingPoint: 'Industrial Area', distance: 22, stops: 11, capacity: 50, fee: 1500 },
      { routeName: 'Route G - University', routeCode: 'RT007', startingPoint: 'City Center', endingPoint: 'University Campus', distance: 18, stops: 9, capacity: 50, fee: 1500 },
      { routeName: 'Route H - Hospital', routeCode: 'RT008', startingPoint: 'City Center', endingPoint: 'Hospital Complex', distance: 10, stops: 5, capacity: 50, fee: 1000 },
      { routeName: 'Route I - Market', routeCode: 'RT009', startingPoint: 'City Center', endingPoint: 'Market District', distance: 8, stops: 4, capacity: 50, fee: 1000 },
      { routeName: 'Route J - Suburbs', routeCode: 'RT010', startingPoint: 'City Center', endingPoint: 'Suburban Area', distance: 30, stops: 18, capacity: 50, fee: 2000 },
    ];

    const routes = [];
    for (const routeData of routesData) {
      const existing = await prisma.transportRoute.findFirst({
        where: { collegeId, routeCode: routeData.routeCode }
      });
      
      let route = existing;
      if (!route) {
        route = await prisma.transportRoute.create({
          data: {
            routeName: routeData.routeName,
            routeCode: routeData.routeCode,
            startingPoint: routeData.startingPoint,
            endingPoint: routeData.endingPoint,
            distance: routeData.distance,
            stops: routeData.stops,
            capacity: routeData.capacity,
            fee: routeData.fee,
            collegeId,
          },
        });
      }
      routes.push(route);
    }
    console.log(`✅ Created ${routes.length} bus routes\n`);

    // ==================== CREATE TEAM MEMBERS ====================
    console.log('👥 Creating team members...');
    const teamsData = [
      { name: 'Ramesh Kumar', email: 'ramesh.accounts@school.edu', phone: '9876543280', role: 'AccountsTeam', designation: 'Senior Accountant' },
      { name: 'Priya Sharma', email: 'priya.accounts@school.edu', phone: '9876543281', role: 'AccountsTeam', designation: 'Junior Accountant' },
      { name: 'Vikram Patel', email: 'vikram.transport@school.edu', phone: '9876543282', role: 'TransportTeam', designation: 'Transport Manager' },
      { name: 'Anjali Singh', email: 'anjali.transport@school.edu', phone: '9876543283', role: 'TransportTeam', designation: 'Transport Coordinator' },
      { name: 'Deepa Verma', email: 'deepa.admin@school.edu', phone: '9876543284', role: 'Admin', designation: 'Office Manager' },
      { name: 'Suresh Nair', email: 'suresh.admin@school.edu', phone: '9876543285', role: 'Admin', designation: 'Administrative Assistant' },
      { name: 'Kavya Malhotra', email: 'kavya.hr@school.edu', phone: '9876543286', role: 'HR', designation: 'HR Manager' },
      { name: 'Ramesh Desai', email: 'ramesh.hr@school.edu', phone: '9876543287', role: 'HR', designation: 'HR Executive' },
      { name: 'Sunita Gupta', email: 'sunita.it@school.edu', phone: '9876543288', role: 'IT', designation: 'IT Manager' },
      { name: 'Anil Sharma', email: 'anil.it@school.edu', phone: '9876543289', role: 'IT', designation: 'IT Support' },
    ];

    const teamMembers = [];
    for (const teamData of teamsData) {
      const hashedPassword = await bcrypt.hash('Team@123', 10);
      
      const existingUser = await prisma.user.findFirst({
        where: { email: teamData.email, collegeId }
      });
      
      let user = existingUser;
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: teamData.name,
            email: teamData.email,
            password: hashedPassword,
            phone: teamData.phone,
            role: teamData.role,
            collegeId,
            isActive: true,
          },
        });
      }

      const existingTeamProfile = await prisma.teamProfile.findFirst({
        where: { collegeId, email: teamData.email }
      });
      
      let teamProfile = existingTeamProfile;
      if (!teamProfile) {
        teamProfile = await prisma.teamProfile.create({
          data: {
            name: teamData.name,
            email: teamData.email,
            phone: teamData.phone,
            designation: teamData.designation,
            collegeId,
            userId: user.id,
          },
        });
      }
      teamMembers.push(teamProfile);
    }
    console.log(`✅ Created ${teamMembers.length} team members\n`);

    // ==================== CREATE FEES ====================
    console.log('💰 Creating fees...');
    let feeCount = 0;
    for (const student of students) {
      const feeTypes = [
        { feeType: 'Tuition Fee', amount: student.sclassId === classes[2].id || student.sclassId === classes[3].id ? 6000 : 5000 },
        { feeType: 'Transport Fee', amount: 1500 },
        { feeType: 'Activity Fee', amount: student.sclassId === classes[2].id || student.sclassId === classes[3].id ? 600 : 500 },
      ];

      for (const feeData of feeTypes) {
        const existing = await prisma.fee.findFirst({
          where: { collegeId, studentId: student.id, feeType: feeData.feeType }
        });
        
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
          });
        }
        feeCount++;
      }
    }
    console.log(`✅ Created ${feeCount} fee records\n`);

    console.log('✨ ========================================');
    console.log('✨ DATA IMPORT COMPLETED SUCCESSFULLY!');
    console.log('✨ ========================================');
    console.log(`
📊 Summary:
  • Classes: ${classes.length}
  • Sections: ${sections.length}
  • Teachers: ${teachers.length}
  • Students: ${students.length}
  • Subjects: ${subjects.length}
  • Bus Routes: ${routes.length}
  • Team Members: ${teamMembers.length}
  • Fee Records: ${feeCount}

🔐 Login Credentials:
  • Teachers: password = Teacher@123
  • Students: password = roll number (e.g., 1, 2, 3...)
  • Team Members: password = Team@123

📧 Admin Email: abhiyeduru@gmail.com
    `);

  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importCollegeData();

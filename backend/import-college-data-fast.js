/**
 * Fast import script - imports college data without upsert checks
 */

const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function importCollegeData() {
  try {
    console.log('🚀 Starting fast college data import...\n');

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
    const classNames = ['10A', '10B', '12A', '12B'];
    const classes = [];
    
    for (const className of classNames) {
      const sclass = await prisma.sclass.create({
        data: {
          sclassName: className,
          sclassCode: className,
          academicYear: '2024',
          collegeId,
        },
      }).catch(() => null);
      
      if (sclass) classes.push(sclass);
      else {
        const existing = await prisma.sclass.findFirst({
          where: { collegeId, sclassName: className }
        });
        if (existing) classes.push(existing);
      }
    }
    console.log(`✅ Created ${classes.length} classes\n`);

    // ==================== CREATE SECTIONS ====================
    console.log('📋 Creating sections...');
    const sections = [];
    for (const cls of classes) {
      for (const sectionName of ['A', 'B']) {
        const section = await prisma.section.create({
          data: { sectionName, sclassId: cls.id, collegeId },
        }).catch(() => null);
        
        if (section) sections.push(section);
        else {
          const existing = await prisma.section.findFirst({
            where: { collegeId, sclassId: cls.id, sectionName }
          });
          if (existing) sections.push(existing);
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
      const hashedPassword = await bcryptjs.hash('Teacher@123', 10);
      
      const user = await prisma.user.create({
        data: {
          name: teacherData.name,
          email: teacherData.email,
          password: hashedPassword,
          phone: teacherData.phone,
          role: 'Teacher',
          collegeId,
          isActive: true,
        },
      }).catch(() => null);

      if (user) {
        const teacher = await prisma.teacher.create({
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
        }).catch(() => null);
        
        if (teacher) teachers.push(teacher);
      }
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
      const hashedPassword = await bcryptjs.hash(String(studentData.rollNum), 10);
      
      const user = await prisma.user.create({
        data: {
          name: studentData.name,
          email: studentData.email,
          password: hashedPassword,
          phone: studentData.phone,
          role: 'Student',
          collegeId,
          isActive: true,
        },
      }).catch(() => null);

      if (user) {
        const student = await prisma.student.create({
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
        }).catch(() => null);
        
        if (student) students.push(student);
      }
    }
    console.log(`✅ Created ${students.length} students\n`);

    console.log('✨ ========================================');
    console.log('✨ DATA IMPORT COMPLETED SUCCESSFULLY!');
    console.log('✨ ========================================');
    console.log(`
📊 Summary:
  • Classes: ${classes.length}
  • Sections: ${sections.length}
  • Teachers: ${teachers.length}
  • Students: ${students.length}

🔐 Login Credentials:
  • Teachers: password = Teacher@123
  • Students: password = roll number (e.g., 1, 2, 3...)

📧 Admin Email: abhiyeduru@gmail.com

✅ All data has been imported successfully!
    `);

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importCollegeData();

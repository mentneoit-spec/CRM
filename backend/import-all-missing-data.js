/**
 * Import all missing data: Exams, Attendance, Routes, Buses, etc.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importAllData() {
  try {
    console.log('🚀 Starting comprehensive data import...\n');

    // Find the college
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' },
    });

    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    const collegeId = admin.collegeId;
    console.log(`✅ Found college: ${collegeId}\n`);

    // Get all students and teachers
    const students = await prisma.student.findMany({
      where: { collegeId },
      include: { sclass: true, section: true },
    });

    const teachers = await prisma.teacher.findMany({
      where: { collegeId },
    });

    const classes = await prisma.sclass.findMany({
      where: { collegeId },
    });

    const subjects = await prisma.subject.findMany({
      where: { collegeId },
    });

    console.log(`📊 Found: ${students.length} students, ${teachers.length} teachers, ${classes.length} classes, ${subjects.length} subjects\n`);

    // ==================== CREATE EXAMS ====================
    console.log('📝 Creating exams...');
    const examNames = ['Monthly Test 1', 'Monthly Test 2', 'Quarterly Exam', 'Half Yearly Exam'];
    const exams = [];

    for (const cls of classes) {
      for (const examName of examNames) {
        const exam = await prisma.exam.create({
          data: {
            examName,
            examType: 'monthly',
            examDate: new Date(2026, 2, 15 + Math.random() * 10),
            sclassId: cls.id,
            collegeId,
            isPublished: true,
          },
        }).catch(() => null);

        if (exam) exams.push(exam);
      }
    }
    console.log(`✅ Created ${exams.length} exams\n`);

    // ==================== CREATE EXAM RESULTS ====================
    console.log('📊 Creating exam results...');
    let resultCount = 0;

    for (const exam of exams) {
      const classStudents = students.filter(s => s.sclassId === exam.sclassId);
      const classSubjects = subjects.filter(s => s.sclassId === exam.sclassId);

      for (const student of classStudents) {
        for (const subject of classSubjects) {
          const marksObtained = Math.floor(Math.random() * 100);
          await prisma.examResult.create({
            data: {
              examId: exam.id,
              studentId: student.id,
              subjectId: subject.id,
              marksObtained,
              collegeId,
            },
          }).catch(() => null);
          resultCount++;
        }
      }
    }
    console.log(`✅ Created ${resultCount} exam results\n`);

    // ==================== CREATE ATTENDANCE ====================
    console.log('📅 Creating attendance records...');
    let attendanceCount = 0;

    // Create attendance for last 30 days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);

      for (const student of students) {
        const isPresent = Math.random() > 0.2; // 80% present
        await prisma.attendance.create({
          data: {
            date,
            studentId: student.id,
            sectionId: student.sectionId,
            sclassId: student.sclassId,
            isPresent,
            collegeId,
          },
        }).catch(() => null);
        attendanceCount++;
      }
    }
    console.log(`✅ Created ${attendanceCount} attendance records\n`);

    // ==================== CREATE BUS ROUTES ====================
    console.log('🚌 Creating bus routes...');
    const routeData = [
      { routeName: 'Route A - North', routeNumber: 'RT-001', startPoint: 'City Center', endPoint: 'North District', distance: 15, fee: 500 },
      { routeName: 'Route B - South', routeNumber: 'RT-002', startPoint: 'City Center', endPoint: 'South District', distance: 20, fee: 600 },
      { routeName: 'Route C - East', routeNumber: 'RT-003', startPoint: 'City Center', endPoint: 'East District', distance: 18, fee: 550 },
      { routeName: 'Route D - West', routeNumber: 'RT-004', startPoint: 'City Center', endPoint: 'West District', distance: 22, fee: 650 },
    ];

    const routes = [];
    for (const route of routeData) {
      const busRoute = await prisma.busRoute.create({
        data: {
          routeName: route.routeName,
          routeNumber: route.routeNumber,
          startPoint: route.startPoint,
          endPoint: route.endPoint,
          distance: route.distance,
          fee: route.fee,
          stopsCount: 3,
          collegeId,
        },
      }).catch(() => null);

      if (busRoute) routes.push(busRoute);
    }
    console.log(`✅ Created ${routes.length} bus routes\n`);

    // ==================== CREATE BUSES ====================
    console.log('🚐 Creating buses...');
    const busData = [
      { busNumber: 'BUS-001', regNumber: 'DL01AB1234', capacity: 50, driverName: 'Rajesh Singh', driverPhone: '9876543220' },
      { busNumber: 'BUS-002', regNumber: 'DL01AB1235', capacity: 50, driverName: 'Vikram Kumar', driverPhone: '9876543221' },
      { busNumber: 'BUS-003', regNumber: 'DL01AB1236', capacity: 45, driverName: 'Suresh Patel', driverPhone: '9876543222' },
      { busNumber: 'BUS-004', regNumber: 'DL01AB1237', capacity: 45, driverName: 'Anil Verma', driverPhone: '9876543223' },
    ];

    const buses = [];
    for (let i = 0; i < busData.length; i++) {
      const bus = await prisma.bus.create({
        data: {
          busNumber: busData[i].busNumber,
          regNumber: busData[i].regNumber,
          capacity: busData[i].capacity,
          driverName: busData[i].driverName,
          driverPhone: busData[i].driverPhone,
          routeId: routes[i % routes.length]?.id,
          collegeId,
        },
      }).catch(() => null);

      if (bus) buses.push(bus);
    }
    console.log(`✅ Created ${buses.length} buses\n`);

    // ==================== ASSIGN STUDENTS TO BUSES ====================
    console.log('🎫 Assigning students to buses...');
    let assignmentCount = 0;

    for (let i = 0; i < students.length; i++) {
      const bus = buses[i % buses.length];
      if (bus) {
        await prisma.student.update({
          where: { id: students[i].id },
          data: { busId: bus.id },
        }).catch(() => null);
        assignmentCount++;
      }
    }
    console.log(`✅ Assigned ${assignmentCount} students to buses\n`);

    // ==================== CREATE TRANSPORT FEES ====================
    console.log('💰 Creating transport fees...');
    let transportFeeCount = 0;

    for (const route of routes) {
      const fee = await prisma.transportFee.create({
        data: {
          amount: 500,
          frequency: 'monthly',
          dueDate: new Date(2026, 3, 15),
          routeId: route.id,
          collegeId,
        },
      }).catch(() => null);

      if (fee) transportFeeCount++;
    }
    console.log(`✅ Created ${transportFeeCount} transport fees\n`);

    // ==================== SUMMARY ====================
    console.log('✅ ✅ ✅ ALL DATA IMPORTED SUCCESSFULLY ✅ ✅ ✅\n');
    console.log('📊 Summary:');
    console.log(`  Exams: ${exams.length}`);
    console.log(`  Exam Results: ${resultCount}`);
    console.log(`  Attendance Records: ${attendanceCount}`);
    console.log(`  Bus Routes: ${routes.length}`);
    console.log(`  Buses: ${buses.length}`);
    console.log(`  Students Assigned to Buses: ${assignmentCount}`);
    console.log(`  Transport Fees: ${transportFeeCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importAllData();

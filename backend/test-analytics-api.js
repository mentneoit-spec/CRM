const prisma = require('./lib/prisma');
const jwt = require('jsonwebtoken');

async function testAnalytics() {
  try {
    // Get first college and admin
    const college = await prisma.college.findFirst();
    if (!college) {
      console.log('No colleges found');
      return;
    }
    
    const collegeId = college.id;
    
    // Get an admin user
    const admin = await prisma.admin.findFirst({
      where: { collegeId }
    });
    
    if (!admin) {
      console.log('No admin found for college');
      return;
    }
    
    console.log('Admin ID:', admin.id);
    console.log('College ID:', collegeId);
    
    // Simulate the analytics query
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalAdmissions,
      totalFees,
      totalPayments,
      completedPayments,
      pendingPayments,
      studentsByClass,
      admissionsByStatus,
      feesByType,
      paymentsByMonth,
      attendanceStats,
      examStats,
      resultStats,
    ] = await Promise.all([
      prisma.student.count({ where: { collegeId, isDeleted: false } }),
      prisma.teacher.count({ where: { collegeId, isActive: true } }),
      prisma.sclass.count({ where: { collegeId } }),
      prisma.subject.count({ where: { collegeId } }),
      prisma.admission.count({ where: { collegeId } }),
      prisma.fee.count({ where: { collegeId } }),
      prisma.payment.count({ where: { collegeId } }),
      prisma.payment.count({ where: { collegeId, status: 'completed' } }),
      prisma.payment.count({ where: { collegeId, status: 'pending' } }),
      prisma.sclass.findMany({
        where: { collegeId },
        select: {
          sclassName: true,
          _count: { select: { Students: { where: { isDeleted: false } } } },
        },
      }),
      prisma.admission.groupBy({
        by: ['status'],
        where: { collegeId },
        _count: { _all: true },
      }),
      prisma.fee.groupBy({
        by: ['feeType'],
        where: { collegeId },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: {
          collegeId,
          status: 'completed',
          createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
        },
        select: { amount: true, createdAt: true },
      }),
      prisma.attendance.aggregate({
        where: { collegeId },
        _count: { _all: true },
      }),
      prisma.exam.count({ where: { collegeId } }),
      prisma.examResult.aggregate({
        where: { collegeId },
        _count: { _all: true },
        _avg: { marksObtained: true },
      }),
    ]);

    console.log('\n=== Analytics Data ===');
    console.log('Total Students:', totalStudents);
    console.log('Total Teachers:', totalTeachers);
    console.log('Total Classes:', totalClasses);
    console.log('Total Subjects:', totalSubjects);
    console.log('Total Admissions:', totalAdmissions);
    console.log('Total Fees:', totalFees);
    console.log('Total Payments:', totalPayments);
    console.log('Completed Payments:', completedPayments);
    console.log('Pending Payments:', pendingPayments);
    console.log('Students by Class:', studentsByClass);
    console.log('Admissions by Status:', admissionsByStatus);
    console.log('Fees by Type:', feesByType);
    console.log('Payments by Month:', paymentsByMonth);
    console.log('Attendance Stats:', attendanceStats);
    console.log('Exam Stats:', examStats);
    console.log('Result Stats:', resultStats);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalytics();

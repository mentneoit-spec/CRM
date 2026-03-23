const prisma = require('./lib/prisma');

async function verifyData() {
  try {
    const college = await prisma.college.findFirst();
    const collegeId = college.id;

    console.log('=== REAL DATA SUMMARY ===\n');

    const students = await prisma.student.findMany({
      where: { collegeId, isDeleted: false },
      include: { Fees: true }
    });

    console.log(`Students: ${students.length}`);
    students.forEach(s => {
      console.log(`  - ${s.name} (${s.Fees.length} fees)`);
    });

    const fees = await prisma.fee.findMany({ where: { collegeId } });
    console.log(`\nTotal Fees: ${fees.length}`);
    console.log(`  - Tuition: ${fees.filter(f => f.feeType === 'Tuition').length}`);
    console.log(`  - Transport: ${fees.filter(f => f.feeType === 'Transport').length}`);
    console.log(`  - Hostel: ${fees.filter(f => f.feeType === 'Hostel').length}`);

    const payments = await prisma.payment.findMany({
      where: { collegeId },
      include: { student: true }
    });

    console.log(`\nTotal Payments: ${payments.length}`);
    console.log(`  - Completed: ${payments.filter(p => p.status === 'completed').length}`);
    console.log(`  - Pending: ${payments.filter(p => p.status === 'pending').length}`);
    console.log(`  - Total Amount: ₹${payments.reduce((sum, p) => sum + p.amount, 0)}`);

    console.log('\nPayment Details:');
    payments.forEach(p => {
      console.log(`  - ${p.student.name}: ₹${p.amount} (${p.status})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();

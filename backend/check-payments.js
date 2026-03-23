const prisma = require('./lib/prisma');

async function checkPayments() {
  try {
    const college = await prisma.college.findFirst();
    if (!college) {
      console.log('No colleges found');
      return;
    }
    
    const collegeId = college.id;
    
    const payments = await prisma.payment.findMany({
      where: { collegeId },
      include: {
        student: { select: { name: true, email: true } },
        fee: { select: { feeType: true } }
      },
      take: 10
    });
    
    console.log('Total Payments:', await prisma.payment.count({ where: { collegeId } }));
    console.log('Sample Payments:', JSON.stringify(payments, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPayments();

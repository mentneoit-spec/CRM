const prisma = require('./lib/prisma');

async function createSamplePayments() {
  try {
    // Get the college
    const college = await prisma.college.findFirst();
    if (!college) {
      console.log('No college found');
      return;
    }

    const collegeId = college.id;
    console.log('Creating payments for college:', college.name);

    // Get all fees
    const fees = await prisma.fee.findMany({
      where: { collegeId },
      include: { student: true }
    });

    console.log(`Found ${fees.length} fees`);

    let createdCount = 0;

    // Create payments for about 70% of fees
    for (const fee of fees) {
      if (Math.random() > 0.3) { // 70% chance
        const paymentAmount = fee.amount * (0.5 + Math.random() * 0.5); // 50-100% of fee amount
        
        const payment = await prisma.payment.create({
          data: {
            collegeId,
            studentId: fee.studentId,
            feeId: fee.id,
            amount: Math.round(paymentAmount),
            status: Math.random() > 0.2 ? 'completed' : 'pending', // 80% completed
            paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            paymentMethod: Math.random() > 0.5 ? 'razorpay' : 'manual',
            notes: `Payment for ${fee.feeType}`,
            razorpayPaymentId: `pay_${Math.random().toString(36).substr(2, 14)}`
          }
        });
        
        console.log(`Created payment: ${fee.student.name} - ${fee.feeType} - ₹${Math.round(paymentAmount)} - ${payment.status}`);
        createdCount++;
      }
    }

    console.log(`\nTotal payments created: ${createdCount}`);

    // Show summary
    const totalPayments = await prisma.payment.count({ where: { collegeId } });
    const completedPayments = await prisma.payment.count({ where: { collegeId, status: 'completed' } });
    const totalAmount = await prisma.payment.aggregate({
      where: { collegeId },
      _sum: { amount: true }
    });

    console.log(`Total payments in database: ${totalPayments}`);
    console.log(`Completed payments: ${completedPayments}`);
    console.log(`Total amount received: ₹${totalAmount._sum.amount || 0}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSamplePayments();

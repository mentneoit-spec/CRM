const prisma = require('./lib/prisma');

async function check() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' }
    });
    
    const collegeId = admin?.collegeId;
    console.log('College ID:', collegeId);
    
    const fees = await prisma.fee.findMany({
      where: { collegeId },
      include: { student: { select: { name: true } } }
    });
    
    console.log('\nFees in database:', fees.length);
    if (fees.length > 0) {
      console.log('\nFirst 5 fees:');
      fees.slice(0, 5).forEach(f => {
        console.log(`  - ${f.feeType} for ${f.student?.name || 'Unknown'}: ₹${f.amount}`);
      });
    } else {
      console.log('❌ NO FEES FOUND IN DATABASE');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

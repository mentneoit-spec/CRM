const prisma = require('./lib/prisma');

async function check() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' }
    });
    
    const collegeId = admin?.collegeId;
    
    const fees = await prisma.fee.findMany({
      where: { collegeId },
      include: { 
        student: { 
          select: { 
            name: true, 
            sclass: { select: { sclassName: true } } 
          } 
        } 
      },
      take: 5
    });
    
    console.log('Fees with student info:');
    fees.forEach(f => {
      console.log(`  ${f.feeType}: ${f.student?.name || 'NO STUDENT'} (${f.student?.sclass?.sclassName || 'NO CLASS'})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

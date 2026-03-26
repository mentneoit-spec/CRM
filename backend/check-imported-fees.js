const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImportedFees() {
  try {
    const college = await prisma.college.findFirst();
    console.log('College:', college.name);
    
    const totalFees = await prisma.fee.count({ where: { collegeId: college.id } });
    console.log('Total fees in database:', totalFees);
    
    const recentFees = await prisma.fee.findMany({
      where: { collegeId: college.id },
      select: {
        id: true,
        feeType: true,
        amount: true,
        dueDate: true,
        isActive: true,
        student: { select: { name: true, studentId: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\nRecent fees:');
    recentFees.forEach((fee, i) => {
      console.log(`${i+1}. ${fee.student?.name} (${fee.student?.studentId}) - ${fee.feeType}: ₹${fee.amount} (Active: ${fee.isActive})`);
    });
    
    // Check if fees are active
    const activeFees = await prisma.fee.count({ 
      where: { collegeId: college.id, isActive: true } 
    });
    console.log(`\nActive fees: ${activeFees}`);
    console.log(`Inactive fees: ${totalFees - activeFees}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkImportedFees();
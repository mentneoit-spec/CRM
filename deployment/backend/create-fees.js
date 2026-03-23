/**
 * Create fees for all students
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createFees() {
  try {
    console.log('🚀 Creating fees for all students...\n');

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

    // Get all students
    const students = await prisma.student.findMany({
      where: { collegeId },
    });

    console.log(`📊 Found: ${students.length} students\n`);

    // ==================== CREATE FEES ====================
    console.log('💰 Creating fees...');
    
    const feeTypes = [
      { type: 'Tuition', amount: 5000 },
      { type: 'Transport', amount: 1000 },
      { type: 'Activity', amount: 500 },
    ];

    let feeCount = 0;
    const dueDate = new Date(2026, 3, 15); // April 15, 2026

    for (const student of students) {
      for (const feeType of feeTypes) {
        try {
          await prisma.fee.create({
            data: {
              studentId: student.id,
              feeType: feeType.type,
              feeCategory: feeType.type,
              amount: feeType.amount,
              dueDate,
              frequency: 'yearly',
              description: `${feeType.type} fee for ${student.name}`,
              isActive: true,
              collegeId,
            },
          });
          feeCount++;
        } catch (error) {
          // Skip if fee already exists
        }
      }
    }

    console.log(`✅ Created ${feeCount} fees\n`);

    // ==================== SUMMARY ====================
    console.log('✅ ✅ ✅ FEES CREATED SUCCESSFULLY ✅ ✅ ✅\n');
    console.log('📊 Summary:');
    console.log(`  Students: ${students.length}`);
    console.log(`  Fee Types: ${feeTypes.length}`);
    console.log(`  Total Fees: ${feeCount}`);
    console.log(`  Expected: ${students.length * feeTypes.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createFees();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' },
    });

    const collegeId = admin.collegeId;

    console.log('Creating route...');
    const route = await prisma.busRoute.create({
      data: {
        routeName: 'Test Route',
        startPoint: 'Start',
        endPoint: 'End',
        distance: 10,
        stops: ['Stop1', 'Stop2'],
        collegeId,
      },
    });

    console.log('✅ Route created:', route);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();

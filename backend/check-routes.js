const prisma = require('./lib/prisma');

async function check() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' }
    });
    
    const collegeId = admin?.collegeId;
    
    const routes = await prisma.busRoute.findMany({
      where: { collegeId }
    });
    
    console.log('Routes:', routes.length);
    routes.forEach(r => console.log(`  ${r.routeName} (${r.routeNumber})`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

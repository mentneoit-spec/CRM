const prisma = require('./lib/prisma');

async function check() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'abhiyeduru@gmail.com' },
      include: { AdminProfile: true }
    });
    
    console.log('Admin found:', admin?.email);
    console.log('Role:', admin?.role);
    console.log('College ID:', admin?.collegeId);
    console.log('Is Active:', admin?.isActive);
    console.log('Admin Profile:', admin?.AdminProfile);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

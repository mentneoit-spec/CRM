const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
  try {
    await prisma.superAdmin.deleteMany({});
    console.log('✅ SuperAdmin records deleted');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

clearData();

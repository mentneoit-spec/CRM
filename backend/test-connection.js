const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🧪 Testing PostgreSQL Connection...');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
  
  const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
  });

  try {
    console.log('⏳ Attempting to connect...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection successful!');
    console.log('📊 Query result:', result);
    
    // Test User count
    const userCount = await prisma.user.count();
    console.log('👥 User count:', userCount);
    
    // Test Teacher count
    const teacherCount = await prisma.teacher.count();
    console.log('📚 Teacher count:', teacherCount);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

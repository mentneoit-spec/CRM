require('dotenv').config();
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function testInsertAndVerify() {
  try {
    console.log('\n🧪 TESTING: Insert New User and Verify Immediately\n');
    console.log('='.repeat(80));
    
    // Create a test user with timestamp
    const timestamp = new Date().toLocaleTimeString();
    const testEmail = `test-${Date.now()}@example.com`;
    
    console.log('\n1️⃣ INSERTING NEW USER...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Time: ${timestamp}`);
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newUser = await prisma.user.create({
      data: {
        name: `Test User ${timestamp}`,
        email: testEmail,
        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        password: hashedPassword,
        role: 'Student',
        isActive: true
      }
    });
    
    console.log('   ✅ User created with ID:', newUser.id);
    
    // Immediately verify
    console.log('\n2️⃣ VERIFYING IN DATABASE...');
    
    const foundUser = await prisma.user.findUnique({
      where: { id: newUser.id }
    });
    
    if (foundUser) {
      console.log('   ✅ User found in database!');
      console.log(`   Name: ${foundUser.name}`);
      console.log(`   Email: ${foundUser.email}`);
      console.log(`   Role: ${foundUser.role}`);
    } else {
      console.log('   ❌ User NOT found!');
    }
    
    // Count total users
    console.log('\n3️⃣ TOTAL USERS IN DATABASE...');
    const totalUsers = await prisma.user.count();
    console.log(`   Total: ${totalUsers} users`);
    
    // Show all users
    console.log('\n4️⃣ ALL USERS:');
    const allUsers = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    allUsers.forEach((user, index) => {
      const isNew = user.email === testEmail ? '🆕' : '  ';
      console.log(`   ${isNew} ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n='.repeat(80));
    console.log('\n✅ TEST COMPLETE!');
    console.log('\n💡 NOW CHECK NEON DASHBOARD:');
    console.log('   1. Go to: https://console.neon.tech');
    console.log('   2. Click "SQL Editor"');
    console.log('   3. Run: SELECT * FROM "User" ORDER BY "createdAt" DESC;');
    console.log(`   4. Look for: ${testEmail}`);
    console.log('\n   If you see it there, your Neon dashboard is working correctly!');
    console.log('   If not, try refreshing the page or checking the branch.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testInsertAndVerify();

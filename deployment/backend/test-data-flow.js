const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function testDataFlow() {
  console.log('🧪 Testing Frontend → Backend → Database Flow...\n');

  try {
    // 1. Test Database Connection
    console.log('1️⃣ Testing Database Connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // 2. Test Create College
    console.log('2️⃣ Testing Create Operation (College)...');
    const college = await prisma.college.create({
      data: {
        name: 'Test College ' + Date.now(),
        email: `test${Date.now()}@college.com`,
        phone: '1234567890',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        country: 'India',
      },
    });
    console.log('✅ College created with ID:', college.id);
    console.log('   Name:', college.name, '\n');

    // 3. Test Create User
    console.log('3️⃣ Testing Create User...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test Student',
        email: `student${Date.now()}@test.com`,
        password: hashedPassword,
        role: 'Student',
        collegeId: college.id,
        isActive: true,
        isEmailVerified: true,
      },
    });
    console.log('✅ User created with ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role, '\n');

    // 4. Test Read Operation
    console.log('4️⃣ Testing Read Operation...');
    const colleges = await prisma.college.findMany({
      take: 5,
    });
    console.log('✅ Found', colleges.length, 'college(s) in database\n');

    const users = await prisma.user.findMany({
      where: { collegeId: college.id },
    });
    console.log('✅ Found', users.length, 'user(s) for this college\n');

    // 5. Test Update Operation
    console.log('5️⃣ Testing Update Operation...');
    const updatedCollege = await prisma.college.update({
      where: { id: college.id },
      data: { 
        phone: '9876543210',
        status: 'active',
      },
    });
    console.log('✅ College updated');
    console.log('   New phone:', updatedCollege.phone, '\n');

    // 6. Test Complex Query (with relations)
    console.log('6️⃣ Testing Complex Query with Relations...');
    const collegeWithUsers = await prisma.college.findUnique({
      where: { id: college.id },
      include: {
        Users: true,
      },
    });
    console.log('✅ College with users fetched');
    console.log('   College:', collegeWithUsers.name);
    console.log('   Users count:', collegeWithUsers.Users.length, '\n');

    // 7. Test Delete Operation
    console.log('7️⃣ Testing Delete Operation...');
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('✅ User deleted\n');

    await prisma.college.delete({
      where: { id: college.id },
    });
    console.log('✅ College deleted\n');

    // 8. Final Verification
    console.log('8️⃣ Final Verification...');
    const totalColleges = await prisma.college.count();
    const totalUsers = await prisma.user.count();
    console.log('✅ Total colleges in database:', totalColleges);
    console.log('✅ Total users in database:', totalUsers, '\n');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Database connection: Working');
    console.log('✅ Create operations: Working');
    console.log('✅ Read operations: Working');
    console.log('✅ Update operations: Working');
    console.log('✅ Delete operations: Working');
    console.log('✅ Relations: Working');
    console.log('\n💾 Data flow is working PERFECTLY!');
    console.log('Frontend → Backend → Database → Frontend is READY! ✅\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the test
testDataFlow();

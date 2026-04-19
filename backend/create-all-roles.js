const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    console.log('👥 CREATING TEST ACCOUNTS FOR ALL ROLES\n');

    // Get or create a demo college
    let college = await prisma.college.findFirst();
    
    if (!college) {
      console.log('Creating demo college...');
      college = await prisma.college.create({
        data: {
          name: 'Demo College',
          email: 'demo@college.com',
          phone: '9999999999',
          address: '123 Demo Street, College City',
          city: 'Demo City',
          state: 'Demo State',
          pincode: '123456',
          country: 'India'
        }
      });
    }

    const collegeId = college.id;
    console.log(`College ID: ${collegeId}\n`);

    // Test users for different roles
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'Admin@123',
        role: 'Admin',
        collegeId
      },
      {
        name: 'Teacher User',
        email: 'teacher@test.com',
        password: 'Teacher@123',
        role: 'Teacher',
        collegeId
      },
      {
        name: 'Student User',
        email: 'student@test.com',
        password: 'Student@123',
        role: 'Student',
        collegeId
      },
      {
        name: 'Parent User',
        email: 'parent@test.com',
        password: 'Parent@123',
        role: 'Parent',
        collegeId
      },
      {
        name: 'Accounts Team',
        email: 'accounts@test.com',
        password: 'Accounts@123',
        role: 'AccountsTeam',
        collegeId
      },
      {
        name: 'Transport Team',
        email: 'transport@test.com',
        password: 'Transport@123',
        role: 'TransportTeam',
        collegeId
      }
    ];

    const hashedPassword = await bcrypt.hash('Test@123', 10);

    for (const userData of testUsers) {
      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { 
          email_collegeId: {
            email: userData.email,
            collegeId: userData.collegeId
          }
        }
      });

      if (!existing) {
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            collegeId: userData.collegeId,
            isEmailVerified: true
          }
        });

        console.log(`✅ ${userData.role}`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Password: Test@123\n`);
      } else {
        console.log(`⏭ ${userData.role} already exists\n`);
      }
    }

    console.log('\n===========================================');
    console.log('🎉 ALL TEST ACCOUNTS CREATED');
    console.log('===========================================\n');
    console.log('SUPERADMIN:');
    console.log('   Email: abhiyeduru8@gmail.com');
    console.log('   Password: abhi2244\n');
    console.log('ALL OTHER ROLES:');
    console.log('   Password: Test@123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestUsers();

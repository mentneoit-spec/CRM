require('dotenv').config();
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function setupTestCollege() {
  try {
    console.log('\n🏫 SETTING UP TEST COLLEGE\n');
    console.log('='.repeat(80));

    // Check if college already exists
    let college = await prisma.college.findFirst({
      where: { name: 'Test College' }
    });

    if (college) {
      console.log('\n✅ Test College already exists');
      console.log(`   ID: ${college.id}`);
      console.log(`   Name: ${college.name}`);
    } else {
      // Create test college
      college = await prisma.college.create({
        data: {
          name: 'Test College',
          description: 'Test college for development',
          email: 'admin@testcollege.edu',
          phone: '+919876543210',
          address: '123 College Street',
          city: 'Test City',
          state: 'Test State',
          country: 'India',
          pincode: '123456',
          status: 'active',
          subscriptionPlan: 'professional',
          isSubscriptionActive: true,
        },
      });

      console.log('\n✅ Created Test College');
      console.log(`   ID: ${college.id}`);
      console.log(`   Name: ${college.name}`);
    }

    // Create a test class for students
    let testClass = await prisma.sclass.findFirst({
      where: { 
        collegeId: college.id,
        sclassName: 'Class 10'
      }
    });

    if (!testClass) {
      testClass = await prisma.sclass.create({
        data: {
          sclassName: 'Class 10',
          sclassCode: 'C10',
          academicYear: '2026',
          collegeId: college.id,
        },
      });
      console.log('\n✅ Created Test Class: Class 10');
    } else {
      console.log('\n✅ Test Class already exists: Class 10');
    }

    console.log('\n='.repeat(80));
    console.log('\n📝 NOW REGISTERING TEST USERS WITH COLLEGE...\n');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Register users with proper role-specific records
    const usersToCreate = [
      {
        name: 'John Student',
        email: 'john.student@testcollege.edu',
        phone: '+919876543201',
        role: 'Student',
      },
      {
        name: 'Sarah Teacher',
        email: 'sarah.teacher@testcollege.edu',
        phone: '+919876543202',
        role: 'Teacher',
      },
      {
        name: 'Michael Parent',
        email: 'michael.parent@testcollege.edu',
        phone: '+919876543203',
        role: 'Parent',
      },
      {
        name: 'Admin User',
        email: 'admin.user@testcollege.edu',
        phone: '+919876543204',
        role: 'Admin',
      },
    ];

    for (const userData of usersToCreate) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: {
            email_collegeId: {
              email: userData.email,
              collegeId: college.id,
            },
          },
        });

        if (existingUser) {
          console.log(`⏭️  ${userData.name} already exists`);
          continue;
        }

        // Create user and role-specific record in transaction
        await prisma.$transaction(async (tx) => {
          // Create base user
          const user = await tx.user.create({
            data: {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              password: hashedPassword,
              role: userData.role,
              collegeId: college.id,
              isActive: true,
            },
          });

          // Create role-specific record
          switch (userData.role) {
            case 'Student':
              await tx.student.create({
                data: {
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  password: hashedPassword,
                  studentId: `STU${Date.now()}${Math.floor(Math.random() * 1000)}`,
                  userId: user.id,
                  collegeId: college.id,
                  sclassId: testClass.id, // Assign to test class
                },
              });
              break;

            case 'Teacher':
              await tx.teacher.create({
                data: {
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  password: hashedPassword,
                  userId: user.id,
                  collegeId: college.id,
                },
              });
              break;

            case 'Parent':
              await tx.parent.create({
                data: {
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  password: hashedPassword,
                  userId: user.id,
                  collegeId: college.id,
                },
              });
              break;

            case 'Admin':
              await tx.admin.create({
                data: {
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  password: hashedPassword,
                  userId: user.id,
                  collegeId: college.id,
                },
              });
              break;
          }
        });

        console.log(`✅ Created ${userData.name} (${userData.role})`);
      } catch (error) {
        console.log(`❌ Error creating ${userData.name}: ${error.message}`);
      }
    }

    console.log('\n='.repeat(80));
    console.log('\n📊 FINAL TABLE COUNTS:\n');

    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    const parentCount = await prisma.parent.count();
    const adminCount = await prisma.admin.count();
    const superAdminCount = await prisma.superAdmin.count();
    const collegeCount = await prisma.college.count();
    const classCount = await prisma.sclass.count();

    console.log(`  Users: ${userCount}`);
    console.log(`  Students: ${studentCount}`);
    console.log(`  Teachers: ${teacherCount}`);
    console.log(`  Parents: ${parentCount}`);
    console.log(`  Admins: ${adminCount}`);
    console.log(`  SuperAdmins: ${superAdminCount}`);
    console.log(`  Colleges: ${collegeCount}`);
    console.log(`  Classes: ${classCount}`);

    console.log('\n='.repeat(80));
    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('📝 Test Credentials:');
    console.log('   Email: john.student@testcollege.edu (or any other)');
    console.log('   Password: password123');
    console.log(`   College ID: ${college.id}\n`);

  } catch (error) {
    console.error('\n❌ Setup error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestCollege();

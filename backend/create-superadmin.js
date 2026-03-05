require('dotenv').config();
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  try {
    console.log('\n👑 CREATING SUPERADMIN ACCOUNT\n');
    console.log('='.repeat(80));

    const email = 'abhiyeduru8@gmail.com';
    const password = 'abhi2244';
    const name = 'Abhi Yeduru';

    // Check if SuperAdmin already exists
    const existingSuperAdmin = await prisma.superAdmin.findUnique({
      where: { email }
    });

    if (existingSuperAdmin) {
      console.log('\n⚠️  SuperAdmin already exists with this email!');
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log('\n💡 Updating password...\n');

      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.superAdmin.update({
        where: { email },
        data: { 
          password: hashedPassword,
          name: name,
        }
      });

      console.log('✅ SuperAdmin password updated successfully!');
    } else {
      // Create new SuperAdmin
      const hashedPassword = await bcrypt.hash(password, 10);

      const superAdmin = await prisma.superAdmin.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          phone: '+919876543210',
          twoFAEnabled: false,
          isActive: true,
        },
      });

      console.log('\n✅ SuperAdmin created successfully!');
      console.log(`   ID: ${superAdmin.id}`);
      console.log(`   Name: ${superAdmin.name}`);
      console.log(`   Email: ${superAdmin.email}`);
    }

    // Also create a User record for authentication
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: email,
        collegeId: null
      }
    });

    if (existingUser) {
      console.log('\n✅ User record already exists');
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          password: hashedPassword,
          name: name,
        }
      });
      console.log('✅ User password updated');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          phone: '+919876543210',
          role: 'SuperAdmin',
          collegeId: null,
          isActive: true,
        },
      });
      console.log('\n✅ User record created');
    }

    console.log('\n='.repeat(80));
    console.log('\n🎉 SUPERADMIN SETUP COMPLETE!\n');
    console.log('📝 Login Credentials:\n');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n🚀 How to Login:\n');
    console.log('   1. Go to: http://localhost:3000/login');
    console.log('   2. Enter the credentials above');
    console.log('   3. You will be logged in as SuperAdmin');
    console.log('\n💡 SuperAdmin Features:\n');
    console.log('   • Manage all colleges');
    console.log('   • View platform analytics');
    console.log('   • Manage subscriptions');
    console.log('   • Access all system features\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();

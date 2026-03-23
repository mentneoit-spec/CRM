require('dotenv').config();

const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

const DEFAULT_COLLEGE_ID = '2aad2902-caee-4a50-bcb9-0b75e0c75262';

async function main() {
  console.log('\n🏫 Seeding default college for local dev...');

  await prisma.$connect();

  const college = await prisma.college.upsert({
    where: { id: DEFAULT_COLLEGE_ID },
    update: {
      status: 'active',
      isSubscriptionActive: true,
    },
    create: {
      id: DEFAULT_COLLEGE_ID,
      name: 'Default Dev College',
      description: 'Seeded college used by the frontend hardcoded collegeId',
      email: 'dev-college@example.com',
      phone: '+910000000000',
      city: 'Dev City',
      state: 'Dev State',
      country: 'India',
      pincode: '000000',
      status: 'active',
      subscriptionPlan: 'starter',
      isSubscriptionActive: true,
    },
  });

  console.log(`✅ College ready: ${college.name}`);
  console.log(`   College ID: ${college.id}`);

  const demoUsers = [
    {
      role: 'Student',
      name: 'Seed Student',
      email: 'student@school.com',
      phone: '+919999999901',
      password: 'Student@123',
    },
    {
      role: 'Teacher',
      name: 'Seed Teacher',
      email: 'teacher@school.com',
      phone: '+919999999902',
      password: 'Teacher@123',
    },
    {
      role: 'Parent',
      name: 'Seed Parent',
      email: 'parent@school.com',
      phone: '+919999999903',
      password: 'Parent@123',
    },
    {
      role: 'Admin',
      name: 'Seed Admin',
      email: 'admin@school.com',
      phone: '+919999999904',
      password: 'Admin@123',
    },
  ];

  for (const demo of demoUsers) {
    const existing = await prisma.user.findUnique({
      where: {
        email_collegeId: {
          email: demo.email,
          collegeId: DEFAULT_COLLEGE_ID,
        },
      },
    });

    const hashedPassword = await bcrypt.hash(demo.password, 10);

    await prisma.$transaction(async (tx) => {
      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: {
              name: demo.name,
              email: demo.email,
              phone: demo.phone,
              password: hashedPassword,
              role: demo.role,
              collegeId: DEFAULT_COLLEGE_ID,
              isActive: true,
              isEmailVerified: true,
            },
          })
        : await tx.user.create({
            data: {
              name: demo.name,
              email: demo.email,
              phone: demo.phone,
              password: hashedPassword,
              role: demo.role,
              collegeId: DEFAULT_COLLEGE_ID,
              isActive: true,
              isEmailVerified: true,
            },
          });

      if (demo.role === 'Student') {
        await tx.student.upsert({
          where: { userId: user.id },
          update: {
            name: demo.name,
            email: demo.email,
            phone: demo.phone,
            password: hashedPassword,
            isActive: true,
            isDeleted: false,
          },
          create: {
            name: demo.name,
            email: demo.email,
            phone: demo.phone,
            password: hashedPassword,
            studentId: `STU${Date.now()}`,
            collegeId: DEFAULT_COLLEGE_ID,
            userId: user.id,
            gender: 'Other',
          },
        });
      }

      if (demo.role === 'Teacher') {
        await tx.teacher.upsert({
          where: { userId: user.id },
          update: {
            name: demo.name,
            email: demo.email,
            phone: demo.phone,
            password: hashedPassword,
            isActive: true,
          },
          create: {
            name: demo.name,
            email: demo.email,
            phone: demo.phone,
            password: hashedPassword,
            collegeId: DEFAULT_COLLEGE_ID,
            userId: user.id,
            qualification: 'M.Sc',
            experience: 3,
          },
        });
      }

      if (demo.role === 'Parent') {
        await tx.parent.upsert({
          where: { userId: user.id },
          update: {
            name: demo.name,
            email: demo.email,
            phone: demo.phone,
            password: hashedPassword,
            isActive: true,
          },
          create: {
            name: demo.name,
            email: demo.email,
            phone: demo.phone,
            password: hashedPassword,
            collegeId: DEFAULT_COLLEGE_ID,
            userId: user.id,
            relation: 'Guardian',
          },
        });
      }

      if (demo.role === 'Admin') {
        await tx.admin.upsert({
          where: { userId: user.id },
          update: {
            name: demo.name,
            email: demo.email,
            phone: demo.phone,
            password: hashedPassword,
            isActive: true,
          },
          create: {
            name: demo.name,
            email: demo.email,
            phone: demo.phone,
            password: hashedPassword,
            collegeId: DEFAULT_COLLEGE_ID,
            userId: user.id,
            designation: 'Principal',
          },
        });
      }
    });

    console.log(`✅ Seed ready ${demo.role}: ${demo.email} / ${demo.password}`);
  }

  // Seed a SuperAdmin (collegeId = null) for SuperAdmin dashboard
  const superAdminEmail = 'superadmin@school.com';
  const superAdminPassword = 'SuperAdmin@123';

  const existingSuperAdminRow = await prisma.superAdmin.findFirst({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdminRow) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    // Ensure a base User row exists too (used by /auth/login flows)
    const existingBaseUser = await prisma.user.findFirst({
      where: { email: superAdminEmail, collegeId: null },
    });

    if (!existingBaseUser) {
      await prisma.user.create({
        data: {
          name: 'Seed SuperAdmin',
          email: superAdminEmail,
          phone: '+919999999905',
          password: hashedPassword,
          role: 'SuperAdmin',
          collegeId: null,
          isActive: true,
          isEmailVerified: true,
          twoFAEnabled: false,
        },
      });
    }

    await prisma.superAdmin.create({
      data: {
        name: 'Seed SuperAdmin',
        email: superAdminEmail,
        phone: '+919999999905',
        password: hashedPassword,
        role: 'SuperAdmin',
        isActive: true,
        twoFAEnabled: false,
      },
    });

    console.log(`✅ Seeded SuperAdmin: ${superAdminEmail} / ${superAdminPassword}`);
  } else {
    console.log('⏭️  SuperAdmin already exists');
  }

  console.log('\n✅ Demo accounts ready (use these on /login):');
  console.log('  Student:    student@school.com / Student@123');
  console.log('  Teacher:    teacher@school.com / Teacher@123');
  console.log('  Parent:     parent@school.com / Parent@123');
  console.log('  Admin:      admin@school.com / Admin@123');
  console.log('  SuperAdmin: superadmin@school.com / SuperAdmin@123');
  console.log(`  College ID: ${DEFAULT_COLLEGE_ID}`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

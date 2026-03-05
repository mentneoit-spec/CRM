require('dotenv').config();
const prisma = require('./lib/prisma');

async function migrateUsersToRoles() {
  try {
    console.log('\n🔄 MIGRATING USERS TO ROLE-SPECIFIC TABLES\n');
    console.log('='.repeat(80));

    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`\nFound ${users.length} users to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        console.log(`Processing: ${user.name} (${user.role})`);

        // Check if role-specific record already exists
        let exists = false;

        switch (user.role) {
          case 'Student':
            const existingStudent = await prisma.student.findUnique({
              where: { userId: user.id }
            });
            if (existingStudent) {
              exists = true;
              console.log(`  ⏭️  Already exists in Student table`);
            } else if (user.collegeId) {
              await prisma.student.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                  studentId: `STU${Date.now()}${Math.floor(Math.random() * 1000)}`,
                  userId: user.id,
                  collegeId: user.collegeId,
                  sclassId: null, // Will be assigned by admin
                },
              });
              console.log(`  ✅ Created in Student table`);
              migrated++;
            } else {
              console.log(`  ⚠️  Skipped - no collegeId`);
              skipped++;
            }
            break;

          case 'Teacher':
            const existingTeacher = await prisma.teacher.findUnique({
              where: { userId: user.id }
            });
            if (existingTeacher) {
              exists = true;
              console.log(`  ⏭️  Already exists in Teacher table`);
            } else if (user.collegeId) {
              await prisma.teacher.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                  userId: user.id,
                  collegeId: user.collegeId,
                },
              });
              console.log(`  ✅ Created in Teacher table`);
              migrated++;
            } else {
              console.log(`  ⚠️  Skipped - no collegeId`);
              skipped++;
            }
            break;

          case 'Parent':
            const existingParent = await prisma.parent.findUnique({
              where: { userId: user.id }
            });
            if (existingParent) {
              exists = true;
              console.log(`  ⏭️  Already exists in Parent table`);
            } else if (user.collegeId) {
              await prisma.parent.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                  userId: user.id,
                  collegeId: user.collegeId,
                },
              });
              console.log(`  ✅ Created in Parent table`);
              migrated++;
            } else {
              console.log(`  ⚠️  Skipped - no collegeId`);
              skipped++;
            }
            break;

          case 'Admin':
            const existingAdmin = await prisma.admin.findUnique({
              where: { userId: user.id }
            });
            if (existingAdmin) {
              exists = true;
              console.log(`  ⏭️  Already exists in Admin table`);
            } else if (user.collegeId) {
              await prisma.admin.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                  userId: user.id,
                  collegeId: user.collegeId,
                },
              });
              console.log(`  ✅ Created in Admin table`);
              migrated++;
            } else {
              console.log(`  ⚠️  Skipped - no collegeId`);
              skipped++;
            }
            break;

          case 'SuperAdmin':
            const existingSuperAdmin = await prisma.superAdmin.findUnique({
              where: { email: user.email }
            });
            if (existingSuperAdmin) {
              exists = true;
              console.log(`  ⏭️  Already exists in SuperAdmin table`);
            } else {
              await prisma.superAdmin.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                },
              });
              console.log(`  ✅ Created in SuperAdmin table`);
              migrated++;
            }
            break;

          default:
            console.log(`  ⚠️  Unknown role: ${user.role}`);
            skipped++;
        }

        if (exists) {
          skipped++;
        }

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        errors++;
      }

      console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n📊 MIGRATION SUMMARY:\n');
    console.log(`  Total users: ${users.length}`);
    console.log(`  ✅ Migrated: ${migrated}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);

    // Show current counts
    console.log('\n📈 CURRENT TABLE COUNTS:\n');
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    const parentCount = await prisma.parent.count();
    const adminCount = await prisma.admin.count();
    const superAdminCount = await prisma.superAdmin.count();

    console.log(`  Students: ${studentCount}`);
    console.log(`  Teachers: ${teacherCount}`);
    console.log(`  Parents: ${parentCount}`);
    console.log(`  Admins: ${adminCount}`);
    console.log(`  SuperAdmins: ${superAdminCount}`);

    console.log('\n='.repeat(80));
    console.log('\n✅ MIGRATION COMPLETE!\n');

  } catch (error) {
    console.error('\n❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsersToRoles();

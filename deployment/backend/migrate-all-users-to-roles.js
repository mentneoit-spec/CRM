require('dotenv').config();
const prisma = require('./lib/prisma');

async function migrateAllUsers() {
  try {
    console.log('\n🔄 MIGRATING ALL USERS TO ROLE-SPECIFIC TABLES\n');
    console.log('='.repeat(80));

    // Get the test college
    const college = await prisma.college.findFirst();
    const collegeId = college?.id;

    if (!collegeId) {
      console.log('❌ No college found. Creating Test College first...');
      return;
    }

    console.log(`✅ Using College: ${college.name} (${collegeId})\n`);

    // Get test class
    const testClass = await prisma.sclass.findFirst({
      where: { collegeId }
    });

    // Get all users
    const users = await prisma.user.findMany({
      where: {
        collegeId: null, // Only migrate users without college
      }
    });

    console.log(`Found ${users.length} users to migrate\n`);

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        console.log(`Processing: ${user.name} (${user.email}) - ${user.role}`);

        // Skip SuperAdmins
        if (user.role === 'SuperAdmin') {
          // Check if already in SuperAdmin table
          const existing = await prisma.superAdmin.findUnique({
            where: { email: user.email }
          });

          if (!existing) {
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
          } else {
            console.log(`  ⏭️  Already in SuperAdmin table`);
            skipped++;
          }
          console.log('');
          continue;
        }

        // Update user with collegeId
        await prisma.user.update({
          where: { id: user.id },
          data: { collegeId: collegeId }
        });

        // Create role-specific record
        switch (user.role) {
          case 'Student':
            const existingStudent = await prisma.student.findUnique({
              where: { userId: user.id }
            });

            if (!existingStudent) {
              await prisma.student.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                  studentId: `STU${Date.now()}${Math.floor(Math.random() * 1000)}`,
                  userId: user.id,
                  collegeId: collegeId,
                  sclassId: testClass?.id || null,
                },
              });
              console.log(`  ✅ Created in Student table`);
              migrated++;
            } else {
              console.log(`  ⏭️  Already in Student table`);
              skipped++;
            }
            break;

          case 'Teacher':
            const existingTeacher = await prisma.teacher.findUnique({
              where: { userId: user.id }
            });

            if (!existingTeacher) {
              await prisma.teacher.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                  userId: user.id,
                  collegeId: collegeId,
                },
              });
              console.log(`  ✅ Created in Teacher table`);
              migrated++;
            } else {
              console.log(`  ⏭️  Already in Teacher table`);
              skipped++;
            }
            break;

          case 'Parent':
            const existingParent = await prisma.parent.findUnique({
              where: { userId: user.id }
            });

            if (!existingParent) {
              await prisma.parent.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                  userId: user.id,
                  collegeId: collegeId,
                },
              });
              console.log(`  ✅ Created in Parent table`);
              migrated++;
            } else {
              console.log(`  ⏭️  Already in Parent table`);
              skipped++;
            }
            break;

          case 'Admin':
            const existingAdmin = await prisma.admin.findUnique({
              where: { userId: user.id }
            });

            if (!existingAdmin) {
              await prisma.admin.create({
                data: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  password: user.password,
                  userId: user.id,
                  collegeId: collegeId,
                },
              });
              console.log(`  ✅ Created in Admin table`);
              migrated++;
            } else {
              console.log(`  ⏭️  Already in Admin table`);
              skipped++;
            }
            break;

          default:
            console.log(`  ⚠️  Unknown role: ${user.role}`);
            skipped++;
        }

        console.log('');
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('\n📊 MIGRATION SUMMARY:\n');
    console.log(`  Total users processed: ${users.length}`);
    console.log(`  ✅ Migrated: ${migrated}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);

    // Show final counts
    console.log('\n📈 FINAL TABLE COUNTS:\n');
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
    console.log('🎯 Now all users are properly organized in role-specific tables!\n');

  } catch (error) {
    console.error('\n❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateAllUsers();

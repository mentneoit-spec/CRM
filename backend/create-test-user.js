const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
    console.log('🔧 Creating Test Users for Login Testing\n');
    console.log('='.repeat(60));

    try {
        await prisma.$connect();
        console.log('✅ Database connected\n');

        // Create a test college first
        console.log('📝 Creating Test College...');
        let college = await prisma.college.findFirst({
            where: { email: 'testcollege@example.com' },
        });

        if (!college) {
            college = await prisma.college.create({
                data: {
                    name: 'Test College',
                    email: 'testcollege@example.com',
                    phone: '+919876543210',
                    status: 'active',
                    city: 'Test City',
                    state: 'Test State',
                    country: 'India',
                },
            });
            console.log('✅ Test College created');
        } else {
            console.log('✅ Test College already exists');
        }
        console.log('   College ID:', college.id);
        console.log('   College Name:', college.name);
        console.log('');

        // Create a test class
        console.log('📝 Creating Test Class...');
        let sclass = await prisma.sclass.findFirst({
            where: { 
                collegeId: college.id,
                sclassCode: 'TEST10A',
            },
        });

        if (!sclass) {
            sclass = await prisma.sclass.create({
                data: {
                    sclassName: 'Class 10A',
                    sclassCode: 'TEST10A',
                    academicYear: '2024-2025',
                    collegeId: college.id,
                },
            });
            console.log('✅ Test Class created');
        } else {
            console.log('✅ Test Class already exists');
        }
        console.log('');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Test users to create
        const testUsers = [
            {
                role: 'Student',
                name: 'Test Student',
                email: 'student@test.com',
                phone: '+919876543211',
                password: hashedPassword,
                collegeId: college.id,
                profileType: 'student',
                studentData: {
                    studentId: 'STU001',
                    sclassId: sclass.id,
                },
            },
            {
                role: 'Teacher',
                name: 'Test Teacher',
                email: 'teacher@test.com',
                phone: '+919876543212',
                password: hashedPassword,
                collegeId: college.id,
                profileType: 'teacher',
                teacherData: {
                    qualification: 'M.Sc',
                    experience: 5,
                },
            },
            {
                role: 'Parent',
                name: 'Test Parent',
                email: 'parent@test.com',
                phone: '+919876543213',
                password: hashedPassword,
                collegeId: college.id,
                profileType: 'parent',
                parentData: {
                    relation: 'Father',
                    occupation: 'Engineer',
                },
            },
            {
                role: 'Admin',
                name: 'Test Admin',
                email: 'admin@test.com',
                phone: '+919876543214',
                password: hashedPassword,
                collegeId: college.id,
                profileType: 'admin',
                adminData: {
                    designation: 'Principal',
                },
            },
        ];

        console.log('─'.repeat(60));
        console.log('Creating Test Users...\n');

        for (const userData of testUsers) {
            try {
                // Check if user already exists
                let user = await prisma.user.findFirst({
                    where: { 
                        email: userData.email,
                        collegeId: userData.collegeId,
                    },
                });

                if (user) {
                    console.log(`⚠️  ${userData.role} user already exists: ${userData.email}`);
                    continue;
                }

                // Create user
                user = await prisma.user.create({
                    data: {
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        password: userData.password,
                        role: userData.role,
                        collegeId: userData.collegeId,
                        isActive: true,
                        isEmailVerified: true,
                    },
                });

                console.log(`✅ ${userData.role} user created: ${userData.email}`);

                // Create role-specific profile
                if (userData.profileType === 'student') {
                    await prisma.student.create({
                        data: {
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone,
                            password: userData.password,
                            studentId: userData.studentData.studentId,
                            collegeId: userData.collegeId,
                            sclassId: userData.studentData.sclassId,
                            userId: user.id,
                            admissionYear: 2024,
                        },
                    });
                    console.log(`   ✅ Student profile created`);
                } else if (userData.profileType === 'teacher') {
                    await prisma.teacher.create({
                        data: {
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone,
                            password: userData.password,
                            qualification: userData.teacherData.qualification,
                            experience: userData.teacherData.experience,
                            collegeId: userData.collegeId,
                            userId: user.id,
                        },
                    });
                    console.log(`   ✅ Teacher profile created`);
                } else if (userData.profileType === 'parent') {
                    await prisma.parent.create({
                        data: {
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone,
                            password: userData.password,
                            relation: userData.parentData.relation,
                            occupation: userData.parentData.occupation,
                            collegeId: userData.collegeId,
                            userId: user.id,
                        },
                    });
                    console.log(`   ✅ Parent profile created`);
                } else if (userData.profileType === 'admin') {
                    await prisma.admin.create({
                        data: {
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone,
                            password: userData.password,
                            designation: userData.adminData.designation,
                            collegeId: userData.collegeId,
                            userId: user.id,
                        },
                    });
                    console.log(`   ✅ Admin profile created`);
                }

                console.log('');
            } catch (error) {
                console.error(`❌ Error creating ${userData.role}:`, error.message);
                console.log('');
            }
        }

        // Create SuperAdmin (no college)
        console.log('─'.repeat(60));
        console.log('Creating SuperAdmin...\n');
        
        let superAdmin = await prisma.superAdmin.findFirst({
            where: { email: 'superadmin@test.com' },
        });

        if (!superAdmin) {
            superAdmin = await prisma.superAdmin.create({
                data: {
                    name: 'Super Admin',
                    email: 'superadmin@test.com',
                    phone: '+919876543215',
                    password: hashedPassword,
                    role: 'SuperAdmin',
                    isActive: true,
                    twoFAEnabled: false,
                },
            });
            console.log('✅ SuperAdmin created: superadmin@test.com');
        } else {
            console.log('⚠️  SuperAdmin already exists: superadmin@test.com');
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Test Users Created Successfully!\n');
        console.log('You can now login with these credentials:\n');
        console.log('─'.repeat(60));
        console.log('STUDENT:');
        console.log('  Email: student@test.com');
        console.log('  Password: password123');
        console.log('  Role: Student\n');
        
        console.log('TEACHER:');
        console.log('  Email: teacher@test.com');
        console.log('  Password: password123');
        console.log('  Role: Teacher\n');
        
        console.log('PARENT:');
        console.log('  Email: parent@test.com');
        console.log('  Password: password123');
        console.log('  Role: Parent\n');
        
        console.log('ADMIN:');
        console.log('  Email: admin@test.com');
        console.log('  Password: password123');
        console.log('  Role: Admin\n');
        
        console.log('SUPER ADMIN:');
        console.log('  Email: superadmin@test.com');
        console.log('  Password: password123');
        console.log('  Role: SuperAdmin\n');
        
        console.log('─'.repeat(60));
        console.log('College ID:', college.id);
        console.log('College Name:', college.name);
        console.log('─'.repeat(60));
        console.log('\n💡 Go to http://localhost:3000/login and try logging in!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Error details:', error.message);
    } finally {
        await prisma.$disconnect();
        console.log('✅ Database disconnected\n');
    }
}

createTestUsers();

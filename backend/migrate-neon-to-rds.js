const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Configuration
const NEON_DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_HelXW2BJo9Kj@ep-steep-flower-ad8g8g9h-pooler.c-2.us-east-1.aws.neon.tech/Crm?sslmode=require";

// You need to provide your AWS RDS connection string
const RDS_DATABASE_URL = process.env.RDS_DATABASE_URL || "postgresql://username:password@your-rds-endpoint:5432/database_name";

// Create Prisma clients
const neonPrisma = new PrismaClient({
    datasources: {
        db: {
            url: NEON_DATABASE_URL
        }
    }
});

const rdsPrisma = new PrismaClient({
    datasources: {
        db: {
            url: RDS_DATABASE_URL
        }
    }
});

async function exportDataFromNeon() {
    console.log('🔄 Exporting data from Neon database...\n');
    
    try {
        // Export all tables in the correct order (respecting foreign key constraints)
        const exportData = {};

        // 1. Colleges (no dependencies)
        console.log('📊 Exporting colleges...');
        exportData.colleges = await neonPrisma.college.findMany();
        console.log(`   ✅ ${exportData.colleges.length} colleges exported`);

        // 2. College Domains
        console.log('📊 Exporting college domains...');
        exportData.collegeDomains = await neonPrisma.collegeDomain.findMany();
        console.log(`   ✅ ${exportData.collegeDomains.length} college domains exported`);

        // 3. Users
        console.log('📊 Exporting users...');
        exportData.users = await neonPrisma.user.findMany();
        console.log(`   ✅ ${exportData.users.length} users exported`);

        // 4. Admins
        console.log('📊 Exporting admins...');
        exportData.admins = await neonPrisma.admin.findMany();
        console.log(`   ✅ ${exportData.admins.length} admins exported`);

        // 5. Classes
        console.log('📊 Exporting classes...');
        exportData.classes = await neonPrisma.sclass.findMany();
        console.log(`   ✅ ${exportData.classes.length} classes exported`);

        // 6. Sections
        console.log('📊 Exporting sections...');
        exportData.sections = await neonPrisma.section.findMany();
        console.log(`   ✅ ${exportData.sections.length} sections exported`);

        // 7. Teachers
        console.log('📊 Exporting teachers...');
        exportData.teachers = await neonPrisma.teacher.findMany();
        console.log(`   ✅ ${exportData.teachers.length} teachers exported`);

        // 8. Subjects
        console.log('📊 Exporting subjects...');
        exportData.subjects = await neonPrisma.subject.findMany();
        console.log(`   ✅ ${exportData.subjects.length} subjects exported`);

        // 9. Students
        console.log('📊 Exporting students...');
        exportData.students = await neonPrisma.student.findMany();
        console.log(`   ✅ ${exportData.students.length} students exported`);

        // 10. Parents
        console.log('📊 Exporting parents...');
        exportData.parents = await neonPrisma.parent.findMany();
        console.log(`   ✅ ${exportData.parents.length} parents exported`);

        // 11. Admissions
        console.log('📊 Exporting admissions...');
        exportData.admissions = await neonPrisma.admission.findMany();
        console.log(`   ✅ ${exportData.admissions.length} admissions exported`);

        // 12. Admission Team
        console.log('📊 Exporting admission team...');
        exportData.admissionTeam = await neonPrisma.admissionTeam.findMany();
        console.log(`   ✅ ${exportData.admissionTeam.length} admission team members exported`);

        // 13. Exams
        console.log('📊 Exporting exams...');
        exportData.exams = await neonPrisma.exam.findMany();
        console.log(`   ✅ ${exportData.exams.length} exams exported`);

        // 14. Exam Results
        console.log('📊 Exporting exam results...');
        exportData.examResults = await neonPrisma.examResult.findMany();
        console.log(`   ✅ ${exportData.examResults.length} exam results exported`);

        // 15. Fees
        console.log('📊 Exporting fees...');
        exportData.fees = await neonPrisma.fee.findMany();
        console.log(`   ✅ ${exportData.fees.length} fees exported`);

        // 16. Payments
        console.log('📊 Exporting payments...');
        exportData.payments = await neonPrisma.payment.findMany();
        console.log(`   ✅ ${exportData.payments.length} payments exported`);

        // 17. Notices
        console.log('📊 Exporting notices...');
        exportData.notices = await neonPrisma.notice.findMany();
        console.log(`   ✅ ${exportData.notices.length} notices exported`);

        // 18. Complaints
        console.log('📊 Exporting complaints...');
        exportData.complaints = await neonPrisma.complain.findMany();
        console.log(`   ✅ ${exportData.complaints.length} complaints exported`);

        // Save to file
        const exportPath = path.join(__dirname, 'neon-export.json');
        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        console.log(`\n💾 Data exported to: ${exportPath}`);

        return exportData;

    } catch (error) {
        console.error('❌ Error exporting data:', error);
        throw error;
    }
}

async function importDataToRDS(exportData) {
    console.log('\n🔄 Importing data to AWS RDS...\n');

    try {
        // Import in the correct order (respecting foreign key constraints)

        // 1. Colleges
        if (exportData.colleges.length > 0) {
            console.log('📥 Importing colleges...');
            for (const college of exportData.colleges) {
                await rdsPrisma.college.upsert({
                    where: { id: college.id },
                    update: college,
                    create: college
                });
            }
            console.log(`   ✅ ${exportData.colleges.length} colleges imported`);
        }

        // 2. College Domains
        if (exportData.collegeDomains.length > 0) {
            console.log('📥 Importing college domains...');
            for (const domain of exportData.collegeDomains) {
                await rdsPrisma.collegeDomain.upsert({
                    where: { id: domain.id },
                    update: domain,
                    create: domain
                });
            }
            console.log(`   ✅ ${exportData.collegeDomains.length} college domains imported`);
        }

        // 3. Users
        if (exportData.users.length > 0) {
            console.log('📥 Importing users...');
            for (const user of exportData.users) {
                await rdsPrisma.user.upsert({
                    where: { id: user.id },
                    update: user,
                    create: user
                });
            }
            console.log(`   ✅ ${exportData.users.length} users imported`);
        }

        // 4. Admins
        if (exportData.admins.length > 0) {
            console.log('📥 Importing admins...');
            for (const admin of exportData.admins) {
                await rdsPrisma.admin.upsert({
                    where: { id: admin.id },
                    update: admin,
                    create: admin
                });
            }
            console.log(`   ✅ ${exportData.admins.length} admins imported`);
        }

        // 5. Classes
        if (exportData.classes.length > 0) {
            console.log('📥 Importing classes...');
            for (const sclass of exportData.classes) {
                await rdsPrisma.sclass.upsert({
                    where: { id: sclass.id },
                    update: sclass,
                    create: sclass
                });
            }
            console.log(`   ✅ ${exportData.classes.length} classes imported`);
        }

        // 6. Sections
        if (exportData.sections.length > 0) {
            console.log('📥 Importing sections...');
            for (const section of exportData.sections) {
                await rdsPrisma.section.upsert({
                    where: { id: section.id },
                    update: section,
                    create: section
                });
            }
            console.log(`   ✅ ${exportData.sections.length} sections imported`);
        }

        // 7. Teachers
        if (exportData.teachers.length > 0) {
            console.log('📥 Importing teachers...');
            for (const teacher of exportData.teachers) {
                await rdsPrisma.teacher.upsert({
                    where: { id: teacher.id },
                    update: teacher,
                    create: teacher
                });
            }
            console.log(`   ✅ ${exportData.teachers.length} teachers imported`);
        }

        // 8. Subjects
        if (exportData.subjects.length > 0) {
            console.log('📥 Importing subjects...');
            for (const subject of exportData.subjects) {
                await rdsPrisma.subject.upsert({
                    where: { id: subject.id },
                    update: subject,
                    create: subject
                });
            }
            console.log(`   ✅ ${exportData.subjects.length} subjects imported`);
        }

        // 9. Parents
        if (exportData.parents.length > 0) {
            console.log('📥 Importing parents...');
            for (const parent of exportData.parents) {
                await rdsPrisma.parent.upsert({
                    where: { id: parent.id },
                    update: parent,
                    create: parent
                });
            }
            console.log(`   ✅ ${exportData.parents.length} parents imported`);
        }

        // 10. Students
        if (exportData.students.length > 0) {
            console.log('📥 Importing students...');
            for (const student of exportData.students) {
                await rdsPrisma.student.upsert({
                    where: { id: student.id },
                    update: student,
                    create: student
                });
            }
            console.log(`   ✅ ${exportData.students.length} students imported`);
        }

        // 11. Admissions
        if (exportData.admissions.length > 0) {
            console.log('📥 Importing admissions...');
            for (const admission of exportData.admissions) {
                await rdsPrisma.admission.upsert({
                    where: { id: admission.id },
                    update: admission,
                    create: admission
                });
            }
            console.log(`   ✅ ${exportData.admissions.length} admissions imported`);
        }

        // 12. Admission Team
        if (exportData.admissionTeam.length > 0) {
            console.log('📥 Importing admission team...');
            for (const member of exportData.admissionTeam) {
                await rdsPrisma.admissionTeam.upsert({
                    where: { id: member.id },
                    update: member,
                    create: member
                });
            }
            console.log(`   ✅ ${exportData.admissionTeam.length} admission team members imported`);
        }

        // 13. Exams
        if (exportData.exams.length > 0) {
            console.log('📥 Importing exams...');
            for (const exam of exportData.exams) {
                await rdsPrisma.exam.upsert({
                    where: { id: exam.id },
                    update: exam,
                    create: exam
                });
            }
            console.log(`   ✅ ${exportData.exams.length} exams imported`);
        }

        // 14. Exam Results
        if (exportData.examResults.length > 0) {
            console.log('📥 Importing exam results...');
            for (const result of exportData.examResults) {
                await rdsPrisma.examResult.upsert({
                    where: { id: result.id },
                    update: result,
                    create: result
                });
            }
            console.log(`   ✅ ${exportData.examResults.length} exam results imported`);
        }

        // 15. Fees
        if (exportData.fees.length > 0) {
            console.log('📥 Importing fees...');
            for (const fee of exportData.fees) {
                await rdsPrisma.fee.upsert({
                    where: { id: fee.id },
                    update: fee,
                    create: fee
                });
            }
            console.log(`   ✅ ${exportData.fees.length} fees imported`);
        }

        // 16. Payments
        if (exportData.payments.length > 0) {
            console.log('📥 Importing payments...');
            for (const payment of exportData.payments) {
                await rdsPrisma.payment.upsert({
                    where: { id: payment.id },
                    update: payment,
                    create: payment
                });
            }
            console.log(`   ✅ ${exportData.payments.length} payments imported`);
        }

        // 17. Notices
        if (exportData.notices.length > 0) {
            console.log('📥 Importing notices...');
            for (const notice of exportData.notices) {
                await rdsPrisma.notice.upsert({
                    where: { id: notice.id },
                    update: notice,
                    create: notice
                });
            }
            console.log(`   ✅ ${exportData.notices.length} notices imported`);
        }

        // 18. Complaints
        if (exportData.complaints.length > 0) {
            console.log('📥 Importing complaints...');
            for (const complaint of exportData.complaints) {
                await rdsPrisma.complain.upsert({
                    where: { id: complaint.id },
                    update: complaint,
                    create: complaint
                });
            }
            console.log(`   ✅ ${exportData.complaints.length} complaints imported`);
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error importing data:', error);
        throw error;
    }
}

async function migrateDatabase() {
    console.log('🚀 Starting database migration from Neon to AWS RDS...\n');
    
    try {
        // Step 1: Export data from Neon
        const exportData = await exportDataFromNeon();
        
        // Step 2: Import data to RDS
        await importDataToRDS(exportData);
        
        console.log('\n✅ Database migration completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   • Colleges: ${exportData.colleges.length}`);
        console.log(`   • Users: ${exportData.users.length}`);
        console.log(`   • Admins: ${exportData.admins.length}`);
        console.log(`   • Students: ${exportData.students.length}`);
        console.log(`   • Teachers: ${exportData.teachers.length}`);
        console.log(`   • Classes: ${exportData.classes.length}`);
        console.log(`   • Sections: ${exportData.sections.length}`);
        console.log(`   • Subjects: ${exportData.subjects.length}`);
        console.log(`   • Parents: ${exportData.parents.length}`);
        console.log(`   • Exams: ${exportData.exams.length}`);
        console.log(`   • Exam Results: ${exportData.examResults.length}`);
        console.log(`   • Fees: ${exportData.fees.length}`);
        console.log(`   • Payments: ${exportData.payments.length}`);
        console.log(`   • Admissions: ${exportData.admissions.length}`);
        console.log(`   • Notices: ${exportData.notices.length}`);
        console.log(`   • Complaints: ${exportData.complaints.length}`);
        
    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    } finally {
        await neonPrisma.$disconnect();
        await rdsPrisma.$disconnect();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateDatabase();
}

module.exports = { migrateDatabase, exportDataFromNeon, importDataToRDS };
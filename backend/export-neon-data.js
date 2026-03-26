const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Use current DATABASE_URL (Neon)
const prisma = new PrismaClient();

async function exportNeonData() {
    console.log('🔄 Exporting data from Neon database...\n');
    
    try {
        await prisma.$connect();
        console.log('✅ Connected to Neon database\n');

        const exportData = {};

        // Export all tables
        console.log('📊 Exporting colleges...');
        exportData.colleges = await prisma.college.findMany();
        console.log(`   ✅ ${exportData.colleges.length} colleges exported`);

        console.log('📊 Exporting college domains...');
        exportData.collegeDomains = await prisma.collegeDomain.findMany();
        console.log(`   ✅ ${exportData.collegeDomains.length} college domains exported`);

        console.log('📊 Exporting users...');
        exportData.users = await prisma.user.findMany();
        console.log(`   ✅ ${exportData.users.length} users exported`);

        console.log('📊 Exporting admins...');
        exportData.admins = await prisma.admin.findMany();
        console.log(`   ✅ ${exportData.admins.length} admins exported`);

        console.log('📊 Exporting classes...');
        exportData.classes = await prisma.sclass.findMany();
        console.log(`   ✅ ${exportData.classes.length} classes exported`);

        console.log('📊 Exporting sections...');
        exportData.sections = await prisma.section.findMany();
        console.log(`   ✅ ${exportData.sections.length} sections exported`);

        console.log('📊 Exporting teachers...');
        exportData.teachers = await prisma.teacher.findMany();
        console.log(`   ✅ ${exportData.teachers.length} teachers exported`);

        console.log('📊 Exporting subjects...');
        exportData.subjects = await prisma.subject.findMany();
        console.log(`   ✅ ${exportData.subjects.length} subjects exported`);

        console.log('📊 Exporting students...');
        exportData.students = await prisma.student.findMany();
        console.log(`   ✅ ${exportData.students.length} students exported`);

        console.log('📊 Exporting parents...');
        exportData.parents = await prisma.parent.findMany();
        console.log(`   ✅ ${exportData.parents.length} parents exported`);

        console.log('📊 Exporting admissions...');
        exportData.admissions = await prisma.admission.findMany();
        console.log(`   ✅ ${exportData.admissions.length} admissions exported`);

        console.log('📊 Exporting admission team...');
        exportData.admissionTeam = await prisma.admissionTeam.findMany();
        console.log(`   ✅ ${exportData.admissionTeam.length} admission team members exported`);

        console.log('📊 Exporting exams...');
        exportData.exams = await prisma.exam.findMany();
        console.log(`   ✅ ${exportData.exams.length} exams exported`);

        console.log('📊 Exporting exam results...');
        exportData.examResults = await prisma.examResult.findMany();
        console.log(`   ✅ ${exportData.examResults.length} exam results exported`);

        console.log('📊 Exporting fees...');
        exportData.fees = await prisma.fee.findMany();
        console.log(`   ✅ ${exportData.fees.length} fees exported`);

        console.log('📊 Exporting payments...');
        exportData.payments = await prisma.payment.findMany();
        console.log(`   ✅ ${exportData.payments.length} payments exported`);

        console.log('📊 Exporting notices...');
        exportData.notices = await prisma.notice.findMany();
        console.log(`   ✅ ${exportData.notices.length} notices exported`);

        console.log('📊 Exporting complaints...');
        exportData.complaints = await prisma.complain.findMany();
        console.log(`   ✅ ${exportData.complaints.length} complaints exported`);

        // Save to file
        const exportPath = path.join(__dirname, 'neon-export.json');
        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        console.log(`\n💾 Data exported to: ${exportPath}`);

        // Show summary
        const totalRecords = Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`\n📈 Total Records Exported: ${totalRecords}`);
        
        console.log('\n📋 Export Summary:');
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

        console.log('\n✅ Export completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('1. Fix RDS connection issues');
        console.log('2. Run: node import-to-rds.js');
        console.log('3. Update DATABASE_URL to RDS in .env');

        return exportData;

    } catch (error) {
        console.error('❌ Error exporting data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

exportNeonData();
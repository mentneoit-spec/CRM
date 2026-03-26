const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_HelXW2BJo9Kj@ep-steep-flower-ad8g8g9h-pooler.c-2.us-east-1.aws.neon.tech/Crm?sslmode=require"
        }
    }
});

async function checkNeonData() {
    console.log('🔍 Checking Neon Database Data...\n');
    
    try {
        // Test connection first
        await prisma.$connect();
        console.log('✅ Connected to Neon database\n');

        // Check all tables with error handling
        let colleges = 0, users = 0, students = 0, teachers = 0, subjects = 0, classes = 0;
        let exams = 0, examResults = 0, fees = 0, payments = 0, admissions = 0, notices = 0, complaints = 0;

        try { colleges = await prisma.college.count(); } catch (e) { console.log('⚠️ College table not accessible'); }
        try { users = await prisma.user.count(); } catch (e) { console.log('⚠️ User table not accessible'); }
        try { students = await prisma.student.count(); } catch (e) { console.log('⚠️ Student table not accessible'); }
        try { teachers = await prisma.teacher.count(); } catch (e) { console.log('⚠️ Teacher table not accessible'); }
        try { subjects = await prisma.subject.count(); } catch (e) { console.log('⚠️ Subject table not accessible'); }
        try { classes = await prisma.sclass.count(); } catch (e) { console.log('⚠️ Class table not accessible'); }
        try { exams = await prisma.exam.count(); } catch (e) { console.log('⚠️ Exam table not accessible'); }
        try { examResults = await prisma.examResult.count(); } catch (e) { console.log('⚠️ ExamResult table not accessible'); }
        try { fees = await prisma.fee.count(); } catch (e) { console.log('⚠️ Fee table not accessible'); }
        try { payments = await prisma.payment.count(); } catch (e) { console.log('⚠️ Payment table not accessible'); }
        try { admissions = await prisma.admission.count(); } catch (e) { console.log('⚠️ Admission table not accessible'); }
        try { notices = await prisma.notice.count(); } catch (e) { console.log('⚠️ Notice table not accessible'); }
        try { complaints = await prisma.complaint.count(); } catch (e) { console.log('⚠️ Complaint table not accessible'); }

        console.log('📊 Data Summary:');
        console.log(`   • Colleges: ${colleges}`);
        console.log(`   • Users: ${users}`);
        console.log(`   • Students: ${students}`);
        console.log(`   • Teachers: ${teachers}`);
        console.log(`   • Classes: ${classes}`);
        console.log(`   • Subjects: ${subjects}`);
        console.log(`   • Exams: ${exams}`);
        console.log(`   • Exam Results: ${examResults}`);
        console.log(`   • Fees: ${fees}`);
        console.log(`   • Payments: ${payments}`);
        console.log(`   • Admissions: ${admissions}`);
        console.log(`   • Notices: ${notices}`);
        console.log(`   • Complaints: ${complaints}`);

        console.log(`\n📈 Total Records: ${colleges + users + students + teachers + subjects + classes + exams + examResults + fees + payments + admissions + notices + complaints}`);

        // Show sample data
        if (students > 0) {
            console.log('\n👥 Sample Students:');
            const sampleStudents = await prisma.student.findMany({
                take: 3,
                include: {
                    sclass: true
                }
            });
            sampleStudents.forEach(student => {
                console.log(`   • ${student.name} (${student.rollNum}) - Class: ${student.sclass?.sclassName || 'N/A'}`);
            });
        }

        if (subjects > 0) {
            console.log('\n📚 Sample Subjects:');
            const sampleSubjects = await prisma.subject.findMany({
                take: 5,
                include: {
                    sclass: true
                }
            });
            sampleSubjects.forEach(subject => {
                console.log(`   • ${subject.subName} (Max Marks: ${subject.maxMarks}) - Class: ${subject.sclass?.sclassName || 'N/A'}`);
            });
        }

        if (examResults > 0) {
            console.log('\n📝 Sample Exam Results:');
            const sampleResults = await prisma.examResult.findMany({
                take: 3,
                include: {
                    student: true,
                    subject: true,
                    exam: true
                }
            });
            sampleResults.forEach(result => {
                console.log(`   • ${result.student?.name || 'N/A'} - ${result.subject?.subName || 'N/A'}: ${result.marksObtained}/${result.subject?.maxMarks || 'N/A'}`);
            });
        }

    } catch (error) {
        console.error('❌ Error checking data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkNeonData();
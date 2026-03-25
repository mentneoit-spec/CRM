const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmissions() {
    try {
        console.log('Checking admissions in database...\n');

        const admissions = await prisma.admission.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                admissionTeam: true,
            }
        });

        console.log(`Total admissions found: ${admissions.length}\n`);

        if (admissions.length > 0) {
            console.log('Sample admissions:');
            admissions.forEach((admission, index) => {
                console.log(`\n${index + 1}. ${admission.applicantName}`);
                console.log(`   ID: ${admission.id}`);
                console.log(`   Email: ${admission.applicantEmail}`);
                console.log(`   Phone: ${admission.applicantPhone}`);
                console.log(`   Status: ${admission.status}`);
                console.log(`   Applied For: ${admission.appliedFor}`);
                console.log(`   College ID: ${admission.collegeId}`);
                console.log(`   Created: ${admission.createdAt}`);
            });
        } else {
            console.log('No admissions found in database.');
            console.log('\nTo add test admissions, you can:');
            console.log('1. Use the CSV import feature in the admin panel');
            console.log('2. Create admissions through the admission form');
        }

        // Check total count
        const totalCount = await prisma.admission.count();
        console.log(`\n\nTotal admission records in database: ${totalCount}`);

        // Check by status
        const pending = await prisma.admission.count({ where: { status: 'pending' } });
        const approved = await prisma.admission.count({ where: { status: 'approved' } });
        const rejected = await prisma.admission.count({ where: { status: 'rejected' } });

        console.log(`\nBy Status:`);
        console.log(`  Pending: ${pending}`);
        console.log(`  Approved: ${approved}`);
        console.log(`  Rejected: ${rejected}`);

    } catch (error) {
        console.error('Error checking admissions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmissions();

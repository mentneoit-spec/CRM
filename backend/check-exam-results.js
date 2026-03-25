const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExamResults() {
    try {
        console.log('Checking exam results structure...\n');

        // Get college
        const college = await prisma.college.findFirst();
        if (!college) {
            console.log('No college found');
            return;
        }
        console.log(`College: ${college.name} (${college.id})\n`);

        // Get subjects
        const subjects = await prisma.subject.findMany({
            where: { collegeId: college.id },
            select: { id: true, subName: true, subCode: true }
        });
        console.log(`Total subjects: ${subjects.length}`);
        subjects.forEach(s => console.log(`  - ${s.subName} (${s.subCode}) - ID: ${s.id}`));

        // Get exams
        const exams = await prisma.exam.findMany({
            where: { collegeId: college.id },
            select: { id: true, examName: true }
        });
        console.log(`\nTotal exams: ${exams.length}`);
        exams.forEach(e => console.log(`  - ${e.examName} - ID: ${e.id}`));

        // Get exam results
        const examResults = await prisma.examResult.findMany({
            where: {
                exam: { collegeId: college.id }
            },
            select: {
                id: true,
                subjectId: true,
                marksObtained: true,
                percentage: true,
                exam: { select: { examName: true } },
                subject: { select: { subName: true, maxMarks: true } },
                student: { select: { name: true } }
            },
            take: 10
        });

        console.log(`\nTotal exam results: ${examResults.length}`);
        if (examResults.length > 0) {
            console.log('\nSample exam results:');
            examResults.forEach((result, index) => {
                console.log(`\n${index + 1}. Student: ${result.student?.name || 'N/A'}`);
                console.log(`   Exam: ${result.exam?.examName || 'N/A'}`);
                console.log(`   Subject: ${result.subject?.subName || 'N/A'}`);
                console.log(`   Subject ID: ${result.subjectId}`);
                console.log(`   Marks: ${result.marksObtained}/${result.subject?.maxMarks || 100}`);
                console.log(`   Percentage: ${result.percentage}%`);
            });
        }

        // Check if subjectId is null
        const resultsWithoutSubject = await prisma.examResult.count({
            where: {
                exam: { collegeId: college.id },
                subjectId: null
            }
        });
        console.log(`\n\nResults without subjectId: ${resultsWithoutSubject}`);

        // Group by subject
        const resultsBySubject = await prisma.examResult.groupBy({
            by: ['subjectId'],
            where: {
                exam: { collegeId: college.id },
                subjectId: { not: null },
                isAbsent: false
            },
            _count: { _all: true },
            _sum: {
                marksObtained: true
            },
            _avg: {
                percentage: true
            }
        });

        console.log('\n\nResults grouped by subject:');
        for (const group of resultsBySubject) {
            const subject = subjects.find(s => s.id === group.subjectId);
            const avgPercentage = group._avg.percentage 
                ? Math.round(group._avg.percentage)
                : 0;
            console.log(`\n${subject?.subName || 'Unknown'} (${group.subjectId})`);
            console.log(`  Count: ${group._count._all}`);
            console.log(`  Total Marks Obtained: ${group._sum.marksObtained}`);
            console.log(`  Average Percentage: ${avgPercentage}%`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkExamResults();

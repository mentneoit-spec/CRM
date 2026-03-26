const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSubjects() {
    try {
        console.log('Checking subjects in database...\n');

        const college = await prisma.college.findFirst();
        if (!college) {
            console.log('No college found');
            return;
        }

        console.log(`College: ${college.name}\n`);

        // Get all subjects
        const subjects = await prisma.subject.findMany({
            where: { collegeId: college.id },
            select: { 
                id: true, 
                subName: true, 
                subCode: true,
                sclass: { select: { sclassName: true } }
            },
            orderBy: { subName: 'asc' }
        });

        console.log(`Total subjects in database: ${subjects.length}\n`);

        // Group by subject name
        const subjectsByName = new Map();
        subjects.forEach(subject => {
            const name = subject.subName;
            if (!subjectsByName.has(name)) {
                subjectsByName.set(name, []);
            }
            subjectsByName.get(name).push(subject);
        });

        console.log('Subjects grouped by name:');
        subjectsByName.forEach((subjectList, name) => {
            console.log(`\n${name}: ${subjectList.length} entries`);
            subjectList.forEach(s => {
                console.log(`  - ID: ${s.id}, Code: ${s.subCode}, Class: ${s.sclass?.sclassName || 'N/A'}`);
            });
        });

        console.log(`\nUnique subject names: ${subjectsByName.size}`);
        console.log('Names:', Array.from(subjectsByName.keys()));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSubjects();
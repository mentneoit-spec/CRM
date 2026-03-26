const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDashboardData() {
    try {
        console.log('Testing dashboard subject performance data...\n');

        const college = await prisma.college.findFirst();
        if (!college) {
            console.log('No college found');
            return;
        }

        const collegeId = college.id;
        console.log(`College: ${college.name}\n`);

        // Get all subjects for the college
        const subjects = await prisma.subject.findMany({
            where: { collegeId },
            select: { id: true, subName: true, maxMarks: true },
        });

        console.log(`Subjects found: ${subjects.length}`);
        subjects.forEach(s => console.log(`  - ${s.subName} (maxMarks: ${s.maxMarks})`));

        // Get all exam results with marks
        const examResults = await prisma.examResult.findMany({
            where: { 
                exam: { collegeId },
                isAbsent: false,
            },
            select: {
                subjectId: true,
                marksObtained: true,
                percentage: true,
                subject: {
                    select: { 
                        maxMarks: true,
                        subName: true 
                    }
                }
            },
        });

        console.log(`\nExam results found: ${examResults.length}`);

        // Calculate subject performance grouped by subject NAME (not ID)
        const subjectPerformanceByName = new Map();
        
        for (const result of examResults) {
            if (!result.subjectId || result.marksObtained == null) continue;
            
            const subjectName = result.subject?.subName;
            if (!subjectName) continue;
            
            if (!subjectPerformanceByName.has(subjectName)) {
                subjectPerformanceByName.set(subjectName, {
                    totalMarks: 0,
                    obtainedMarks: 0,
                    count: 0,
                });
            }
            
            const data = subjectPerformanceByName.get(subjectName);
            const maxMarks = result.subject?.maxMarks || 100;
            data.totalMarks += maxMarks;
            data.obtainedMarks += Number(result.marksObtained);
            data.count += 1;
        }

        console.log('\nSubject Performance Calculation (Grouped by Name):');
        
        // Get unique subject names
        const uniqueSubjectNames = new Set(subjects.map(s => s.subName));
        console.log(`Unique subject names: ${uniqueSubjectNames.size}`);
        uniqueSubjectNames.forEach(name => console.log(`  - ${name}`));

        // Format subject performance with actual data (unique subjects only)
        const subjectPerformance = Array.from(uniqueSubjectNames).map((subjectName) => {
            const perfData = subjectPerformanceByName.get(subjectName);
            
            if (!perfData || perfData.count === 0) {
                return null;
            }

            const percentage = Math.round((perfData.obtainedMarks / perfData.totalMarks) * 100);
            
            // Assign colors based on performance
            let color = '#667eea';
            if (percentage >= 80) color = '#43e97b';
            else if (percentage >= 70) color = '#4facfe';
            else if (percentage >= 60) color = '#feca57';
            else if (percentage >= 50) color = '#fa709a';
            else color = '#f5576c';

            return {
                subject: subjectName,
                percentage,
                change: '+0%',
                color,
                changeColor: '#43e97b',
                hasData: true,
                resultCount: perfData.count
            };
        }).filter(s => s !== null)
          .sort((a, b) => b.percentage - a.percentage);

        console.log(`\nFinal subject performance array length: ${subjectPerformance.length}`);
        console.log('\n✅ UNIQUE SUBJECTS (No Duplicates):');
        subjectPerformance.forEach((sp, index) => {
            console.log(`  ${index + 1}. ${sp.subject}: ${sp.percentage}% (${sp.resultCount} results) - Color: ${sp.color}`);
        });

        if (subjectPerformance.length === 0) {
            console.log('\n⚠️  WARNING: No subject performance data generated!');
            console.log('This means either:');
            console.log('  1. No exam results exist');
            console.log('  2. All students are marked as absent');
            console.log('  3. SubjectId is null in exam results');
        } else {
            console.log('\n✅ Subject performance data is being generated correctly!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDashboardData();

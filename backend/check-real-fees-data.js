const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRealFeesData() {
    try {
        console.log('Checking real fees data in database...\n');

        // Get college ID
        const college = await prisma.college.findFirst();
        if (!college) {
            console.log('❌ No college found');
            return;
        }
        console.log(`College: ${college.name} (ID: ${college.id})`);

        // Check students
        const students = await prisma.student.findMany({
            where: { collegeId: college.id, isDeleted: false },
            select: {
                id: true,
                name: true,
                studentId: true,
                sclass: { select: { sclassName: true } }
            },
            take: 10
        });
        console.log(`\n👥 Students found: ${students.length}`);
        students.slice(0, 5).forEach((student, index) => {
            console.log(`  ${index + 1}. ${student.name} (${student.studentId}) - Class: ${student.sclass?.sclassName || 'N/A'}`);
        });

        // Check fees
        const fees = await prisma.fee.findMany({
            where: { collegeId: college.id },
            select: {
                id: true,
                feeType: true,
                amount: true,
                dueDate: true,
                isActive: true,
                studentId: true,
                student: { 
                    select: { 
                        name: true, 
                        studentId: true,
                        sclass: { select: { sclassName: true } }
                    } 
                }
            },
            take: 10
        });
        console.log(`\n💰 Fees found: ${fees.length}`);
        fees.slice(0, 5).forEach((fee, index) => {
            console.log(`  ${index + 1}. ${fee.student?.name || 'Unknown'} - ₹${fee.amount} (${fee.feeType})`);
            console.log(`     Due: ${new Date(fee.dueDate).toLocaleDateString()}, Active: ${fee.isActive}`);
        });

        // Check payments
        const payments = await prisma.payment.findMany({
            where: { collegeId: college.id },
            select: {
                id: true,
                amount: true,
                status: true,
                paymentMethod: true,
                studentId: true,
                student: { 
                    select: { 
                        name: true, 
                        studentId: true 
                    } 
                }
            },
            take: 10
        });
        console.log(`\n💳 Payments found: ${payments.length}`);
        payments.slice(0, 5).forEach((payment, index) => {
            console.log(`  ${index + 1}. ${payment.student?.name || 'Unknown'} - ₹${payment.amount} (${payment.status})`);
            console.log(`     Method: ${payment.paymentMethod || 'N/A'}`);
        });

        // Check if we have any data at all
        const totalStudents = await prisma.student.count({ where: { collegeId: college.id, isDeleted: false } });
        const totalFees = await prisma.fee.count({ where: { collegeId: college.id } });
        const totalPayments = await prisma.payment.count({ where: { collegeId: college.id } });

        console.log(`\n📊 TOTAL COUNTS:`);
        console.log(`  Total Students: ${totalStudents}`);
        console.log(`  Total Fees: ${totalFees}`);
        console.log(`  Total Payments: ${totalPayments}`);

        if (totalFees === 0) {
            console.log('\n⚠️  NO FEES DATA FOUND! Need to create fee records first.');
            console.log('   You can create fees using the admin panel or import CSV.');
        }

        if (totalPayments === 0) {
            console.log('\n⚠️  NO PAYMENTS DATA FOUND! All fees will show as unpaid.');
        }

    } catch (error) {
        console.error('❌ Error checking fees data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRealFeesData();
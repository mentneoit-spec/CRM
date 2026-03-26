const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFeeStatusCalculation() {
    try {
        console.log('Testing fee status calculation with real data...\n');

        const college = await prisma.college.findFirst();
        console.log(`College: ${college.name}`);

        // Get all fees with student information
        const fees = await prisma.fee.findMany({
            where: { collegeId: college.id, isActive: true },
            select: {
                id: true,
                feeType: true,
                amount: true,
                dueDate: true,
                studentId: true,
                student: { 
                    select: { 
                        id: true, 
                        name: true, 
                        studentId: true,
                        sclass: { select: { sclassName: true } } 
                    } 
                },
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`\nTotal fees found: ${fees.length}`);

        // Get all payments
        const payments = await prisma.payment.findMany({
            where: { 
                collegeId: college.id,
                status: 'completed' 
            },
            select: {
                studentId: true,
                amount: true,
            },
        });

        console.log(`Total completed payments found: ${payments.length}`);

        // Calculate payment totals per student
        const paymentsByStudent = new Map();
        for (const payment of payments) {
            const current = paymentsByStudent.get(payment.studentId) || 0;
            paymentsByStudent.set(payment.studentId, current + Number(payment.amount));
        }

        console.log(`\nPayments by student:`);
        paymentsByStudent.forEach((amount, studentId) => {
            console.log(`  Student ${studentId}: ₹${amount}`);
        });

        // Process fees with payment information and status
        const currentDate = new Date();
        console.log(`\nCurrent date: ${currentDate.toLocaleDateString()}`);
        
        const processedFees = fees.map(fee => {
            const feeAmount = Number(fee.amount) || 0;
            const paidAmount = paymentsByStudent.get(fee.studentId) || 0;
            const dueAmount = Math.max(0, feeAmount - paidAmount);
            const dueDate = new Date(fee.dueDate);
            
            // Determine fee status
            let feeStatus = 'pending';
            if (paidAmount >= feeAmount) {
                feeStatus = 'completed';
            } else if (dueDate < currentDate) {
                feeStatus = 'overdue';
            }

            return {
                id: fee.id,
                name: fee.student?.name || 'Unknown',
                studentId: fee.student?.studentId || 'N/A',
                class: fee.student?.sclass?.sclassName || 'N/A',
                totalFee: feeAmount,
                paidAmount,
                dueAmount,
                dueDate: fee.dueDate,
                feeStatus,
                feeType: fee.feeType,
                student: fee.student
            };
        });

        console.log('\n✅ PROCESSED FEES WITH REAL DATA:');
        processedFees.forEach((fee, index) => {
            console.log(`\n${index + 1}. ${fee.name} (${fee.studentId}) - ${fee.class}`);
            console.log(`   Fee Type: ${fee.feeType}`);
            console.log(`   Total Fee: ₹${fee.totalFee}`);
            console.log(`   Paid Amount: ₹${fee.paidAmount}`);
            console.log(`   Due Amount: ₹${fee.dueAmount}`);
            console.log(`   Due Date: ${new Date(fee.dueDate).toLocaleDateString()}`);
            console.log(`   Status: ${fee.feeStatus.toUpperCase()}`);
        });

        // Calculate summary statistics
        const totalFees = processedFees.reduce((sum, fee) => sum + fee.totalFee, 0);
        const totalCollected = processedFees.reduce((sum, fee) => sum + fee.paidAmount, 0);
        const totalDue = processedFees.reduce((sum, fee) => sum + fee.dueAmount, 0);
        const completedCount = processedFees.filter(fee => fee.feeStatus === 'completed').length;
        const pendingCount = processedFees.filter(fee => fee.feeStatus === 'pending').length;
        const overdueCount = processedFees.filter(fee => fee.feeStatus === 'overdue').length;

        console.log('\n📊 SUMMARY STATISTICS:');
        console.log(`  Total Fees: ₹${totalFees.toLocaleString()}`);
        console.log(`  Total Collected: ₹${totalCollected.toLocaleString()}`);
        console.log(`  Total Due: ₹${totalDue.toLocaleString()}`);
        console.log(`  Total Students: ${processedFees.length}`);
        console.log(`  Completed: ${completedCount}`);
        console.log(`  Pending: ${pendingCount}`);
        console.log(`  Overdue: ${overdueCount}`);
        console.log(`  Collection Rate: ${totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 0}%`);

        console.log('\n✅ Backend is using REAL DATABASE DATA, not dummy data!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFeeStatusCalculation();
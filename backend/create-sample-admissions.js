const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleAdmissions() {
    try {
        console.log('Creating sample admissions...\n');

        // Get the first college
        const college = await prisma.college.findFirst();
        if (!college) {
            console.log('No college found. Please create a college first.');
            return;
        }

        console.log(`Using college: ${college.name} (ID: ${college.id})\n`);

        // Sample admission data
        const sampleAdmissions = [
            {
                admissionNumber: 'ADM2025001',
                applicantName: 'Rahul Sharma',
                applicantEmail: 'rahul.sharma@example.com',
                applicantPhone: '9876543210',
                dateOfBirth: new Date('2010-05-15'),
                gender: 'Male',
                fatherName: 'Vijay Sharma',
                motherName: 'Priya Sharma',
                address: '123 MG Road, Bangalore',
                appliedFor: 'Class 10',
                status: 'pending',
                appliedDate: new Date(),
                collegeId: college.id,
            },
            {
                admissionNumber: 'ADM2025002',
                applicantName: 'Priya Patel',
                applicantEmail: 'priya.patel@example.com',
                applicantPhone: '9876543211',
                dateOfBirth: new Date('2011-08-20'),
                gender: 'Female',
                fatherName: 'Amit Patel',
                motherName: 'Neha Patel',
                address: '456 Park Street, Mumbai',
                appliedFor: 'Class 9',
                status: 'pending',
                appliedDate: new Date(),
                collegeId: college.id,
            },
            {
                admissionNumber: 'ADM2025003',
                applicantName: 'Arjun Kumar',
                applicantEmail: 'arjun.kumar@example.com',
                applicantPhone: '9876543212',
                dateOfBirth: new Date('2010-12-10'),
                gender: 'Male',
                fatherName: 'Rajesh Kumar',
                motherName: 'Sunita Kumar',
                address: '789 Lake View, Delhi',
                appliedFor: 'Class 10',
                status: 'pending',
                appliedDate: new Date(),
                collegeId: college.id,
            },
            {
                admissionNumber: 'ADM2025004',
                applicantName: 'Sneha Reddy',
                applicantEmail: 'sneha.reddy@example.com',
                applicantPhone: '9876543213',
                dateOfBirth: new Date('2012-03-25'),
                gender: 'Female',
                fatherName: 'Venkat Reddy',
                motherName: 'Lakshmi Reddy',
                address: '321 Tech Park, Hyderabad',
                appliedFor: 'Class 8',
                status: 'pending',
                appliedDate: new Date(),
                collegeId: college.id,
            },
            {
                admissionNumber: 'ADM2025005',
                applicantName: 'Vikram Singh',
                applicantEmail: 'vikram.singh@example.com',
                applicantPhone: '9876543214',
                dateOfBirth: new Date('2011-07-18'),
                gender: 'Male',
                fatherName: 'Harpreet Singh',
                motherName: 'Simran Kaur',
                address: '654 Green Avenue, Chandigarh',
                appliedFor: 'Class 9',
                status: 'approved',
                appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                approvedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                collegeId: college.id,
            },
            {
                admissionNumber: 'ADM2025006',
                applicantName: 'Ananya Iyer',
                applicantEmail: 'ananya.iyer@example.com',
                applicantPhone: '9876543215',
                dateOfBirth: new Date('2010-11-30'),
                gender: 'Female',
                fatherName: 'Suresh Iyer',
                motherName: 'Meena Iyer',
                address: '987 Beach Road, Chennai',
                appliedFor: 'Class 10',
                status: 'rejected',
                appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                rejectionReason: 'Age criteria not met',
                collegeId: college.id,
            },
        ];

        // Create admissions
        for (const admission of sampleAdmissions) {
            const created = await prisma.admission.create({
                data: admission,
            });
            console.log(`✓ Created admission: ${created.applicantName} (${created.status})`);
        }

        console.log(`\n✓ Successfully created ${sampleAdmissions.length} sample admissions!`);

        // Show summary
        const pending = await prisma.admission.count({ where: { status: 'pending' } });
        const approved = await prisma.admission.count({ where: { status: 'approved' } });
        const rejected = await prisma.admission.count({ where: { status: 'rejected' } });

        console.log(`\nSummary:`);
        console.log(`  Pending: ${pending}`);
        console.log(`  Approved: ${approved}`);
        console.log(`  Rejected: ${rejected}`);
        console.log(`  Total: ${pending + approved + rejected}`);

    } catch (error) {
        console.error('Error creating sample admissions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSampleAdmissions();

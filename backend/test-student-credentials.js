/**
 * Test Script: Student Login Credentials Feature
 * 
 * This script tests:
 * 1. Manual student creation with auto-generated email and roll number as password
 * 2. CSV bulk import with login credentials display
 * 3. Verification of created students in database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testManualStudentCreation() {
    console.log('\n========== TEST 1: Manual Student Creation ==========\n');
    
    try {
        // Get the first class
        const sclass = await prisma.sclass.findFirst();
        if (!sclass) {
            console.log('❌ No class found. Please create a class first.');
            return;
        }

        const college = await prisma.college.findUnique({
            where: { id: sclass.collegeId }
        });

        console.log(`✅ Using Class: ${sclass.sclassName}`);
        console.log(`✅ Using College: ${college.name}`);

        // Create a test student
        const testPassword = '99'; // Roll number
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const generatedEmail = `test.manual.001@${college.name.toLowerCase().replace(/\s+/g, '')}.student`;

        const user = await prisma.user.create({
            data: {
                name: 'Test Manual Student',
                email: generatedEmail,
                password: hashedPassword,
                phone: '9999999999',
                role: 'Student',
                collegeId: college.id,
                isActive: true,
            },
        });

        const student = await prisma.student.create({
            data: {
                name: 'Test Manual Student',
                studentId: 'TEST_MANUAL_001',
                email: generatedEmail,
                phone: '9999999999',
                password: hashedPassword,
                rollNum: 99,
                collegeId: college.id,
                sclassId: sclass.id,
                userId: user.id,
            },
        });

        console.log('\n✅ Student Created Successfully!');
        console.log('📋 Login Credentials:');
        console.log(`   Email: ${generatedEmail}`);
        console.log(`   Password: ${testPassword}`);
        console.log(`   Roll Number: ${student.rollNum}`);
        console.log(`   Student ID: ${student.studentId}`);

        // Verify password
        const isPasswordValid = await bcrypt.compare(testPassword, student.password);
        console.log(`\n✅ Password verification: ${isPasswordValid ? 'PASSED' : 'FAILED'}`);

        // Clean up
        await prisma.student.delete({ where: { id: student.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('❌ Error in manual creation test:', error.message);
    }
}

async function testCSVImportCredentials() {
    console.log('\n========== TEST 2: CSV Import with Credentials ==========\n');
    
    try {
        // Get the first class
        const sclass = await prisma.sclass.findFirst();
        if (!sclass) {
            console.log('❌ No class found. Please create a class first.');
            return;
        }

        const college = await prisma.college.findUnique({
            where: { id: sclass.collegeId }
        });

        console.log(`✅ Using Class: ${sclass.sclassName}`);
        console.log(`✅ Using College: ${college.name}`);

        // Simulate CSV import data
        const csvData = [
            { studentId: 'CSV_TEST_001', name: 'CSV Test Student 1', rollNum: 101 },
            { studentId: 'CSV_TEST_002', name: 'CSV Test Student 2', rollNum: 102 },
            { studentId: 'CSV_TEST_003', name: 'CSV Test Student 3', rollNum: 103 },
        ];

        const createdStudents = [];

        for (const data of csvData) {
            const password = String(data.rollNum); // Roll number as password
            const hashedPassword = await bcrypt.hash(password, 10);
            const generatedEmail = `${data.studentId.toLowerCase()}@${college.name.toLowerCase().replace(/\s+/g, '')}.student`;

            const user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: generatedEmail,
                    password: hashedPassword,
                    role: 'Student',
                    collegeId: college.id,
                    isActive: true,
                },
            });

            const student = await prisma.student.create({
                data: {
                    name: data.name,
                    studentId: data.studentId,
                    email: generatedEmail,
                    password: hashedPassword,
                    rollNum: data.rollNum,
                    collegeId: college.id,
                    sclassId: sclass.id,
                    userId: user.id,
                },
            });

            createdStudents.push({
                studentId: student.studentId,
                name: student.name,
                email: generatedEmail,
                password: password,
                rollNum: student.rollNum,
            });
        }

        console.log('\n✅ CSV Import Simulation Complete!');
        console.log('📋 Created Students with Login Credentials:\n');
        console.log('┌─────────────────┬──────────────────────┬──────────────────────────────────────┬──────────┐');
        console.log('│ Student ID      │ Name                 │ Email                                │ Password │');
        console.log('├─────────────────┼──────────────────────┼──────────────────────────────────────┼──────────┤');
        
        for (const student of createdStudents) {
            const studentIdPad = student.studentId.padEnd(15);
            const namePad = student.name.padEnd(20);
            const emailPad = student.email.padEnd(36);
            const passwordPad = student.password.padEnd(8);
            console.log(`│ ${studentIdPad} │ ${namePad} │ ${emailPad} │ ${passwordPad} │`);
        }
        
        console.log('└─────────────────┴──────────────────────┴──────────────────────────────────────┴──────────┘');

        // Verify all students exist in database
        console.log('\n✅ Verifying students in database...');
        for (const data of csvData) {
            const student = await prisma.student.findFirst({
                where: { studentId: data.studentId, collegeId: college.id }
            });
            if (student) {
                console.log(`   ✅ ${data.studentId} found in database`);
            } else {
                console.log(`   ❌ ${data.studentId} NOT found in database`);
            }
        }

        // Clean up
        console.log('\n✅ Cleaning up test data...');
        for (const data of csvData) {
            const student = await prisma.student.findFirst({
                where: { studentId: data.studentId, collegeId: college.id }
            });
            if (student) {
                await prisma.student.delete({ where: { id: student.id } });
                await prisma.user.delete({ where: { id: student.userId } });
            }
        }
        console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('❌ Error in CSV import test:', error.message);
    }
}

async function testEmailGeneration() {
    console.log('\n========== TEST 3: Email Generation Logic ==========\n');
    
    try {
        const college = await prisma.college.findFirst();
        if (!college) {
            console.log('❌ No college found.');
            return;
        }

        const testCases = [
            { studentId: 'STU001', expected: 'stu001@democollege.student' },
            { studentId: 'STU-002', expected: 'stu-002@democollege.student' },
            { studentId: 'STUDENT_003', expected: 'student_003@democollege.student' },
        ];

        console.log(`College Name: ${college.name}`);
        console.log(`College Slug: ${college.name.toLowerCase().replace(/\s+/g, '')}\n`);

        console.log('Email Generation Test Cases:');
        console.log('┌──────────────┬──────────────────────────────────────┐');
        console.log('│ Student ID   │ Generated Email                      │');
        console.log('├──────────────┼──────────────────────────────────────┤');

        for (const testCase of testCases) {
            const emailBase = `${testCase.studentId.toLowerCase().replace(/\s+/g, '.')}@${college.name.toLowerCase().replace(/\s+/g, '')}.student`;
            const match = emailBase === testCase.expected ? '✅' : '❌';
            console.log(`│ ${testCase.studentId.padEnd(12)} │ ${emailBase.padEnd(36)} │ ${match}`);
        }
        console.log('└──────────────┴──────────────────────────────────────┘');

    } catch (error) {
        console.error('❌ Error in email generation test:', error.message);
    }
}

async function testPasswordStrategy() {
    console.log('\n========== TEST 4: Password Strategy (Roll Number) ==========\n');
    
    try {
        const testRollNumbers = [1, 2, 10, 42, 99, 101];

        console.log('Password Strategy: Roll Number as Password\n');
        console.log('┌──────────────┬──────────────┬──────────────────────────────────────┐');
        console.log('│ Roll Number  │ Password     │ Hash (first 20 chars)                │');
        console.log('├──────────────┼──────────────┼──────────────────────────────────────┤');

        for (const rollNum of testRollNumbers) {
            const password = String(rollNum);
            const hash = await bcrypt.hash(password, 10);
            const hashPreview = hash.substring(0, 20) + '...';
            console.log(`│ ${String(rollNum).padEnd(12)} │ ${password.padEnd(12)} │ ${hashPreview.padEnd(36)} │`);
        }
        console.log('└──────────────┴──────────────┴──────────────────────────────────────┘');

        // Test password verification
        console.log('\n✅ Password Verification Test:');
        const testPassword = '42';
        const hash = await bcrypt.hash(testPassword, 10);
        const isValid = await bcrypt.compare(testPassword, hash);
        console.log(`   Password: ${testPassword}`);
        console.log(`   Hash: ${hash}`);
        console.log(`   Verification: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);

    } catch (error) {
        console.error('❌ Error in password strategy test:', error.message);
    }
}

async function runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║   Student Login Credentials Feature - Test Suite               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    await testManualStudentCreation();
    await testCSVImportCredentials();
    await testEmailGeneration();
    await testPasswordStrategy();

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║   All Tests Completed!                                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    await prisma.$disconnect();
}

runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

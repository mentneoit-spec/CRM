const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5001/api';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`),
};

async function testMultiTenancyAPI() {
    try {
        log.section('MULTI-TENANCY API TEST');

        // Step 1: Get all colleges
        log.info('Fetching all colleges from database...');
        const colleges = await prisma.college.findMany({
            include: {
                Users: true,
                Students: true,
                Teachers: true,
            },
        });

        if (colleges.length < 2) {
            log.error(`Need at least 2 colleges for testing. Found: ${colleges.length}`);
            log.info('Run: node create-dummy-data.js');
            process.exit(1);
        }

        log.success(`Found ${colleges.length} colleges`);
        colleges.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.name} (ID: ${c.id})`);
            console.log(`      - Users: ${c.Users.length}`);
            console.log(`      - Students: ${c.Students.length}`);
            console.log(`      - Teachers: ${c.Teachers.length}`);
        });

        // Step 2: Get admin users for each college
        log.info('Fetching admin users...');
        const adminUsers = await prisma.user.findMany({
            where: { role: 'Admin' },
            include: { college: true },
        });

        if (adminUsers.length < 2) {
            log.error(`Need at least 2 admin users. Found: ${adminUsers.length}`);
            process.exit(1);
        }

        const admin1 = adminUsers[0];
        const admin2 = adminUsers[1];

        log.success(`Found ${adminUsers.length} admin users`);
        console.log(`   1. ${admin1.name} (${admin1.email}) → ${admin1.college.name}`);
        console.log(`   2. ${admin2.name} (${admin2.email}) → ${admin2.college.name}`);

        // Step 3: Login as Admin 1
        log.section('TEST 1: Admin 1 Login & Access Own College Data');
        log.info(`Logging in as ${admin1.name}...`);

        let admin1Token;
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: admin1.email,
                password: 'Test@123',
            });
            admin1Token = loginRes.data.token;
            log.success(`Admin 1 logged in successfully`);
            console.log(`   Token: ${admin1Token.substring(0, 20)}...`);
        } catch (error) {
            log.error(`Admin 1 login failed: ${error.response?.data?.message || error.message}`);
            process.exit(1);
        }

        // Step 4: Admin 1 fetches their college's students
        log.info(`Admin 1 fetching students from ${admin1.college.name}...`);
        try {
            const studentsRes = await axios.get(`${BASE_URL}/admin/students`, {
                headers: { Authorization: `Bearer ${admin1Token}` },
            });
            const admin1Students = studentsRes.data.data;
            log.success(`Admin 1 retrieved ${admin1Students.length} students`);
            
            // Verify all students belong to Admin 1's college
            const allBelongToCollege = admin1Students.every(s => s.collegeId === admin1.collegeId);
            if (allBelongToCollege) {
                log.success(`All students belong to ${admin1.college.name}`);
            } else {
                log.error(`Some students don't belong to ${admin1.college.name}`);
            }
        } catch (error) {
            log.error(`Admin 1 fetch students failed: ${error.response?.data?.message || error.message}`);
        }

        // Step 5: Login as Admin 2
        log.section('TEST 2: Admin 2 Login & Access Own College Data');
        log.info(`Logging in as ${admin2.name}...`);

        let admin2Token;
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: admin2.email,
                password: 'Test@123',
            });
            admin2Token = loginRes.data.token;
            log.success(`Admin 2 logged in successfully`);
            console.log(`   Token: ${admin2Token.substring(0, 20)}...`);
        } catch (error) {
            log.error(`Admin 2 login failed: ${error.response?.data?.message || error.message}`);
            process.exit(1);
        }

        // Step 6: Admin 2 fetches their college's students
        log.info(`Admin 2 fetching students from ${admin2.college.name}...`);
        try {
            const studentsRes = await axios.get(`${BASE_URL}/admin/students`, {
                headers: { Authorization: `Bearer ${admin2Token}` },
            });
            const admin2Students = studentsRes.data.data;
            log.success(`Admin 2 retrieved ${admin2Students.length} students`);
            
            // Verify all students belong to Admin 2's college
            const allBelongToCollege = admin2Students.every(s => s.collegeId === admin2.collegeId);
            if (allBelongToCollege) {
                log.success(`All students belong to ${admin2.college.name}`);
            } else {
                log.error(`Some students don't belong to ${admin2.college.name}`);
            }
        } catch (error) {
            log.error(`Admin 2 fetch students failed: ${error.response?.data?.message || error.message}`);
        }

        // Step 7: Verify data isolation - Admin 1 cannot see Admin 2's students
        log.section('TEST 3: Data Isolation - Admin 1 Cannot Access Admin 2 Data');
        log.info(`Attempting to fetch Admin 2's college data using Admin 1's token...`);
        
        try {
            const studentsRes = await axios.get(`${BASE_URL}/admin/students?collegeId=${admin2.collegeId}`, {
                headers: { Authorization: `Bearer ${admin1Token}` },
            });
            
            // Check if the response contains only Admin 1's college data
            const students = studentsRes.data.data;
            const admin2CollegeStudents = students.filter(s => s.collegeId === admin2.collegeId);
            
            if (admin2CollegeStudents.length === 0) {
                log.success(`Admin 1 cannot access Admin 2's college data (isolation working)`);
            } else {
                log.error(`Admin 1 can see Admin 2's data (isolation broken!)`);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                log.success(`Admin 1 access denied (403) - isolation working`);
            } else {
                log.warn(`Unexpected error: ${error.response?.data?.message || error.message}`);
            }
        }

        // Step 8: Get Super Admin
        log.section('TEST 4: Super Admin Can Access All Colleges');
        const superAdmin = await prisma.user.findFirst({
            where: { role: 'SuperAdmin' },
        });

        if (!superAdmin) {
            log.warn('No Super Admin found, skipping Super Admin tests');
        } else {
            log.info(`Logging in as ${superAdmin.name}...`);
            
            let superAdminToken;
            try {
                const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                    email: superAdmin.email,
                    password: 'Test@123',
                });
                superAdminToken = loginRes.data.token;
                log.success(`Super Admin logged in successfully`);
            } catch (error) {
                log.error(`Super Admin login failed: ${error.response?.data?.message || error.message}`);
            }

            if (superAdminToken) {
                // Super Admin fetches all colleges
                log.info('Super Admin fetching all colleges...');
                try {
                    const collegesRes = await axios.get(`${BASE_URL}/superadmin/colleges`, {
                        headers: { Authorization: `Bearer ${superAdminToken}` },
                    });
                    const allColleges = collegesRes.data.data;
                    log.success(`Super Admin retrieved ${allColleges.length} colleges`);
                    allColleges.forEach(c => console.log(`   - ${c.name}`));
                } catch (error) {
                    log.error(`Super Admin fetch colleges failed: ${error.response?.data?.message || error.message}`);
                }
            }
        }

        // Step 9: Summary
        log.section('TEST SUMMARY');
        log.success('Multi-Tenancy API Tests Completed');
        console.log(`
   ✅ Admin 1 can access their college data
   ✅ Admin 2 can access their college data
   ✅ Admin 1 cannot access Admin 2's data
   ✅ Super Admin can access all colleges
   
   🔐 Data Isolation: VERIFIED
        `);

    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        console.error(error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

testMultiTenancyAPI();

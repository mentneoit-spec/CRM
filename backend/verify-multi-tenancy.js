const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyMultiTenancy() {
    console.log('🔍 Verifying Multi-Tenancy Implementation...\n');

    try {
        // 1. Check colleges exist
        const colleges = await prisma.college.findMany();
        console.log(`✅ Colleges: ${colleges.length} found`);
        colleges.forEach(c => console.log(`   - ${c.name} (ID: ${c.id})`));

        // 2. Check admins are assigned to colleges
        const admins = await prisma.admin.findMany({
            include: { college: true, user: true }
        });
        console.log(`\n✅ Admins: ${admins.length} found`);
        admins.forEach(a => console.log(`   - ${a.name} → ${a.college.name}`));

        // 3. Check students are assigned to colleges
        const students = await prisma.student.findMany({
            include: { college: true, sclass: true }
        });
        console.log(`\n✅ Students: ${students.length} found`);
        const studentsByCollege = {};
        students.forEach(s => {
            if (!studentsByCollege[s.college.name]) {
                studentsByCollege[s.college.name] = [];
            }
            studentsByCollege[s.college.name].push(s.name);
        });
        Object.entries(studentsByCollege).forEach(([college, stus]) => {
            console.log(`   - ${college}: ${stus.length} students`);
            stus.slice(0, 3).forEach(s => console.log(`     • ${s}`));
            if (stus.length > 3) console.log(`     ... and ${stus.length - 3} more`);
        });

        // 4. Check teachers are assigned to colleges
        const teachers = await prisma.teacher.findMany({
            include: { college: true }
        });
        console.log(`\n✅ Teachers: ${teachers.length} found`);
        const teachersByCollege = {};
        teachers.forEach(t => {
            if (!teachersByCollege[t.college.name]) {
                teachersByCollege[t.college.name] = [];
            }
            teachersByCollege[t.college.name].push(t.name);
        });
        Object.entries(teachersByCollege).forEach(([college, tchs]) => {
            console.log(`   - ${college}: ${tchs.length} teachers`);
        });

        // 5. Check fees are assigned to colleges
        const fees = await prisma.fee.findMany({
            include: { college: true, student: true }
        });
        console.log(`\n✅ Fees: ${fees.length} found`);
        const feesByCollege = {};
        fees.forEach(f => {
            if (!feesByCollege[f.college.name]) {
                feesByCollege[f.college.name] = 0;
            }
            feesByCollege[f.college.name]++;
        });
        Object.entries(feesByCollege).forEach(([college, count]) => {
            console.log(`   - ${college}: ${count} fees`);
        });

        // 6. Check classes are assigned to colleges
        const classes = await prisma.sclass.findMany({
            include: { college: true }
        });
        console.log(`\n✅ Classes: ${classes.length} found`);
        const classesByCollege = {};
        classes.forEach(c => {
            if (!classesByCollege[c.college.name]) {
                classesByCollege[c.college.name] = [];
            }
            classesByCollege[c.college.name].push(c.sclassName);
        });
        Object.entries(classesByCollege).forEach(([college, cls]) => {
            console.log(`   - ${college}: ${cls.join(', ')}`);
        });

        // 7. Verify data isolation
        console.log(`\n🔐 Data Isolation Verification:`);
        let isolationOk = true;
        
        // Check all students have collegeId
        if (students.every(s => s.collegeId)) {
            console.log(`   ✅ All students have collegeId assigned`);
        } else {
            const missing = students.filter(s => !s.collegeId).length;
            console.log(`   ❌ ${missing} students missing collegeId`);
            isolationOk = false;
        }

        // Check all teachers have collegeId
        if (teachers.every(t => t.collegeId)) {
            console.log(`   ✅ All teachers have collegeId assigned`);
        } else {
            const missing = teachers.filter(t => !t.collegeId).length;
            console.log(`   ❌ ${missing} teachers missing collegeId`);
            isolationOk = false;
        }

        // Check all fees have collegeId
        if (fees.every(f => f.collegeId)) {
            console.log(`   ✅ All fees have collegeId assigned`);
        } else {
            const missing = fees.filter(f => !f.collegeId).length;
            console.log(`   ❌ ${missing} fees missing collegeId`);
            isolationOk = false;
        }

        // 8. Summary
        console.log(`\n📊 Summary:`);
        console.log(`   Total Colleges: ${colleges.length}`);
        console.log(`   Total Admins: ${admins.length}`);
        console.log(`   Total Students: ${students.length}`);
        console.log(`   Total Teachers: ${teachers.length}`);
        console.log(`   Total Fees: ${fees.length}`);
        console.log(`   Total Classes: ${classes.length}`);
        
        if (isolationOk) {
            console.log(`\n✅ Multi-Tenancy Implementation: VERIFIED`);
        } else {
            console.log(`\n⚠️  Multi-Tenancy Implementation: ISSUES FOUND`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyMultiTenancy();

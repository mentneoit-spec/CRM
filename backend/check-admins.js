const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmins() {
    const admins = await prisma.user.findMany({
        where: { role: 'Admin' },
        include: { college: true },
    });
    
    console.log('Admin Users:');
    admins.forEach((a, i) => {
        console.log(`${i + 1}. ${a.name} (${a.email}) → ${a.college.name} (${a.collegeId})`);
    });
    
    // Group by email
    const byEmail = {};
    admins.forEach(a => {
        if (!byEmail[a.email]) byEmail[a.email] = [];
        byEmail[a.email].push(a);
    });
    
    console.log('\nGrouped by Email:');
    Object.entries(byEmail).forEach(([email, users]) => {
        console.log(`${email}: ${users.length} users`);
        users.forEach(u => console.log(`  - ${u.college.name}`));
    });
    
    process.exit(0);
}

checkAdmins();

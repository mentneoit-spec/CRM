require('dotenv').config();
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const collegeId = process.argv[4];

  if (!email || !password) {
    console.log('Usage: node debug-password-compare.js <email> <password> [collegeId]');
    process.exit(1);
  }

  await prisma.$connect();

  let user = null;
  if (collegeId) {
    user = await prisma.user.findUnique({
      where: { email_collegeId: { email, collegeId } },
    });
  } else {
    const nonCollege = await prisma.user.findFirst({ where: { email, collegeId: null } });
    const collegeMatches = await prisma.user.findMany({
      where: { email, collegeId: { not: null } },
      take: 5,
    });

    console.log('Resolution debug (no collegeId):');
    console.log('  nonCollege user found:', !!nonCollege);
    console.log('  collegeMatches:', collegeMatches.map((u) => ({ id: u.id, collegeId: u.collegeId, role: u.role })));

    user = nonCollege || (collegeMatches.length === 1 ? collegeMatches[0] : null);
  }

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User found:', { id: user.id, email: user.email, role: user.role, collegeId: user.collegeId });
  console.log('Password hash prefix:', String(user.password || '').slice(0, 12), 'len=', String(user.password || '').length);

  const ok = await bcrypt.compare(password, user.password || '');
  console.log('bcrypt.compare result:', ok);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });

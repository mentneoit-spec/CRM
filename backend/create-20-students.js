const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function create20Students() {
  try {
    const college = await prisma.college.findFirst();
    if (!college) {
      console.log('No college found');
      return;
    }

    const collegeId = college.id;
    console.log('Creating 20 students for:', college.name);

    // Get classes and sections
    const classes = await prisma.sclass.findMany({ where: { collegeId } });
    const sections = await prisma.section.findMany({ where: { collegeId } });

    if (classes.length === 0 || sections.length === 0) {
      console.log('No classes or sections found');
      return;
    }

    const studentNames = [
      'Vikram Patel', 'Nisha Gupta', 'Sanjay Desai', 'Isha Reddy', 'Nikhil Joshi',
      'Pooja Saxena', 'Rahul Verma', 'Sakshi Nair', 'Aryan Singh', 'Zara Khan',
      'Aditya Verma', 'Divya Nair', 'Karan Malhotra', 'Sneha Desai', 'Varun Chopra',
      'Ananya Patel', 'Rohan Singh', 'Priya Sharma', 'Arjun Kumar', 'Neha Gupta'
    ];

    let createdCount = 0;

    for (let i = 0; i < studentNames.length; i++) {
      const name = studentNames[i];
      const studentId = `STU${String(i + 5).padStart(3, '0')}`;
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}@student.edu`;
      const password = await bcrypt.hash('student123', 10);
      const rollNum = i + 5;

      const sclass = classes[i % classes.length];
      const section = sections[i % sections.length];

      try {
        // Create user first
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password,
            role: 'Student',
            collegeId,
            isEmailVerified: true,
          },
        });

        // Create student
        const student = await prisma.student.create({
          data: {
            name,
            studentId,
            email,
            password,
            rollNum,
            collegeId,
            sclassId: sclass.id,
            sectionId: section.id,
            userId: user.id,
            gender: i % 2 === 0 ? 'Male' : 'Female',
            dateOfBirth: new Date(2005 + Math.floor(i / 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          },
        });

        createdCount++;
        console.log(`✓ Created: ${name} (${studentId})`);
      } catch (e) {
        console.log(`✗ Failed: ${name} - ${e.message}`);
      }
    }

    console.log(`\n✓ Successfully created ${createdCount} students`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

create20Students();

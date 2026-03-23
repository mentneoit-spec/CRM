const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');

dotenv.config();

const sampleStudents = [
  {
    studentId: 'STU001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    class: '10th Grade'
  },
  {
    studentId: 'STU002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '1234567891',
    class: '10th Grade'
  },
  {
    studentId: 'STU003',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '1234567892',
    class: '11th Grade'
  },
  {
    studentId: 'STU004',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '1234567893',
    class: '11th Grade'
  },
  {
    studentId: 'STU005',
    name: 'David Brown',
    email: 'david.brown@example.com',
    phone: '1234567894',
    class: '12th Grade'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing students
    await Student.deleteMany({});
    console.log('✓ Cleared existing students');

    // Insert sample students
    await Student.insertMany(sampleStudents);
    console.log('✓ Inserted', sampleStudents.length, 'sample students');

    console.log('\n📋 Sample Students:');
    sampleStudents.forEach(student => {
      console.log(`  - ${student.studentId}: ${student.name} (${student.email})`);
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('⚠️  Remember to update email addresses to real ones for testing');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

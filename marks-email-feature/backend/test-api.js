const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testStudent = {
  studentId: 'STU001',
  name: 'John Doe',
  email: 'test@example.com', // Change this to your email
  phone: '1234567890',
  class: '10th Grade'
};

const testMarks = {
  studentId: 'STU001',
  subject: 'Mathematics',
  marks: 85,
  totalMarks: 100,
  examType: 'Final'
};

async function runTests() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Create Student
    console.log('1️⃣ Creating test student...');
    const createResponse = await axios.post(`${API_URL}/students`, testStudent);
    console.log('✅ Student created:', createResponse.data);
    console.log('');

    // Test 2: Get All Students
    console.log('2️⃣ Fetching all students...');
    const studentsResponse = await axios.get(`${API_URL}/students`);
    console.log('✅ Students found:', studentsResponse.data.count);
    console.log('');

    // Test 3: Send Marks
    console.log('3️⃣ Sending marks and email...');
    const marksResponse = await axios.post(`${API_URL}/send-marks`, testMarks);
    console.log('✅ Marks sent:', marksResponse.data.message);
    console.log('📧 Check email:', testStudent.email);
    console.log('');

    // Test 4: Get Marks History
    console.log('4️⃣ Fetching marks history...');
    const historyResponse = await axios.get(`${API_URL}/marks/${testStudent.studentId}`);
    console.log('✅ Marks history:', historyResponse.data.count, 'records');
    console.log('');

    console.log('🎉 All tests passed!');
    console.log('\n📧 IMPORTANT: Check your email inbox for the marks notification!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
runTests();

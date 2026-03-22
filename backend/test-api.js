const axios = require('axios');

async function testAPI() {
  try {
    // First, login to get token
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'abhiyeduru@gmail.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    const collegeId = loginRes.data.data.user.collegeId;
    console.log('✓ Logged in. Token:', token.substring(0, 20) + '...');
    console.log('✓ College ID:', collegeId);
    
    // Create axios instance with token
    const api = axios.create({
      baseURL: 'http://localhost:5001/api',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Test getting teachers
    console.log('\n2. Fetching teachers...');
    const teachersRes = await api.get('/admin/teachers');
    console.log('✓ Teachers response structure:', Object.keys(teachersRes.data));
    console.log('✓ Teachers count:', teachersRes.data.data?.length || 0);
    if (teachersRes.data.data?.length > 0) {
      console.log('✓ First teacher:', teachersRes.data.data[0].name);
    }
    
    // Test getting students
    console.log('\n3. Fetching students...');
    const studentsRes = await api.get('/admin/students');
    console.log('✓ Students response structure:', Object.keys(studentsRes.data));
    console.log('✓ Students count:', studentsRes.data.data?.length || 0);
    if (studentsRes.data.data?.length > 0) {
      console.log('✓ First student:', studentsRes.data.data[0].name);
    }
    
    // Test getting classes
    console.log('\n4. Fetching classes...');
    const classesRes = await api.get('/admin/classes');
    console.log('✓ Classes response structure:', Object.keys(classesRes.data));
    console.log('✓ Classes count:', classesRes.data.data?.length || 0);
    if (classesRes.data.data?.length > 0) {
      console.log('✓ First class:', classesRes.data.data[0].sclassName);
    }
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

testAPI();

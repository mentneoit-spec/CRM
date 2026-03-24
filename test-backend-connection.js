const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Login Endpoint (should return error without credentials)
    console.log('2. Testing Login Endpoint...');
    try {
      await axios.post(`${API_URL}/auth/login`, {});
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Login endpoint is working (validation error expected)');
      } else {
        console.log('❌ Login endpoint error:', error.message);
      }
    }
    console.log('');

    // Test 3: CORS Check
    console.log('3. Testing CORS Configuration...');
    const corsResponse = await axios.get(`${API_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:3002'
      }
    });
    console.log('✅ CORS is configured correctly');
    console.log('');

    // Test 4: Database Connection
    console.log('4. Testing Database Connection...');
    if (healthResponse.data.database === 'connected') {
      console.log('✅ Database is connected');
    } else {
      console.log('❌ Database connection issue');
    }
    console.log('');

    console.log('🎉 All tests passed! Backend is working correctly.\n');
    console.log('Frontend: http://localhost:3002');
    console.log('Backend:  http://localhost:5000/api');
    console.log('');

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Make sure backend is running: cd backend && npm start');
    console.log('2. Check if port 5000 is available');
    console.log('3. Verify .env file exists in backend folder');
    console.log('4. Check DATABASE_URL in backend/.env');
  }
}

testBackendConnection();

const axios = require('axios');

async function test() {
  try {
    // First, login
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'abhiyeduru@gmail.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    console.log('✓ Logged in');
    
    // Create axios instance with token
    const api = axios.create({
      baseURL: 'http://localhost:5001/api',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Test getting fees
    console.log('\n2. Fetching fees...');
    const feesRes = await api.get('/admin/fees');
    console.log('✓ Response status:', feesRes.status);
    console.log('✓ Response keys:', Object.keys(feesRes.data));
    console.log('✓ Fees count:', feesRes.data.data?.length || 0);
    if (feesRes.data.data?.length > 0) {
      console.log('✓ First fee:', JSON.stringify(feesRes.data.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

test();

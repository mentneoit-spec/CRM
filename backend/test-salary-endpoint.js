// Quick API test - test the salary update endpoint
async function testSalaryEndpoint() {
  console.log('🧪 Testing Salary Update Endpoint\n');
  
  // Step 1: Login
  console.log('Step 1️⃣: Login to get auth token...');
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abhiyeduru@gmail.com',
        password: 'Test@123'
      })
    });
    
    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginRes.status);
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login successful!');
    console.log('🔑 Token:', token.substring(0, 30) + '...\n');
    
    // Step 2: Fetch teachers
    console.log('Step 2️⃣: Fetching teachers...');
    const teachersRes = await fetch('http://localhost:5000/api/hr/teachers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!teachersRes.ok) {
      console.error('❌ Fetch failed:', teachersRes.status);
      return;
    }
    
    const teachersData = await teachersRes.json();
    if (!teachersData.data || teachersData.data.length === 0) {
      console.error('❌ No teachers found');
      return;
    }
    
    const teacher = teachersData.data[0];
    console.log(`✅ Found ${teachersData.data.length} teachers`);
    console.log(`📚 Using teacher: ${teacher.name} (ID: ${teacher.id})`);
    console.log(`💰 Current salary: ${teacher.salary}\n`);
    
    // Step 3: Update salary
    const newSalary = 55000;
    console.log(`Step 3️⃣: Updating salary to ₹${newSalary}...`);
    
    const updateRes = await fetch(`http://localhost:5000/api/hr/teachers/${teacher.id}/salary`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ salary: newSalary })
    });
    
    if (!updateRes.ok) {
      console.error('❌ Update failed:', updateRes.status);
      const errorText = await updateRes.text();
      console.error('Error:', errorText);
      return;
    }
    
    const updateData = await updateRes.json();
    console.log('✅ Salary updated successfully!');
    console.log(`💰 New salary: ₹${updateData.data.salary}\n`);
    
    console.log('🎉 All tests passed! The salary update endpoint is working correctly.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSalaryEndpoint();

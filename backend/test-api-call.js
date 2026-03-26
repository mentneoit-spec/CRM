const axios = require('axios');

async function testAPI() {
    try {
        // You need to login first to get a token
        console.log('Testing dashboard API...\n');
        
        // For now, let's just test if the endpoint is accessible
        const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE'
            }
        }).catch(err => {
            if (err.response?.status === 401) {
                console.log('⚠️  Need authentication token');
                console.log('Please login first and get your token\n');
            }
            return null;
        });

        if (response && response.data) {
            const subjectPerf = response.data.data?.subjectPerformance || [];
            console.log(`✅ API Response received`);
            console.log(`Subject Performance count: ${subjectPerf.length}\n`);
            
            if (subjectPerf.length > 0) {
                console.log('Subjects returned:');
                subjectPerf.forEach((s, i) => {
                    console.log(`  ${i + 1}. ${s.subject}: ${s.percentage}%`);
                });
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();

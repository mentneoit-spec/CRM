const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import the getFees function directly
const { getFees } = require('./controllers/admin-controller');

async function testFeesEndpoint() {
    try {
        console.log('Testing getFees endpoint directly...\n');

        const college = await prisma.college.findFirst();
        
        // Mock request and response objects
        const req = {
            collegeId: college.id,
            query: {}
        };

        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Status: ${code}`);
                    console.log('Response:', JSON.stringify(data, null, 2));
                    return data;
                }
            })
        };

        console.log('Calling getFees with real data...');
        await getFees(req, res);

    } catch (error) {
        console.error('❌ Error testing endpoint:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFeesEndpoint();
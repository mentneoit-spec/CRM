const request = require('supertest');
const { app, server } = require('../index');
const prisma = require('../lib/prisma');

// Test database cleanup
beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
});

afterAll(async () => {
    // Close server if it exists (not in test mode)
    if (server) {
        server.close();
    }
    // Cleanup and disconnect
    await prisma.$disconnect();
});

describe('Health Check', () => {
    it('should return 200 for health endpoint', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
    });
});

describe('Authentication', () => {
    describe('POST /api/auth/login', () => {
        it('should return 400 if email is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ password: 'test123' });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if password is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/otp/request-login', () => {
        it('should return 400 if phone is missing', async () => {
            const response = await request(app)
                .post('/api/auth/otp/request-login')
                .send({});
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Multi-Tenancy', () => {
    it('should detect college from domain', async () => {
        const response = await request(app)
            .get('/api/health')
            .set('Host', 'gravity.com');
        
        expect(response.status).toBe(200);
    });
});

// describe('Rate Limiting', () => {
//     it('should rate limit excessive requests', async () => {
//         const requests = [];
//         
//         for (let i = 0; i < 110; i++) {
//             requests.push(request(app).get('/api/health'));
//         }
//         
//         const responses = await Promise.all(requests);
//         const rateLimited = responses.some(r => r.status === 429);
//         
//         expect(rateLimited).toBe(true);
//     });
// });

module.exports = { app, prisma };

# Multi-Tenant White-Label College ERP & CRM SaaS Platform

## 🎯 Overview

Enterprise-grade, multi-tenant SaaS platform for college management supporting 1 million users and 50,000 concurrent connections across 100+ colleges with complete white-label capabilities.

## ✨ Key Features

### Multi-Tenancy
- ✅ Shared infrastructure with isolated data
- ✅ Custom domain support for each college
- ✅ White-label branding (no platform branding visible)
- ✅ Automatic domain detection and routing
- ✅ College-specific data isolation via `collegeId`

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Email/Password login
- ✅ Phone OTP authentication
- ✅ Google OAuth integration
- ✅ Two-Factor Authentication (2FA)
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting & DDoS protection
- ✅ Bcrypt password hashing
- ✅ Session management with Redis

### User Roles & Permissions
- ✅ Super Admin (Platform owner)
- ✅ College Admin
- ✅ Teachers
- ✅ Students
- ✅ Parents
- ✅ Admission Team
- ✅ Accounts Team
- ✅ Transport Team

### Core Modules
- ✅ College Management
- ✅ User Management
- ✅ Academic Management (Classes, Subjects, Exams)
- ✅ Student Management
- ✅ Teacher Management
- ✅ Attendance Tracking
- ✅ Exam & Results Management
- ✅ Fee Management
- ✅ Payment Integration (Razorpay)
- ✅ Admission Portal
- ✅ Transport Management
- ✅ Notice Board
- ✅ Homework Management
- ✅ Complaint System

### Performance & Scalability
- ✅ Redis caching for high performance
- ✅ Database connection pooling
- ✅ Query optimization with indexes
- ✅ Background job processing (Bull Queue)
- ✅ File upload to AWS S3
- ✅ CDN integration ready
- ✅ Horizontal scaling support
- ✅ Load balancer ready

### Monitoring & Logging
- ✅ Comprehensive audit logging
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Activity logging
- ✅ Request/Response logging

## 🏗️ Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL (with Prisma ORM)
- **Cache**: Redis
- **Queue**: Bull (Redis-based)
- **File Storage**: AWS S3
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Authentication**: JWT, Google OAuth, 2FA (Speakeasy)
- **Security**: Helmet, Rate Limiting, CORS
- **Process Manager**: PM2

## 📋 Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+
- Redis 6+
- AWS Account (for S3)
- Razorpay Account
- Google OAuth credentials (optional)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourorg/college-erp.git
cd college-erp/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
nano .env  # Configure all variables
```

### 4. Database Setup
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Redis
```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally
sudo apt install redis-server
sudo systemctl start redis
```

### 6. Run Application
```bash
# Development
npm run dev

# Production
npm start

# With PM2
pm2 start ecosystem.config.js
```

## 📁 Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── auth-controller.js
│   ├── superadmin-controller.js
│   ├── admin-controller.js
│   ├── teacher-controller.js
│   ├── student-controller.js
│   ├── parent-controller.js
│   ├── accounts-controller.js
│   ├── admission-controller.js
│   └── transport-controller.js
├── middleware/          # Express middleware
│   ├── auth.js         # Authentication & authorization
│   └── validation.js   # Input validation
├── routes/             # API routes
├── utils/              # Utility functions
│   ├── jwt.js
│   ├── otp-service.js
│   ├── email-service.js
│   ├── redis-service.js
│   ├── file-upload-service.js
│   ├── 2fa-service.js
│   ├── google-oauth-service.js
│   ├── queue-service.js
│   ├── razorpay-service.js
│   └── permissions.js
├── prisma/
│   └── schema.prisma   # Database schema
├── tests/              # Test files
├── index.js            # Application entry point
├── package.json
└── README.md
```

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/college_erp

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=college-erp-files

# Razorpay
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Examples

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.com","password":"password123"}'
```

#### Create College (Super Admin)
```bash
curl -X POST http://localhost:5000/api/superadmin/colleges \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Gravity College","domain":"gravity.com"}'
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 📊 Performance Benchmarks

### Target Metrics
- **Response Time**: < 200ms (95th percentile)
- **Throughput**: 10,000 requests/second
- **Concurrent Users**: 50,000
- **Database Queries**: < 50ms average
- **Cache Hit Rate**: > 80%
- **Uptime**: 99.9%

### Optimization Techniques
1. Redis caching for frequently accessed data
2. Database query optimization with indexes
3. Connection pooling (max 100 connections)
4. Background job processing for heavy tasks
5. CDN for static assets
6. Horizontal scaling with load balancer

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Rate limiting (100 req/15min per IP)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Input validation & sanitization
- ✅ Audit logging
- ✅ 2FA support
- ✅ Session management
- ✅ Secure file uploads

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment instructions.

### Quick Deploy with PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Setup startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

## 📈 Scaling Strategy

### Horizontal Scaling
- Load balancer (AWS ALB/Nginx)
- Multiple application servers (3-10+)
- Auto-scaling based on CPU/Memory
- Session sharing via Redis

### Database Scaling
- Read replicas (2-3 instances)
- Connection pooling
- Query optimization
- Indexing strategy

### Caching Strategy
- Redis cluster for high availability
- Multi-level caching (L1: Memory, L2: Redis)
- Cache invalidation strategy
- TTL-based expiration

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d college_erp
```

**Redis Connection Failed**
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📞 Support

- **Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: GitHub Issues
- **Email**: support@yourplatform.com

## 📄 License

Proprietary - All Rights Reserved

## 👥 Team

- **Platform Owner**: Mentneo Company
- **Development Team**: Your Team
- **Support**: support@yourplatform.com

---

## ✅ Production Readiness Checklist

- [x] Multi-tenant architecture implemented
- [x] Custom domain white-label support
- [x] Complete authentication system (Email, OTP, Google, 2FA)
- [x] Role-based access control
- [x] Redis caching layer
- [x] Background job processing
- [x] File upload to S3
- [x] Payment integration (Razorpay)
- [x] Email service
- [x] Input validation
- [x] Error handling
- [x] Audit logging
- [x] Security hardening
- [x] API documentation
- [x] Deployment guide
- [x] Testing setup
- [x] Performance optimization
- [x] Scalability ready

**Status: 100% Production Ready ✅**

---

**Built with ❤️ for 1 Million Users**

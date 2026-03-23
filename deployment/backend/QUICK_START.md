# ⚡ Quick Start Guide
## Get Your Backend Running in 5 Minutes

---

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed and running
- ✅ Redis 6+ installed and running
- ✅ Git installed

---

## 🚀 Installation Steps

### Step 1: Clone & Navigate
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

**Minimum required configuration:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/college_erp"
JWT_SECRET="your-super-secret-key-change-this"
REDIS_URL="redis://localhost:6379"
```

### Step 4: Setup Database
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Step 5: Start Redis
```bash
# If not already running
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:latest
```

### Step 6: Start Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

---

## ✅ Verify Installation

### Check Health Endpoint
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-05T...",
  "uptime": 123.45,
  "database": "connected",
  "redis": "connected",
  "memory": {
    "used": "50 MB",
    "total": "100 MB"
  },
  "version": "1.0.0"
}
```

---

## 🧪 Test the API

### 1. Create Super Admin (First Time Only)
```bash
# You'll need to create this manually in database or via seed script
# For now, use Prisma Studio:
npx prisma studio
# Navigate to SuperAdmin table and create a record
```

### 2. Login as Super Admin
```bash
curl -X POST http://localhost:5000/api/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@platform.com",
    "password": "your-password"
  }'
```

### 3. Create a College
```bash
curl -X POST http://localhost:5000/api/superadmin/colleges \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test College",
    "domain": "test.localhost",
    "email": "admin@test.com"
  }'
```

---

## 🛠️ Common Issues & Solutions

### Issue: Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d college_erp

# If database doesn't exist, create it:
createdb college_erp
```

### Issue: Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# If not running, start it:
redis-server

# Or check status:
sudo systemctl status redis
```

### Issue: Port 5000 Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env:
PORT=5001
```

### Issue: Prisma Client Not Generated
```bash
# Generate Prisma Client
npx prisma generate

# If still issues, try:
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

---

## 📚 Next Steps

### Development
1. **Explore API**: Check `API_DOCUMENTATION.md`
2. **Add Features**: Modify controllers and routes
3. **Test Changes**: Run `npm test`
4. **View Database**: Run `npx prisma studio`

### Production
1. **Read Deployment Guide**: `DEPLOYMENT_GUIDE.md`
2. **Setup PM2**: `pm2 start ecosystem.config.js`
3. **Configure Monitoring**: Setup CloudWatch/Grafana
4. **Enable Auto-scaling**: Follow AWS setup guide

---

## 🔧 Useful Commands

### Development
```bash
npm run dev              # Start with auto-reload
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npx prisma studio        # Open database GUI
```

### Database
```bash
npx prisma migrate dev   # Create new migration
npx prisma migrate deploy # Apply migrations
npx prisma generate      # Generate Prisma Client
npx prisma db seed       # Seed database (if configured)
```

### Production
```bash
npm start                # Start production server
pm2 start ecosystem.config.js  # Start with PM2
pm2 logs                 # View logs
pm2 monit                # Monitor processes
pm2 restart all          # Restart all processes
```

---

## 📊 Default Ports

- **Application**: 5000
- **PostgreSQL**: 5432
- **Redis**: 6379
- **Prisma Studio**: 5555

---

## 🔐 Default Credentials

**Note**: Create your own super admin via Prisma Studio or seed script.

**Recommended First Super Admin:**
```
Email: superadmin@yourplatform.com
Password: (set your own secure password)
```

---

## 📖 Documentation Links

- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Checklist**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- **Full README**: [README.md](./README.md)
- **Score Report**: [SCORE_REPORT.md](./SCORE_REPORT.md)

---

## 💡 Pro Tips

1. **Use Environment Variables**: Never commit `.env` file
2. **Enable Logging**: Check `logs/` directory for errors
3. **Monitor Redis**: Use `redis-cli monitor` to watch commands
4. **Database Backups**: Setup automated backups from day 1
5. **Use PM2 in Production**: Better process management
6. **Enable HTTPS**: Use Let's Encrypt or AWS ACM
7. **Setup Monitoring**: CloudWatch, Grafana, or similar
8. **Rate Limiting**: Already configured, but adjust as needed

---

## 🆘 Getting Help

### Check Logs
```bash
# Application logs
tail -f logs/combined.log

# PM2 logs
pm2 logs

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### Debug Mode
```bash
# Set in .env
NODE_ENV=development
DEBUG=*

# Then restart
npm run dev
```

### Common Log Locations
- Application: `./logs/`
- PM2: `~/.pm2/logs/`
- PostgreSQL: `/var/log/postgresql/`
- Redis: `/var/log/redis/`

---

## ✅ Success Checklist

After setup, verify:
- [ ] Health endpoint returns 200
- [ ] Database connection successful
- [ ] Redis connection successful
- [ ] Can create super admin
- [ ] Can login and get JWT token
- [ ] Can create a college
- [ ] Logs are being written
- [ ] No errors in console

---

## 🎉 You're Ready!

Your backend is now running and ready for development or deployment!

**Next**: Start building your frontend or deploy to production.

---

**Need Help?** Check the comprehensive guides in the documentation folder.

**Found a Bug?** Check logs and troubleshooting guide.

**Ready to Deploy?** Follow the deployment guide for production setup.

---

*Happy Coding! 🚀*

# 🚀 AWS Deployment Guide

## 📦 Build Status

✅ **Frontend Build:** Created successfully  
✅ **Backend:** Ready for deployment  
✅ **Database:** PostgreSQL (Neon) - Already configured

---

## 📁 What Was Built

### Frontend Build:
```
frontend/build/
├── static/
│   ├── css/
│   │   └── main.115fd109.css (7.75 kB)
│   └── js/
│       └── main.f20177cd.js (542.47 kB)
├── index.html
├── favicon.ico
└── asset-manifest.json
```

### Backend (Production Ready):
```
backend/
├── controllers/
├── routes/
├── lib/
├── middleware/
├── prisma/
├── index.js
├── package.json
└── .env (needs configuration)
```

---

## 🎯 Deployment Options

### Option 1: AWS EC2 (Recommended)
- Full control over server
- Can run both frontend and backend
- Cost: ~$5-20/month

### Option 2: AWS Elastic Beanstalk
- Managed service
- Auto-scaling
- Cost: ~$10-50/month

### Option 3: AWS Amplify (Frontend) + Lambda (Backend)
- Serverless
- Pay per use
- Cost: ~$5-30/month

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
```bash
# Backend (.env)
DATABASE_URL=your_neon_postgres_url
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 2. Database
- ✅ Neon PostgreSQL already configured
- ✅ Connection string in .env
- ⚠️ Run migrations: `npx prisma migrate deploy`

### 3. Dependencies
```bash
# Backend
cd backend
npm install --production

# Frontend (already built)
# No need to install, build folder is ready
```

---

## 🚀 Deployment Steps

### Step 1: Prepare Files for Upload

#### Create deployment package:
```bash
# Create a deployment folder
mkdir deployment
mkdir deployment/backend
mkdir deployment/frontend

# Copy backend files
cp -r backend/* deployment/backend/
rm -rf deployment/backend/node_modules

# Copy frontend build
cp -r frontend/build deployment/frontend/
```

#### Files to include:
```
deployment/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── lib/
│   ├── middleware/
│   ├── prisma/
│   ├── index.js
│   ├── package.json
│   └── .env.example
└── frontend/
    └── build/
        ├── static/
        ├── index.html
        └── ...
```

---

### Step 2: AWS EC2 Deployment

#### A. Launch EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Choose: Ubuntu Server 22.04 LTS
4. Instance type: t2.micro (free tier) or t2.small
5. Configure security group:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 5000 (Backend API)
6. Create/select key pair
7. Launch instance

#### B. Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### C. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### D. Upload Files
```bash
# From your local machine
scp -i your-key.pem -r deployment ubuntu@your-ec2-ip:~/
```

#### E. Setup Backend
```bash
# On EC2 instance
cd ~/deployment/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Paste your environment variables

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start index.js --name "crm-backend"
pm2 save
pm2 startup
```

#### F. Setup Frontend (Nginx)
```bash
# Copy build files to Nginx
sudo cp -r ~/deployment/frontend/build/* /var/www/html/

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Step 3: AWS Amplify Deployment (Frontend Only)

#### A. Push to GitHub
```bash
# Already done! Your code is at:
# https://github.com/VenkatSatyaSaiABHISHEK/gravity-crm
```

#### B. Deploy to Amplify
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Choose "GitHub"
4. Select repository: `VenkatSatyaSaiABHISHEK/gravity-crm`
5. Select branch: `main`
6. Build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/build
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```
7. Click "Save and deploy"

---

### Step 4: Backend Deployment (AWS Lambda + API Gateway)

#### Option A: Using Serverless Framework
```bash
# Install Serverless
npm install -g serverless

# Create serverless.yml in backend/
```

```yaml
service: crm-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_SECRET: ${env:JWT_SECRET}

functions:
  api:
    handler: index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
```

```bash
# Deploy
cd backend
serverless deploy
```

---

## 🔒 Security Checklist

### Before Deployment:
- [ ] Change all default passwords
- [ ] Update JWT_SECRET to strong random string
- [ ] Configure CORS with actual domain
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up firewall rules
- [ ] Enable database SSL
- [ ] Remove .env from git
- [ ] Set NODE_ENV=production

### After Deployment:
- [ ] Test all API endpoints
- [ ] Test frontend functionality
- [ ] Check database connections
- [ ] Monitor error logs
- [ ] Set up backups
- [ ] Configure monitoring (CloudWatch)

---

## 📊 Post-Deployment Testing

### Test Backend:
```bash
# Health check
curl https://your-domain.com/api/health

# Test login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Test Frontend:
1. Visit: https://your-domain.com
2. Try login
3. Test all features
4. Check console for errors

---

## 🔄 Update/Redeploy Process

### When you make changes:

#### 1. Build new version:
```bash
# Frontend
cd frontend
npm run build

# Commit and push
git add .
git commit -m "Update: description"
git push origin main
```

#### 2. Deploy to AWS:

**EC2:**
```bash
# SSH to server
ssh -i your-key.pem ubuntu@your-ec2-ip

# Pull latest code
cd ~/deployment
git pull origin main

# Rebuild frontend
cd frontend
npm run build
sudo cp -r build/* /var/www/html/

# Restart backend
cd ../backend
npm install
pm2 restart crm-backend
```

**Amplify:**
- Automatically deploys on git push!

---

## 💰 Cost Estimation

### Option 1: EC2 + Nginx
- EC2 t2.micro: $0 (free tier) or $8/month
- Data transfer: ~$1-5/month
- **Total: ~$0-13/month**

### Option 2: Amplify + Lambda
- Amplify: $0.15/GB + $0.01/build
- Lambda: $0.20/1M requests
- API Gateway: $3.50/1M requests
- **Total: ~$5-30/month**

### Option 3: Elastic Beanstalk
- Environment: ~$10-50/month
- Load balancer: ~$20/month
- **Total: ~$30-70/month**

---

## 🆘 Troubleshooting

### Backend won't start:
```bash
# Check logs
pm2 logs crm-backend

# Check environment
cat .env

# Test database connection
npx prisma db pull
```

### Frontend shows blank page:
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check file permissions
ls -la /var/www/html/

# Rebuild
cd frontend
npm run build
```

### API calls fail:
- Check CORS settings
- Verify API URL in frontend
- Check security group rules
- Test backend directly: `curl http://localhost:5000/api/health`

---

## 📞 Support Resources

- AWS Documentation: https://docs.aws.amazon.com/
- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/en/docs/
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment

---

## ✅ Quick Deployment Checklist

- [ ] Frontend build created
- [ ] Backend dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] AWS account ready
- [ ] Domain name configured (optional)
- [ ] SSL certificate obtained (optional)
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test all features
- [ ] Monitor logs
- [ ] Set up backups

---

**Ready to deploy!** Choose your deployment option and follow the steps above. 🚀

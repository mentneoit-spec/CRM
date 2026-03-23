# 🚀 Deployment Package - Gravity CRM

This folder contains production-ready files for AWS deployment.

## 📦 Package Contents

```
deployment/
├── backend/          # Backend API (Node.js + Express + Prisma)
├── frontend/         # Frontend Build (React production build)
├── deploy.sh         # Deployment script for Linux/Mac
├── deploy.ps1        # Deployment script for Windows
└── README.md         # This file
```

## 🎯 Quick Deploy to AWS EC2

### Prerequisites
- AWS EC2 instance running Ubuntu 22.04
- SSH key pair (.pem file)
- Domain name (optional)

### Step 1: Upload Files to EC2

```bash
# Replace with your EC2 details
scp -i your-key.pem -r deployment ubuntu@your-ec2-ip:~/
```

### Step 2: SSH into EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Run Deployment Script

```bash
cd ~/deployment
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Install Node.js 18
2. Install Nginx
3. Install PM2
4. Setup backend with dependencies
5. Configure Nginx for frontend
6. Start backend with PM2
7. Configure SSL (optional)

## 🔧 Manual Deployment Steps

### Backend Setup

```bash
cd ~/deployment/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

Add these environment variables:
```env
DATABASE_URL=postgresql://neondb_owner:npg_HelXW2BJo9Kj@ep-steep-flower-ad8g8g9h-pooler.c-2.us-east-1.aws.neon.tech/Crm?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.com,http://your-ec2-ip

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=svljyothikanookala@gmail.com
EMAIL_PASSWORD=your-app-password
```

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start with PM2
pm2 start index.js --name "gravity-crm"
pm2 save
pm2 startup
```

### Frontend Setup (Nginx)

```bash
# Install Nginx
sudo apt update
sudo apt install -y nginx

# Copy frontend files
sudo cp -r ~/deployment/frontend/* /var/www/html/

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Security Setup

### 1. Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Install SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Update Environment Variables

Change these in `backend/.env`:
- `JWT_SECRET` - Use a strong random string
- `ALLOWED_ORIGINS` - Add your actual domain
- `EMAIL_PASSWORD` - Use Gmail App Password

## 📊 Monitoring

### Check Backend Status
```bash
pm2 status
pm2 logs gravity-crm
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Check Database Connection
```bash
cd ~/deployment/backend
npx prisma db pull
```

## 🔄 Update/Redeploy

When you make changes and want to redeploy:

```bash
# On your local machine
cd frontend
npm run build

# Commit and push to GitHub
git add .
git commit -m "Update: description"
git push origin main

# On EC2 server
cd ~/deployment
git pull origin main

# Update frontend
sudo cp -r frontend/* /var/www/html/

# Update backend
cd backend
npm install
pm2 restart gravity-crm
```

## 🆘 Troubleshooting

### Backend won't start
```bash
pm2 logs gravity-crm
cat backend/.env
```

### Frontend shows blank page
```bash
sudo tail -f /var/log/nginx/error.log
ls -la /var/www/html/
```

### API calls fail
- Check CORS in backend/.env
- Verify Nginx proxy configuration
- Check security group rules in AWS

## 📞 Support

For detailed deployment guide, see: `../AWS_DEPLOYMENT_GUIDE.md`

---

**Ready to deploy!** 🚀

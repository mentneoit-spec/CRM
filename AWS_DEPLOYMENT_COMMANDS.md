# 🚀 AWS Deployment Commands - Quick Reference

## ✅ Everything is Ready in GitHub!

**Repository:** https://github.com/VenkatSatyaSaiABHISEK/gravity-crm

The `deployment/` folder contains:
- ✅ Backend (complete with all files)
- ✅ Frontend (production build)
- ✅ Deployment scripts
- ✅ Documentation

---

## 📋 Step-by-Step AWS EC2 Deployment

### Step 1: Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Clone Repository
```bash
cd ~
git clone https://github.com/VenkatSatyaSaiABHISEK/gravity-crm.git
cd gravity-crm/deployment
```

### Step 3: Create Environment File
```bash
nano backend/.env
```

**Copy and paste this (update the values):**
```env
DATABASE_URL=postgresql://neondb_owner:npg_HelXW2BJo9Kj@ep-steep-flower-ad8g8g9h-pooler.c-2.us-east-1.aws.neon.tech/Crm?sslmode=require
JWT_SECRET=change-this-to-a-super-secret-random-string-min-32-characters
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=http://YOUR_EC2_IP,https://your-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=svljyothikanookala@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
REDIS_ENABLED=false
```

**Important:** Replace:
- `YOUR_EC2_IP` with your actual EC2 public IP
- `your-gmail-app-password` with your Gmail App Password
- `JWT_SECRET` with a strong random string

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 4: Run Deployment Script
```bash
chmod +x deploy.sh
./deploy.sh
```

This will automatically:
- Install Node.js 18
- Install Nginx
- Install PM2
- Setup backend
- Setup frontend
- Configure everything

**Wait 5-10 minutes for installation to complete.**

### Step 5: Verify Deployment
```bash
# Check backend status
pm2 status

# Check backend logs
pm2 logs gravity-crm

# Check Nginx status
sudo systemctl status nginx
```

### Step 6: Access Your Application
Open browser and go to:
- **Frontend:** `http://YOUR_EC2_IP`
- **Backend API:** `http://YOUR_EC2_IP/api`

---

## 🔄 Update/Redeploy After Making Changes

### When you make changes locally:

1. **Build frontend:**
```bash
cd frontend
npm run build
```

2. **Commit and push:**
```bash
git add .
git commit -m "Update: your changes"
git push origin main
```

3. **On EC2, pull and update:**
```bash
cd ~/gravity-crm
git pull origin main

# Update frontend
sudo cp -r deployment/frontend/* /var/www/html/

# Update backend
cd deployment/backend
npm install
pm2 restart gravity-crm
```

---

## 🆘 Troubleshooting Commands

### Backend Issues:
```bash
# View backend logs
pm2 logs gravity-crm

# Restart backend
pm2 restart gravity-crm

# Check backend status
pm2 status

# View environment variables
cat ~/gravity-crm/deployment/backend/.env
```

### Frontend Issues:
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check frontend files
ls -la /var/www/html/
```

### Database Issues:
```bash
cd ~/gravity-crm/deployment/backend

# Test database connection
npx prisma db pull

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Port Issues:
```bash
# Check what's running on ports
sudo netstat -tulpn | grep LISTEN

# Check if port 5000 is in use
sudo lsof -i :5000

# Check if port 80 is in use
sudo lsof -i :80
```

---

## 🔒 Security Setup (After Basic Deployment)

### 1. Configure Firewall:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Install SSL Certificate (Optional):
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## 📊 Monitoring Commands

### Check System Resources:
```bash
# CPU and Memory usage
htop

# Disk usage
df -h

# Check running processes
ps aux | grep node
```

### Check Application Health:
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:80
```

---

## 🎯 Quick Commands Reference

| Task | Command |
|------|---------|
| View backend logs | `pm2 logs gravity-crm` |
| Restart backend | `pm2 restart gravity-crm` |
| Stop backend | `pm2 stop gravity-crm` |
| Start backend | `pm2 start gravity-crm` |
| Restart Nginx | `sudo systemctl restart nginx` |
| View Nginx logs | `sudo tail -f /var/log/nginx/error.log` |
| Pull latest code | `cd ~/gravity-crm && git pull origin main` |
| Update frontend | `sudo cp -r deployment/frontend/* /var/www/html/` |
| Update backend | `cd deployment/backend && npm install && pm2 restart gravity-crm` |

---

## ✅ Deployment Checklist

- [ ] EC2 instance launched (Ubuntu 22.04)
- [ ] Security group configured (ports 22, 80, 443)
- [ ] SSH key downloaded
- [ ] Connected to EC2 via SSH
- [ ] Repository cloned
- [ ] .env file created with correct values
- [ ] deploy.sh script executed
- [ ] Backend running (pm2 status shows "online")
- [ ] Nginx running (systemctl status nginx shows "active")
- [ ] Application accessible at http://YOUR_EC2_IP
- [ ] Login tested with admin credentials
- [ ] All features working

---

## 🎉 Success!

If you can access your application at `http://YOUR_EC2_IP`, congratulations! Your Gravity CRM is now live on AWS!

**Next Steps:**
1. Configure your domain DNS to point to EC2 IP
2. Install SSL certificate for HTTPS
3. Test all features thoroughly
4. Set up monitoring and backups

---

**Last Updated:** March 24, 2026  
**Repository:** https://github.com/VenkatSatyaSaiABHISEK/gravity-crm

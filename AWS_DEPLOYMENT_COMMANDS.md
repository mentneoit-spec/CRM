# 🚀 AWS Deployment Commands - Step by Step

## Prerequisites

Before starting, you need:
- AWS account
- EC2 instance running Ubuntu 22.04
- SSH key pair (.pem file)
- Your EC2 instance IP address

---

## STEP 1: Launch AWS EC2 Instance

### 1.1 Go to AWS Console
```
https://console.aws.amazon.com/ec2/
```

### 1.2 Launch Instance Settings
- **Name:** gravity-crm-server
- **AMI:** Ubuntu Server 22.04 LTS
- **Instance Type:** t2.micro (free tier) or t2.small
- **Key Pair:** Create new or use existing (.pem file)
- **Security Group:** Create with these rules:
  - SSH (22) - Your IP
  - HTTP (80) - Anywhere
  - HTTPS (443) - Anywhere

### 1.3 Download Key Pair
Save the `.pem` file (e.g., `gravity-crm-key.pem`)

---

## STEP 2: Prepare Your Local Machine

### 2.1 Set Key Permissions (Linux/Mac)
```bash
chmod 400 gravity-crm-key.pem
```

### 2.2 Set Key Permissions (Windows PowerShell)
```powershell
icacls gravity-crm-key.pem /inheritance:r
icacls gravity-crm-key.pem /grant:r "%USERNAME%:R"
```

---

## STEP 3: Upload Deployment Package to EC2

### Option A: Upload from Local (Recommended)

**From your project directory:**

```bash
# Replace YOUR_EC2_IP with your actual EC2 IP address
scp -i gravity-crm-key.pem -r deployment ubuntu@YOUR_EC2_IP:~/
```

**Example:**
```bash
scp -i gravity-crm-key.pem -r deployment ubuntu@54.123.45.67:~/
```

### Option B: Clone from GitHub

```bash
# SSH into EC2 first
ssh -i gravity-crm-key.pem ubuntu@YOUR_EC2_IP

# Then clone
git clone https://github.com/VenkatSatyaSaiABHISEK/gravity-crm.git
cd gravity-crm/deployment
```

---

## STEP 4: SSH into EC2 Instance

```bash
ssh -i gravity-crm-key.pem ubuntu@YOUR_EC2_IP
```

**Example:**
```bash
ssh -i gravity-crm-key.pem ubuntu@54.123.45.67
```

---

## STEP 5: Create Environment File

### 5.1 Navigate to Backend
```bash
cd ~/deployment/backend
```

### 5.2 Create .env File
```bash
nano .env
```

### 5.3 Paste This Configuration
```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_HelXW2BJo9Kj@ep-steep-flower-ad8g8g9h-pooler.c-2.us-east-1.aws.neon.tech/Crm?sslmode=require

# Server Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=gravity-crm-super-secret-jwt-key-2026-production-min-32-chars

# CORS Configuration (REPLACE YOUR_EC2_IP with actual IP)
ALLOWED_ORIGINS=http://YOUR_EC2_IP,http://localhost:3002

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=svljyothikanookala@gmail.com
EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD

# Redis Configuration
REDIS_ENABLED=false

# Optional Services
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### 5.4 Update These Values:
- Replace `YOUR_EC2_IP` with your actual EC2 IP (e.g., `54.123.45.67`)
- Replace `YOUR_GMAIL_APP_PASSWORD` with your Gmail App Password

### 5.5 Save and Exit
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

---

## STEP 6: Run Deployment Script

### 6.1 Navigate to Deployment Folder
```bash
cd ~/deployment
```

### 6.2 Make Script Executable
```bash
chmod +x deploy.sh
```

### 6.3 Run Deployment Script
```bash
./deploy.sh
```

**This will automatically:**
- Install Node.js 18
- Install Nginx
- Install PM2
- Install backend dependencies
- Generate Prisma client
- Run database migrations
- Start backend with PM2
- Configure Nginx
- Setup firewall

**Wait 5-10 minutes for completion.**

---

## STEP 7: Verify Deployment

### 7.1 Check Backend Status
```bash
pm2 status
```

**Expected output:**
```
┌─────┬──────────────┬─────────┬─────────┬─────────┐
│ id  │ name         │ status  │ restart │ uptime  │
├─────┼──────────────┼─────────┼─────────┼─────────┤
│ 0   │ gravity-crm  │ online  │ 0       │ 2m      │
└─────┴──────────────┴─────────┴─────────┴─────────┘
```

### 7.2 Check Backend Logs
```bash
pm2 logs gravity-crm --lines 50
```

### 7.3 Check Nginx Status
```bash
sudo systemctl status nginx
```

### 7.4 Test Backend API
```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"success":true,"message":"API is running"}
```

---

## STEP 8: Access Your Application

### 8.1 Open Browser
```
http://YOUR_EC2_IP
```

**Example:**
```
http://54.123.45.67
```

### 8.2 Test Login
- Email: `admin@example.com`
- Password: `admin123`

---

## STEP 9: Configure Domain (Optional)

### 9.1 Point Domain to EC2
In your domain registrar (GoDaddy, Namecheap, etc.):
- Create A record
- Point to your EC2 IP

### 9.2 Update .env File
```bash
nano ~/deployment/backend/.env
```

Update ALLOWED_ORIGINS:
```env
ALLOWED_ORIGINS=https://yourdomain.com,http://YOUR_EC2_IP
```

### 9.3 Restart Backend
```bash
pm2 restart gravity-crm
```

---

## STEP 10: Install SSL Certificate (Optional)

### 10.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 10.2 Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```

### 10.3 Follow Prompts
- Enter email
- Agree to terms
- Choose redirect HTTP to HTTPS

### 10.4 Test Auto-Renewal
```bash
sudo certbot renew --dry-run
```

---

## 🔄 REDEPLOYMENT COMMANDS (After Making Changes)

### When You Update Code Locally:

#### 1. Build Frontend
```bash
cd frontend
npm run build
```

#### 2. Commit and Push
```bash
git add .
git commit -m "Update: your changes"
git push origin main
```

#### 3. SSH to EC2
```bash
ssh -i gravity-crm-key.pem ubuntu@YOUR_EC2_IP
```

#### 4. Pull Latest Changes
```bash
cd ~/deployment
git pull origin main
```

#### 5. Update Frontend
```bash
sudo cp -r frontend/* /var/www/html/
```

#### 6. Update Backend (if backend changed)
```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
pm2 restart gravity-crm
```

#### 7. Verify
```bash
pm2 logs gravity-crm
```

---

## 🛠️ USEFUL COMMANDS

### Backend Management
```bash
# Check status
pm2 status

# View logs
pm2 logs gravity-crm

# Restart backend
pm2 restart gravity-crm

# Stop backend
pm2 stop gravity-crm

# Start backend
pm2 start gravity-crm
```

### Nginx Management
```bash
# Check status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log

# Test configuration
sudo nginx -t
```

### Database Management
```bash
cd ~/deployment/backend

# Check connection
npx prisma db pull

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio (view data)
npx prisma studio
```

### System Management
```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check running processes
ps aux | grep node
```

---

## 🆘 TROUBLESHOOTING

### Problem: Backend won't start

**Solution:**
```bash
# Check logs
pm2 logs gravity-crm

# Check .env file
cat ~/deployment/backend/.env

# Restart
pm2 restart gravity-crm
```

### Problem: Frontend shows blank page

**Solution:**
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check files
ls -la /var/www/html/

# Recopy files
sudo cp -r ~/deployment/frontend/* /var/www/html/
sudo systemctl restart nginx
```

### Problem: API calls fail (CORS error)

**Solution:**
```bash
# Update .env
nano ~/deployment/backend/.env

# Add your EC2 IP to ALLOWED_ORIGINS
ALLOWED_ORIGINS=http://YOUR_EC2_IP,http://localhost:3002

# Restart backend
pm2 restart gravity-crm
```

### Problem: Database connection error

**Solution:**
```bash
# Test connection
cd ~/deployment/backend
npx prisma db pull

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Problem: Port 5000 already in use

**Solution:**
```bash
# Find process
sudo lsof -i :5000

# Kill process
sudo kill -9 PROCESS_ID

# Restart
pm2 restart gravity-crm
```

---

## 📊 MONITORING

### Check Application Health
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend
curl http://localhost/

# Check all PM2 processes
pm2 monit
```

### View Real-time Logs
```bash
# Backend logs
pm2 logs gravity-crm --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 SECURITY CHECKLIST

After deployment:
- [ ] Changed JWT_SECRET
- [ ] Updated ALLOWED_ORIGINS
- [ ] Using Gmail App Password
- [ ] Firewall enabled (UFW)
- [ ] SSL certificate installed
- [ ] Security group configured
- [ ] Regular backups enabled

---

## 💰 COST ESTIMATE

- **EC2 t2.micro:** FREE (first 12 months) or $8/month
- **Data Transfer:** ~$1-5/month
- **SSL Certificate:** FREE (Let's Encrypt)
- **Total:** $0-13/month

---

## 📞 SUPPORT

- **GitHub:** https://github.com/VenkatSatyaSaiABHISEK/gravity-crm
- **AWS Docs:** https://docs.aws.amazon.com/ec2/
- **PM2 Docs:** https://pm2.keymetrics.io/

---

**Ready to deploy!** Follow the steps above in order. 🚀

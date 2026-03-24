# ✅ ERROR FIXED: API Connection Issue Resolved!

## 🐛 The Problem

**Error:** "Network error. Please check your connection."  
**Console Error:** `Failed to load resource: net::ERR_CONNECTION_REFUSED`

The frontend was trying to connect to `http://localhost:5001/api` but the backend runs on `http://localhost:5000/api`.

## ✅ The Fix

**File Changed:** `frontend/src/config/api.js`

**Line 9 - Changed from:**
```javascript
return 'http://localhost:5001/api';  // ❌ WRONG PORT
```

**To:**
```javascript
return 'http://localhost:5000/api';  // ✅ CORRECT PORT
```

## 📦 What Was Updated

1. ✅ Fixed API port in `frontend/src/config/api.js`
2. ✅ Rebuilt frontend with correct configuration
3. ✅ Updated deployment folder with new build
4. ✅ Pushed to GitHub

**Commit:** `af8e880` - "fix: Change API port from 5001 to 5000 - fixes connection refused error"

## 🚀 Now Deploy to AWS

The fix is now in GitHub. Deploy with these commands:

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Remove old code
rm -rf ~/gravity-crm

# Clone fresh with fix
git clone https://github.com/VenkatSatyaSaiABHISEK/gravity-crm.git
cd gravity-crm

# Deploy backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy

# Create .env
nano .env
```

**Add to .env:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_HelXW2BJo9Kj@ep-steep-flower-ad8g8g9h-pooler.c-2.us-east-1.aws.neon.tech/Crm?sslmode=require
JWT_SECRET=gravity-crm-secret-2026-change-this-random
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=http://YOUR_EC2_IP,https://your-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=svljyothikanookala@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
REDIS_ENABLED=false
```

```bash
# Start backend
pm2 start index.js --name gravity-crm
pm2 save
pm2 startup

# Deploy frontend
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name _;
    
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
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
# Restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## ✅ Test Locally First

Before deploying to AWS, test locally:

1. Make sure backend is running on port 5000:
```bash
cd backend
npm start
# Should show: "Server running on port 5000"
```

2. Start frontend on port 3002:
```bash
cd frontend
npm start
# Opens at http://localhost:3002
```

3. Try logging in - should work now!

## 🎯 What This Fixes

- ✅ Login page will connect to backend
- ✅ No more "Network error" message
- ✅ No more "ERR_CONNECTION_REFUSED" in console
- ✅ API calls will work properly
- ✅ Authentication will work
- ✅ All features will function

## 📊 Verification

After deployment, verify:

```bash
# Check backend is running on port 5000
pm2 status
# Should show "gravity-crm" as "online"

# Test backend API
curl http://localhost:5000/api/health
# Should return success

# Check frontend
curl http://localhost/
# Should return HTML

# Test from browser
# Open: http://YOUR_EC2_IP
# Login page should load and connect to backend
```

## 🆘 If Still Getting Errors

### Error: "Cannot connect to backend"
```bash
# Check if backend is running
pm2 logs gravity-crm

# Check if port 5000 is listening
sudo netstat -tulpn | grep 5000

# Restart backend
pm2 restart gravity-crm
```

### Error: "CORS error"
```bash
# Check ALLOWED_ORIGINS in .env
cat backend/.env | grep ALLOWED_ORIGINS

# Should include your EC2 IP or domain
# Update if needed:
nano backend/.env
# Add: ALLOWED_ORIGINS=http://YOUR_EC2_IP

# Restart
pm2 restart gravity-crm
```

## ✅ Summary

**Problem:** Frontend was connecting to wrong port (5001 instead of 5000)  
**Solution:** Fixed API configuration to use port 5000  
**Status:** ✅ FIXED and pushed to GitHub  
**Next Step:** Deploy to AWS using commands above

---

**Fixed:** March 24, 2026  
**Commit:** af8e880  
**Repository:** https://github.com/VenkatSatyaSaiABHISEK/gravity-crm  
**Status:** ✅ READY TO DEPLOY

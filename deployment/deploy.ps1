# Gravity CRM - Windows Deployment Helper Script
# This script helps prepare files for AWS deployment on Windows

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Gravity CRM - Windows Deployment Helper                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running in deployment folder
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Please run this script from the deployment folder" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Checking deployment package..." -ForegroundColor Yellow

# Check backend files
if (Test-Path "backend/index.js") {
    Write-Host "✓ Backend files found" -ForegroundColor Green
} else {
    Write-Host "✗ Backend files missing" -ForegroundColor Red
    exit 1
}

# Check frontend build
if (Test-Path "frontend/index.html") {
    Write-Host "✓ Frontend build found" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend build missing" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/5] Creating .env.example for backend..." -ForegroundColor Yellow

# Create .env.example
$envExample = @"
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_HelXW2BJo9Kj@ep-steep-flower-ad8g8g9h-pooler.c-2.us-east-1.aws.neon.tech/Crm?sslmode=require

# Server Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=change-this-to-a-strong-random-secret

# CORS Configuration
ALLOWED_ORIGINS=https://your-domain.com,http://your-ec2-ip

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=svljyothikanookala@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Redis Configuration (Optional)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Razorpay Configuration (Optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
"@

Set-Content -Path "backend/.env.example" -Value $envExample
Write-Host "✓ Created backend/.env.example" -ForegroundColor Green

Write-Host ""
Write-Host "[3/5] Creating deployment instructions..." -ForegroundColor Yellow

$instructions = @"
# AWS EC2 Deployment Instructions

## Step 1: Upload to EC2

Use WinSCP or similar tool to upload the deployment folder to your EC2 instance:
- Host: your-ec2-ip
- Username: ubuntu
- Private key: your-key.ppk (convert .pem to .ppk using PuTTYgen)
- Upload to: /home/ubuntu/deployment

Or use SCP from PowerShell:
```powershell
scp -i your-key.pem -r deployment ubuntu@your-ec2-ip:~/
```

## Step 2: SSH into EC2

Use PuTTY or PowerShell:
```powershell
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 3: Create .env file

```bash
cd ~/deployment/backend
nano .env
```

Copy the contents from .env.example and update:
- JWT_SECRET (use a strong random string)
- ALLOWED_ORIGINS (add your domain)
- EMAIL_PASSWORD (use Gmail App Password)

## Step 4: Run deployment script

```bash
cd ~/deployment
chmod +x deploy.sh
./deploy.sh
```

## Step 5: Configure Domain (Optional)

1. Point your domain DNS to EC2 IP
2. Install SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

## Done!

Your application should now be running at:
- Frontend: http://your-ec2-ip
- Backend: http://your-ec2-ip/api

"@

Set-Content -Path "DEPLOYMENT_INSTRUCTIONS.txt" -Value $instructions
Write-Host "✓ Created DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Green

Write-Host ""
Write-Host "[4/5] Checking package size..." -ForegroundColor Yellow

$backendSize = (Get-ChildItem -Path "backend" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$frontendSize = (Get-ChildItem -Path "frontend" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$totalSize = $backendSize + $frontendSize

Write-Host "  Backend:  $([math]::Round($backendSize, 2)) MB" -ForegroundColor Cyan
Write-Host "  Frontend: $([math]::Round($frontendSize, 2)) MB" -ForegroundColor Cyan
Write-Host "  Total:    $([math]::Round($totalSize, 2)) MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "[5/5] Creating deployment archive..." -ForegroundColor Yellow

# Create zip file
$zipPath = "..\gravity-crm-deployment.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "backend", "frontend", "README.md", "deploy.sh", "DEPLOYMENT_INSTRUCTIONS.txt" -DestinationPath $zipPath

Write-Host "✓ Created gravity-crm-deployment.zip" -ForegroundColor Green

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Deployment Package Ready! 🚀                            ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Package location: gravity-crm-deployment.zip" -ForegroundColor Cyan
Write-Host "Package size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Upload gravity-crm-deployment.zip to your EC2 instance" -ForegroundColor White
Write-Host "  2. Extract: unzip gravity-crm-deployment.zip" -ForegroundColor White
Write-Host "  3. Follow instructions in DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor White
Write-Host ""
Write-Host "Or upload the deployment folder directly using WinSCP/SCP" -ForegroundColor White
Write-Host ""

#!/bin/bash

# Gravity CRM - AWS EC2 Deployment Script
# This script automates the deployment process on Ubuntu 22.04

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Gravity CRM - AWS Deployment Script                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}[1/8] Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo -e "${YELLOW}[2/8] Installing Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node -v) installed${NC}"

# Install Nginx
echo -e "${YELLOW}[3/8] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi
echo -e "${GREEN}✓ Nginx installed${NC}"

# Install PM2
echo -e "${YELLOW}[4/8] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 installed${NC}"

# Setup Backend
echo -e "${YELLOW}[5/8] Setting up backend...${NC}"
cd ~/deployment/backend

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create backend/.env with required environment variables"
    echo "See backend/.env.example for reference"
    exit 1
fi

# Install dependencies
npm install --production

# Generate Prisma Client
npx prisma generate

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy

# Start backend with PM2
pm2 delete gravity-crm 2>/dev/null || true
pm2 start index.js --name "gravity-crm"
pm2 save
pm2 startup | tail -n 1 | sudo bash

echo -e "${GREEN}✓ Backend started on port 5000${NC}"

# Setup Frontend
echo -e "${YELLOW}[6/8] Setting up frontend...${NC}"
sudo mkdir -p /var/www/html
sudo cp -r ~/deployment/frontend/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
echo -e "${GREEN}✓ Frontend files copied${NC}"

# Configure Nginx
echo -e "${YELLOW}[7/8] Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/default > /dev/null <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    
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
EOF

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo -e "${GREEN}✓ Nginx configured and started${NC}"

# Configure Firewall
echo -e "${YELLOW}[8/8] Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Deployment Complete! 🚀                                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Your application is now running:"
echo "  Frontend: http://$(curl -s ifconfig.me)"
echo "  Backend:  http://$(curl -s ifconfig.me)/api"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check backend status"
echo "  pm2 logs gravity-crm - View backend logs"
echo "  pm2 restart gravity-crm - Restart backend"
echo "  sudo systemctl status nginx - Check Nginx status"
echo ""
echo "Next steps:"
echo "  1. Configure your domain DNS to point to this server"
echo "  2. Install SSL certificate: sudo certbot --nginx -d your-domain.com"
echo "  3. Update ALLOWED_ORIGINS in backend/.env with your domain"
echo ""

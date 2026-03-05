#!/bin/bash

# Multi-Tenant College ERP Setup Script
# This script automates the initial setup process

set -e

echo "=========================================="
echo "College ERP & CRM Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Check if PostgreSQL is installed
echo ""
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL not found. Please install PostgreSQL 14+${NC}"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
else
    echo -e "${GREEN}✓ PostgreSQL detected${NC}"
fi

# Check if Redis is installed
echo ""
echo "Checking Redis installation..."
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠ Redis not found. Please install Redis 6+${NC}"
    echo "  Ubuntu/Debian: sudo apt install redis-server"
    echo "  macOS: brew install redis"
    echo "  Docker: docker run -d -p 6379:6379 redis:latest"
else
    echo -e "${GREEN}✓ Redis detected${NC}"
fi

# Install npm dependencies
echo ""
echo "Installing npm dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Setup environment file
echo ""
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit .env file with your configuration${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists, skipping...${NC}"
fi

# Check if DATABASE_URL is configured
echo ""
echo "Checking database configuration..."
if grep -q "postgresql://user:password@localhost" .env; then
    echo -e "${YELLOW}⚠ Please configure DATABASE_URL in .env file${NC}"
else
    echo -e "${GREEN}✓ DATABASE_URL configured${NC}"
    
    # Run Prisma migrations
    echo ""
    echo "Running database migrations..."
    npx prisma migrate deploy
    echo -e "${GREEN}✓ Migrations completed${NC}"
    
    # Generate Prisma Client
    echo ""
    echo "Generating Prisma Client..."
    npx prisma generate
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
fi

# Create uploads directory
echo ""
echo "Creating uploads directory..."
mkdir -p uploads
echo -e "${GREEN}✓ Uploads directory created${NC}"

# Create logs directory
echo ""
echo "Creating logs directory..."
mkdir -p logs
echo -e "${GREEN}✓ Logs directory created${NC}"

# Check Redis connection
echo ""
echo "Checking Redis connection..."
if redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠ Redis is not running. Start it with: redis-server${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Ensure PostgreSQL is running"
echo "3. Ensure Redis is running"
echo "4. Run: npm run dev (development)"
echo "   Or: npm start (production)"
echo ""
echo "Documentation:"
echo "- API Documentation: ./API_DOCUMENTATION.md"
echo "- Deployment Guide: ./DEPLOYMENT_GUIDE.md"
echo "- Production Checklist: ./PRODUCTION_CHECKLIST.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"

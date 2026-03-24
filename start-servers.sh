#!/bin/bash

# Gravity CRM - Start Both Servers
# This script starts both backend and frontend servers

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Gravity CRM - Starting Servers                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"
echo ""

# Start Backend
echo -e "${YELLOW}[1/2] Starting Backend Server...${NC}"
echo -e "${CYAN}      Port: 5000${NC}"
echo -e "${CYAN}      URL:  http://localhost:5000/api${NC}"
echo ""

cd backend
npm start &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✓ Backend server started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 5

# Test backend connection
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running!${NC}"
else
    echo -e "${YELLOW}⚠ Backend may still be starting...${NC}"
fi
echo ""

# Start Frontend
echo -e "${YELLOW}[2/2] Starting Frontend Server...${NC}"
echo -e "${CYAN}      Port: 3002${NC}"
echo -e "${CYAN}      URL:  http://localhost:3002${NC}"
echo ""

cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✓ Frontend server started (PID: $FRONTEND_PID)${NC}"
echo ""

# Wait for frontend to compile
echo -e "${YELLOW}Waiting for frontend to compile...${NC}"
sleep 10

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Servers Started Successfully! 🚀                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Your application is now running:"
echo ""
echo -e "${CYAN}  Frontend:  http://localhost:3002${NC}"
echo -e "${CYAN}  Backend:   http://localhost:5000/api${NC}"
echo -e "${CYAN}  Health:    http://localhost:5000/api/health${NC}"
echo ""
echo -e "${YELLOW}Login Page: http://localhost:3002/login${NC}"
echo ""
echo "Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to exit this script (servers will continue running)"
echo ""

# Keep script running
wait

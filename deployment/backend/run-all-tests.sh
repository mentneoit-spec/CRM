#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NEON DATABASE VERIFICATION SUITE${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the backend directory${NC}"
    echo -e "${YELLOW}Run: cd backend && bash run-all-tests.sh${NC}\n"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create a .env file with DATABASE_URL${NC}\n"
    exit 1
fi

# Check if pg package is installed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if ! npm list pg > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing pg package for raw PostgreSQL tests...${NC}"
    npm install pg --save-dev
    echo -e "${GREEN}✅ pg package installed${NC}\n"
else
    echo -e "${GREEN}✅ pg package already installed${NC}\n"
fi

# Run Test 1: Comprehensive Verification
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 1: Comprehensive Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"
node verify-neon-connection.js
echo -e "\n${GREEN}✅ Test 1 Complete${NC}\n"
sleep 2

# Run Test 2: Pooler vs Direct Check
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 2: Pooler vs Direct Connection${NC}"
echo -e "${BLUE}========================================${NC}\n"
node check-neon-direct.js
echo -e "\n${GREEN}✅ Test 2 Complete${NC}\n"
sleep 2

# Run Test 3: Raw PostgreSQL Test
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 3: Raw PostgreSQL Connection${NC}"
echo -e "${BLUE}========================================${NC}\n"
node test-direct-connection.js
echo -e "\n${GREEN}✅ Test 3 Complete${NC}\n"
sleep 2

# Run Test 4: Original Debug Script
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 4: Original Debug Connection${NC}"
echo -e "${BLUE}========================================${NC}\n"
node debug-connection.js
echo -e "\n${GREEN}✅ Test 4 Complete${NC}\n"

# Final Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ALL TESTS COMPLETE${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}✅ All verification tests completed!${NC}\n"

echo -e "${YELLOW}📝 NEXT STEPS:${NC}"
echo -e "1. Review the output above"
echo -e "2. If tests show SUCCESS, your data IS in Neon"
echo -e "3. Go to Neon Console > SQL Editor"
echo -e "4. Run: SELECT * FROM \"User\" LIMIT 10;"
echo -e "5. You should see your data there!\n"

echo -e "${YELLOW}💡 TO FIX DASHBOARD DISPLAY:${NC}"
echo -e "Edit .env and remove '-pooler' from DATABASE_URL"
echo -e "Then restart your backend server\n"

echo -e "${BLUE}========================================${NC}\n"

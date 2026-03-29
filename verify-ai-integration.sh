#!/bin/bash
# Quick Verification & Testing Script for Groq AI Integration

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Groq AI Integration - Verification & Test Guide         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is listening
check_port() {
  local port=$1
  local name=$2
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $name is running on port $port"
    return 0
  else
    echo -e "${RED}✗${NC} $name is NOT running on port $port"
    return 1
  fi
}

# Function to test API endpoint
test_api() {
  echo ""
  echo -e "${BLUE}Testing API Endpoint...${NC}"
  
  # Test health check
  echo ""
  echo "1. Checking health endpoint..."
  HEALTH=$(curl -s http://localhost:5000/api/ai/health)
  if echo "$HEALTH" | grep -q "alive"; then
    echo -e "  ${GREEN}✓${NC} Health check passed: $HEALTH"
  else
    echo -e "  ${RED}✗${NC} Health check failed"
    return 1
  fi
  
  # Test chat endpoint
  echo ""
  echo "2. Testing chat endpoint..."
  RESPONSE=$(curl -s -X POST http://localhost:5000/api/ai/chat \
    -H "Content-Type: application/json" \
    -d '{
      "message": "Hello, what is 2+2?",
      "role": "student",
      "conversationHistory": []
    }')
  
  if echo "$RESPONSE" | grep -q "message"; then
    echo -e "  ${GREEN}✓${NC} Chat endpoint working!"
    echo "  Response: $(echo $RESPONSE | jq '.message' 2>/dev/null || echo $RESPONSE)"
    echo "  Tokens used: $(echo $RESPONSE | jq '.usage.total_tokens' 2>/dev/null || echo 'N/A')"
  else
    echo -e "  ${RED}✗${NC} Chat endpoint failed"
    echo "  Response: $RESPONSE"
    return 1
  fi
}

echo ""
echo -e "${BLUE}Step 1: Check Running Services${NC}"
echo "─────────────────────────────────────"
BACKEND_RUNNING=0
FRONTEND_RUNNING=0

if check_port 5000 "Backend (Express)"; then
  BACKEND_RUNNING=1
fi

if check_port 3000 "Frontend (React)"; then
  FRONTEND_RUNNING=1
fi

echo ""
echo -e "${BLUE}Step 2: Verify Configuration Files${NC}"
echo "─────────────────────────────────────"

if [ -f "backend/.env" ]; then
  echo -e "${GREEN}✓${NC} .env file found"
  
  # Check for Groq key
  if grep -q "GROQ_API_KEY" backend/.env; then
    echo -e "  ${GREEN}✓${NC} GROQ_API_KEY configured"
  else
    echo -e "  ${RED}✗${NC} GROQ_API_KEY missing"
  fi
else
  echo -e "${RED}✗${NC} .env file NOT found"
fi

if [ -f "backend/routes/aiChatbot.js" ]; then
  echo -e "${GREEN}✓${NC} aiChatbot.js route exists"
else
  echo -e "${RED}✗${NC} aiChatbot.js route missing"
fi

if [ -f "frontend/src/components/ai/AIChatbot.js" ]; then
  echo -e "${GREEN}✓${NC} AIChatbot.js component exists"
else
  echo -e "${RED}✗${NC} AIChatbot.js component missing"
fi

echo ""
echo -e "${BLUE}Step 3: File Structure${NC}"
echo "─────────────────────────────────────"
echo "📁 Backend:"
echo "   - backend/.env"
echo "   - backend/routes/aiChatbot.js"
echo "   - backend/index.js (route registered)"
echo ""
echo "📁 Frontend:"
echo "   - frontend/src/components/ai/AIChatbot.js"

# If backend is running, test API
if [ $BACKEND_RUNNING -eq 1 ]; then
  test_api
fi

echo ""
echo -e "${BLUE}Step 4: Access Instructions${NC}"
echo "─────────────────────────────────────"

if [ $FRONTEND_RUNNING -eq 1 ] && [ $BACKEND_RUNNING -eq 1 ]; then
  echo -e "${GREEN}✓${NC} Both services running! Access the chatbot at:"
  echo ""
  echo "  🔗 http://localhost:3000/admin/ai"
  echo "  🔗 http://localhost:3000/teacher/ai"
  echo "  🔗 http://localhost:3000/student/ai"
  echo "  🔗 http://localhost:3000/parent/ai"
  echo ""
  echo "Click 'AI Assistant' button to open the chatbot!"
else
  echo -e "${YELLOW}⚠${NC}  Services not running. Start with:"
  echo ""
  echo "  Terminal 1:"
  echo "    cd backend"
  echo "    npm start"
  echo ""
  echo "  Terminal 2:"
  echo "    cd frontend"
  echo "    npm start"
fi

echo ""
echo -e "${BLUE}Step 5: Troubleshooting${NC}"
echo "─────────────────────────────────────"
echo ""
echo "If API returns 'Invalid API key':"
echo "  → Check backend/.env for GROQ_API_KEY"
echo "  → Restart backend: npm start"
echo ""
echo "If 'Cannot POST /api/ai/chat':"
echo "  → Verify route in backend/index.js"
echo "  → Look for: app.use(\"/api/ai\", ...)"
echo ""
echo "If chatbot doesn't appear in frontend:"
echo "  → Check browser console (F12) for errors"
echo "  → Verify component is imported in dashboard"
echo ""
echo ""
echo -e "${BLUE}═════════════════════════════════════════════════════════════════${NC}"
echo "For detailed instructions, see: AI_GROQ_INTEGRATION_COMPLETE.md"
echo -e "${BLUE}═════════════════════════════════════════════════════════════════${NC}"

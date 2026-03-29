# 🚀 Quick Start - Groq AI Chatbot

## 1️⃣ Start Backend (Terminal 1)
```bash
cd backend
npm start
```
Expected output:
```
Server running on port 5000
```

## 2️⃣ Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```
Expected output:
```
http://localhost:3000 - Local:   http://localhost:3000
```

## 3️⃣ Open Browser
Click one of these links:
- http://localhost:3000/admin/ai
- http://localhost:3000/teacher/ai
- http://localhost:3000/student/ai
- http://localhost:3000/parent/ai

## 4️⃣ Click AI Assistant Button
- Look for the floating "AI Assistant" button
- Click it to open the chatbot
- Type your message
- Press Enter
- **Get real AI responses!** ✨

---

## What Changed?

### ✅ Backend Files Created/Modified:
1. **`backend/.env`** ← API credentials
2. **`backend/routes/aiChatbot.js`** ← API endpoint (POST /api/ai/chat)
3. **`backend/index.js`** ← Added route registration

### ✅ Frontend Files Updated:
1. **`frontend/src/components/ai/AIChatbot.js`** ← Premium UI + API integration

### ✅ Documentation Created:
1. **`AI_GROQ_INTEGRATION_COMPLETE.md`** ← Full guide
2. **`verify-ai-integration.bat`** ← Windows verification script
3. **`verify-ai-integration.sh`** ← Linux/Mac verification script
4. **`QUICK_START_AI.md`** ← This file

---

## API Flow

```
User Types Message
        ↓
Frontend Component Captures Input
        ↓
Sends POST to http://localhost:5000/api/ai/chat
        ↓
Backend receives: {message, role, conversationHistory}
        ↓
Backend calls Groq API (Mixtral 8x7b model)
        ↓
Groq returns AI response
        ↓
Backend sends back: {message, usage, timestamp}
        ↓
Frontend displays AI response with animations
        ↓
User sees beautiful chat!
```

---

## Features

✨ **Beautiful UI**
- Gradient headers (color-coded by role)
- Smooth animations
- Professional message bubbles
- Loading indicators

🧠 **Smart AI**
- Real Groq API responses
- Conversation history for context
- Role-specific prompts
- 2048 token limit

⚡ **Responsive**
- Mobile-friendly
- Works on all devices
- Smooth scrolling
- Quick message sending

---

## Test Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/ai/health
```

### Test Chat API
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "role": "student",
    "conversationHistory": []
  }'
```

---

## Groq API Details

| Property | Value |
|----------|-------|
| Model | `mixtral-8x7b-32768` |
| Max Tokens | 2048 |
| Temperature | 0.7 |
| API Provider | Groq (Free tier) |
| Speed | ~5-15 seconds per response |

---

## Colors by Role

| Role | Color | Code |
|------|-------|------|
| Admin | Purple | #667eea |
| Teacher | Purple | #764ba2 |
| Student | Green | #43e97b |
| Parent | Orange | #fa8231 |

---

## ⚡ Instant Troubleshooting

| Problem | Solution |
|---------|----------|
| ❌ "Network error" | Backend not running → `cd backend && npm start` |
| ❌ "Cannot POST /api/ai/chat" | Route not registered → Restart backend |
| ❌ "Invalid API key" | Check `.env` file → Restart backend |
| ❌ Chatbot not showing | Refresh browser (Ctrl+Shift+R) |
| ⚠️ Slow responses | Normal for Groq free tier, wait 15-30 sec |

---

## Demo Prompts

Try these questions for each role:

### 👨‍💼 **Admin**
- "What are the key metrics this month?"
- "Analyze student enrollment trends"
- "Generate a department report"

### 👨‍🏫 **Teacher**
- "How do I plan a lesson on calculus?"
- "How can I improve classroom participation?"
- "Tips for grading fairly?"

### 👨‍🎓 **Student**
- "What should I study for exams?"
- "Explain quantum physics simply"
- "Help me with my math homework?"

### 👨‍👩‍👧 **Parent**
- "What's my child's learning progress like?"
- "How can I help at home?"
- "When is the next school event?"

---

## 📊 Real-Time Usage

The API response includes token usage:
```json
{
  "usage": {
    "prompt_tokens": 250,      // Your question size
    "completion_tokens": 180,  // AI answer size
    "total_tokens": 430        // Combined
  }
}
```

---

## ✅ Verification Checklist

Run this to verify everything is set up:

**Windows:**
```bash
.\verify-ai-integration.bat
```

**Mac/Linux:**
```bash
bash verify-ai-integration.sh
```

---

## 🎉 You're All Set!

Your AI chatbot is now **fully functional** with real Groq API responses.

**Next:** Open the browser and start chatting! 🚀

---

**Need Help?** See `AI_GROQ_INTEGRATION_COMPLETE.md` for detailed documentation.

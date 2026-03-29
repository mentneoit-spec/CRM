@echo off
REM Quick Verification & Testing Script for Groq AI Integration (Windows)

setlocal enabledelayedexpansion

title Groq AI Integration Verification

echo.
echo ===================================================================
echo        Groq AI Integration - Verification ^& Test Guide
echo ===================================================================
echo.

REM Check if backend is running
echo [1] Checking Backend (Port 5000)...
netstat -ano | find "5000" >nul 2>&1
if !errorlevel! equ 0 (
    echo  [OK] Backend is running on port 5000
    set BACKEND_RUNNING=1
) else (
    echo  [ERROR] Backend is NOT running on port 5000
    set BACKEND_RUNNING=0
)
echo.

REM Check if frontend is running
echo [2] Checking Frontend (Port 3000)...
netstat -ano | find "3000" >nul 2>&1
if !errorlevel! equ 0 (
    echo  [OK] Frontend is running on port 3000
    set FRONTEND_RUNNING=1
) else (
    echo  [ERROR] Frontend is NOT running on port 3000
    set FRONTEND_RUNNING=0
)
echo.

REM Verify configuration files
echo [3] Verifying Configuration Files...
if exist "backend\.env" (
    echo  [OK] .env file found
    findstr /M "GROQ_API_KEY" backend\.env >nul 2>&1
    if !errorlevel! equ 0 (
        echo  [OK] GROQ_API_KEY configured
    ) else (
        echo  [ERROR] GROQ_API_KEY missing from .env
    )
) else (
    echo  [ERROR] .env file NOT found
)
echo.

REM Verify route files
echo [4] Verifying Route Files...
if exist "backend\routes\aiChatbot.js" (
    echo  [OK] aiChatbot.js route exists
) else (
    echo  [ERROR] aiChatbot.js route missing
)

if exist "frontend\src\components\ai\AIChatbot.js" (
    echo  [OK] AIChatbot.js component exists
) else (
    echo  [ERROR] AIChatbot.js component missing
)
echo.

REM Display file structure
echo [5] File Structure:
echo.
echo  Backend:
echo    - backend\.env
echo    - backend\routes\aiChatbot.js
echo    - backend\index.js
echo.
echo  Frontend:
echo    - frontend\src\components\ai\AIChatbot.js
echo.

REM Display next steps
echo [6] Next Steps:
echo.

if !BACKEND_RUNNING! equ 1 if !FRONTEND_RUNNING! equ 1 (
    echo  [STATUS] Both services are RUNNING!
    echo.
    echo  Access the chatbot at:
    echo    - http://localhost:3000/admin/ai
    echo    - http://localhost:3000/teacher/ai
    echo    - http://localhost:3000/student/ai
    echo    - http://localhost:3000/parent/ai
    echo.
    echo  Click "AI Assistant" button to open the chatbot.
    echo.
) else (
    echo  [STATUS] Start the services:
    echo.
    echo  Terminal 1:
    echo    cd backend
    echo    npm start
    echo.
    echo  Terminal 2:
    echo    cd frontend
    echo    npm start
    echo.
)

echo [7] Troubleshooting Checklist:
echo.
echo    - "Invalid API key" error:
echo      ^> Check backend\.env for GROQ_API_KEY
echo      ^> Restart backend after changes
echo.
echo    - "Cannot POST /api/ai/chat" error:
echo      ^> Verify route registered in backend\index.js
echo      ^> Look for: app.use("/api/ai", ...)
echo.
echo    - Chatbot not appearing:
echo      ^> Check browser console (F12) for errors
echo      ^> Verify AIChatbot.js is imported in dashboard
echo.
echo ===================================================================
echo For detailed instructions: AI_GROQ_INTEGRATION_COMPLETE.md
echo ===================================================================
echo.
pause

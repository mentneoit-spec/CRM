@echo off
title College ERP - Application Starter
color 0A

echo.
echo ========================================
echo   College ERP Application Starter
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
echo.

echo [2/3] Starting Backend Server...
start "Backend Server - Port 5000" cmd /k "cd backend && echo Starting Backend... && npm start"
echo [OK] Backend server starting on http://localhost:5000
echo If port 5000 is busy, the backend will exit with an error.
echo.

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul
echo.

echo [3/3] Starting Frontend Application...
start "Frontend App - Port 3000" cmd /k "cd frontend && echo Starting Frontend... && npm start"
echo [OK] Frontend app starting on http://localhost:3000
echo.

echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo Database: Run 'npx prisma studio' in backend folder
echo.
echo Test Credentials:
echo   Email:    admin@test.com
echo   Password: password123
echo.
echo Press any key to close this window...
echo (Backend and Frontend will keep running)
pause >nul

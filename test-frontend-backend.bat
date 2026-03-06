@echo off
title Frontend & Backend Test
color 0A

echo.
echo ========================================
echo   Testing Frontend and Backend
echo ========================================
echo.

echo [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not installed!
    pause
    exit /b 1
)
node --version
echo [OK] Node.js found
echo.

echo [2/5] Checking Backend...
cd backend
if not exist "node_modules" (
    echo [WARNING] Backend dependencies not installed
    echo Installing...
    call npm install
)
echo [OK] Backend ready
cd ..
echo.

echo [3/5] Checking Frontend...
cd frontend
if not exist "node_modules" (
    echo [WARNING] Frontend dependencies not installed
    echo Installing...
    call npm install
)
echo [OK] Frontend ready
cd ..
echo.

echo [4/5] Checking Database...
cd backend
call npx prisma generate >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Database schema ready
) else (
    echo [WARNING] Database might need setup
    echo Run: cd backend ^&^& npx prisma db push
)
cd ..
echo.

echo [5/5] Checking Configuration...
if exist "frontend\.env" (
    echo [OK] Frontend .env exists
) else (
    echo [WARNING] Frontend .env missing
)

if exist "backend\.env" (
    echo [OK] Backend .env exists
) else (
    echo [WARNING] Backend .env missing
)
echo.

echo ========================================
echo   Test Complete!
echo ========================================
echo.
echo To start the application:
echo   1. Double-click start-app.bat
echo   OR
echo   2. Run these commands in separate terminals:
echo      Terminal 1: cd backend ^&^& npm start
echo      Terminal 2: cd frontend ^&^& npm start
echo.
echo Test Credentials:
echo   Email:    admin@test.com
echo   Password: password123
echo.
pause

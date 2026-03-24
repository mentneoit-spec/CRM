# Gravity CRM - Start Both Servers
# This script starts both backend and frontend servers

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Gravity CRM - Starting Servers                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Node.js version: $(node -v)" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Yellow
Write-Host "      Port: 5000" -ForegroundColor Cyan
Write-Host "      URL:  http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

Write-Host "✓ Backend server starting in new window..." -ForegroundColor Green
Write-Host ""

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend connection
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend may still be starting..." -ForegroundColor Yellow
}
Write-Host ""

# Start Frontend
Write-Host "[2/2] Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "      Port: 3002" -ForegroundColor Cyan
Write-Host "      URL:  http://localhost:3002" -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

Write-Host "✓ Frontend server starting in new window..." -ForegroundColor Green
Write-Host ""

# Wait for frontend to compile
Write-Host "Waiting for frontend to compile..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Servers Started Successfully! 🚀                        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now running:" -ForegroundColor White
Write-Host ""
Write-Host "  Frontend:  http://localhost:3002" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "  Health:    http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login Page: http://localhost:3002/login" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Gray
Write-Host ""

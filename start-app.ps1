# College ERP Application Starter Script
# PowerShell version

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  College ERP Application Starter" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Node.js installation
Write-Host "[1/3] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Start Backend
Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; npm start" -WindowStyle Normal
Write-Host "[OK] Backend server starting on http://localhost:5000" -ForegroundColor Green
Write-Host "If port 5000 is busy, the backend will exit with an error." -ForegroundColor DarkYellow

Write-Host "`nWaiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""

# Start Frontend
Write-Host "[3/3] Starting Frontend Application..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Starting Frontend Application...' -ForegroundColor Green; npm start" -WindowStyle Normal
Write-Host "[OK] Frontend app starting on http://localhost:3000" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Application Started Successfully!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Backend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5000" -ForegroundColor Cyan

Write-Host "Frontend: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan

Write-Host "Database: " -NoNewline -ForegroundColor White
Write-Host "Run 'npx prisma studio' in backend folder" -ForegroundColor Cyan

Write-Host "`nTest Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    admin@test.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White

Write-Host "`nBoth servers are running in separate windows." -ForegroundColor Green
Write-Host "Close those windows to stop the servers.`n" -ForegroundColor Yellow

Read-Host "Press Enter to close this window"

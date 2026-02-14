# Start Script for Local Development
# Make sure MongoDB is configured in backend/.env first!

Write-Host "`n=== Starting PDS Application ===" -ForegroundColor Green
Write-Host "`n1. Starting Backend Server..." -ForegroundColor Yellow

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "2. Starting Frontend Server..." -ForegroundColor Yellow

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "`n=== Servers Starting ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nCheck the PowerShell windows for server logs`n" -ForegroundColor White

# Agentic XAI - Start Both Servers
Write-Host "🚀 Starting Agentic XAI Servers..." -ForegroundColor Green

# Start Backend
Write-Host "📡 Starting Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\api'; python -m uvicorn main:app --reload --port 8000"

# Wait a moment
Start-Sleep -Seconds 3

# Start Frontend  
Write-Host "🌐 Starting Frontend (React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "✅ Servers starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan

# Wait and test
Write-Host "⏳ Waiting 10 seconds for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test Backend
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "✅ Backend Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "Health Response: $healthResponse" -ForegroundColor White
} catch {
    Write-Host "❌ Backend Health Check: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Frontend Check: SUCCESS (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Check: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Setup Complete! Both servers should be running." -ForegroundColor Green
Write-Host "Press any key to exit this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
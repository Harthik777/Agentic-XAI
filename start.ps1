# Agentic XAI Startup Script for Windows PowerShell
# This script starts both the backend and frontend services

Write-Host "🚀 Starting Agentic XAI System..." -ForegroundColor Green
Write-Host ""

# Check if required dependencies are installed
Write-Host "📋 Checking dependencies..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ from https://python.org" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Installing dependencies..." -ForegroundColor Yellow

# Install backend dependencies
Write-Host "📦 Installing Python dependencies..."
Set-Location api
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}
& .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Set-Location ..

# Install frontend dependencies
Write-Host "📦 Installing Node.js dependencies..."
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "🎉 Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Backend will start on http://localhost:8000" -ForegroundColor White
Write-Host "2. Frontend will start on http://localhost:3000" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "🔥 Starting services..." -ForegroundColor Yellow

# Start backend in a new PowerShell window
$backendScript = @"
Set-Location '$PWD\api'
& .\venv\Scripts\Activate.ps1
Write-Host '🔧 Starting Backend API on http://localhost:8000...' -ForegroundColor Green
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in another new PowerShell window
$frontendScript = @"
Set-Location '$PWD\frontend'
Write-Host '🎨 Starting Frontend on http://localhost:3000...' -ForegroundColor Green
npm start
"@

Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "✅ Agentic XAI is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Your AI decision-making system will be available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔧 API documentation available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Features:" -ForegroundColor Yellow
Write-Host "• 🆓 100% Free AI APIs (DeepSeek R1, Llama 3.3, etc.)" -ForegroundColor White
Write-Host "• 🌐 Works for any industry and business domain" -ForegroundColor White
Write-Host "• 🔍 Explainable AI with confidence scores" -ForegroundColor White
Write-Host "• 📊 Analytics and decision history" -ForegroundColor White
Write-Host "• ⚡ Multiple AI model fallbacks for reliability" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Perfect for job applications, consulting, and business decisions!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
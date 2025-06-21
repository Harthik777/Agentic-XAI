# Agentic-XAI Development Server Script (PowerShell)
Write-Host "Starting Agentic-XAI Development Servers...`n" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Please edit .env file and add your REPLICATE_API_TOKEN`n" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: .env.example file not found. Please create .env manually.`n" -ForegroundColor Red
    }
}

# Start backend server
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-Command", "cd backend; pip install -r requirements.txt; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-Command", "cd frontend; npm install --legacy-peer-deps; npm start" -WindowStyle Normal

Write-Host "`nDevelopment servers are starting..." -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nPress any key to exit..." -ForegroundColor Yellow

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
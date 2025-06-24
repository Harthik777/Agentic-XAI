# Agentic-XAI Development Startup Script
Write-Host "Starting Agentic-XAI Development Environment..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Setting up backend..." -ForegroundColor Yellow
Set-Location api

# Install Python dependencies
if (-not (Test-Path "..\venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    Set-Location ..
    python -m venv venv
    Set-Location api
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ..\venv\Scripts\Activate.ps1

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; ..\venv\Scripts\Activate.ps1; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

# Go back to root and setup frontend
Set-Location ..
Write-Host "Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Starting frontend development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm start"

Set-Location ..

Write-Host "=======================================" -ForegroundColor Green
Write-Host "Development servers are starting up!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Backend Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "Shutting down..." -ForegroundColor Yellow
} 
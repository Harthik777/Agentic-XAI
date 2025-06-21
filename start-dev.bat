@echo off
echo Starting Agentic-XAI Development Servers...
echo.

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found. Creating from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo Please edit .env file and add your REPLICATE_API_TOKEN
        echo.
    ) else (
        echo ERROR: .env.example file not found. Please create .env manually.
        echo.
    )
)

REM Start backend server
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && pip install -r requirements.txt && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm install --legacy-peer-deps && npm start"

echo.
echo Development servers are starting...
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause >nul 
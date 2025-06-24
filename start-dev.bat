@echo off
echo =======================================
echo Starting Agentic-XAI Development Environment...
echo =======================================

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Setting up backend...
cd api

:: Create virtual environment if it doesn't exist
if not exist "..\venv" (
    echo Creating virtual environment...
    cd ..
    python -m venv venv
    cd api
)

:: Activate virtual environment and install dependencies
echo Installing Python dependencies...
call ..\venv\Scripts\activate.bat
pip install -r requirements.txt

:: Start backend server in a new window
echo Starting backend server...
start "Backend Server" cmd /k "..\venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Go back to root and setup frontend
cd ..
echo Setting up frontend...
cd frontend

:: Install frontend dependencies
echo Installing frontend dependencies...
call npm install

:: Start frontend development server in a new window
echo Starting frontend development server...
start "Frontend Server" cmd /k "npm start"

cd ..

echo =======================================
echo Development servers are starting up!
echo Backend API: http://localhost:8000
echo Backend Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo =======================================
echo Press any key to exit...
pause 
@echo off
echo Starting Agentic-XAI Development Environment...

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Development servers starting...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Backend Docs: http://localhost:8000/docs
pause 
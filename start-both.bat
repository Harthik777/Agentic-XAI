@echo off
echo 🚀 Starting Agentic XAI Servers...
echo.

echo 📡 Starting Backend (FastAPI)...
start "Backend Server" cmd /k "cd /d api && python -m uvicorn main:app --reload --port 8000"

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo 🌐 Starting Frontend (React)...
start "Frontend Server" cmd /k "cd /d frontend && npm start"

echo.
echo ✅ Servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Both servers will open in separate windows.
echo Close those windows to stop the servers.
echo.
pause 
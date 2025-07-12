# Set environment variables
$env:GOOGLE_API_KEY="AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8"
$env:GEMINI_API_KEY="AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8"
$env:NODE_ENV="development"

# Start the backend server
Write-Host "Setting API keys..." -ForegroundColor Green
Write-Host "Starting backend server..." -ForegroundColor Blue

cd api
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 
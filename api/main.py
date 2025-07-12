from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import logging
import os
from dotenv import load_dotenv

from routes import tasks

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== FASTAPI APP =====
app = FastAPI(
    title="Agentic-XAI API",
    version="4.0.0",
    description="AI Decision Making API"
)

app.include_router(tasks.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== ENDPOINTS =====
@app.get("/")
async def root():
    return {
        "message": "Agentic-XAI API",
        "version": "4.0.0",
        "status": "running",
        "endpoints": ["/health", "/debug", "/task", "/test"]
    }

@app.get("/test", response_class=PlainTextResponse)
async def test_endpoint():
    return "API_IS_WORKING"

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0.0",
        "timestamp": "running"
    }

@app.get("/debug")
async def debug_info():
    google_key = os.getenv("GOOGLE_API_KEY", "")
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    google_api_status = "configured" if google_key or gemini_key else "missing"
    return {
        "google_api_key": google_api_status,
        "google_key_length": len(google_key) if google_key else 0,
        "gemini_key_length": len(gemini_key) if gemini_key else 0,
        "environment": os.getenv("NODE_ENV", "unknown"),
        "api_status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
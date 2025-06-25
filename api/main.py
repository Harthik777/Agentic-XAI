from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import logging
import os
import sys

# Add the current directory to Python path for Vercel
sys.path.append(os.path.dirname(__file__))

from routes import tasks

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(
    title="Agentic-XAI API",
    description="A sophisticated API for an intelligent agent with Explainable AI capabilities.",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the task processing router (no prefix since Vercel already routes /api/* here)
app.include_router(tasks.router)

@app.on_event("startup")
async def startup_event():
    """
    Actions to perform on application startup.
    """
    logger.info("🚀 API is starting up...")
    # Pre-load the agent model on startup if desired
    # from logic.agent_logic import IntelligentAgent
    # IntelligentAgent.get_instance()
    logger.info("✅ API startup complete.")

@app.get("/")
async def root():
    """
    Root endpoint for the API.
    """
    return {
        "message": "Welcome to the Agentic-XAI API",
        "version": app.version,
        "documentation": "/docs"
    }

@app.get("/test", response_class=PlainTextResponse)
async def simple_test():
    """
    Simple test endpoint that returns plain text to bypass any JSON issues.
    """
    return "API_IS_WORKING"

@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify service status.
    """
    return {"status": "healthy", "version": app.version}

@app.get("/debug")
async def debug_info():
    """
    Debug endpoint to check environment and configuration.
    """
    hf_token_status = "configured" if os.getenv("HUGGING_FACE_TOKEN") else "missing"
    hf_token_length = len(os.getenv("HUGGING_FACE_TOKEN", "")) if os.getenv("HUGGING_FACE_TOKEN") else 0
    
    return {
        "environment": {
            "python_version": sys.version,
            "hugging_face_token_status": hf_token_status,
            "hugging_face_token_length": hf_token_length,
            "node_env": os.getenv("NODE_ENV", "not_set")
        },
        "status": "debug_info_retrieved"
    } 
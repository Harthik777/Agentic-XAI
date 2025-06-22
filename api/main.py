from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

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

# Include the task processing router
app.include_router(tasks.router, prefix="/api")

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

@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify service status.
    """
    return {"status": "healthy", "version": app.version} 
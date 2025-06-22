from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List
import logging
import os

from models.agent import IntelligentAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Agentic-XAI API",
    description="Intelligent Agent with Explainable AI",
    version="3.0.0", # Version bump for new structure
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent
try:
    agent = IntelligentAgent()
    logger.info("Agent initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize agent: {e}")
    agent = None

class TaskRequest(BaseModel):
    task_description: str = Field(..., min_length=1, description="Description of the task to be performed")
    context: Dict[str, Any] = Field(default_factory=dict, description="Additional context for the task")

class ExplanationResponse(BaseModel):
    reasoning_steps: List[str]
    feature_importance: Dict[str, float]
    model_details: Dict[str, str]
    analysis_type: str

class TaskResponse(BaseModel):
    decision: str
    explanation: ExplanationResponse
    confidence: float
    success: bool = True
    
@app.get("/api")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Agentic-XAI API is running",
        "version": "3.0.0",
        "docs": "/api/docs"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    agent_status = "ready" if agent else "unavailable"
    return {
        "status": "healthy",
        "agent_status": agent_status,
        "api_token_configured": bool(os.getenv("HUGGING_FACE_TOKEN"))
    }

@app.post("/api/task", response_model=TaskResponse)
async def process_task(request: TaskRequest):
    """
    Process a task using the intelligent agent.
    Returns the agent's decision and explanation.
    """
    if not agent:
        raise HTTPException(
            status_code=503, 
            detail="Agent service is unavailable. Please check server configuration."
        )
    
    try:
        logger.info(f"Processing task: {request.task_description[:100]}...")
        
        result = await agent.process_task(
            task_description=request.task_description,
            context=request.context
        )
        
        logger.info("Task processed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error processing task: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 
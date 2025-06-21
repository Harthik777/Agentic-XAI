from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List
import logging
import os
import sys

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our components
try:
    from app.models.agent import IntelligentAgent
    from app.xai.explainer import XAIExplainer
except ImportError as e:
    logger.error(f"Import error: {e}")
    # Fallback imports
    IntelligentAgent = None
    XAIExplainer = None

app = FastAPI(
    title="Agentic-XAI API",
    description="Intelligent Agent with Explainable AI",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent
try:
    if IntelligentAgent:
        agent = IntelligentAgent()
        logger.info("Agent initialized successfully")
    else:
        agent = None
        logger.warning("Agent could not be initialized")
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

class TaskResponse(BaseModel):
    decision: str
    explanation: ExplanationResponse
    success: bool = True

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Agentic-XAI API is running",
        "version": "2.0.0",
        "endpoints": {
            "submit_task": "/api/task",
            "health": "/api/health",
            "docs": "/api/docs"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    agent_status = "ready" if agent else "unavailable"
    return {
        "status": "healthy",
        "agent_status": agent_status,
        "api_token_configured": bool(os.getenv("REPLICATE_API_TOKEN"))
    }

@app.post("/api/task", response_model=TaskResponse)
async def process_task(request: TaskRequest):
    """
    Process a task using the intelligent agent.
    Returns the agent's decision and explanation.
    """
    if not agent:
        # Return mock response when agent is not available
        return TaskResponse(
            decision=f"Mock decision for task: {request.task_description[:50]}...",
            explanation=ExplanationResponse(
                reasoning_steps=[
                    f"Received task: {request.task_description}",
                    f"Analyzed context with {len(request.context)} parameters",
                    "Generated mock response (Agent not available)",
                    "This is a demonstration response"
                ],
                feature_importance={k: 0.5 for k in list(request.context.keys())[:5]},
                model_details={"name": "Mock Agent", "type": "Fallback Response"}
            ),
            success=True
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
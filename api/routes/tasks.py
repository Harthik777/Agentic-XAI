from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import logging
import os
import sys

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, parent_dir)

# Import with error handling for different environments
try:
    from logic.agent_logic import IntelligentAgent, Decision
except ImportError:
    # Fallback for Vercel serverless environment
    import importlib.util
    logic_path = os.path.join(parent_dir, 'logic', 'agent_logic.py')
    spec = importlib.util.spec_from_file_location("agent_logic", logic_path)
    agent_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(agent_module)
    IntelligentAgent = agent_module.IntelligentAgent
    Decision = agent_module.Decision

from pydantic import BaseModel, Field

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency to get the agent instance
def get_agent():
    try:
        return IntelligentAgent.get_instance()
    except RuntimeError as e:
        logger.error(f"Failed to initialize agent: {e}")
        raise HTTPException(
            status_code=503, 
            detail="Agent service is unavailable due to initialization failure."
        )

class TaskRequest(BaseModel):
    task_description: str = Field(..., min_length=1, description="Description of the task for the agent to perform.")
    context: Dict[str, Any] = Field(default_factory=dict, description="Supporting context for the task.")

@router.post("/task", response_model=Decision)
async def process_task(
    request: TaskRequest,
    agent: IntelligentAgent = Depends(get_agent)
):
    """
    Process a decision-making task using the Intelligent Agent.
    
    This endpoint takes a task description and relevant context,
    and returns a structured decision with reasoning and confidence.
    """
    try:
        logger.info(f"Processing task: '{request.task_description[:80]}...'")
        
        result = await agent.generate_decision(
            task_description=request.task_description,
            context=request.context
        )
        
        logger.info("✅ Task processed successfully.")
        return result
        
    except Exception as e:
        logger.error(f"Error processing task '{request.task_description[:80]}...': {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        ) 
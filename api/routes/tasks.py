from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
import logging
import os
import sys

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, parent_dir)

# Import with error handling for different environments
try:
    from api.logic.agent_logic import IntelligentAgent, Decision
except ImportError:
    # Fallback for direct import
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

class TaskRequest(BaseModel):
    task: str
    context: str = ""
    priority: str = "medium"

class TaskResponse(BaseModel):
    recommendation: str
    reasoning: str
    confidence: float
    alternatives: List[Dict[str, Any]]
    risk_factors: List[str]
    decision_id: str

def convert_decision_to_response(decision, decision_id: str) -> TaskResponse:
    """Convert Decision model to TaskResponse format expected by frontend"""
    # Convert reasoning list to string
    reasoning_text = " ".join(decision.reasoning) if isinstance(decision.reasoning, list) else str(decision.reasoning)
    
    # Convert key_factors to alternatives and risk_factors
    alternatives = []
    risk_factors = []
    
    # Create default alternatives based on decision
    alternatives = [
        {
            "option": "Recommended Approach",
            "description": decision.decision,
            "pros": ["Based on AI analysis", "Data-driven recommendation"],
            "cons": ["Requires careful implementation", "May need adjustments"]
        },
        {
            "option": "Alternative Approach", 
            "description": "Consider alternative solutions with different trade-offs",
            "pros": ["Different perspective", "Risk mitigation"],
            "cons": ["May require more research", "Unknown outcomes"]
        }
    ]
    
    # Convert key_factors to risk_factors
    risk_factors = [f"{key}: {value}" for key, value in decision.key_factors.items()]
    
    return TaskResponse(
        recommendation=decision.decision,
        reasoning=reasoning_text,
        confidence=decision.confidence * 100,  # Convert to percentage
        alternatives=alternatives,
        risk_factors=risk_factors,
        decision_id=decision_id
    )

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

@router.post("/task", response_model=TaskResponse)
async def process_task(
    request: TaskRequest,
    agent = Depends(get_agent)
):
    """
    Process a decision-making task using the Intelligent Agent.
    
    This endpoint takes a task description and relevant context,
    and returns a structured decision with reasoning and confidence.
    """
    try:
        logger.info(f"Processing task: '{request.task[:80]}...'")
        
        # Generate decision using the agent
        decision = await agent.generate_decision(
            task_description=request.task,
            context={"details": request.context, "priority": request.priority}
        )
        
        # Generate a decision ID
        import hashlib
        input_str = f"{request.task}{request.context}{request.priority}"
        decision_hash = hashlib.md5(input_str.encode()).hexdigest()[:8]
        decision_id = f"decision_{decision_hash}"
        
        # Convert to frontend-expected format
        response = convert_decision_to_response(decision, decision_id)
        
        logger.info("✅ Task processed successfully.")
        return response
        
    except Exception as e:
        logger.error(f"Error processing task '{request.task[:80]}...': {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        ) 
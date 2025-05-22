from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import torch
import numpy as np
from .models.agent import IntelligentAgent
from .xai.explainer import XAIExplainer

app = FastAPI(title="Agentic-XAI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent and explainer
agent = IntelligentAgent()
explainer = XAIExplainer()

class TaskRequest(BaseModel):
    task_description: str
    context: Dict[str, Any] = {}

class ExplanationRequest(BaseModel):
    decision_id: str
    format: str = "text"  # text, visualization, or both

@app.post("/api/task")
async def process_task(request: TaskRequest):
    try:
        # Process the task using the agent
        result = agent.process_task(request.task_description, request.context)
        
        # Generate explanation for the decision
        explanation = explainer.explain_decision(result)
        
        return {
            "status": "success",
            "result": result,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/explanation/{decision_id}")
async def get_explanation(decision_id: str, format: str = "text"):
    try:
        explanation = explainer.get_explanation(decision_id, format)
        return {
            "status": "success",
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"} 
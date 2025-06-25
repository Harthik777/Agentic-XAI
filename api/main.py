from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List
import logging
import os
import httpx
import asyncio
import re
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== EMBEDDED MODELS (NO IMPORTS NEEDED) =====
class Decision(BaseModel):
    decision: str
    confidence: float
    reasoning: List[str]
    key_factors: Dict[str, str]

class TaskRequest(BaseModel):
    task_description: str = Field(..., min_length=1)
    context: Dict[str, Any] = Field(default_factory=dict)

# ===== EMBEDDED AGENT LOGIC (NO IMPORTS NEEDED) =====
class IntelligentAgent:
    _instance = None
    
    def __init__(self):
        self.hf_token = os.getenv("HUGGING_FACE_TOKEN")
        self.use_fallback = not bool(self.hf_token)
        
        if self.use_fallback:
            logger.warning("HUGGING_FACE_TOKEN not set. Using demo responses.")
        else:
            logger.info("✅ Hugging Face token found.")
        
        self.http_client = httpx.AsyncClient(timeout=45.0)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def generate_decision(self, task_description: str, context: Dict[str, Any]) -> Decision:
        if self.use_fallback:
            return self._create_demo_decision(task_description, context)
        
        try:
            # Create prompt
            context_str = "\n".join([f"- {k}: {v}" for k, v in context.items()])
            prompt = f"[INST] Analyze this task and provide a decision: {task_description}\nContext: {context_str}[/INST]"
            
            # Call Hugging Face API
            response = await self.http_client.post(
                "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 512,
                        "temperature": 0.7,
                        "return_full_text": False
                    }
                },
                headers={"Authorization": f"Bearer {self.hf_token}"}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result and result[0].get('generated_text'):
                    text = result[0]['generated_text']
                    return Decision(
                        decision=f"AI Recommendation: {text[:200]}...",
                        confidence=0.85,
                        reasoning=[
                            f"Analyzed task: {task_description[:100]}...",
                            "Applied AI reasoning using Mistral model",
                            "Considered provided context factors"
                        ],
                        key_factors={
                            "ai_model": "Mistral-7B-Instruct",
                            "context_provided": "yes" if context else "no",
                            "confidence_level": "high"
                        }
                    )
            
            return self._create_demo_decision(task_description, context, "AI model returned empty response")
            
        except Exception as e:
            logger.error(f"AI API error: {e}")
            return self._create_demo_decision(task_description, context, f"AI service error: {str(e)}")

    def _create_demo_decision(self, task_description: str, context: Dict[str, Any], error_reason: str = None) -> Decision:
        """Create a meaningful demo decision"""
        
        if error_reason:
            decision_text = f"Unable to use AI model ({error_reason}). Based on general analysis of '{task_description[:50]}...', consider gathering more data before deciding."
            confidence = 0.3
        else:
            decision_text = f"Demo Analysis: For the task '{task_description[:50]}...', I recommend a careful, data-driven approach."
            confidence = 0.7
        
        reasoning = [
            "This is a demonstration response (Hugging Face token not configured)",
            f"Task analysis: {task_description[:100]}...",
            "Context factors considered" if context else "Limited context available",
            "Recommendation: Gather more specific data for this decision"
        ]
        
        factors = {
            "demo_mode": "Active - configure HUGGING_FACE_TOKEN for full AI capabilities",
            "task_complexity": "Moderate" if len(task_description) > 50 else "Simple",
            "data_availability": "Sufficient" if context else "Limited",
            "next_steps": "Configure API token or provide more context"
        }
        
        if error_reason:
            factors["error_details"] = error_reason
        
        return Decision(
            decision=decision_text,
            confidence=confidence,
            reasoning=reasoning,
            key_factors=factors
        )

# ===== FASTAPI APP =====
app = FastAPI(
    title="Agentic-XAI API",
    version="4.0.0",
    description="AI Decision Making API"
)

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
    token_status = "configured" if os.getenv("HUGGING_FACE_TOKEN") else "missing"
    return {
        "hugging_face_token": token_status,
        "environment": os.getenv("NODE_ENV", "unknown"),
        "api_status": "operational"
    }

@app.post("/task", response_model=Decision)
async def process_task(request: TaskRequest):
    try:
        logger.info(f"Processing: {request.task_description[:50]}...")
        
        agent = IntelligentAgent.get_instance()
        result = await agent.generate_decision(
            request.task_description,
            request.context
        )
        
        logger.info("✅ Task completed")
        return result
        
    except Exception as e:
        logger.error(f"Task processing error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        ) 
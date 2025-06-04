from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict

# Corrected import: Changed IntelligentAgent to Agent
from .models.agent import Agent

app = FastAPI(
    title="Agentic-XAI API",
    description="API for the Intelligent Agent with Explainable AI",
    version="0.1.0",
)

# CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development, restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize the agent
# The REPLICATE_API_TOKEN should be set as an environment variable
# where this FastAPI application is run.
agent: Agent | None = None  # Initialize agent to None with type hint
try:
    agent = Agent()
except Exception as e:
    # If agent initialization fails (e.g., REPLICATE_API_TOKEN missing and client init fails hard)
    # We'll log it and the agent instance might be None or in an error state.
    # The Agent class itself has a print warning for missing token,
    # but a hard failure during __init__ could be caught here.
    print(f"Critical error initializing Agent: {e}")
    # Depending on how critical the agent is at startup, you might choose to exit
    # or allow the app to start and handle the error per-request in process_task.
    # For now, we let it proceed, and the Agent class handles the None client.


class TaskRequest(BaseModel):
    task_description: str
    context: Dict[str, Any]


@app.post("/api/task")
async def process_task_endpoint(request: TaskRequest):
    """
    Endpoint to process a task using the intelligent agent.
    Receives a task description and context, returns the agent's decision and explanation.
    """
    if not agent: # Should ideally not happen if __init__ is robust or raises
        raise HTTPException(status_code=500, detail="Agent not initialized. Check server logs.")
    try:
        # The Agent's process_task method is asynchronous
        result = await agent.process_task(request.task_description, request.context)
        return result
    except Exception as e:
        # Catch any other unexpected errors during task processing
        print(f"Error during task processing: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Agentic-XAI API. Use the /api/task endpoint to submit tasks."}

# To run this application (from the backend directory):
# uvicorn app.main:app --reload

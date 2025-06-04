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
agent: Agent | None = None
agent_initialized_successfully: bool = False
try:
    agent = Agent()
    agent_initialized_successfully = True
except Exception as e:
    # If agent initialization fails (e.g., REPLICATE_API_TOKEN missing and client init fails hard)
    # We'll log it and the agent instance might be None or in an error state.
    # The Agent class itself has a print warning for missing token,
    # but a hard failure during __init__ could be caught here.
    print(f"CRITICAL: Agent initialization failed: {e}")
    agent = None # Ensure agent is None if initialization fails
    agent_initialized_successfully = False
    # The application will continue to run, but endpoints relying on the agent will indicate its unavailability.


class TaskRequest(BaseModel):
    task_description: str
    context: Dict[str, Any]


@app.post("/api/task")
async def process_task_endpoint(request: TaskRequest):
    """
    Endpoint to process a task using the intelligent agent.
    Receives a task description and context, returns the agent's decision and explanation.
    """
    if not agent_initialized_successfully or agent is None:
        raise HTTPException(status_code=503, detail="Agent is not available due to initialization failure. Please check server logs.")
    try:
        # The Agent's process_task method is asynchronous
        result = await agent.process_task(request.task_description, request.context) # type: ignore
        return result
    except Exception as e:
        # Catch any other unexpected errors during task processing
        print(f"Error during task processing: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

@app.get("/")
async def read_root():
    if agent_initialized_successfully:
        return {"message": "Welcome to the Agentic-XAI API. Agent is available. Use the /api/task endpoint to submit tasks."}
    else:
        return {"message": "Agentic-XAI API is running, but the Agent failed to initialize. Please check server logs. The /api/task endpoint will not be functional."}

# To run this application (from the backend directory):
# uvicorn app.main:app --reload

#!/usr/bin/env python3
"""
Railway startup script for Agentic-XAI API
"""

import os
import sys
from pathlib import Path

# Add the api directory to Python path
api_dir = Path(__file__).parent / "api"
sys.path.insert(0, str(api_dir))

# Import the FastAPI app from the api directory
from main import app

# This is what Railway will run
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 
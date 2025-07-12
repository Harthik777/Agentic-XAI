#!/usr/bin/env python3
"""
Azure App Service entry point for Agentic-XAI API
This file allows Azure to easily locate and run the FastAPI application
"""

import sys
import os
from pathlib import Path

# Add the api directory to Python path
api_dir = Path(__file__).parent / "api"
sys.path.insert(0, str(api_dir))

# Import the FastAPI app from the api directory
from main import app

# For Railway deployment
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

# For WSGI compatibility (Azure App Service)
application = app 
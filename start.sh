#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Start the application
uvicorn api.main:app --host 0.0.0.0 --port $PORT 
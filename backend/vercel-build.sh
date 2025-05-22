#!/bin/bash

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
mkdir -p .vercel/python

# Copy Python files
cp -r app .vercel/python/
cp requirements.txt .vercel/python/
cp runtime.txt .vercel/python/ 
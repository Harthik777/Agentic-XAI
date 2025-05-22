#!/bin/bash

# Exit on error
set -e

# Create and activate virtual environment
python3.9 -m venv venv
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
cd backend
pip install -r requirements.txt

# Build frontend
cd ../frontend
npm install
npm run build

# Create Vercel build output
cd ..
mkdir -p .vercel/output
cp -r frontend/build .vercel/output/static
cp -r backend/app .vercel/output/functions
cp backend/requirements.txt .vercel/output/functions/ 
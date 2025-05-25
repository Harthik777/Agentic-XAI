# Agentic-XAI: Intelligent Agent with Explainable AI

This project demonstrates the integration of Agentic AI and Explainable AI (XAI) concepts. It features an intelligent agent that can perform tasks while providing transparent explanations for its decisions.

## Features

- 🤖 Intelligent Agent System
- 🔍 Explainable AI Components
- 🌐 Modern Web Interface
- 📊 Decision Visualization
- 📝 Natural Language Explanations

## Project Structure

```
agentic-xai/
├── backend/                 # Python FastAPI backend
│   ├── app/                # Main application code
│   ├── models/             # AI models and agents
│   └── xai/                # Explainable AI components
├── frontend/               # React frontend
│   ├── src/               # Source code
│   └── public/            # Static assets
├── requirements.txt        # Python dependencies
├── start-dev.bat          # Windows batch script to start both servers
└── start-dev.ps1          # PowerShell script to start both servers
```

## Quick Start

### Option 1: Use the automated scripts (Windows)
```bash
# Using batch file
start-dev.bat

# Or using PowerShell
.\start-dev.ps1
```

### Option 2: Manual setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentic-xai
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Set up the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm start
   ```

## Common Issues & Solutions

### Issue: `npm start` fails with "Could not read package.json"
**Solution:** Make sure you're running `npm start` from the `frontend` directory, not the root directory.

### Issue: Vercel deployment fails with pip3.12 error
**Solution:** The project has been updated to use Python 3.12. Make sure your local environment matches:
- Updated `vercel.json` to use `python3.12`
- Updated `backend/runtime.txt` to `python-3.12.0`
- Updated dependencies to Python 3.12 compatible versions

## Development URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend API Documentation: http://localhost:8000/docs

## Technologies Used

- Backend:
  - Python 3.12
  - FastAPI
  - PyTorch
  - SHAP (SHapley Additive exPlanations)
  - LIME (Local Interpretable Model-agnostic Explanations)

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - D3.js for visualizations

## Deployment

This project is configured for deployment on Vercel with:
- Frontend built from the `frontend` directory
- Backend deployed as a Python serverless function
- Automatic builds on push to main branch

## License

MIT License

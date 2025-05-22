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
└── requirements.txt        # Python dependencies
```

## Setup Instructions

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Technologies Used

- Backend:
  - Python 3.9+
  - FastAPI
  - PyTorch
  - SHAP (SHapley Additive exPlanations)
  - LIME (Local Interpretable Model-agnostic Explanations)

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - D3.js for visualizations

## License

MIT License

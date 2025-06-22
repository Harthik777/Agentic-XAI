# Agentic-XAI: Intelligent Agent with Explainable AI

A modern, clean implementation of an Agentic AI system with comprehensive Explainable AI (XAI) capabilities. This project demonstrates how to build intelligent agents that not only make decisions but also provide transparent, detailed explanations of their reasoning process.

## ✨ Features

- 🤖 **Intelligent Agent System** - Advanced AI decision-making using Replicate API
- 🔍 **Explainable AI (XAI)** - Detailed reasoning and feature importance analysis
- 🌐 **Modern Web Interface** - Clean, responsive React frontend with Material-UI
- 📊 **Visual Decision Analysis** - Interactive visualizations of decision factors
- 📝 **Natural Language Explanations** - Human-readable reasoning steps
- 🚀 **Fast & Lightweight** - Optimized for performance and quick deployment
- 🔧 **Mock Mode Support** - Works without API tokens for development and testing

## 🏗️ Architecture

```
agentic-xai/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application entry point
│   │   ├── models/
│   │   │   └── agent.py    # Intelligent agent implementation
│   │   └── xai/
│   │       └── explainer.py # XAI explanation engine
│   └── requirements.txt    # Python dependencies
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── components/    # React components
│   │   └── types/         # TypeScript type definitions
│   └── package.json       # Node.js dependencies
├── start-dev.bat          # Windows development startup
├── start-dev.ps1          # PowerShell development startup
└── vercel.json            # Deployment configuration
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** - For the backend API
- **Node.js 18+** - For the frontend application
- **Git** - For version control

### Option 1: Automated Setup (Windows)

```bash
# Using PowerShell (Recommended)
.\start-dev.ps1

# Or using Command Prompt
start-dev.bat
```

### Option 2: Manual Setup

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd agentic-xai
   ```

2. **Backend setup:**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend setup (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🌐 Access Points

Once running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔑 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Optional: Replicate API token for AI model access
REPLICATE_API_TOKEN=your_token_here

# The system works in mock mode without this token
```

### API Configuration

The system supports two modes:

1. **AI Mode**: With `REPLICATE_API_TOKEN` - Uses actual AI models
2. **Mock Mode**: Without token - Generates demonstration responses

## 🛠️ Usage

1. **Open the application** at http://localhost:3000
2. **Enter a task description** - Describe what you need help with
3. **Add context (optional)** - Provide additional information as JSON
4. **Submit the task** - Get AI decision with detailed explanation
5. **Review the analysis** - Examine reasoning steps and feature importance

### Example Tasks

```
Task: "Should we launch the new product next quarter?"
Context: {
  "budget": 100000,
  "market_research_score": 8.5,
  "competition_level": "high",
  "team_readiness": "medium"
}
```

```
Task: "Recommend the best programming language for our new project"
Context: {
  "project_type": "web_application",
  "team_experience": ["JavaScript", "Python"],
  "timeline": "6_months",
  "scalability_required": true
}
```

## 🧠 How It Works

### 1. Task Processing
- User submits task description and optional context
- System validates input and prepares for processing

### 2. AI Decision Making
- **AI Mode**: Calls Replicate API with optimized prompts
- **Mock Mode**: Generates realistic demonstration responses
- Applies decision cleaning and formatting

### 3. XAI Explanation Generation
- Analyzes task description for key insights
- Calculates feature importance for context parameters
- Generates step-by-step reasoning process
- Estimates confidence levels

### 4. Response Delivery
- Returns structured JSON with decision and explanation
- Frontend renders interactive visualizations
- Users can explore reasoning and feature analysis

## 🎨 Frontend Features

- **Responsive Design** - Works on desktop and mobile
- **Real-time Validation** - JSON context validation
- **Interactive UI** - Collapsible sections and sample data
- **Visual Feedback** - Progress indicators and error handling
- **Feature Visualization** - Charts and progress bars

## 🔧 Development

### Code Structure

- **Clean Architecture** - Separation of concerns
- **Type Safety** - Full TypeScript support
- **Error Handling** - Comprehensive error management
- **Logging** - Structured logging for debugging
- **Testing Ready** - Modular design for easy testing

### Key Components

- `IntelligentAgent` - Core AI decision-making logic
- `XAIExplainer` - Explanation generation engine
- `TaskForm` - User input and validation
- `ExplanationView` - Results visualization

## 🚀 Deployment

### Vercel (Recommended)

The project is optimized for Vercel deployment:

1. Connect your repository to Vercel
2. Set environment variables (optional: `REPLICATE_API_TOKEN`)
3. Deploy - both frontend and backend will be deployed automatically

### Manual Deployment

- **Frontend**: Build with `npm run build` and serve static files
- **Backend**: Deploy FastAPI app to any Python hosting service

## 📝 API Reference

### POST /api/task

Submit a task for AI analysis:

```json
{
  "task_description": "Your task description here",
  "context": {
    "key": "value",
    "additional": "context"
  }
}
```

Response:
```json
{
  "decision": "AI decision here",
  "explanation": {
    "reasoning_steps": ["Step 1", "Step 2", "..."],
    "feature_importance": {"feature1": 0.8, "feature2": 0.2},
    "model_details": {"name": "Agent Name", "type": "Agent Type"}
  },
  "success": true
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in startup scripts
2. **Python/Node not found**: Ensure they're installed and in PATH
3. **Dependencies fail**: Check Python/Node versions
4. **API errors**: Verify network connectivity and API tokens

### Support

- Check the API documentation at `/docs`
- Review logs in the terminal
- Ensure all dependencies are installed
- Verify environment variables are set correctly

---

Made with ❤️ by Harthik

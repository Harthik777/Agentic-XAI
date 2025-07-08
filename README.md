# 🚀 Agentic XAI - Google AI Powered Decision Making System

> **Google AI-Powered Decision Support** - Get expert recommendations for any business decision using Google's Gemini AI model.

## ✨ Features

- **🆓 100% Free**: Uses the best free AI APIs available in 2025
- **🧠 Multi-Model Intelligence**: Integrates OpenRouter (DeepSeek R1), Groq (Llama 3.3), Together AI
- **🔍 Explainable AI**: Detailed reasoning, confidence scores, and risk assessment
- **🌐 Universal**: Works for any industry - finance, tech, healthcare, retail, consulting
- **⚡ Fast & Reliable**: Multiple API fallbacks ensure 100% uptime
- **📊 Analytics**: Track decision patterns and confidence metrics

## 🎯 Use Cases

- **Business Strategy**: Market entry, product decisions, resource allocation
- **Technology**: Build vs buy, tool selection, architecture choices  
- **Finance**: Investment analysis, budget optimization, risk management
- **Operations**: Process automation, vendor selection, capacity planning
- **HR**: Hiring decisions, policy development, team structure
- **Marketing**: Channel strategy, campaign optimization, messaging

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** and **Node.js 18+**
- **Google API key** for Gemini AI (configured)

### 🎯 One-Click Startup (Windows)

```powershell
# Clone and run in one command!
git clone https://github.com/yourusername/Agentic-XAI.git
cd Agentic-XAI
.\start.ps1
```

### Manual Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Agentic-XAI.git
cd Agentic-XAI
```

2. **Set up the backend**
   ```bash
cd api
pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
cd ../frontend
npm install
```

4. **Start the application**

Terminal 1 (Backend):
```bash
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

5. **Open your browser** to `http://localhost:3000`

## 🔑 Google API Configuration

Your system is configured to use Google's Gemini AI model:

- **Model**: Gemini 1.5 Flash
- **API Key**: AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8 (configured)
- **Features**: Advanced reasoning, analysis, and decision-making capabilities

## ⚙️ Environment Setup

The `.env` file is already configured in the `api` directory with your Google API key:

```bash
# Google API Configuration (already set)
GOOGLE_API_KEY=AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8
GEMINI_API_KEY=AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8

# Environment Settings
NODE_ENV=development
```

## 🏗️ Architecture

```
Frontend (React + TypeScript + Material-UI)
    ↓ HTTP requests
Backend (FastAPI + Python)
    ↓ Google Gemini API
Google Gemini 1.5 Flash - Advanced AI decision-making
    ↓ Fallback
Sophisticated Local Logic - Ensures reliability
```

## 📊 Demo Examples

### Business Strategy
**Task**: "Should we expand to the European market?"
**Context**: "SaaS company, $5M ARR, 50 employees"

**AI Response**:
- **Recommendation**: Implement phased European expansion starting with UK/Germany
- **Confidence**: 82%
- **Reasoning**: Market analysis shows strong demand, regulatory alignment with existing compliance
- **Alternatives**: Direct expansion vs partnership vs acquisition
- **Risk Factors**: Currency fluctuation, regulatory complexity, local competition

### Technology Decision  
**Task**: "Should we migrate to microservices architecture?"
**Context**: "Monolithic app, 10-person engineering team, growing user base"

**AI Response**:
- **Recommendation**: Gradual migration starting with user authentication service
- **Confidence**: 78%
- **Reasoning**: Team size supports limited microservices, allows learning without full commitment
- **Alternatives**: Complete rewrite vs maintain monolith vs hybrid approach
- **Risk Factors**: Increased complexity, distributed system challenges, team learning curve

## 🚀 Deployment

### Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Deploy automatically
4. Add environment variables in Vercel dashboard

### Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Deploy backend to your preferred platform
3. Set environment variables
4. Update `REACT_APP_API_BASE` for frontend

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📈 Roadmap

- [ ] **More AI Models**: Add Claude, Gemini, and other free APIs
- [ ] **Industry Templates**: Pre-built prompts for specific industries
- [ ] **Decision Trees**: Visual decision flow diagrams
- [ ] **Team Collaboration**: Multi-user decision making
- [ ] **API Integrations**: Connect to business tools (Slack, Notion, etc.)
- [ ] **Mobile App**: React Native version

## 💡 Why This Project?

This project showcases:
- **Full-stack development** with modern tech stack
- **AI integration** with multiple API providers
- **Production-ready** deployment and error handling
- **User experience** design for complex AI interactions
- **Cost optimization** using free tier APIs
- **Enterprise readiness** with analytics and history

Perfect for:
- **Job applications** - demonstrates AI/ML integration skills
- **Consulting projects** - real business value delivery
- **Learning** - modern web development with AI
- **Startups** - free decision support system

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter** for free access to DeepSeek R1
- **Groq** for ultra-fast Llama inference  
- **Together AI** for open-source model hosting
- **HuggingFace** for the incredible model ecosystem
- **FastAPI** and **React** teams for amazing frameworks

## 🆘 Support

- **Issues**: GitHub Issues for bugs and feature requests
- **Discussions**: GitHub Discussions for questions

---

**⭐ Star this repo if it helps with your projects!**

Built with ❤️ for the AI community by developers, for developers. 
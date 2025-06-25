# 🚀 Agentic XAI - Free AI Decision Making System

> **Completely Free AI-Powered Decision Support** - Get expert recommendations for any business decision using state-of-the-art AI models at zero cost.

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
- No API keys required for basic usage!

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

## 🔑 Optional: Free API Keys for Enhanced Performance

While the system works without any API keys, you can optionally add free API keys for better performance:

### 1. OpenRouter (DeepSeek R1 - FREE)
- Visit: https://openrouter.ai/
- Sign up for free account  
- Get $1 free credit
- Model: `deepseek/deepseek-r1:free`
- Add to environment: `OPENROUTER_API_KEY=your_key_here`

### 2. Groq (Llama 3.3 - FREE)
- Visit: https://console.groq.com/
- Free tier: 14,400 requests/day
- Model: `llama-3.3-70b-versatile`
- Add to environment: `GROQ_API_KEY=your_key_here`

### 3. Together AI (FREE)
- Visit: https://api.together.xyz/
- $1 starting credit
- Model: `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`
- Add to environment: `TOGETHER_API_KEY=your_key_here`

### 4. Hyperbolic (Up to 80% cheaper)
- Visit: https://hyperbolic.xyz/
- Free base plan
- Add to environment: `HYPERBOLIC_API_KEY=your_key_here`

### 5. HuggingFace (FREE)
- Visit: https://huggingface.co/settings/tokens
- Free inference API
- Add to environment: `HUGGING_FACE_TOKEN=your_token_here`

## ⚙️ Environment Setup

Create a `.env` file in the `api` directory:

```bash
# Optional - System works without these
OPENROUTER_API_KEY=sk-or-v1-your-key-here
GROQ_API_KEY=gsk_your-key-here  
TOGETHER_API_KEY=your-key-here
HYPERBOLIC_API_KEY=your-key-here
HUGGING_FACE_TOKEN=hf_your-token-here

# For production deployment
NODE_ENV=production
```

## 🏗️ Architecture

```
Frontend (React + TypeScript + Material-UI)
    ↓ HTTP requests
Backend (FastAPI + Python)
    ↓ Try multiple APIs in order
├── OpenRouter (DeepSeek R1) - Primary
├── Groq (Llama 3.3) - Secondary  
├── Together AI (Llama 3.1) - Tertiary
└── Sophisticated Fallback Logic - Always works
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
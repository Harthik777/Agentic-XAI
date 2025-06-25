import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Fade,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Alert,
  Divider
} from '@mui/material';
import TaskForm from './components/TaskForm';
import ExplanationView from './components/ExplanationView';
import ConfidenceMeter from './components/ConfidenceMeter';
import DecisionHistory from './components/DecisionHistory';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { TaskResponse } from './types';

// Determine the base URL for the backend API.
// 1. If the user has explicitly set REACT_APP_API_BASE, always honour it.
// 2. Otherwise, default to:
//    • '/api'   in production (/api routes are proxied to the FastAPI handler on Vercel)
//    • 'http://localhost:8000' during local development when the FastAPI server is usually started with `uvicorn main:app --reload`.
//
// This avoids hard-coding '/api' in the fetch path which caused 404s when running locally.
const API_BASE =
  process.env.REACT_APP_API_BASE ??
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000');

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [response, setResponse] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TaskResponse[]>([]);

  const handleTaskSubmit = async (task: string, context: string, priority: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task,
          context,
          priority
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TaskResponse = await response.json();
      setResponse(data);
      setHistory(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 decisions
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            🚀 Agentic XAI
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            AI-Powered Decision Making with Explainable Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Get intelligent recommendations for any business decision using the latest free AI models. 
            Our system provides detailed analysis, confidence scores, alternatives, and risk assessment.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>🆓 Completely Free AI Service:</strong> This system uses the best free AI APIs available including 
            OpenRouter (DeepSeek R1), Groq (Llama 3.3), and Together AI. No API keys required for basic usage!
            For enhanced performance, you can optionally add your own free API keys as environment variables.
          </Typography>
        </Alert>

        <TaskForm 
          onSubmit={handleTaskSubmit} 
          loading={loading}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {response && (
          <>
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ mb: 4 }}>
              <ConfidenceMeter confidence={response.confidence} />
            </Box>

            <ExplanationView response={response} />

            {history.length > 0 && (
              <>
                <Divider sx={{ my: 4 }} />
                <DecisionHistory decisions={history} />
              </>
            )}

            <Divider sx={{ my: 4 }} />
            <AnalyticsDashboard decisions={history} />
          </>
        )}

        <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            💡 About This System
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Agentic XAI combines multiple state-of-the-art AI models to provide sophisticated decision support 
            for any industry or domain. The system analyzes your situation, provides recommendations with detailed 
            reasoning, suggests alternatives, and identifies potential risks.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Technology Stack:</strong> React TypeScript frontend, FastAPI Python backend, 
            integrated with free tier APIs from OpenRouter (DeepSeek R1), Groq (Llama 3.3), Together AI, 
            and advanced fallback logic for 100% reliability.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
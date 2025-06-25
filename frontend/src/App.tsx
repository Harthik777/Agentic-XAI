import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Fade,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import TaskForm from './components/TaskForm';
import ExplanationView from './components/ExplanationView';
import { Decision, TaskRequest } from './types';

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
    mode: 'dark',
    primary: { main: '#7e57c2' },
    secondary: { main: '#03a9f4' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<Decision | null>(null);

  const handleTaskSubmit = async (request: TaskRequest) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
          // First try to get the response as text
          const responseText = await res.text();
          // Then try to parse it as JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If response is not JSON (e.g., HTML error page), provide a helpful message
          if (res.status >= 500) {
            errorMessage = 'Server error occurred. Please check your environment variables and API deployment.';
          } else if (res.status === 404) {
            errorMessage = 'API endpoint not found. Please check your deployment configuration.';
          }
        }
        throw new Error(errorMessage);
      }

      const data: Decision = await res.json();
      setResponse(data);

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Agentic-XAI
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your personal AI decision-making assistant with built-in explainability.
          </Typography>
        </Paper>

        <TaskForm onSubmit={handleTaskSubmit} loading={loading} error={error} />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {response && (
          <Fade in={true} timeout={500}>
            <div>
              <ExplanationView response={response} />
            </div>
          </Fade>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
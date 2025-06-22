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

// Use environment variable for API URL, fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
      const res = await fetch(`${API_URL}/api/tasks/process_task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
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
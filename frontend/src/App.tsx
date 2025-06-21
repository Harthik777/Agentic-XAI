import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TaskForm from './components/TaskForm';
import ExplanationView from './components/ExplanationView';
import { TaskResponse } from './types';

const API_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:8000');

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
});

function App() {
  const [loading, setLoading] = useState(false);
  const [taskResponse, setTaskResponse] = useState<TaskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTaskSubmit = async (taskDescription: string, context: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_description: taskDescription,
          context,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore if response body is not JSON
        }
        const errorMessage = errorData?.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      if (!responseText) {
        console.error("Received empty response from API");
        setError("Received an empty response from the server.");
        setTaskResponse(null);
        setLoading(false);
        return;
      }

      const data: any = JSON.parse(responseText);

      if (data && typeof data.decision === 'string' && data.explanation && typeof data.explanation === 'object') {
        const exp = data.explanation;
        if (Array.isArray(exp.reasoning_steps) && typeof exp.feature_importance === 'object' && typeof exp.model_details === 'object') {
          setTaskResponse(data as TaskResponse);
          setError(null);
        } else {
          console.error("Received data with malformed explanation structure:", data);
          setError("Received data with an invalid explanation structure from the server.");
          setTaskResponse(null);
        }
      } else {
        console.error("Received malformed or incomplete data from API:", data);
        setError("Received malformed or incomplete data from the server.");
        setTaskResponse(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during fetch.');
      setTaskResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Agentic-XAI
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Intelligent Agent with Explainable AI
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: 3,
              mt: 3
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <TaskForm onSubmit={handleTaskSubmit} loading={loading} />
              </Paper>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error" align="center" sx={{ p: 2 }}>{error}</Typography>
                ) : taskResponse ? (
                  <ExplanationView response={taskResponse} />
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ p: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Submit a task to see the agent's decision and explanation.
                  </Typography>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
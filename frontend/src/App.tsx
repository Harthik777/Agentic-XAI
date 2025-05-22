import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TaskForm from './components/TaskForm';
import ExplanationView from './components/ExplanationView';
import { TaskResponse } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
        throw new Error('Failed to process task');
      }

      const data = await response.json();
      setTaskResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

          <Grid container spacing={3}>
            {/* Corrected Grid item */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <TaskForm onSubmit={handleTaskSubmit} loading={loading} />
              </Paper>
            </Grid>
            {/* Corrected Grid item */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : taskResponse ? (
                  <ExplanationView response={taskResponse} />
                ) : (
                  <Typography color="text.secondary" align="center">
                    Submit a task to see the agent's decision and explanation
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
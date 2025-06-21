import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TaskForm from './components/TaskForm';
import ExplanationView from './components/ExplanationView';
import { TaskResponse } from './types';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:8000');

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [loading, setLoading] = useState(false);
  const [taskResponse, setTaskResponse] = useState<TaskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleTaskSubmit = async (taskDescription: string, context: any) => {
    setLoading(true);
    setError(null);
    setShowError(false);

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
        const errorMessage = errorData?.detail || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data: TaskResponse = await response.json();

      if (data && data.decision && data.explanation) {
        setTaskResponse(data);
        setError(null);
      } else {
        throw new Error("Invalid response format from server");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setShowError(true);
      setTaskResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Agentic-XAI
          </Typography>
          <Typography variant="h6" component="h2" color="text.secondary">
            Intelligent Agent with Explainable AI
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
            Submit tasks to our AI agent and receive clear decisions along with detailed explanations
            of the reasoning process and feature importance analysis.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, height: 'fit-content' }}>
              <TaskForm onSubmit={handleTaskSubmit} loading={loading} />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, minHeight: 400 }}>
              {loading ? (
                <Box 
                  display="flex" 
                  flexDirection="column"
                  justifyContent="center" 
                  alignItems="center" 
                  minHeight={300}
                  gap={2}
                >
                  <CircularProgress size={40} />
                  <Typography variant="body1" color="text.secondary">
                    Processing your task...
                  </Typography>
                </Box>
              ) : taskResponse ? (
                <ExplanationView response={taskResponse} />
              ) : (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  minHeight={300}
                  sx={{ textAlign: 'center' }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Submit a task to see the agent's decision and explanation
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Snackbar 
          open={showError} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
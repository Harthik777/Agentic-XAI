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
import { TaskResponse, Explanation } from './types'; // Ensure Explanation is imported if used directly

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
    // setTaskResponse(null); // Optionally clear previous response immediately

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
        // Try to get more specific error from response body if possible
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore if response body is not JSON
        }
        const errorMessage = errorData?.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Check if the response is empty before trying to parse JSON
      const responseText = await response.text();
      if (!responseText) {
        console.error("Received empty response from API");
        setError("Received an empty response from the server.");
        setTaskResponse(null);
        setLoading(false);
        return;
      }

      const data: any = JSON.parse(responseText); // Parse text after checking it's not empty

      // Validate the structure of data before setting it
      if (data && typeof data.decision === 'string' && data.explanation && typeof data.explanation === 'object') {
        // Further check if explanation has the required nested properties
        const exp = data.explanation as Explanation; // Cast for easier access
        if (Array.isArray(exp.reasoning_steps) && typeof exp.feature_importance === 'object' && typeof exp.model_details === 'object') {
          setTaskResponse(data as TaskResponse);
          setError(null); // Clear previous errors
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
      setTaskResponse(null); // Ensure taskResponse is null on error
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <TaskForm onSubmit={handleTaskSubmit} loading={loading} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
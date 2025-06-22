import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Fade,
  Slide,
  Card,
  CardContent,
  Chip,
  Stack,
  alpha,
  Fab,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Psychology,
  AutoAwesome,
  TrendingUp,
  Security,
  Speed,
  Visibility,
  DarkMode,
  LightMode,
  KeyboardArrowUp,
} from '@mui/icons-material';
import TaskForm from './components/TaskForm';
import ExplanationView from './components/ExplanationView';
import { TaskResponse } from './types';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:8000');

// Enhanced theme with dark mode support
const createAppTheme = (darkMode: boolean) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#667eea',
      light: '#818cf8',
      dark: '#5b6bd4',
    },
    secondary: {
      main: '#f093fb',
      light: '#fbb6fd',
      dark: '#e879f0',
    },
    background: {
      default: darkMode ? '#0f172a' : '#f8fafc',
      paper: darkMode ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: darkMode ? '#f1f5f9' : '#1e293b',
      secondary: darkMode ? '#94a3b8' : '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.025em',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      color: darkMode ? '#94a3b8' : '#64748b',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      color: darkMode ? '#cbd5e1' : '#475569',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: darkMode ? '#94a3b8' : '#64748b',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'}`,
          boxShadow: darkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

// Feature highlights data
const features = [
  {
    icon: <Psychology sx={{ fontSize: 32 }} />,
    title: 'Explainable AI',
    description: 'Get detailed reasoning and feature importance analysis for every decision',
    color: '#667eea',
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 32 }} />,
    title: 'Smart Decisions',
    description: 'AI-powered decision making across 11+ different scenario types',
    color: '#f093fb',
  },
  {
    icon: <TrendingUp sx={{ fontSize: 32 }} />,
    title: 'Confidence Scoring',
    description: 'Quantified confidence levels and uncertainty estimation',
    color: '#10b981',
  },
  {
    icon: <Security sx={{ fontSize: 32 }} />,
    title: 'Audit Ready',
    description: 'Complete decision trails for regulatory compliance',
    color: '#f59e0b',
  },
  {
    icon: <Speed sx={{ fontSize: 32 }} />,
    title: 'Real-time',
    description: 'Instant analysis with sub-5 second response times',
    color: '#ef4444',
  },
  {
    icon: <Visibility sx={{ fontSize: 32 }} />,
    title: 'Transparent',
    description: 'See exactly how and why decisions are made',
    color: '#3b82f6',
  },
];

function App() {
  const [loading, setLoading] = useState(false);
  const [taskResponse, setTaskResponse] = useState<TaskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const theme = createAppTheme(darkMode);

  // Effect to handle state changes after API call
  useEffect(() => {
    if (taskResponse) {
      setShowResult(true);
      setLoading(false);
    }
  }, [taskResponse]);

  const handleTaskSubmit = async (taskDescription: string, context: any) => {
    setLoading(true);
    setTaskResponse(null); // Clear previous results
    setShowResult(false);
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
        setTaskResponse(data); // This will trigger the useEffect
      } else {
        throw new Error('Invalid response structure from server');
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setShowError(true);
      setLoading(false); // Stop loading on error
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Dark Mode Toggle */}
      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Hero Section */}
      <Box
        sx={{
          background: darkMode 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box textAlign="center">
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom
                sx={{ 
                  color: 'white',
                  background: 'none',
                  WebkitTextFillColor: 'white',
                  mb: 3,
                }}
              >
                Agentic-XAI
              </Typography>
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  mb: 4,
                  maxWidth: 600,
                  mx: 'auto',
                  fontSize: '1.25rem',
                }}
              >
                Intelligent Agent with Explainable AI
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  maxWidth: 800, 
                  mx: 'auto',
                  fontSize: '1.125rem',
                  lineHeight: 1.6,
                }}
              >
                Submit complex tasks to our AI agent and receive clear decisions along with detailed explanations, 
                feature importance analysis, and confidence scoring for transparent, auditable decision-making.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in timeout={1500}>
          <Box textAlign="center" mb={6}>
            <Typography variant="h2" component="h3" gutterBottom color="text.primary">
              Why Choose Our XAI System?
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600} mx="auto">
              Built for transparency, designed for trust, and optimized for real-world decision-making scenarios.
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Slide in direction="up" timeout={800 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${feature.color}, ${alpha(feature.color, 0.7)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h4" component="h4" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Main Application Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="xl">
          <Fade in timeout={2000}>
            <Box textAlign="center" mb={6}>
              <Typography variant="h2" component="h3" gutterBottom>
                Try the AI Decision System
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth={600} mx="auto">
                Experience the power of explainable AI with real-time decision analysis and transparent reasoning.
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} lg={5}>
              <Slide in direction="right" timeout={1000}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    height: 'fit-content',
                    position: 'sticky',
                    top: 20,
                  }}
                >
                  <Box mb={3}>
                    <Typography variant="h4" component="h4" gutterBottom>
                      Submit a Task
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Describe your decision scenario and provide context for better analysis.
                    </Typography>
                  </Box>
                  <TaskForm onSubmit={handleTaskSubmit} loading={loading} />
                </Paper>
              </Slide>
            </Grid>
            
            <Grid item xs={12} lg={7}>
              <Slide in direction="left" timeout={1000}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    minHeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box mb={3}>
                    <Typography variant="h4" component="h4" gutterBottom>
                      AI Analysis Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Detailed decision analysis with explanations and confidence metrics.
                    </Typography>
                  </Box>
                  
                  <Box flex={1} display="flex" flexDirection="column" justifyContent="center">
                    {loading ? (
                      <Box 
                        display="flex" 
                        flexDirection="column"
                        justifyContent="center" 
                        alignItems="center" 
                        flex={1}
                        gap={3}
                      >
                        <CircularProgress size={50} thickness={4} />
                        <Typography variant="h6" color="text.secondary">
                          🧠 Analyzing your task...
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label="Processing context" size="small" />
                          <Chip label="Generating decision" size="small" />
                          <Chip label="Calculating confidence" size="small" />
                        </Stack>
                      </Box>
                    ) : taskResponse && showResult ? (
                      <Fade in timeout={500}>
                        <Box>
                          <ExplanationView response={taskResponse} />
                        </Box>
                      </Fade>
                    ) : (
                      <Box 
                        display="flex" 
                        flexDirection="column"
                        justifyContent="center" 
                        alignItems="center" 
                        flex={1}
                        sx={{ textAlign: 'center' }}
                      >
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            opacity: 0.8,
                          }}
                        >
                          <Psychology sx={{ fontSize: 60, color: 'white' }} />
                        </Box>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Ready for your first decision
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Submit a task to see detailed AI analysis with explanations
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      <Fab
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5b6bd4 0%, #6b4397 100%)',
          },
        }}
      >
        <KeyboardArrowUp />
      </Fab>

      {/* Enhanced Error Handling */}
      <Snackbar 
        open={showError} 
        autoHideDuration={8000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Snackbar>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 4, 
          textAlign: 'center', 
          bgcolor: 'transparent',
          mt: 'auto',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Built with ❤️ by Harthik
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
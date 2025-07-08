import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert,
  Fab,
  Slide,
  Zoom,
  Paper,
  Backdrop,
  CircularProgress,
  Snackbar,
  useMediaQuery,
  Stack
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Insights,
  AutoAwesome,
  TrendingUp,
  Security
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import TaskForm from './components/TaskForm';
import ExplanationView from './components/ExplanationView';
import DecisionHistory from './components/DecisionHistory';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { TaskResponse } from './types';

// Modern theme with industry standards
const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#818cf8' : '#4f46e5',
      light: mode === 'dark' ? '#a5b4fc' : '#6366f1',
      dark: mode === 'dark' ? '#6366f1' : '#3730a3',
    },
    secondary: {
      main: mode === 'dark' ? '#a78bfa' : '#8b5cf6',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#fafbfc',
      paper: mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
      secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: 'clamp(2.5rem, 4vw, 4rem)',
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'dark' 
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.3)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
        },
      },
    },
  },
});

// Determine API base URL
const API_BASE = process.env.REACT_APP_API_BASE || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000');

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Hero section component
const HeroSection: React.FC<{ darkMode: boolean }> = ({ darkMode }: { darkMode: boolean }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={containerVariants}
  >
    <Paper
      sx={{
        p: { xs: 4, sm: 6, md: 8 },
        mb: 6,
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }}
      />
      
      <Stack spacing={3} alignItems="center" textAlign="center" position="relative">
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <AutoAwesome sx={{ fontSize: 40, color: 'white' }} />
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="h1"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: darkMode ? '#818cf8' : '#4f46e5',
              textAlign: 'center',
              maxWidth: 800,
              mb: 2,
              padding: '8px 12px',
              lineHeight: 1.3,
              letterSpacing: '0.02em',
              overflow: 'visible',
              display: 'inline-block',
              width: 'fit-content',
              margin: '0 auto 16px',
            }}
          >
            Agentic XAI
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="h4"
            color="text.secondary"
            sx={{
              fontWeight: 400,
              maxWidth: 600,
              mb: 3,
            }}
          >
            Google Gemini AI-Powered Decision Intelligence Platform
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: '1.125rem',
              maxWidth: 700,
              lineHeight: 1.7,
            }}
          >
            Make smarter business decisions with Google's Gemini AI. Get expert recommendations, 
            confidence scores, and detailed analysis for any industry or domain.
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
            <Box textAlign="center">
              <Insights sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Google Gemini AI
              </Typography>
            </Box>
            <Box textAlign="center">
              <TrendingUp sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Real-time Analysis
              </Typography>
            </Box>
            <Box textAlign="center">
              <Security sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                100% Free
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      </Stack>
    </Paper>
  </motion.div>
);

function App() {
  const [response, setResponse] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TaskResponse[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = createAppTheme(darkMode ? 'dark' : 'light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      setDarkMode(prefersDarkMode);
    }
  }, [prefersDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const handleSubmit = async (task: string, context: string, priority: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, context, priority }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data);
      setHistory((prev: TaskResponse[]) => [data, ...prev.slice(0, 9)]); // Keep last 10
      setSuccessMessage('Decision analysis completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to get AI recommendation: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: darkMode
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)',
          position: 'relative',
        }}
      >
        {/* Theme Toggle */}
        <Zoom in timeout={500}>
          <Fab
            size="medium"
            onClick={toggleDarkMode}
            sx={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 1000,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </Fab>
        </Zoom>

        <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
          <HeroSection darkMode={darkMode} />

          {error && (
            <Slide direction="down" in={Boolean(error)} mountOnEnter unmountOnExit>
              <Alert 
                severity="error" 
                onClose={() => setError(null)}
                sx={{ 
                  mb: 4,
                  borderRadius: 3,
                  '& .MuiAlert-message': { fontSize: '0.95rem' }
                }}
              >
                {error}
              </Alert>
            </Slide>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TaskForm onSubmit={handleSubmit} loading={loading} />
          </motion.div>

          {response && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ExplanationView response={response} />
            </motion.div>
          )}

          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <AnalyticsDashboard decisions={history} />
              <DecisionHistory decisions={history} />
            </motion.div>
          )}

          {/* Loading Backdrop */}
          <Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme: any) => theme.zIndex.drawer + 1,
              backdropFilter: 'blur(4px)',
            }}
            open={loading}
          >
            <Box textAlign="center">
              <CircularProgress color="inherit" size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3, color: 'white' }}>
                Google Gemini AI is analyzing your decision...
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
                Using advanced reasoning and analysis capabilities
              </Typography>
            </Box>
          </Backdrop>

          {/* Success Snackbar */}
          <Snackbar
            open={Boolean(successMessage)}
            autoHideDuration={4000}
            onClose={() => setSuccessMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSuccessMessage(null)}
              severity="success"
              sx={{ borderRadius: 3 }}
            >
              {successMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
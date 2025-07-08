/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  AutoAwesome,
  DataObject,
  Send,
  Refresh,
  Business,
  TrendingUp,
  Psychology,
  Groups,
  Campaign,
  Build,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { TaskRequest } from '../types';

interface TaskFormProps {
  onSubmit: (task: string, context: string, priority: string) => void;
  loading: boolean;
}

// Enhanced sample scenarios for different industries
const sampleScenarios = [
  {
    icon: <Business />,
    title: "Business Strategy",
    task: "Should we expand to international markets?",
    context: "We're a mid-size SaaS company with strong domestic performance. Revenue: $10M annually, team of 50. Considering expansion to Europe and Asia. Main concerns: cultural differences, regulatory compliance, competition from local players."
  },
  {
    icon: <TrendingUp />,
    title: "Technology",
    task: "Should we migrate our infrastructure to the cloud?",
    context: "Currently running on-premise servers. System performance issues during peak times. Cloud migration would cost $200K upfront but reduce operational costs by 30%. Team has limited cloud experience."
  },
  {
    icon: <Psychology />,
    title: "Finance",
    task: "Should we take venture capital funding?",
    context: "Growing startup with $2M ARR, 40% YoY growth. VC offers $10M for 25% equity. Would accelerate growth but dilute founder control. Alternative: continue bootstrapping with slower growth."
  },
  {
    icon: <Groups />,
    title: "Human Resources",
    task: "Should we implement a remote-first work policy?",
    context: "Post-pandemic decision for 200-employee company. 60% of employees prefer remote work. Office lease expires in 6 months. Productivity remained stable during remote work periods. Concerns about company culture and collaboration."
  },
  {
    icon: <Campaign />,
    title: "Marketing",
    task: "Should we pivot our marketing strategy to focus on social media?",
    context: "Traditional marketing channels showing declining ROI. Social media engagement is high but conversion rates are unclear. Budget: $500K annually. Target audience: millennials and Gen Z professionals."
  },
  {
    icon: <Build />,
    title: "Operations",
    task: "Should we automate our manufacturing process?",
    context: "Manual process employs 30 workers, high error rate (5%), increasing labor costs. Automation would cost $2M, reduce errors to <1%, but eliminate 20 jobs. ROI estimated at 3 years."
  }
];

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, loading }) => {
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [priority, setPriority] = useState('medium');
  const theme = useTheme();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (task.trim() && context.trim()) {
      onSubmit(task.trim(), context.trim(), priority);
    }
  };

  const fillSample = (sampleTask: string, sampleContext: string) => {
    setTask(sampleTask);
    setContext(sampleContext);
  };
  
  const clearForm = () => {
    setTask('');
    setContext('');
    setPriority('medium');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 6 },
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
              }}
            >
              <AutoAwesome sx={{ fontSize: 28, color: 'white' }} />
            </Box>
          </motion.div>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            What decision do you need help with?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Describe your situation and get Google Gemini AI-powered analysis with detailed reasoning, alternatives, and risk assessment
          </Typography>
        </Box>

        {/* Sample Scenarios */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}
          >
            Try a Sample Scenario
          </Typography>
          <Grid container spacing={2}>
            {sampleScenarios.map((scenario, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Tooltip title={`Click to use this ${scenario.title.toLowerCase()} scenario`}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                    }}
                    onClick={() => fillSample(scenario.task, scenario.context)}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          color: 'primary.main',
                          minWidth: 40,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {scenario.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: 'primary.main' }}
                        >
                          {scenario.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {scenario.task}
        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Stack spacing={3}>
        <TextField
          fullWidth
          multiline
          rows={4}
              label="Describe your decision or challenge"
              placeholder="e.g., Should we invest in AI automation for our customer service department?"
              value={task}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTask(e.target.value)}
          required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                },
              }}
            />

          <TextField
            fullWidth
            multiline
              rows={3}
              label="Additional Context (Optional but Recommended)"
              placeholder="e.g., Company size, budget constraints, timeline, current situation, specific requirements..."
              value={context}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContext(e.target.value)}
            sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Decision Priority</InputLabel>
              <Select
                value={priority}
                label="Decision Priority"
                onChange={(e: SelectChangeEvent<string>) => setPriority(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="low">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                      }}
                    />
                    <Typography>Low Priority - Exploratory analysis</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="medium">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                      }}
                    />
                    <Typography>Medium Priority - Important decision</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="high">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'error.main',
                      }}
                    />
                    <Typography>High Priority - Critical/urgent decision</Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
                disabled={!task.trim() || !context.trim() || loading}
                startIcon={loading ? null : <Send />}
                sx={{
                  minWidth: 200,
                  height: 56,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #7c3aed 100%)',
                    boxShadow: '0 12px 35px rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.action.disabled, 0.12),
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                {loading ? 'Analyzing...' : 'Get Gemini AI Analysis'}
          </Button>

              <Tooltip title="Clear form">
                <IconButton
            onClick={clearForm}
            disabled={loading}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    '&:hover': {
                      background: alpha(theme.palette.action.hover, 0.04),
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>
          </motion.div>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              🤖 Powered by Google Gemini 1.5 Flash - Advanced AI reasoning and analysis
            </Typography>
          </Box>
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default TaskForm; 
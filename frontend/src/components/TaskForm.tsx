import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Chip,
  Collapse,
  Card,
  CardContent,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  AutoAwesome,
  DataObject,
  Send,
  Refresh
} from '@mui/icons-material';
import { TaskRequest } from '../types';

interface TaskFormProps {
  onSubmit: (task: string, context: string, priority: string) => void;
  loading: boolean;
}

// Industry-agnostic sample tasks
const sampleTasks = [
    {
      category: "Business Strategy",
      task: "Develop a market entry strategy for a new geographic region",
      context: "SaaS company with $10M ARR looking to expand internationally"
    },
    {
      category: "Technology",
      task: "Evaluate whether to build vs buy a customer analytics platform",
      context: "Mid-size e-commerce company with 50,000 daily active users"
    },
    {
      category: "Finance",
      task: "Optimize budget allocation across marketing channels",
      context: "D2C brand with $5M annual revenue and 15% growth target"
    },
    {
      category: "Operations",
      task: "Implement automation to reduce manual data processing",
      context: "Professional services firm with 200 employees and growing data volume"
    },
    {
      category: "HR & Talent",
      task: "Design a remote work policy for hybrid workforce",
      context: "Tech startup with 75 employees across multiple time zones"
    },
    {
      category: "Product",
      task: "Prioritize feature development for Q2 roadmap",
      context: "Mobile app with 100K users and limited engineering resources"
    },
    {
      category: "Sales",
      task: "Restructure sales territories to improve coverage and efficiency",
      context: "B2B software company with 25-person sales team and uneven performance"
    },
    {
      category: "Marketing",
      task: "Launch a content marketing strategy to increase brand awareness",
      context: "B2B consulting firm competing in saturated market"
    }
];

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, loading }) => {
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      onSubmit(task, context, priority);
    }
  };

  const handleSampleTaskClick = (sampleTask: typeof sampleTasks[0]) => {
    setTask(sampleTask.task);
    setContext(sampleTask.context);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AutoAwesome sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          AI Decision Assistant
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Get expert AI analysis and recommendations for any business decision. 
        Our system provides detailed reasoning, alternatives, and risk assessment.
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Describe your decision or challenge"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          margin="normal"
          required
          placeholder="e.g., Should we invest in AI automation for our customer service?"
        />

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Additional Context (Optional)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          margin="normal"
          placeholder="e.g., Company size, budget constraints, timeline, specific requirements..."
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Priority Level</InputLabel>
          <Select
            value={priority}
            label="Priority Level"
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="low">Low - Exploratory analysis</MenuItem>
            <MenuItem value="medium">Medium - Important decision</MenuItem>
            <MenuItem value="high">High - Critical/urgent decision</MenuItem>
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading || !task.trim()}
          startIcon={<Send />}
          sx={{ mt: 2, mb: 3 }}
        >
          {loading ? 'AI is analyzing...' : 'Get AI Recommendation'}
        </Button>
      </form>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Try these sample scenarios:
      </Typography>
      
      <Grid container spacing={1}>
        {sampleTasks.map((sample, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Chip
              label={`${sample.category}: ${sample.task.substring(0, 40)}...`}
              onClick={() => handleSampleTaskClick(sample)}
              sx={{ 
                width: '100%', 
                height: 'auto',
                py: 1,
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  textAlign: 'left'
                }
              }}
              variant="outlined"
              color="primary"
              clickable
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TaskForm; 
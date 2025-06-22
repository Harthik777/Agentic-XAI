import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Collapse,
  Chip,
  Stack,
  useTheme,
  alpha,
  Grow,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  AutoAwesome,
  DataObject,
  Send,
  Refresh,
  InfoOutlined
} from '@mui/icons-material';
import { TaskRequest } from '../types';

interface TaskFormProps {
  onSubmit: (request: TaskRequest) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

// Sample tasks for user guidance
const sampleTasks = [
    {
      title: "Database Selection",
      task: "Which database should we use for our new social media app?",
      context: {
        expected_daily_users: 50000,
        team_sql_experience: "intermediate",
        budget_constraint: "moderate",
        scalability_importance: "high",
      }
    },
    {
      title: "Marketing Strategy",
      task: "Should we invest in social media marketing or SEO for our e-commerce store?",
      context: {
        monthly_budget: 5000,
        target_audience_age: "25-40",
        product_category: "fashion",
        time_horizon: "6 months"
      }
    },
];

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, loading, error }) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isValidJson, setIsValidJson] = useState(true);
  const theme = useTheme();
  const contextInputRef = useRef<HTMLTextAreaElement>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const jsonString = e.target.value;
    setContextInput(jsonString);
    if (!jsonString.trim()) {
      setIsValidJson(true);
      return;
    }
    try {
      JSON.parse(jsonString);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim() || !isValidJson) {
      return;
    }
    const context = contextInput.trim() ? JSON.parse(contextInput) : {};
    onSubmit({ task_description: taskDescription, context });
  };
  
  const loadSample = (sample: typeof sampleTasks[0]) => {
    setTaskDescription(sample.task);
    setContextInput(JSON.stringify(sample.context, null, 2));
    setShowAdvanced(true);
    setTimeout(() => {
        contextInputRef.current?.focus();
    }, 100);
  };
  
  const clearForm = () => {
    setTaskDescription('');
    setContextInput('');
  };

  return (
    <Card component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 4 } }}>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          Describe Your Task
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="e.g., Should I invest in stocks or real estate?"
          variant="outlined"
          disabled={loading}
          required
          sx={{ mb: 2 }}
        />

        <Button 
          variant="text" 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          startIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
          sx={{ mb: 1 }}
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </Button>

        <Collapse in={showAdvanced}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DataObject color="primary" />
            Provide Context (as JSON)
          </Typography>
          <TextField
            inputRef={contextInputRef}
            fullWidth
            multiline
            rows={6}
            value={contextInput}
            onChange={handleJsonChange}
            placeholder='{ "risk_tolerance": "high", "investment_horizon": "10 years" }'
            variant="outlined"
            disabled={loading}
            error={!isValidJson}
            helperText={!isValidJson && "Please enter valid JSON."}
            sx={{ 
              '& .MuiOutlinedInput-root': { fontFamily: 'monospace' },
            }}
          />
        </Collapse>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Need inspiration? Try a sample:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {sampleTasks.map(sample => (
              <Chip
                key={sample.title}
                label={sample.title}
                onClick={() => loadSample(sample)}
                disabled={loading}
                variant="outlined"
                color="secondary"
              />
            ))}
          </Stack>
        </Box>

        {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !taskDescription.trim() || !isValidJson}
            startIcon={<Send />}
            size="large"
          >
            {loading ? 'Analyzing...' : 'Get Decision'}
          </Button>
          <Button
            variant="outlined"
            onClick={clearForm}
            disabled={loading}
            startIcon={<Refresh />}
            size="large"
          >
            Clear
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskForm; 
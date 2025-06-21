import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TaskFormProps } from '../types';

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, loading }) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [context, setContext] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setJsonError(null);
      return true;
    }
    
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch (error) {
      setJsonError('Invalid JSON format');
      return false;
    }
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContext(value);
    validateJson(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskDescription.trim()) {
      return;
    }

    let contextObj = {};
    if (context.trim()) {
      if (!validateJson(context)) {
        return;
      }
      try {
        contextObj = JSON.parse(context);
      } catch (err) {
        setJsonError('Failed to parse JSON');
        return;
      }
    }

    await onSubmit(taskDescription, contextObj);
  };

  const insertSampleContext = () => {
    const sample = JSON.stringify({
      "priority": "high",
      "deadline": "2024-12-31",
      "budget": 10000,
      "team_size": 5,
      "complexity": "medium"
    }, null, 2);
    setContext(sample);
    setJsonError(null);
  };

  const clearContext = () => {
    setContext('');
    setJsonError(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Submit a Task
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          fullWidth
          label="Task Description"
          multiline
          rows={4}
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          required
          disabled={loading}
          placeholder="Describe the task you want the AI agent to analyze and decide on..."
          helperText="Provide a clear, detailed description of what you need help with"
        />

        <Accordion elevation={1}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Context (Optional)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Provide additional context as JSON to help the agent make better decisions
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label="Use Sample" 
                  onClick={insertSampleContext} 
                  variant="outlined" 
                  size="small"
                  disabled={loading}
                />
                <Chip 
                  label="Clear" 
                  onClick={clearContext} 
                  variant="outlined" 
                  size="small"
                  disabled={loading}
                />
              </Box>

              <TextField
                fullWidth
                label="Context (JSON)"
                multiline
                rows={6}
                value={context}
                onChange={handleContextChange}
                disabled={loading}
                placeholder='{"key": "value", "priority": "high"}'
                error={!!jsonError}
                helperText={jsonError || "Enter valid JSON or leave empty"}
                sx={{ fontFamily: 'monospace' }}
              />

              {jsonError && (
                <Alert severity="error">
                  {jsonError}
                </Alert>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading || !taskDescription.trim() || !!jsonError}
          sx={{ py: 1.5, mt: 2 }}
        >
          {loading ? 'Processing...' : 'Analyze Task'}
        </Button>
      </Box>
    </Box>
  );
};

export default TaskForm; 
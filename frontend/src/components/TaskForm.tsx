import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { TaskFormProps } from '../types';

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, loading }) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [context, setContext] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contextObj = context ? JSON.parse(context) : {};
    await onSubmit(taskDescription, contextObj);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Submit a Task
      </Typography>
      
      <TextField
        fullWidth
        label="Task Description"
        multiline
        rows={4}
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
        margin="normal"
        required
        disabled={loading}
      />

      <TextField
        fullWidth
        label="Context (JSON)"
        multiline
        rows={3}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        margin="normal"
        placeholder='{"key": "value"}'
        disabled={loading}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading || !taskDescription}
        sx={{ mt: 2 }}
      >
        {loading ? 'Processing...' : 'Submit Task'}
      </Button>
    </Box>
  );
};

export default TaskForm; 
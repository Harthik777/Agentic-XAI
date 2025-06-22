import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Collapse,
  Alert,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  Grow,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  AutoAwesome,
  DataObject,
  Lightbulb,
  CheckCircle,
  Error as ErrorIcon,
  Send,
  Refresh,
} from '@mui/icons-material';

interface TaskFormProps {
  onSubmit: (taskDescription: string, context: any) => void;
  loading: boolean;
}

const sampleTasks = [
  {
    title: "Database Selection",
    task: "Which database should we use for our new social media app?",
    context: {
      expected_daily_users: 50000,
      team_sql_experience: "intermediate",
      budget_constraint: "moderate",
      scalability_importance: "high",
      data_consistency_needs: "high",
      read_write_ratio: "80:20",
      deployment_preference: "cloud"
    }
  },
  {
    title: "Marketing Strategy",
    task: "Should we invest in social media marketing or SEO for our e-commerce store?",
    context: {
      monthly_budget: 5000,
      target_audience_age: "25-40",
      product_category: "fashion",
      competition_level: "high",
      current_website_traffic: 1000,
      conversion_rate: 0.02,
      time_horizon: "6 months"
    }
  },
  {
    title: "Hiring Decision",
    task: "Should we hire a senior developer or two junior developers?",
    context: {
      project_complexity: "high",
      deadline: "3 months",
      current_team_size: 4,
      budget_per_month: 12000,
      mentoring_capacity: "limited",
      technology_stack: "React/Node.js",
      growth_plans: "aggressive"
    }
  }
];

function TaskForm({ onSubmit, loading }: TaskFormProps) {
  const [taskDescription, setTaskDescription] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidJson, setIsValidJson] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const [contextPreview, setContextPreview] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    setCharCount(taskDescription.length);
  }, [taskDescription]);

  useEffect(() => {
    if (contextInput.trim()) {
      try {
        const parsed = JSON.parse(contextInput);
        setIsValidJson(true);
        setContextPreview(parsed);
        setValidationError(null);
      } catch (e) {
        setIsValidJson(false);
        setContextPreview(null);
        setValidationError('Invalid JSON format');
      }
    } else {
      setIsValidJson(true);
      setContextPreview(null);
      setValidationError(null);
    }
  }, [contextInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskDescription.trim()) {
      setValidationError('Please provide a task description');
      return;
    }

    let context = {};
    if (contextInput.trim()) {
      try {
        context = JSON.parse(contextInput);
      } catch (e) {
        setValidationError('Please provide valid JSON context or leave it empty');
        return;
      }
    }

    setValidationError(null);
    onSubmit(taskDescription, context);
  };

  const loadSampleTask = (sample: typeof sampleTasks[0]) => {
    setTaskDescription(sample.task);
    setContextInput(JSON.stringify(sample.context, null, 2));
    setShowAdvanced(true);
  };

  const clearForm = () => {
    setTaskDescription('');
    setContextInput('');
    setValidationError(null);
    setShowAdvanced(false);
  };

  const formatJsonPreview = () => {
    if (!contextPreview) return null;
    
    return Object.entries(contextPreview).map(([key, value]) => (
      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Chip 
          label={key} 
          size="small" 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 500,
            minWidth: 120,
          }} 
        />
        <Typography variant="body2" color="text.secondary">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </Typography>
      </Box>
    ));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {/* Task Description Input */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          Task Description
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Describe the decision you need help with. Be specific about your requirements and constraints..."
          variant="outlined"
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" color="text.secondary">
                  {charCount}/500
                </Typography>
              </InputAdornment>
            ),
          }}
        />
        <LinearProgress 
          variant="determinate" 
          value={(charCount / 500) * 100} 
          sx={{ 
            mt: 1, 
            height: 4, 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 2,
              background: charCount > 400 
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
                : 'linear-gradient(90deg, #667eea, #764ba2)',
            },
          }} 
        />
      </Box>

      {/* Sample Tasks */}
      <Box mb={3}>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lightbulb sx={{ fontSize: 16 }} />
          Try these sample tasks:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {sampleTasks.map((sample, index) => (
            <Chip
              key={index}
              label={sample.title}
              onClick={() => loadSampleTask(sample)}
              variant="outlined"
              disabled={loading}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'translateY(-1px)',
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Advanced Context Section */}
      <Box mb={3}>
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          startIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
          endIcon={<DataObject />}
          variant="outlined"
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: alpha(theme.palette.primary.main, 0.3),
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
          disabled={loading}
        >
          {showAdvanced ? 'Hide' : 'Add'} Context & Parameters
        </Button>
        
        <Collapse in={showAdvanced}>
          <Box mt={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Provide additional context as JSON to improve decision quality:
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={8}
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              placeholder={`{
  "budget": 10000,
  "timeline": "3 months",
  "team_size": 5,
  "priority": "high",
  "constraints": ["regulatory", "security"]
}`}
              variant="outlined"
              disabled={loading}
              error={!isValidJson}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: !isValidJson 
                      ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.1)}`
                      : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                },
              }}
              helperText={
                !isValidJson 
                  ? "Invalid JSON format - check syntax" 
                  : contextInput.trim() 
                    ? `✓ Valid JSON with ${Object.keys(contextPreview || {}).length} parameters`
                    : "Optional: Add context parameters in JSON format"
              }
            />

            {/* Context Preview */}
            {contextPreview && (
              <Grow in timeout={300}>
                <Card 
                  sx={{ 
                    mt: 2, 
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 16 }} />
                      Context Preview
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {formatJsonPreview()}
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Validation Error */}
      {validationError && (
        <Grow in timeout={300}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              '& .MuiAlert-icon': {
                fontSize: '1.25rem',
              },
            }}
            icon={<ErrorIcon />}
          >
            {validationError}
          </Alert>
        </Grow>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Button
          onClick={clearForm}
          startIcon={<Refresh />}
          variant="outlined"
          disabled={loading || (!taskDescription && !contextInput)}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: alpha(theme.palette.grey[500], 0.3),
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.grey[500],
              bgcolor: alpha(theme.palette.grey[500], 0.05),
            },
          }}
        >
          Clear
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={loading || !taskDescription.trim() || !isValidJson}
          startIcon={loading ? undefined : <Send />}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #5b6bd4 0%, #6b4397 100%)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: alpha(theme.palette.grey[400], 0.4),
              color: alpha(theme.palette.grey[600], 0.7),
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'currentColor',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              Analyzing...
            </Box>
          ) : (
            'Submit Task'
          )}
        </Button>
      </Stack>

      {/* Help Text */}
      <Box mt={3} p={2} sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
          💡 <strong>Pro tip:</strong> Include specific context like budget, timeline, team size, or constraints 
          to get more accurate and tailored recommendations from the AI system.
        </Typography>
      </Box>
    </Box>
  );
}

export default TaskForm; 
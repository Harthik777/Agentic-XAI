import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { TaskResponse } from '../types';

interface ExplanationViewProps {
  response: TaskResponse;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ response }) => {
  if (!response) {
    return (
      <Alert severity="error">
        No response data available
      </Alert>
    );
  }

  const { decision, explanation, success } = response;

  if (!success) {
    return (
      <Alert severity="error">
        <Typography variant="h6">Task Processing Failed</Typography>
        <Typography>{decision}</Typography>
      </Alert>
    );
  }

  if (!explanation) {
    return (
      <Alert severity="warning">
        Decision received but explanation data is missing
      </Alert>
    );
  }

  const { reasoning_steps, feature_importance, model_details } = explanation;

  // Calculate max importance for scaling
  const maxImportance = Math.max(...Object.values(feature_importance || {}));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Agent's Analysis
      </Typography>

      {/* Decision Section */}
      <Card elevation={2} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            Decision
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.5 }}>
            {decision}
          </Typography>
        </CardContent>
      </Card>

      {/* Reasoning Steps */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          Reasoning Process
        </Typography>
        
        {reasoning_steps && reasoning_steps.length > 0 ? (
          <List dense>
            {reasoning_steps.map((step, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {index + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={step}
                    primaryTypographyProps={{
                      sx: { fontSize: '0.95rem', lineHeight: 1.4 }
                    }}
                  />
                </ListItem>
                {index < reasoning_steps.length - 1 && (
                  <Divider variant="inset" component="li" sx={{ ml: 4 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">
            No reasoning steps provided
          </Typography>
        )}
      </Paper>

      {/* Feature Importance */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Feature Importance Analysis
        </Typography>
        
        {feature_importance && Object.keys(feature_importance).length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(feature_importance)
              .sort(([, a], [, b]) => b - a) // Sort by importance
              .map(([feature, importance]) => (
                <Box key={feature}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {feature.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(importance * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(importance / maxImportance) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: importance > 0.5 ? 'success.main' : 
                                importance > 0.3 ? 'warning.main' : 'info.main'
                      }
                    }}
                  />
                </Box>
              ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            No feature importance data available
          </Typography>
        )}
      </Paper>

      {/* Model Details */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Model Information
        </Typography>
        {model_details ? (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`Name: ${model_details.name}`} 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label={`Type: ${model_details.type}`} 
              variant="outlined" 
              size="small"
            />
          </Box>
        ) : (
          <Typography color="text.secondary">
            No model details available
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ExplanationView;

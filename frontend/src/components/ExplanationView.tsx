import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { TaskResponse } from '../types';

interface ExplanationViewProps {
  response: TaskResponse;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ response }) => {
  if (!response || typeof response.decision !== 'string' || !response.explanation || typeof response.explanation !== 'object') {
    return (
      <Paper elevation={1} sx={{ p: 2, backgroundColor: 'error.light' }}>
        <Typography variant="h6" color="error.contrastText">Error</Typography>
        <Typography color="error.contrastText">
          Explanation data is missing or malformed. Cannot display details.
        </Typography>
      </Paper>
    );
  }

  const { decision, explanation } = response;
  const { reasoning_steps, feature_importance, model_details } = explanation;

  return (
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 0.5 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Agent's Decision
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6">{decision}</Typography>
      </Paper>

      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 3 }}>
        Explanation
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Reasoning Steps:
        </Typography>
        {reasoning_steps && reasoning_steps.length > 0 ? (
          <List dense>
            {reasoning_steps.map((step, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText primary={`${index + 1}. ${step}`} />
                </ListItem>
                {index < reasoning_steps.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography>No reasoning steps provided.</Typography>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Feature Importance:
        </Typography>
        {feature_importance && Object.keys(feature_importance).length > 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1 
            }}
          >
            {Object.entries(feature_importance).map(([feature, importance]) => (
              <Box key={feature} sx={{ minWidth: { xs: '100%', sm: '48%' } }}>
                <Chip
                  label={`${feature}: ${typeof importance === 'number' ? importance.toFixed(2) : importance}`}
                  variant="outlined"
                  sx={{ width: '100%', justifyContent: 'flex-start', pl: 1 }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>No feature importance data available.</Typography>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Model Details:
        </Typography>
        {model_details ? (
          <>
            <Typography><strong>Name:</strong> {model_details.name || 'N/A'}</Typography>
            <Typography><strong>Type:</strong> {model_details.type || 'N/A'}</Typography>
          </>
        ) : (
          <Typography>No model details available.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ExplanationView;

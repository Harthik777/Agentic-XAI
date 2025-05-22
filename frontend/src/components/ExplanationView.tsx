import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ExplanationViewProps } from '../types';

const ExplanationView: React.FC<ExplanationViewProps> = ({ response }) => {
  const { result, explanation } = response;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Agent's Decision
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          {result.decision}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Confidence: {(result.confidence * 100).toFixed(2)}%
        </Typography>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Explanation
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          {explanation.natural_language}
        </Typography>
      </Paper>

      <Typography variant="subtitle1" gutterBottom>
        Key Factors (SHAP Analysis)
      </Typography>
      <List>
        {Object.entries(explanation.shap.token_importance)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([token, importance]) => (
            <ListItem key={token}>
              <ListItemText
                primary={token}
                secondary={`Importance: ${(importance * 100).toFixed(2)}%`}
              />
            </ListItem>
          ))}
      </List>

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        Local Explanation (LIME)
      </Typography>
      <List>
        {explanation.lime.features
          .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
          .slice(0, 5)
          .map(([feature, weight], index) => (
            <ListItem key={index}>
              <ListItemText
                primary={feature}
                secondary={`Weight: ${(weight * 100).toFixed(2)}%`}
              />
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default ExplanationView; 
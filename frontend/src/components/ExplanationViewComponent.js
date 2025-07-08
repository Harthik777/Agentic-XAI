import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ExplanationView = ({ response }) => {
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        AI Analysis Results
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" color="primary">
          Recommendation:
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {response.recommendation}
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" color="primary">
          Reasoning:
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {response.reasoning}
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" color="primary">
          Confidence: {response.confidence}%
        </Typography>
      </Box>
    </Paper>
  );
};

export default ExplanationView;

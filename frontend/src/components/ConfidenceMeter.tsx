import React from 'react';
import { Box, Typography, LinearProgress, Tooltip } from '@mui/material';
import { CheckCircle, Warning, Error, HelpOutline } from '@mui/icons-material';

interface ConfidenceMeterProps {
  value: number;
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ value }) => {
  const getConfidenceProps = (confidence: number) => {
    if (confidence >= 75) {
      return {
        color: 'success.main',
        icon: <CheckCircle />,
        text: 'High Confidence',
      };
    }
    if (confidence >= 50) {
      return {
        color: 'warning.main',
        icon: <Warning />,
        text: 'Medium Confidence',
      };
    }
    if (confidence > 25) {
      return {
        color: 'error.main',
        icon: <Error />,
        text: 'Low Confidence',
      };
    }
    return {
      color: 'grey.500',
      icon: <HelpOutline />,
      text: 'Very Low Confidence',
    };
  };

  const { color, icon, text } = getConfidenceProps(value);

  return (
    <Box>
      <Tooltip title={`Confidence: ${value.toFixed(1)}%`} arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ color }}>{icon}</Box>
          <Box flexGrow={1}>
            <Typography variant="body2" sx={{ color, fontWeight: 'bold' }}>
              {text}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                },
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ color, fontWeight: 'bold' }}>
            {value.toFixed(1)}%
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default ConfidenceMeter; 
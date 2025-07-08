import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  History,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { TaskResponse } from '../types';

interface DecisionHistoryProps {
  decisions: TaskResponse[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const DecisionHistory: React.FC<DecisionHistoryProps> = ({ decisions }) => {
  const theme = useTheme();

  if (!Array.isArray(decisions) || decisions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No decision history available yet.
        </Typography>
      </Box>
    );
  }

  const getConfidenceColor = (confidence: number | undefined) => {
    if (typeof confidence !== 'number') return theme.palette.error.main;
    if (confidence >= 80) return theme.palette.success.main;
    if (confidence >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card
        elevation={0}
        sx={{
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <History sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Decision History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your recent AI-powered decision analysis
                </Typography>
              </Box>
            </Stack>
          </motion.div>

          {/* Decision List */}
          <Grid container spacing={3}>
            {decisions.slice(0, 5).map((decision, index) => (
              <Grid item xs={12} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {/* Header Row */}
                        <Stack 
                          direction={{ xs: 'column', sm: 'row' }} 
                          justifyContent="space-between" 
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={2}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {decision.recommendation || 'No recommendation available'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {(decision.reasoning && decision.reasoning.substring(0, 150)) || 'No reasoning available'}...
                            </Typography>
                          </Box>

                          <Stack direction="row" alignItems="center" spacing={2}>
                            {/* Confidence Badge */}
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Assessment 
                                sx={{ 
                                  fontSize: 16, 
                                  color: getConfidenceColor(decision.confidence) 
                                }} 
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: getConfidenceColor(decision.confidence),
                                }}
                              >
                                {typeof decision.confidence === 'number' ? `${decision.confidence}%` : 'N/A'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>

                        {/* Tags Row */}
                        {Array.isArray(decision.risk_factors) && decision.risk_factors.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                              size="small"
                              label={`${decision.risk_factors.length} risks identified`}
                              color="warning"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                            {Array.isArray(decision.alternatives) && decision.alternatives.length > 0 && (
                              <Chip
                                size="small"
                                label={`${decision.alternatives.length} alternatives`}
                                color="info"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Footer */}
          {decisions.length > 5 && (
            <motion.div variants={itemVariants}>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing latest 5 decisions • {decisions.length - 5} more in history
                </Typography>
              </Box>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DecisionHistory; 
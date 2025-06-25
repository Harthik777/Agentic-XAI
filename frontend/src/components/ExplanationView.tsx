/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Card,
  CardContent,
  IconButton,
  Chip,
  Tooltip,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  InfoOutlined,
  ArrowRight,
  DoubleArrow,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
  Info,
  TrendingUp,
  Assessment,
  Psychology,
  Speed,
  Star,
  Lightbulb,
  Security,
  Schedule,
  AttachMoney,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { TaskResponse } from '../types';

interface ExplanationViewProps {
  response: TaskResponse;
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Enhanced confidence meter component
const ConfidenceMeter: React.FC<{ confidence: number }> = ({ confidence }) => {
  const theme = useTheme();
  
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return theme.palette.success.main;
    if (conf >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 90) return 'Very High Confidence';
    if (conf >= 80) return 'High Confidence';
    if (conf >= 70) return 'Good Confidence';
    if (conf >= 60) return 'Moderate Confidence';
    if (conf >= 50) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  return (
    <motion.div variants={itemVariants}>
      <Card
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${getConfidenceColor(confidence)} 0%, ${alpha(getConfidenceColor(confidence), 0.7)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Speed sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                AI Confidence Score
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getConfidenceLabel(confidence)}
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: getConfidenceColor(confidence),
              }}
            >
              {confidence}%
            </Typography>
          </Stack>
          
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={confidence}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(getConfidenceColor(confidence), 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${getConfidenceColor(confidence)} 0%, ${alpha(getConfidenceColor(confidence), 0.8)} 100%)`,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Icon mapping for different types
const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'recommendation':
    case 'decision':
      return <CheckCircle color="success" />;
    case 'alternative':
    case 'option':
      return <Lightbulb color="primary" />;
    case 'risk':
    case 'challenge':
      return <Warning color="warning" />;
    case 'benefit':
    case 'advantage':
      return <TrendingUp color="success" />;
    case 'consideration':
    case 'factor':
      return <Psychology color="info" />;
    case 'timeline':
    case 'schedule':
      return <Schedule color="info" />;
    case 'cost':
    case 'budget':
      return <AttachMoney color="warning" />;
    case 'security':
    case 'compliance':
      return <Security color="error" />;
    default:
      return <Info color="info" />;
  }
};

const ExplanationView: React.FC<ExplanationViewProps> = ({ response }) => {
  const [openReasoning, setOpenReasoning] = useState(true);
  const [openFactors, setOpenFactors] = useState(true);
  const theme = useTheme();

  if (!response) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
    <Paper
        elevation={0}
      sx={{
          p: { xs: 3, sm: 4, md: 6 },
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Assessment sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Analysis Complete
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's your personalized decision analysis and recommendations
            </Typography>
          </Box>
        </motion.div>

        {/* Confidence Score */}
        <ConfidenceMeter confidence={response.confidence} />

        {/* Primary Recommendation */}
        <motion.div variants={itemVariants}>
          <Card
            sx={{
              mb: 3,
              background: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 0.5,
                  }}
                >
                  <Star sx={{ color: 'success.main', fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}
                  >
                    Primary Recommendation
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ lineHeight: 1.7, color: 'text.primary' }}
                  >
                    {response.recommendation}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reasoning */}
        <motion.div variants={itemVariants}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}
              >
                <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                Detailed Analysis
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.7, color: 'text.primary' }}
              >
                {response.reasoning}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alternatives */}
        {response.alternatives && response.alternatives.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}
                >
                  <Lightbulb sx={{ mr: 1, color: 'primary.main' }} />
                  Alternative Options
                </Typography>
                <List sx={{ p: 0 }}>
                  {response.alternatives.map((alternative, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 0,
                        py: 1,
                        borderBottom: index < response.alternatives!.length - 1 
                          ? `1px solid ${alpha(theme.palette.divider, 0.1)}` 
                          : 'none',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'primary.main',
                          }}
                        >
                          {index + 1}
          </Box>
                  </ListItemIcon>
                                             <ListItemText
                         primary={alternative.option}
                         secondary={alternative.description}
                         sx={{
                           '& .MuiListItemText-primary': {
                             lineHeight: 1.6,
                             fontWeight: 600,
                           },
                           '& .MuiListItemText-secondary': {
                             lineHeight: 1.5,
                           },
                         }}
                       />
                </ListItem>
              ))}
            </List>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Risk Factors */}
        {response.risk_factors && response.risk_factors.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}
                >
                  <Warning sx={{ mr: 1, color: 'warning.main' }} />
                  Risk Assessment
                </Typography>
                <Grid container spacing={2}>
                  {response.risk_factors.map((risk, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Tooltip title="Potential risk factor to consider">
                        <Chip
                          icon={<Warning />}
                          label={risk}
                          variant="outlined"
                          color="warning"
                          sx={{
                            width: '100%',
                            height: 'auto',
                            py: 1,
                            px: 2,
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              textAlign: 'left',
                              display: 'block',
                              lineHeight: 1.4,
                            },
                            '& .MuiChip-icon': {
                              fontSize: 16,
                            },
                          }}
                        />
                      </Tooltip>
                    </Grid>
                  ))}
        </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        

        {/* Footer */}
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              💡 Analysis generated using advanced AI models • Consider this as expert guidance, not absolute truth
            </Typography>
          </Box>
        </motion.div>
    </Paper>
    </motion.div>
  );
};

export default ExplanationView;
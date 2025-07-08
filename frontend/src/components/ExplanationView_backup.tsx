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
  Stack,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import {
  InfoOutlined,
  ArrowRight,
  DoubleArrow,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  TrendingUp,
  Assessment,
  Psychology,
  Lightbulb,
  Warning,
  Star,
  Speed,
  ErrorOutline
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

// Confidence Meter Component
const ConfidenceMeter: React.FC<{ confidence: number }> = ({ confidence }) => {
  const theme = useTheme();

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return theme.palette.success.main;
    if (conf >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 80) return 'High Confidence';
    if (conf >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <motion.div variants={itemVariants}>
      <Card
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${getConfidenceColor(confidence)} 0%, ${alpha(getConfidenceColor(confidence), 0.7)} 100%)`,
                boxShadow: `0 0 20px ${alpha(getConfidenceColor(confidence), 0.3)}`,
              }}
            >
              <Speed sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {getConfidenceLabel(confidence)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={confidence}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(getConfidenceColor(confidence), 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getConfidenceColor(confidence),
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                  {confidence}%
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main ExplanationView Component
const ExplanationView: React.FC<ExplanationViewProps> = ({ response }) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    alternatives: false,
    risks: false,
    reasoning: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'alternatives':
        return <Assessment sx={{ color: theme.palette.info.main }} />;
      case 'risks':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'reasoning':
        return <Psychology sx={{ color: theme.palette.primary.main }} />;
      default:
        return <InfoOutlined />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ width: '100%' }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <motion.div variants={itemVariants}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <Lightbulb sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  AI Analysis Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Powered by Google Gemini AI • Decision ID: {response.decision_id}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Confidence Meter */}
          <Box sx={{ mb: 4 }}>
            <ConfidenceMeter confidence={response.confidence} />
          </Box>

          {/* Main Recommendation */}
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                mb: 4,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(21, 128, 61, 0.05) 100%)',
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: theme.palette.success.main,
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 24, color: 'white' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                      Recommended Action
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: '1.1rem' }}>
                      {response.recommendation}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Reasoning */}
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                mb: 3,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Button
                  fullWidth
                  onClick={() => toggleSection('reasoning')}
                  sx={{
                    p: 3,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                    {getSectionIcon('reasoning')}
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, textAlign: 'left' }}>
                      Detailed Reasoning
                    </Typography>
                    {expandedSections.reasoning ? <ExpandLess /> : <ExpandMore />}
                  </Stack>
                </Button>
                <Collapse in={expandedSections.reasoning}>
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.7, fontSize: '1.05rem' }}>
                      {response.reasoning}
                    </Typography>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alternative Options */}
          {response.alternatives && response.alternatives.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  mb: 3,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Button
                    fullWidth
                    onClick={() => toggleSection('alternatives')}
                    sx={{
                      p: 3,
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.main, 0.04),
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                      {getSectionIcon('alternatives')}
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, textAlign: 'left' }}>
                        Alternative Options ({response.alternatives.length})
                      </Typography>
                      {expandedSections.alternatives ? <ExpandLess /> : <ExpandMore />}
                    </Stack>
                  </Button>
                  <Collapse in={expandedSections.alternatives}>
                    <Box sx={{ px: 3, pb: 3 }}>
                      <Grid container spacing={2}>
                        {response.alternatives.map((alt, index) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Card
                              sx={{
                                background: alpha(theme.palette.info.main, 0.05),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                                borderRadius: 2,
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                  {alt.option}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {alt.description}
                                </Typography>
                                <Stack spacing={1}>
                                  <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                      PROS:
                                    </Typography>
                                    <List dense sx={{ py: 0 }}>
                                      {alt.pros.map((pro, i) => (
                                        <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                                          <ListItemIcon sx={{ minWidth: 20 }}>
                                            <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={pro}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                                      CONS:
                                    </Typography>
                                    <List dense sx={{ py: 0 }}>
                                      {alt.cons.map((con, i) => (
                                        <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                                          <ListItemIcon sx={{ minWidth: 20 }}>
                                            <ErrorOutline sx={{ fontSize: 16, color: theme.palette.error.main }} />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={con}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Risk Factors */}
          {response.risk_factors && response.risk_factors.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  mb: 3,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Button
                    fullWidth
                    onClick={() => toggleSection('risks')}
                    sx={{
                      p: 3,
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.warning.main, 0.04),
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                      {getSectionIcon('risks')}
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, textAlign: 'left' }}>
                        Risk Factors ({response.risk_factors.length})
                      </Typography>
                      {expandedSections.risks ? <ExpandLess /> : <ExpandMore />}
                    </Stack>
                  </Button>
                  <Collapse in={expandedSections.risks}>
                    <Box sx={{ px: 3, pb: 3 }}>
                      <List>
                        {response.risk_factors.map((risk, index) => (
                          <ListItem key={index} sx={{ px: 0, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ mt: 0.5 }}>
                              <Warning sx={{ color: theme.palette.warning.main }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={risk}
                              primaryTypographyProps={{
                                variant: 'body1',
                                sx: { lineHeight: 1.6 }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Footer */}
          <Box
            sx={{
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              🤖 Analysis generated using Google Gemini 1.5 Flash • Consider this as expert guidance, not absolute truth
            </Typography>
          </Box>
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default ExplanationView;

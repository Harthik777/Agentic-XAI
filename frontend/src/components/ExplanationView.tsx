import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  useTheme,
  alpha,
  Grow,
  Fade,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Rating,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  CheckCircle,
  TrendingUp,
  Psychology,
  Assessment,
  Timeline,
  LightbulbOutlined,
  SpeedOutlined,
  VerifiedOutlined,
  InsightsOutlined,
  AutoAwesome,
  Star,
  ThumbUp,
} from '@mui/icons-material';
import { TaskResponse } from '../types';

interface ExplanationViewProps {
  response: TaskResponse;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ response }) => {
  const theme = useTheme();

  if (!response) {
    return null;
  }

  const { decision, explanation, confidence } = response;

  // Parse feature importance if available
  const featureImportance = explanation.feature_importance || {};
  const reasoningSteps = explanation.reasoning_steps || [];
  const analysisType = explanation.analysis_type || 'Unknown';

  // Calculate confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return theme.palette.success.main;
    if (conf >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get confidence icon
  const getConfidenceIcon = (conf: number) => {
    if (conf >= 80) return <VerifiedOutlined />;
    if (conf >= 60) return <SpeedOutlined />;
    return <Psychology />;
  };

  // Format feature importance for visualization
  const formatFeatureData = () => {
    return Object.entries(featureImportance)
      .map(([feature, importance]) => ({
        feature: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: typeof importance === 'number' ? importance : 0,
        color: `hsl(${200 + (typeof importance === 'number' ? importance : 0) * 1.2}, 70%, 50%)`,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const featureData = formatFeatureData();
  const maxFeatureValue = Math.max(...featureData.map(f => f.value), 1);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Decision Header */}
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
              }}
            >
              <AutoAwesome />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                AI Decision
              </Typography>
              <Chip
                label={analysisType}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              />
            </Box>
          </Stack>

          <Typography
            variant="h6"
            component="div"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 600,
              fontSize: '1.375rem',
              lineHeight: 1.4,
              mb: 2,
            }}
          >
            {decision}
          </Typography>

          {/* Confidence Score */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              p: 2,
              bgcolor: alpha(getConfidenceColor(confidence), 0.1),
              borderRadius: 3,
              border: `1px solid ${alpha(getConfidenceColor(confidence), 0.3)}`,
            }}
          >
            <Box sx={{ color: getConfidenceColor(confidence) }}>
              {getConfidenceIcon(confidence)}
            </Box>
            <Box flex={1}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Confidence Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={confidence}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(getConfidenceColor(confidence), 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: getConfidenceColor(confidence),
                    },
                  }}
                />
                <Typography variant="h6" sx={{ color: getConfidenceColor(confidence), fontWeight: 700, minWidth: 60 }}>
                  {confidence.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
            <Rating
              value={confidence / 20}
              precision={0.1}
              readOnly
              size="small"
              icon={<Star fontSize="inherit" />}
              emptyIcon={<Star fontSize="inherit" />}
            />
          </Box>
        </Paper>
      </Fade>

      <Grid container spacing={3}>
        {/* Feature Importance Analysis */}
        {featureData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Grow in timeout={800}>
              <Card sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Assessment />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h4" sx={{ fontWeight: 600 }}>
                        Feature Importance
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Key factors influencing this decision
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {featureData.map((item, index) => (
                      <Fade in timeout={1000 + index * 200} key={item.feature}>
                        <Box sx={{ mb: 3 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.feature}
                            </Typography>
                            <Chip
                              label={`${item.value.toFixed(1)}%`}
                              size="small"
                              sx={{
                                bgcolor: alpha(item.color, 0.1),
                                color: item.color,
                                fontWeight: 600,
                                minWidth: 60,
                              }}
                            />
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={item.value * 100 / maxFeatureValue}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(item.color, 0.15),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: item.color,
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      </Fade>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      📊 Analysis based on {featureData.length} key parameters
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        )}

        {/* Reasoning Steps */}
        {reasoningSteps.length > 0 && (
          <Grid item xs={12} lg={featureData.length > 0 ? 6 : 12}>
            <Grow in timeout={1200}>
              <Card sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Timeline />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h4" sx={{ fontWeight: 600 }}>
                        Reasoning Steps
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        The AI's thought process from start to finish
                      </Typography>
                    </Box>
                  </Stack>

                  <Stepper orientation="vertical" nonLinear>
                    {reasoningSteps.map((step, index) => (
                      <Step key={index} active>
                        <StepLabel
                          icon={
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.875rem' }}>
                              {index + 1}
                            </Avatar>
                          }
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Step {index + 1}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary">
                            {step}
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>

                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      🧠 {reasoningSteps.length} logical steps analyzed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        )}
      </Grid>

      {/* Additional Insights */}
      <Fade in timeout={1600}>
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <TrendingUp sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {featureData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Parameters Analyzed
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Psychology sx={{ fontSize: 32, color: theme.palette.secondary.main, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {reasoningSteps.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reasoning Steps
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <InsightsOutlined sx={{ fontSize: 32, color: theme.palette.success.main, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {confidence.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confidence Level
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <LightbulbOutlined sx={{ fontSize: 32, color: theme.palette.warning.main, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  XAI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analysis Type
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Bottom Action Bar */}
      <Fade in timeout={2000}>
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Tooltip title="Analysis Complete">
              <CheckCircle sx={{ color: theme.palette.success.main }} />
            </Tooltip>
            <Typography variant="body2" color="text.secondary">
              Analysis complete • Transparent AI decision making • Ready for action
            </Typography>
            <Tooltip title="Explainable AI">
              <Badge badgeContent="XAI" color="primary">
                <ThumbUp sx={{ color: theme.palette.primary.main }} />
              </Badge>
            </Tooltip>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
};

export default ExplanationView;

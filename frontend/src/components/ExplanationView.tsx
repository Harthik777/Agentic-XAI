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
} from '@mui/material';
import {
  InfoOutlined,
  CheckCircleOutline,
  ArrowRight,
  DoubleArrow,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { TaskResponse } from '../types';
import ConfidenceMeter from './ConfidenceMeter';

interface ExplanationViewProps {
  response: TaskResponse;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ response }) => {
  const [openReasoning, setOpenReasoning] = useState(true);
  const [openFactors, setOpenFactors] = useState(true);

  if (!response) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mt: 4,
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Grid container spacing={4} alignItems="flex-start">
        {/* Decision and Confidence */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                🎯 AI Decision Recommendation
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                {response.recommendation}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Analysis Framework: Advanced AI Decision Engine
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  • Multi-factor Analysis • Risk Assessment • Data-driven Insights
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <ConfidenceMeter confidence={response.confidence} />
        </Grid>

        {/* Reasoning */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }}
            onClick={() => setOpenReasoning(!openReasoning)}
          >
            <DoubleArrow color="secondary" sx={{ mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Reasoning</Typography>
            <IconButton size="small" sx={{ ml: 'auto' }}>
              {openReasoning ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={openReasoning} timeout="auto" unmountOnExit>
            <Typography variant="body1" sx={{ pl: 2, mt: 1 }}>
              {response.reasoning}
            </Typography>
          </Collapse>
        </Grid>

        {/* Risk Factors */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }}
            onClick={() => setOpenFactors(!openFactors)}
          >
            <InfoOutlined color="secondary" sx={{ mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Risk Factors</Typography>
            <IconButton size="small" sx={{ ml: 'auto' }}>
              {openFactors ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={openFactors} timeout="auto" unmountOnExit>
            <List dense sx={{ pl: 2 }}>
              {response.risk_factors.map((risk: string, index: number) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ArrowRight fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary={risk} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Grid>

        {/* Alternatives */}
        {response.alternatives && response.alternatives.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              🔄 Alternative Options
            </Typography>
            <Grid container spacing={2}>
              {response.alternatives.map((alt, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {alt.option}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {alt.description}
                      </Typography>
                      {alt.pros && alt.pros.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" color="success.main">
                            Pros:
                          </Typography>
                          {alt.pros.map((pro, idx) => (
                            <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                              • {pro}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      {alt.cons && alt.cons.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" color="error.main">
                            Cons:
                          </Typography>
                          {alt.cons.map((con, idx) => (
                            <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                              • {con}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ExplanationView;
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
import { Decision } from '../types';
import ConfidenceMeter from './ConfidenceMeter';

interface ExplanationViewProps {
  response: Decision;
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
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.8 }}>
                AI Decision
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {response.decision}
              </Typography>
            </CardContent>
          </Card>
          <ConfidenceMeter value={response.confidence * 100} />
        </Grid>

        {/* Reasoning Steps */}
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
            <List dense sx={{ pl: 2 }}>
              {response.reasoning.map((step: string, index: number) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutline fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Grid>

        {/* Key Factors */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }}
            onClick={() => setOpenFactors(!openFactors)}
          >
            <InfoOutlined color="secondary" sx={{ mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Key Factors</Typography>
            <IconButton size="small" sx={{ ml: 'auto' }}>
              {openFactors ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={openFactors} timeout="auto" unmountOnExit>
            <List dense sx={{ pl: 2 }}>
              {Object.entries(response.key_factors).map(([key, value]) => (
                <ListItem key={key} sx={{ py: 1, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <ArrowRight fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={key}
                    secondary={value}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExplanationView;
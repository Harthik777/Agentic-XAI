import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Box,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { TaskResponse } from '../types';

interface DecisionHistoryProps {
  decisions: TaskResponse[];
}

const DecisionHistory: React.FC<DecisionHistoryProps> = ({ decisions }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const exportHistory = () => {
    const exportData = decisions.map((item, index) => ({
      decision_id: item.decision_id,
      recommendation: item.recommendation,
      confidence: item.confidence,
      reasoning: item.reasoning,
      risk_factors: item.risk_factors.join('; '),
      alternatives: item.alternatives.map(alt => `${alt.option}: ${alt.description}`).join('; ')
    }));

    const csv = [
      'Decision ID,Recommendation,Confidence,Reasoning,Risk Factors,Alternatives',
      ...exportData.map(row => 
        `"${row.decision_id}","${row.recommendation}",${row.confidence},"${row.reasoning}","${row.risk_factors}","${row.alternatives}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decision-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          📋 Decision History
        </Typography>
        <Button
          startIcon={<DownloadIcon />}
          variant="outlined"
          onClick={exportHistory}
          size="small"
        >
          Export CSV
        </Button>
      </Box>

      <List>
        {decisions.map((item, index) => (
          <React.Fragment key={item.decision_id}>
            <ListItem 
              sx={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <ListItemText
                  primary={item.recommendation}
                  secondary={`Decision ID: ${item.decision_id}`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`${item.confidence.toFixed(0)}% confident`}
                    color={item.confidence > 70 ? 'success' : 'warning'}
                    size="small"
                  />
                  <IconButton
                    onClick={() => toggleExpanded(item.decision_id)}
                    size="small"
                  >
                    {expandedItems.has(item.decision_id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              </Box>

              <Collapse in={expandedItems.has(item.decision_id)}>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Recommendation: {item.recommendation}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Reasoning:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {item.reasoning}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    <strong>Risk Factors:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {item.risk_factors.map((risk, idx) => (
                      <Chip 
                        key={idx}
                        label={risk}
                        variant="outlined"
                        size="small"
                        color="error"
                      />
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </ListItem>
            {index < decisions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {decisions.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
          No decisions made yet. Start by submitting a task above!
        </Typography>
      )}
    </Paper>
  );
};

export default DecisionHistory; 
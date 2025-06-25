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
import { Decision } from '../types';

interface DecisionHistoryItem {
  id: string;
  task: string;
  decision: Decision;
  timestamp: Date;
}

const DecisionHistory: React.FC = () => {
  const [history, setHistory] = useState<DecisionHistoryItem[]>([
    {
      id: '1',
      task: 'Should I learn Python or JavaScript?',
      decision: {
        decision: 'Learn JavaScript first for web development',
        confidence: 0.85,
        reasoning: ['JavaScript is essential for frontend', 'Can be used for backend too', 'Larger job market'],
        key_factors: { 'Market Demand': 'Very High', 'Learning Curve': 'Moderate' }
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2', 
      task: 'Should we use microservices or monolith?',
      decision: {
        decision: 'Start with monolith, migrate to microservices later',
        confidence: 0.78,
        reasoning: ['Team size is small', 'Faster initial development', 'Can refactor later'],
        key_factors: { 'Team Size': 'Small', 'Complexity': 'Medium' }
      },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    }
  ]);

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
    const exportData = history.map(item => ({
      task: item.task,
      decision: item.decision.decision,
      confidence: item.decision.confidence,
      timestamp: item.timestamp.toISOString(),
      reasoning: item.decision.reasoning.join('; '),
      key_factors: Object.entries(item.decision.key_factors)
        .map(([k, v]) => `${k}: ${v}`).join('; ')
    }));

    const csv = [
      'Task,Decision,Confidence,Timestamp,Reasoning,Key Factors',
      ...exportData.map(row => 
        `"${row.task}","${row.decision}",${row.confidence},"${row.timestamp}","${row.reasoning}","${row.key_factors}"`
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

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Less than an hour ago';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
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
        {history.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem 
              sx={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <ListItemText
                  primary={item.task}
                  secondary={formatTimeAgo(item.timestamp)}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`${(item.decision.confidence * 100).toFixed(0)}% confident`}
                    color={item.decision.confidence > 0.7 ? 'success' : 'warning'}
                    size="small"
                  />
                  <IconButton
                    onClick={() => toggleExpanded(item.id)}
                    size="small"
                  >
                    {expandedItems.has(item.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              </Box>

              <Collapse in={expandedItems.has(item.id)}>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Decision: {item.decision.decision}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Reasoning:</strong>
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {item.decision.reasoning.map((reason, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{reason}</Typography>
                      </li>
                    ))}
                  </ul>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Key Factors:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {Object.entries(item.decision.key_factors).map(([key, value]) => (
                      <Chip 
                        key={key}
                        label={`${key}: ${value}`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </ListItem>
            {index < history.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {history.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
          No decisions made yet. Start by submitting a task above!
        </Typography>
      )}
    </Paper>
  );
};

export default DecisionHistory; 
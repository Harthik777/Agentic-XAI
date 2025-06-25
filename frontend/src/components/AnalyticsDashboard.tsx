import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Box
} from '@mui/material';

interface AnalyticsData {
  totalDecisions: number;
  avgConfidence: number;
  topDecisionTypes: { type: string; count: number }[];
  avgResponseTime: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalDecisions: 127,
    avgConfidence: 0.82,
    topDecisionTypes: [
      { type: 'Career Decisions', count: 45 },
      { type: 'Technical Choices', count: 32 },
      { type: 'Business Strategy', count: 28 },
      { type: 'Personal Finance', count: 22 }
    ],
    avgResponseTime: 2.1
  });

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        📊 System Analytics
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Decisions
              </Typography>
              <Typography variant="h4">
                {analytics.totalDecisions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Confidence
              </Typography>
              <Typography variant="h4">
                {(analytics.avgConfidence * 100).toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={analytics.avgConfidence * 100} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Response Time
              </Typography>
              <Typography variant="h4">
                {analytics.avgResponseTime}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4">
                98.9%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Decision Categories
              </Typography>
              {analytics.topDecisionTypes.map((type, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{type.type}</Typography>
                    <Typography variant="body2">{type.count} decisions</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(type.count / analytics.totalDecisions) * 100}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AnalyticsDashboard; 
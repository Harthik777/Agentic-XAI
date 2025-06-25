import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Box
} from '@mui/material';
import { TaskResponse } from '../types';

interface AnalyticsDashboardProps {
  decisions: TaskResponse[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ decisions }) => {
  const analytics = useMemo(() => {
    if (decisions.length === 0) {
      return {
        totalDecisions: 0,
        avgConfidence: 0,
        topRiskFactors: [],
        successRate: 0
      };
    }

    const avgConfidence = decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length;
    
    // Count risk factors
    const riskFactorCounts: { [key: string]: number } = {};
    decisions.forEach(d => {
      d.risk_factors.forEach(risk => {
        riskFactorCounts[risk] = (riskFactorCounts[risk] || 0) + 1;
      });
    });

    const topRiskFactors = Object.entries(riskFactorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([risk, count]) => ({ type: risk, count }));

    return {
      totalDecisions: decisions.length,
      avgConfidence,
      topRiskFactors,
      successRate: (decisions.filter(d => d.confidence > 70).length / decisions.length) * 100
    };
  }, [decisions]);

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
                {analytics.avgConfidence.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={analytics.avgConfidence} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Confidence Rate
              </Typography>
              <Typography variant="h4">
                {analytics.successRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                AI Models Used
              </Typography>
              <Typography variant="h4">
                3+
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Free AI APIs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {analytics.topRiskFactors.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most Common Risk Factors
                </Typography>
                {analytics.topRiskFactors.map((riskFactor, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{riskFactor.type}</Typography>
                      <Typography variant="body2">{riskFactor.count} mentions</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(riskFactor.count / analytics.totalDecisions) * 100}
                      sx={{ mt: 0.5 }}
                      color="error"
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default AnalyticsDashboard; 
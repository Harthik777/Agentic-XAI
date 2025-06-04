import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { TaskResponse, XaiFeatureImportance, ShapExplanation, LimeExplanation } from '../types'; // Ensure all necessary types are imported

interface ExplanationViewProps {
  response: TaskResponse;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ response }) => {
  if (!response || typeof response.decision !== 'string' || !response.explanation || typeof response.explanation !== 'object') {
    return (
      <Paper elevation={1} sx={{ p: 2, backgroundColor: 'error.light' }}>
        <Typography variant="h6" color="error.contrastText">Error</Typography>
        <Typography color="error.contrastText">
          Explanation data is missing or malformed. Cannot display details.
        </Typography>
      </Paper>
    );
  }

  const { decision, explanation } = response;
  const { reasoning_steps, feature_importance, model_details } = explanation;

  // Type assertion for feature_importance
  const xaiFeatures = feature_importance as XaiFeatureImportance;

  return (
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 0.5 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Agent's Decision
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6">{decision}</Typography>
      </Paper>

      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 3 }}>
        Explanation Details
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Reasoning Steps:
        </Typography>
        {reasoning_steps && reasoning_steps.length > 0 ? (
          <List dense>
            {reasoning_steps.map((step, index) => (
              <React.Fragment key={`reasoning-${index}`}>
                <ListItem>
                  <ListItemText primary={`${index + 1}. ${step}`} />
                </ListItem>
                {index < reasoning_steps.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography>No reasoning steps provided.</Typography>
        )}
      </Paper>

      {/* XAI Explanations Section */}
      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 3 }}>
        XAI Analysis
      </Typography>

      {xaiFeatures.error && (
        <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: 'error.light' }}>
          <Typography variant="h6" color="error.contrastText">XAI Error</Typography>
          <Typography color="error.contrastText">{xaiFeatures.error}</Typography>
        </Paper>
      )}

      {/* Natural Language Explanation */}
      {xaiFeatures.natural_language && (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Natural Language Summary</Typography>
          <Typography>{xaiFeatures.natural_language}</Typography>
        </Paper>
      )}

      {/* SHAP Explanation */}
      {xaiFeatures.shap && (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            SHAP Analysis {xaiFeatures.shap.method && `(${xaiFeatures.shap.method})`}
          </Typography>
          {xaiFeatures.shap.error && <Typography color="error" sx={{ mb:1 }}>{xaiFeatures.shap.error}</Typography>}
          {xaiFeatures.shap.token_importance && Object.keys(xaiFeatures.shap.token_importance).length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(xaiFeatures.shap.token_importance).map(([token, importance]) => (
                <Chip key={`shap-${token}`} label={`${token}: ${importance.toFixed(4)}`} />
              ))}
            </Box>
          ) : (
            !xaiFeatures.shap.error && <Typography>No SHAP token importance data available.</Typography>
          )}
        </Paper>
      )}

      {/* LIME Explanation */}
      {xaiFeatures.lime && (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            LIME Analysis {xaiFeatures.lime.method && `(${xaiFeatures.lime.method})`}
          </Typography>
          {xaiFeatures.lime.error && <Typography color="error" sx={{ mb:1 }}>{xaiFeatures.lime.error}</Typography>}
          {xaiFeatures.lime.features && xaiFeatures.lime.features.length > 0 ? (
            <List dense>
              {xaiFeatures.lime.features.map(([feature, weight], index) => (
                <ListItem key={`lime-${feature}-${index}`} sx={{ pl:0 }}>
                  <Chip
                    label={`${feature}: ${weight.toFixed(4)}`}
                    variant={weight > 0 ? "default" : "outlined"}
                    color={weight > 0 ? "success" : "error"}
                    sx={{opacity: Math.max(0.3, Math.abs(weight))}} // Example: vary opacity by weight
                  />
                </ListItem>
              ))}
            </List>
          ) : (
             !xaiFeatures.lime.error && <Typography>No LIME feature data available.</Typography>
          )}
        </Paper>
      )}

      {/* Fallback for any other unexpected keys in feature_importance, if any, for debugging.
          Can be removed for cleaner production UI if not needed. */}
      {/*
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Raw/Other Feature Data:</Typography>
        {Object.entries(xaiFeatures)
          .filter(([key]) => !['shap', 'lime', 'natural_language', 'error'].includes(key))
          .map(([key, value]) => (
            <Typography key={`other-${key}`}>
              <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </Typography>
        ))}
      </Paper>
      */}

      <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Model Details:
        </Typography>
        {model_details ? (
          <>
            <Typography><strong>Name:</strong> {model_details.name || 'N/A'}</Typography>
            <Typography><strong>Type:</strong> {model_details.type || 'N/A'}</Typography>
          </>
        ) : (
          <Typography>No model details available.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ExplanationView;

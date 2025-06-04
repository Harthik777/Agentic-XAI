// New type definitions for XAI explanations

export interface ShapTokenImportance {
  [token: string]: number;
}

export interface ShapExplanation {
  token_importance: ShapTokenImportance | null;
  method: string;
  error?: string; // Optional error field
}

export type LimeFeature = [string, number]; // [feature, weight]

export interface LimeExplanation {
  features: LimeFeature[] | null;
  method: string;
  error?: string; // Optional error field
}

export interface XaiFeatureImportance {
  shap: ShapExplanation | null;
  lime: LimeExplanation | null;
  natural_language: string | null;
  error?: string; // Top-level error for XAI generation, e.g., if self.explainer was None
  // Keep compatibility for old structure or other simple key-value pairs if any might still exist
  // This also helps if the backend returns the old "info", "task_description_length" etc.
  [key: string]: any; // Allows for other potential keys, but shap, lime, nl are primary
}

// Updated Explanation Interface
export interface Explanation {
  reasoning_steps: string[];
  feature_importance: XaiFeatureImportance; // Updated type
  model_details: {
    name: string;
    type: string;
  };
}

// Existing interfaces (ensure they remain)
export interface TaskResponse {
  decision: string;
  explanation: Explanation;
}

export interface TaskFormProps {
  onSubmit: (taskDescription: string, context: any) => Promise<void>;
  loading: boolean;
}

export interface ExplanationViewProps {
  response: TaskResponse;
}

export interface Explanation {
  reasoning_steps: string[];
  feature_importance: Record<string, number>;
  model_details: {
    name: string;
    type: string;
  };
}

export interface TaskResponse {
  decision: string;
  explanation: Explanation;
  success?: boolean;
}

export interface TaskFormProps {
  onSubmit: (taskDescription: string, context: any) => Promise<void>;
  loading: boolean;
}

export interface ExplanationViewProps {
  response: TaskResponse;
} 
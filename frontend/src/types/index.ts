export interface TaskResponse {
  status: string;
  result: {
    decision_id: string;
    decision: string;
    confidence: number;
  };
  explanation: {
    shap: {
      token_importance: Record<string, number>;
      method: string;
    };
    lime: {
      features: Array<[string, number]>;
      method: string;
    };
    natural_language: string;
  };
}

export interface TaskFormProps {
  onSubmit: (taskDescription: string, context: any) => Promise<void>;
  loading: boolean;
}

export interface ExplanationViewProps {
  response: TaskResponse;
} 
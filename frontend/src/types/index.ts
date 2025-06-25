export interface TaskRequest {
  task: string;
  context: string;
  priority: string;
}

export interface TaskResponse {
  recommendation: string;
  reasoning: string;
  confidence: number;
  alternatives: Array<{
    option: string;
    description: string;
    pros: string[];
    cons: string[];
  }>;
  risk_factors: string[];
  decision_id: string;
}

// Legacy interface for backwards compatibility
export interface Decision {
  decision: string;
  confidence: number;
  reasoning: string[];
  key_factors: Record<string, string>;
}
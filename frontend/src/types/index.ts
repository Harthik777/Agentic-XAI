export interface Decision {
  decision: string;
  confidence: number;
  reasoning: string[];
  key_factors: { [key: string]: string };
}

export interface TaskRequest {
  task_description: string;
  context: { [key: string]: any };
}
import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer
import numpy as np
from typing import Dict, Any, List
import uuid

class IntelligentAgent:
    def __init__(self):
        self.model_name = "gpt2"  # Using GPT-2 as base model
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        self.decision_history = {}
        
    def process_task(self, task_description: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task and make a decision based on the input.
        """
        # Generate a unique decision ID
        decision_id = str(uuid.uuid4())
        
        # Prepare input for the model
        input_text = f"Task: {task_description}\nContext: {str(context)}\nDecision:"
        inputs = self.tokenizer(input_text, return_tensors="pt", padding=True)
        
        # Generate decision
        with torch.no_grad():
            outputs = self.model.generate(
                inputs["input_ids"],
                max_length=100,
                num_return_sequences=1,
                temperature=0.7,
                top_p=0.9
            )
        
        # Decode the output
        decision = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Store decision in history
        self.decision_history[decision_id] = {
            "task": task_description,
            "context": context,
            "decision": decision,
            "timestamp": str(np.datetime64('now'))
        }
        
        return {
            "decision_id": decision_id,
            "decision": decision,
            "confidence": self._calculate_confidence(outputs[0])
        }
    
    def _calculate_confidence(self, output_tokens: torch.Tensor) -> float:
        """
        Calculate confidence score for the decision.
        """
        # Simple confidence calculation based on token probabilities
        with torch.no_grad():
            logits = self.model(output_tokens.unsqueeze(0)).logits
            probs = torch.softmax(logits, dim=-1)
            confidence = torch.mean(probs).item()
        
        return confidence
    
    def get_decision_history(self, decision_id: str) -> Dict[str, Any]:
        """
        Retrieve decision history for a specific decision ID.
        """
        return self.decision_history.get(decision_id, {})
    
    def analyze_decision_patterns(self) -> Dict[str, Any]:
        """
        Analyze patterns in decision history.
        """
        if not self.decision_history:
            return {"message": "No decision history available"}
        
        # Simple pattern analysis
        task_types = [d["task"] for d in self.decision_history.values()]
        unique_tasks = len(set(task_types))
        
        return {
            "total_decisions": len(self.decision_history),
            "unique_tasks": unique_tasks,
            "average_confidence": np.mean([d.get("confidence", 0) for d in self.decision_history.values()])
        } 
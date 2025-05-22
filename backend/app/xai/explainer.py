import shap
import lime
import numpy as np
from typing import Dict, Any, List
import json
from lime.lime_text import LimeTextExplainer
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

class XAIExplainer:
    def __init__(self):
        self.model_name = "gpt2"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        self.lime_explainer = LimeTextExplainer(class_names=['decision'])
        self.explanation_cache = {}
        
    def explain_decision(self, decision_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate explanations for a decision using multiple XAI techniques.
        """
        decision_id = decision_data.get("decision_id")
        decision = decision_data.get("decision", "")
        
        # Generate SHAP explanation
        shap_explanation = self._generate_shap_explanation(decision)
        
        # Generate LIME explanation
        lime_explanation = self._generate_lime_explanation(decision)
        
        # Generate natural language explanation
        nl_explanation = self._generate_natural_language_explanation(decision_data)
        
        explanation = {
            "shap": shap_explanation,
            "lime": lime_explanation,
            "natural_language": nl_explanation
        }
        
        # Cache the explanation
        self.explanation_cache[decision_id] = explanation
        
        return explanation
    
    def _generate_shap_explanation(self, text: str) -> Dict[str, Any]:
        """
        Generate SHAP values for the input text.
        """
        # Tokenize the input
        tokens = self.tokenizer(text, return_tensors="pt", padding=True)
        
        # Create a simple background dataset
        background = torch.zeros((1, tokens["input_ids"].shape[1]))
        
        # Initialize SHAP explainer
        explainer = shap.DeepExplainer(self.model, background)
        
        # Get SHAP values
        shap_values = explainer.shap_values(tokens["input_ids"])
        
        # Process SHAP values for visualization
        token_importance = {}
        for i, token in enumerate(self.tokenizer.convert_ids_to_tokens(tokens["input_ids"][0])):
            if token != "<pad>":
                token_importance[token] = float(np.abs(shap_values[0][i]))
        
        return {
            "token_importance": token_importance,
            "method": "SHAP"
        }
    
    def _generate_lime_explanation(self, text: str) -> Dict[str, Any]:
        """
        Generate LIME explanation for the input text.
        """
        def predictor(texts):
            # Tokenize and get model predictions
            tokens = self.tokenizer(texts, return_tensors="pt", padding=True)
            with torch.no_grad():
                outputs = self.model(**tokens)
            return outputs.logits.numpy()
        
        # Generate LIME explanation
        exp = self.lime_explainer.explain_instance(
            text,
            predictor,
            num_features=10,
            top_labels=1
        )
        
        # Process LIME explanation
        explanation = {
            "features": exp.as_list(),
            "method": "LIME"
        }
        
        return explanation
    
    def _generate_natural_language_explanation(self, decision_data: Dict[str, Any]) -> str:
        """
        Generate a natural language explanation of the decision.
        """
        decision = decision_data.get("decision", "")
        confidence = decision_data.get("confidence", 0)
        
        # Create a simple natural language explanation
        explanation = f"The agent made this decision with {confidence:.2%} confidence. "
        explanation += "The decision was based on the input context and task description. "
        explanation += "Key factors influencing this decision were identified using SHAP and LIME analysis."
        
        return explanation
    
    def get_explanation(self, decision_id: str, format: str = "text") -> Dict[str, Any]:
        """
        Retrieve cached explanation for a decision.
        """
        explanation = self.explanation_cache.get(decision_id, {})
        
        if format == "text":
            return {"explanation": explanation.get("natural_language", "No explanation available")}
        elif format == "visualization":
            return {
                "shap": explanation.get("shap", {}),
                "lime": explanation.get("lime", {})
            }
        else:  # both
            return explanation 
import numpy as np
from typing import Dict, Any, List
import json
import re
from collections import Counter

class XAIExplainer:
    def __init__(self):
        self.explanation_cache = {}
        print("XAI Explainer initialized with lightweight implementation.")
        
    def explain_decision(self, decision_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate explanations for a decision using lightweight XAI techniques.
        """
        decision_id = decision_data.get("decision_id")
        decision = decision_data.get("decision", "")
        task_description = decision_data.get("task_description", "")
        context = decision_data.get("context", {})
        
        # Generate lightweight explanations
        text_analysis = self._analyze_text_features(task_description + " " + str(decision))
        context_analysis = self._analyze_context_features(context)
        
        # Generate natural language explanation
        nl_explanation = self._generate_natural_language_explanation(decision_data)
        
        explanation = {
            "text_analysis": text_analysis,
            "context_analysis": context_analysis,
            "natural_language": nl_explanation
        }
        
        # Cache the explanation
        if decision_id:
            self.explanation_cache[decision_id] = explanation
        
        return explanation
    
    def _analyze_text_features(self, text: str) -> Dict[str, Any]:
        """
        Analyze text features without heavy NLP libraries.
        """
        if not text:
            return {"error": "No text provided"}
        
        # Basic text analysis
        words = re.findall(r'\b\w+\b', text.lower())
        word_count = Counter(words)
        
        # Calculate basic importance scores
        total_words = len(words)
        word_importance = {}
        
        for word, count in word_count.most_common(10):
            # Simple TF-like scoring
            importance = count / total_words
            if len(word) > 2:  # Filter out very short words
                word_importance[word] = round(importance, 3)
        
        return {
            "word_importance": word_importance,
            "total_words": total_words,
            "unique_words": len(word_count),
            "method": "Basic Text Analysis"
        }
    
    def _analyze_context_features(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze context features to determine importance.
        """
        if not isinstance(context, dict):
            return {"error": "Context is not a dictionary"}
        
        feature_importance = {}
        
        for key, value in context.items():
            # Calculate importance based on value type and content
            if isinstance(value, (int, float)):
                # Numeric values get importance based on magnitude
                importance = min(abs(value) / 100.0, 1.0) if value != 0 else 0.1
            elif isinstance(value, str):
                # String values get importance based on length and content
                importance = min(len(value) / 50.0, 1.0) if value else 0.1
            elif isinstance(value, (list, dict)):
                # Collections get importance based on size
                importance = min(len(value) / 10.0, 1.0) if value else 0.1
            else:
                importance = 0.5  # Default importance
            
            feature_importance[f"context_{key}"] = round(importance, 3)
        
        return {
            "feature_importance": feature_importance,
            "context_keys": list(context.keys()),
            "context_size": len(context),
            "method": "Basic Context Analysis"
        }
    
    def _generate_natural_language_explanation(self, decision_data: Dict[str, Any]) -> str:
        """
        Generate a natural language explanation of the decision.
        """
        decision = decision_data.get("decision", "Unknown decision")
        task_description = decision_data.get("task_description", "")
        context = decision_data.get("context", {})
        confidence = decision_data.get("confidence", 0.5)
        
        # Create a simple natural language explanation
        explanation_parts = []
        
        explanation_parts.append(f"The agent analyzed the task: '{task_description[:100]}{'...' if len(task_description) > 100 else ''}'")
        
        if context:
            context_info = f"with {len(context)} context parameter{'s' if len(context) != 1 else ''}"
            if len(context) <= 3:
                context_keys = ', '.join(context.keys())
                context_info += f" ({context_keys})"
            explanation_parts.append(context_info)
        
        explanation_parts.append(f"and reached the decision with {confidence:.1%} confidence.")
        
        # Add information about key factors
        if isinstance(context, dict) and context:
            key_factors = []
            for key, value in list(context.items())[:3]:  # Top 3 factors
                if isinstance(value, (int, float)):
                    key_factors.append(f"{key} ({value})")
                elif isinstance(value, str) and len(value) < 50:
                    key_factors.append(f"{key} ('{value}')")
                else:
                    key_factors.append(key)
            
            if key_factors:
                explanation_parts.append(f"Key factors considered: {', '.join(key_factors)}.")
        
        return " ".join(explanation_parts)
    
    def get_explanation(self, decision_id: str, format: str = "text") -> Dict[str, Any]:
        """
        Retrieve cached explanation for a decision.
        """
        explanation = self.explanation_cache.get(decision_id, {})
        
        if format == "text":
            return {"explanation": explanation.get("natural_language", "No explanation available")}
        elif format == "analysis":
            return {
                "text_analysis": explanation.get("text_analysis", {}),
                "context_analysis": explanation.get("context_analysis", {})
            }
        else:  # both
            return explanation 
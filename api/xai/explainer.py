import re
import json
import math
from typing import Dict, Any, List
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class XAIExplainer:
    """
    Explainable AI component that generates explanations for agent decisions.
    Uses lightweight methods that don't require heavy ML libraries.
    """
    
    def __init__(self):
        self.explanation_cache = {}
        logger.info("XAI Explainer initialized")
    
    def generate_explanation(self, decision: str, task_description: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive explanation for a decision.
        """
        try:
            # Analyze task description
            task_analysis = self._analyze_task_description(task_description)
            
            # Analyze context features
            feature_importance = self._calculate_feature_importance(context)
            
            # Generate reasoning steps
            reasoning_steps = self._generate_reasoning_steps(
                decision, task_description, context, task_analysis
            )
            
            # Estimate confidence
            confidence = self._estimate_confidence(task_description, context, decision)
            
            # Model details
            model_details = {
                "name": "Intelligent Agent with XAI",
                "type": "Language Model with Explainable AI"
            }
            
            return {
                "reasoning_steps": reasoning_steps,
                "feature_importance": feature_importance,
                "model_details": model_details,
                "confidence": confidence,
                "analysis_type": "Rule-Based Heuristics"
            }
            
        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            return self._generate_error_explanation(str(e))
    
    def _analyze_task_description(self, task_description: str) -> Dict[str, Any]:
        """
        Analyze the task description to extract key insights.
        """
        if not task_description:
            return {"error": "No task description provided"}
        
        # Basic text analysis
        words = re.findall(r'\b\w+\b', task_description.lower())
        word_count = Counter(words)
        
        # Identify key action words
        action_words = ['analyze', 'create', 'decide', 'recommend', 'evaluate', 
                       'compare', 'solve', 'find', 'determine', 'assess']
        found_actions = [word for word in action_words if word in words]
        
        # Calculate readability metrics
        sentences = len(re.findall(r'[.!?]+', task_description))
        complexity = len(words) / max(sentences, 1)
        
        return {
            "word_count": len(words),
            "unique_words": len(word_count),
            "key_actions": found_actions,
            "complexity_score": round(complexity, 2),
            "most_common_words": dict(word_count.most_common(5))
        }
    
    def _calculate_feature_importance(self, context: Dict[str, Any]) -> Dict[str, float]:
        """
        Calculate importance scores for context features.
        """
        if not context:
            return {}
        
        feature_importance = {}
        
        for key, value in context.items():
            importance = self._calculate_single_feature_importance(key, value)
            feature_importance[key] = round(importance, 3)
        
        # Normalize scores to sum to 1.0
        total_importance = sum(feature_importance.values())
        if total_importance > 0:
            feature_importance = {
                k: round(v / total_importance, 3) 
                for k, v in feature_importance.items()
            }
        
        return feature_importance
    
    def _calculate_single_feature_importance(self, key: str, value: Any) -> float:
        """
        Calculate importance score for a single feature.
        """
        base_importance = 0.1  # Minimum importance
        
        # Key name importance
        key_weight = len(key) / 20.0  # Longer keys might be more descriptive
        
        # Value type importance
        if isinstance(value, (int, float)):
            # Numeric values - importance based on magnitude
            value_weight = min(abs(float(value)) / 100.0, 1.0) if value != 0 else 0.1
        elif isinstance(value, str):
            # String values - importance based on length and content
            value_weight = min(len(value) / 50.0, 1.0) if value else 0.1
            # Boost for meaningful strings
            if any(word in value.lower() for word in ['important', 'critical', 'key', 'main']):
                value_weight *= 1.5
        elif isinstance(value, (list, dict)):
            # Collections - importance based on size
            value_weight = min(len(value) / 10.0, 1.0) if value else 0.1
        elif isinstance(value, bool):
            # Boolean values
            value_weight = 0.8 if value else 0.3
        else:
            value_weight = 0.5
        
        return base_importance + min(key_weight + value_weight, 1.0)
    
    def _generate_reasoning_steps(self, decision: str, task_description: str, 
                                context: Dict[str, Any], task_analysis: Dict[str, Any]) -> List[str]:
        """
        Generate step-by-step reasoning for the decision.
        """
        steps = []
        
        # Step 1: Task understanding
        steps.append(f"Analyzed the task: '{task_description[:80]}{'...' if len(task_description) > 80 else ''}'")
        
        # Step 2: Context analysis
        if context:
            context_desc = f"Evaluated {len(context)} context parameter{'s' if len(context) != 1 else ''}"
            if len(context) <= 3:
                context_keys = list(context.keys())
                context_desc += f": {', '.join(context_keys)}"
            steps.append(context_desc)
        else:
            steps.append("No additional context was provided for analysis")
        
        # Step 3: Key factors
        if task_analysis.get('key_actions'):
            actions = task_analysis['key_actions'][:3]  # Top 3 actions
            steps.append(f"Identified key actions required: {', '.join(actions)}")
        
        # Step 4: Feature analysis
        if context:
            top_features = sorted(
                self._calculate_feature_importance(context).items(),
                key=lambda x: x[1], reverse=True
            )[:3]
            if top_features:
                feature_names = [f[0] for f in top_features]
                steps.append(f"Prioritized key factors: {', '.join(feature_names)}")
        
        # Step 5: Decision rationale
        decision_preview = decision[:60] + "..." if len(decision) > 60 else decision
        steps.append(f"Formulated decision based on analysis: '{decision_preview}'")
        
        # Step 6: Confidence assessment
        confidence = self._estimate_confidence(task_description, context, decision)
        steps.append(f"Assessed decision confidence at {confidence:.1%} based on available information")
        
        return steps
    
    def _estimate_confidence(self, task_description: str, context: Dict[str, Any], decision: str) -> float:
        """
        Estimate confidence level for the decision.
        """
        confidence_factors = []
        
        # Task clarity factor
        task_words = len(task_description.split())
        clarity_factor = min(task_words / 20.0, 1.0)  # More words generally mean clearer task
        confidence_factors.append(clarity_factor)
        
        # Context richness factor
        if context:
            context_factor = min(len(context) / 5.0, 1.0)  # More context parameters
            confidence_factors.append(context_factor)
        else:
            confidence_factors.append(0.3)  # Lower confidence without context
        
        # Decision specificity factor
        decision_words = len(decision.split())
        specificity_factor = min(decision_words / 15.0, 1.0)
        confidence_factors.append(specificity_factor)
        
        # Calculate weighted average
        base_confidence = 0.4  # Base confidence level
        factor_weight = sum(confidence_factors) / len(confidence_factors)
        
        final_confidence = base_confidence + (factor_weight * 0.5)
        return min(final_confidence, 0.95)  # Cap at 95%
    
    def _generate_error_explanation(self, error_msg: str) -> Dict[str, Any]:
        """
        Generate explanation for error cases.
        """
        return {
            "reasoning_steps": [
                "An error occurred during explanation generation",
                f"Error details: {error_msg}",
                "The system is designed to handle such cases gracefully",
                "Please try again or contact support if the issue persists"
            ],
            "feature_importance": {},
            "model_details": {
                "name": "Error Handler",
                "type": "Exception Management System"
            },
            "confidence": 0.0,
            "analysis_type": "Error Analysis"
        } 
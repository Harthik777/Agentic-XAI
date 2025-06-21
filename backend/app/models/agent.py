import os
import json
import asyncio
import logging
from typing import Dict, Any, List
import replicate

# Import the XAI explainer
from ..xai.explainer import XAIExplainer

logger = logging.getLogger(__name__)

class IntelligentAgent:
    """
    Intelligent Agent with Explainable AI capabilities.
    Supports both Replicate API and mock mode.
    """
    
    def __init__(self):
        self.api_token = os.getenv("REPLICATE_API_TOKEN")
        self.model_name = "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3"
        
        # Initialize XAI explainer
        self.explainer = XAIExplainer()
        
        # Initialize Replicate client if token is available
        if self.api_token:
            try:
                self.replicate_client = replicate.Client(api_token=self.api_token)
                logger.info("Replicate client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Replicate client: {e}")
                self.replicate_client = None
        else:
            logger.info("No Replicate API token found. Running in mock mode.")
            self.replicate_client = None
    
    async def process_task(self, task_description: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task and return decision with explanation.
        """
        try:
            # Generate decision
            if self.replicate_client:
                decision = await self._generate_ai_decision(task_description, context)
            else:
                decision = self._generate_mock_decision(task_description, context)
            
            # Generate XAI explanation
            explanation = self.explainer.generate_explanation(
                decision=decision,
                task_description=task_description,
                context=context
            )
            
            return {
                "decision": decision,
                "explanation": explanation,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in process_task: {e}")
            return {
                "decision": f"Error processing task: {str(e)}",
                "explanation": {
                    "reasoning_steps": [f"An error occurred: {str(e)}"],
                    "feature_importance": {},
                    "model_details": {"name": "Error Handler", "type": "Error Response"}
                },
                "success": False
            }
    
    async def _generate_ai_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """
        Generate decision using Replicate AI model.
        """
        try:
            # Prepare context string
            context_str = json.dumps(context, indent=2) if context else "No additional context provided"
            
            # Create prompt
            prompt = f"""You are an AI assistant. Please analyze the following task and provide a clear, concise decision.

Task: {task_description}

Context: {context_str}

Please provide your decision in a single, clear sentence. Be specific and actionable."""

            # Prepare input for Replicate
            input_data = {
                "prompt": prompt,
                "system_prompt": "You are a helpful AI assistant that provides clear, concise, and actionable decisions.",
                "max_new_tokens": 150,
                "temperature": 0.3,
                "top_p": 0.9,
                "repetition_penalty": 1.0
            }
            
            # Run the model
            logger.info(f"Calling Replicate model: {self.model_name}")
            output = self.replicate_client.run(self.model_name, input=input_data)
            
            # Collect output
            decision_parts = []
            for item in output:
                decision_parts.append(str(item))
            
            decision = "".join(decision_parts).strip()
            
            # Clean up the decision
            decision = self._clean_decision(decision)
            
            logger.info(f"Generated AI decision: {decision[:100]}...")
            return decision
            
        except Exception as e:
            logger.error(f"Error generating AI decision: {e}")
            raise Exception(f"AI model error: {str(e)}")
    
    def _generate_mock_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """
        Generate a mock decision when AI model is not available.
        """
        context_summary = f"with {len(context)} context parameters" if context else "without additional context"
        
        decision = f"Mock decision for task '{task_description[:50]}...' {context_summary}. This is a demonstration response showing the system's capability to process tasks and provide explanations."
        
        logger.info(f"Generated mock decision: {decision[:100]}...")
        return decision
    
    def _clean_decision(self, decision: str) -> str:
        """
        Clean and format the decision text.
        """
        # Remove common prefixes
        prefixes_to_remove = [
            "Decision:", "My decision:", "Based on the analysis:",
            "After analyzing:", "My recommendation:", "I recommend:"
        ]
        
        for prefix in prefixes_to_remove:
            if decision.lower().startswith(prefix.lower()):
                decision = decision[len(prefix):].strip()
        
        # Ensure it ends with punctuation
        if decision and not decision.endswith(('.', '!', '?')):
            decision += '.'
        
        return decision.strip()

import os
import json
import replicate # Import the replicate library

# Import the XAI explainer
from ..xai.explainer import XAIExplainer

class Agent:
    # Updated model_name with the new version hash provided by the user
    def __init__(self, model_name="meta/llama-2-70b-chat:2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48"): 
        self.model_name = model_name
        self.replicate_client = None
        
        # Initialize XAI explainer
        try:
            self.explainer = XAIExplainer()
            print("XAI Explainer initialized successfully.")
        except Exception as e:
            print(f"Warning: Could not initialize XAI Explainer: {e}")
            self.explainer = None
        
        # The Replicate client automatically uses the REPLICATE_API_TOKEN environment variable.
        # Ensure it's set in your environment where you run uvicorn.
        api_token = os.environ.get("REPLICATE_API_TOKEN")
        if not api_token:
            print("Warning: REPLICATE_API_TOKEN environment variable not found. Using mock responses.")
            # You might want to handle this more gracefully, e.g., by disabling Replicate features
            # or raising a configuration error if Replicate is essential.
        try:
            # Initialize the client. It will use the REPLICATE_API_TOKEN from the environment.
            if api_token:
                self.replicate_client = replicate.Client(api_token=api_token)
                print("Replicate client initialized.")
            else:
                self.replicate_client = None
                print("Replicate client not initialized - using mock mode.")
        except Exception as e:
            print(f"Error initializing Replicate client: {e}")
            # self.replicate_client will remain None

    async def process_task(self, task_description: str, context: dict) -> dict:
        if not self.replicate_client:
            # Use mock response when Replicate is not available
            return self._generate_mock_response(task_description, context)

        # Prepare the input for the Replicate model
        # This will vary greatly depending on the specific model you're using.
        # For a chat model like Llama, you might structure it as a prompt.
        context_str = json.dumps(context, indent=2, ensure_ascii=False)
        
        # Constructing a detailed prompt
        # You'll need to adapt this prompt engineering to your specific model and task
        prompt = (
            f"You are an AI assistant. Your task is to: {task_description}\n\n"
            f"Here is the context you should use for this task:\n"
            f"```json\n{context_str}\n```\n\n"
            f"Based on the task and the provided context, please provide your decision and a step-by-step reasoning for it. "
            f"Format your response clearly, separating the decision and the reasoning."
        )
        
        # Default input parameters for meta/llama-2-70b-chat
        # Refer to Replicate documentation for the specific model version for all available parameters
        input_data = {
            "prompt": prompt,
            "system_prompt": "You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.",
            "max_new_tokens": 500, # Default is often 500 or 128, check model page
            "temperature": 0.5,    # Default is often 0.5 or 0.75
            "top_p": 1,            # Default is often 1
            "repetition_penalty": 1 # Default is often 1
            # Add other parameters as needed by the specific model version
        }

        try:
            print(f"Attempting to run Replicate model: {self.model_name}")
            print(f"Input to Replicate (first 200 chars of prompt): {json.dumps(input_data, indent=2)[:200]}...")

            # --- ACTUAL REPLICATE CALL ---
            output_iterator = self.replicate_client.run(
                self.model_name, 
                input=input_data
            )
            
            model_output_parts = []
            for item in output_iterator:
                model_output_parts.append(str(item)) 
            full_model_output = "".join(model_output_parts)
            
            print(f"Replicate model raw output (first 200 chars): {full_model_output[:200]}...")
            
            # Parse the model output to extract decision and reasoning
            decision, reasoning = self._parse_model_output(full_model_output)
            
            reasoning_steps = [
                f"Received task: {task_description}",
                f"Analyzed context: {context_str[:100]}..." if len(context_str) > 100 else f"Analyzed context: {context_str}",
                f"Generated decision using {self.model_name}",
                f"Decision: {decision}",
                f"Model reasoning: {reasoning[:200]}..." if len(reasoning) > 200 else f"Model reasoning: {reasoning}"
            ]

            # Generate XAI explanation if explainer is available
            feature_importance = self._generate_feature_importance(task_description, context, decision)

            return {
                "decision": decision,
                "explanation": {
                    "reasoning_steps": reasoning_steps,
                    "feature_importance": feature_importance,
                    "model_details": {"name": self.model_name, "type": "Replicate Agent"}
                }
            }

        except replicate.exceptions.ReplicateError as e:
            print(f"Replicate API Error: {e}")
            error_message = f"Replicate API Error: {getattr(e, 'title', 'Unknown error')}"
            # Try to get more details from the error response if available
            if hasattr(e, 'response') and e.response:
                try:
                    error_detail_json = e.response.json()
                    error_message_detail = error_detail_json.get('detail', str(e))
                    error_message = f"Replicate API Error: {error_message_detail}"
                except ValueError: # Not a JSON response
                    error_message = f"Replicate API Error (non-JSON response): {e.response.text[:200]}" # Truncate
            
            return {
                "decision": "Error during Replicate API call",
                "explanation": {
                    "reasoning_steps": [error_message],
                    "feature_importance": {},
                    "model_details": {"name": self.model_name, "type": "Replicate Agent (API Error State)"}
                }
            }
        except Exception as e:
            print(f"An unexpected error occurred in process_task: {e}")
            import traceback
            traceback.print_exc() # Print full traceback for unexpected errors
            return {
                "decision": "Unexpected Server Error",
                "explanation": {
                    "reasoning_steps": [f"An unexpected error occurred on the server: {str(e)}"],
                    "feature_importance": {},
                    "model_details": {"name": self.model_name, "type": "Replicate Agent (Unexpected Error State)"}
                }
            }

    def _generate_mock_response(self, task_description: str, context: dict) -> dict:
        """Generate a mock response when Replicate API is not available"""
        mock_decision = f"Mock decision for task: {task_description[:50]}..."
        
        reasoning_steps = [
            f"Received task: {task_description}",
            f"Analyzed context with {len(context)} parameters",
            "Generated mock response (Replicate API not available)",
            "This is a demonstration response showing the expected format",
            f"Decision: {mock_decision}"
        ]

        # Generate basic feature importance
        feature_importance = self._generate_feature_importance(task_description, context, mock_decision)

        return {
            "decision": mock_decision,
            "explanation": {
                "reasoning_steps": reasoning_steps,
                "feature_importance": feature_importance,
                "model_details": {"name": "Mock Agent", "type": "Mock Response (No API Token)"}
            }
        }

    def _parse_model_output(self, output: str) -> tuple:
        """Parse the model output to extract decision and reasoning"""
        # Simple parsing logic - you may need to adjust based on your model's output format
        lines = output.strip().split('\n')
        
        # Try to find decision and reasoning sections
        decision = "Model decision extracted from output"
        reasoning = output
        
        # Look for common patterns in the output
        for i, line in enumerate(lines):
            if "decision" in line.lower() and len(line) < 200:
                decision = line.strip()
                reasoning = '\n'.join(lines[i+1:])
                break
        
        return decision, reasoning

    def _generate_feature_importance(self, task_description: str, context: dict, decision: str) -> dict:
        """Generate feature importance using XAI explainer or basic heuristics"""
        
        if self.explainer:
            try:
                # Use XAI explainer if available
                decision_data = {
                    "decision_id": f"task_{hash(task_description)}",
                    "decision": decision,
                    "task_description": task_description,
                    "context": context,
                    "confidence": 0.8  # Mock confidence
                }
                
                explanation = self.explainer.explain_decision(decision_data)
                
                # Extract feature importance from XAI explanation
                feature_importance = {}
                
                # Add text analysis features
                if "text_analysis" in explanation:
                    text_data = explanation["text_analysis"]
                    if "word_importance" in text_data:
                        for word, importance in text_data["word_importance"].items():
                            feature_importance[f"word_{word}"] = importance
                
                # Add context analysis features
                if "context_analysis" in explanation:
                    context_data = explanation["context_analysis"]
                    if "feature_importance" in context_data:
                        feature_importance.update(context_data["feature_importance"])
                
                # Add basic metrics
                feature_importance.update({
                    "task_description_length": len(task_description) / 100.0,  # Normalize
                    "context_size": len(str(context)) / 100.0,  # Normalize
                    "context_keys_count": len(context) if isinstance(context, dict) else 0
                })
                
                return feature_importance
                
            except Exception as e:
                print(f"Error generating XAI explanation: {e}")
                # Fall back to basic feature importance
        
        # Basic feature importance when XAI is not available
        feature_importance = {
            "task_description_length": len(task_description) / 100.0,
            "context_payload_size": len(str(context)) / 100.0,
        }
        
        if isinstance(context, dict):
            for i, key in enumerate(list(context.keys())[:5]):  # Limit to first 5 keys
                feature_importance[f"context_key_{key}"] = 1.0
        
        return feature_importance

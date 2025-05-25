import os
import json
import replicate # Import the replicate library

# Placeholder for actual XAI logic
# from ..xai.explainer import XAIExplainer # Assuming you might have this

class Agent:
    # Updated model_name with the new version hash provided by the user
    def __init__(self, model_name="meta/llama-2-70b-chat:2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48"): 
        self.model_name = model_name
        self.replicate_client = None
        # The Replicate client automatically uses the REPLICATE_API_TOKEN environment variable.
        # Ensure it's set in your environment where you run uvicorn.
        api_token = os.environ.get("REPLICATE_API_TOKEN")
        if not api_token:
            print("Warning: REPLICATE_API_TOKEN environment variable not found. Replicate API calls will fail.")
            # You might want to handle this more gracefully, e.g., by disabling Replicate features
            # or raising a configuration error if Replicate is essential.
        try:
            # Initialize the client. It will use the REPLICATE_API_TOKEN from the environment.
            self.replicate_client = replicate.Client(api_token=api_token)
            print("Replicate client initialized.")
        except Exception as e:
            print(f"Error initializing Replicate client: {e}")
            # self.replicate_client will remain None

        # self.explainer = XAIExplainer() # If you have an explainer

    async def process_task(self, task_description: str, context: dict) -> dict:
        if not self.replicate_client:
            error_message = "Replicate client not initialized."
            if not os.environ.get("REPLICATE_API_TOKEN"):
                error_message += " REPLICATE_API_TOKEN is not set."
            else:
                error_message += " Check server logs for initialization errors."
            
            return {
                "decision": "Error",
                "explanation": {
                    "reasoning_steps": [error_message],
                    "feature_importance": {},
                    "model_details": {"name": self.model_name, "type": "Replicate Agent (Error State)"}
                }
            }

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
            # Make sure your REPLICATE_API_TOKEN is correctly set in your environment.
            # The specific input parameters might need adjustment based on the model's requirements.
            # --------------------------------------------------------------------
            output_iterator = self.replicate_client.run(
                self.model_name, 
                input=input_data
            )
            
            model_output_parts = []
            for item in output_iterator:
                model_output_parts.append(str(item)) 
            full_model_output = "".join(model_output_parts)
            
            print(f"Replicate model raw output (first 200 chars): {full_model_output[:200]}...")
            
            # TODO: Parse `full_model_output` to extract decision and reasoning
            # This parsing logic is highly dependent on how the Llama model (or your chosen model)
            # formats its response. You might need to use string manipulation or regex.
            # For now, we'll use the full output as reasoning and a generic decision.
            decision = "Decision based on model output (parsing needed)" 
            reasoning = full_model_output 
            # --------------------------------------------------------------------

            reasoning_steps = [
                f"Received task: {task_description}",
                f"Analyzed context (first 100 chars): {context_str[:100]}...",
                f"Formatted prompt for model (first 100 chars): {prompt[:100]}...",
                f"Raw model output (first 100 chars): {str(full_model_output)[:100]}...",
                f"Interpreted decision: {decision}",
                f"Interpreted reasoning (full model output): {reasoning}"
            ]

            # Dummy feature importance (replace with actual XAI method output from your explainer)
            # feature_importance = self.explainer.explain(input_data_for_xai, decision)
            feature_importance = {
                "info": "Feature importance calculation not yet implemented.",
                "task_description_length": len(task_description),
                "context_payload_size_chars": len(context_str),
            }
            if isinstance(context, dict):
                for key_item in list(context.keys())[:5]: # Limit to first 5 keys for brevity
                    feature_importance[f"context_key_{key_item}_present"] = 1


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

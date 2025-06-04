import os
import json
import replicate # Import the replicate library
from datetime import datetime # For generating unique decision_ids

# Placeholder for actual XAI logic
from ..xai.explainer import XAIExplainer # Assuming you might have this

class Agent:
    # Updated model_name with the new version hash provided by the user
    def __init__(self, model_name="meta/llama-2-70b-chat:2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48"): 
        self.model_name = model_name
        self.replicate_client = None
        self.explainer = None
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

        try:
            self.explainer = XAIExplainer()
            print("XAIExplainer initialized successfully.")
        except Exception as e:
            print(f"Warning: XAIExplainer initialization failed: {e}. XAI features will be unavailable.")
            self.explainer = None # Ensure explainer is None if it fails

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
            # ---- START PARSING LOGIC ----
            decision_keyword = "Decision:"
            reasoning_keyword = "Reasoning:"

            parsed_decision = "Could not parse decision from model output."
            parsed_reasoning_text = full_model_output # Default to full output if not parsed
            parsing_successful = False

            decision_index = full_model_output.find(decision_keyword)
            reasoning_index = full_model_output.find(reasoning_keyword)

            if decision_index != -1:
                # Potential conflict if Reasoning: comes before Decision:
                # So we find the start of reasoning text if it exists and comes after decision
                end_of_decision_search_area = len(full_model_output)
                if reasoning_index != -1 and reasoning_index > decision_index:
                    end_of_decision_search_area = reasoning_index

                parsed_decision_text = full_model_output[decision_index + len(decision_keyword):end_of_decision_search_area].strip()
                if parsed_decision_text: # Ensure it's not empty
                    parsed_decision = parsed_decision_text
                    parsing_successful = True # At least decision was found

            if reasoning_index != -1:
                # Potential conflict if Decision: comes after Reasoning:
                # So we find the start of decision text if it exists and comes after reasoning
                # This part of logic assumes Decision: comes before Reasoning: or they are mutually exclusive for extraction.
                # For simplicity, we'll extract from "Reasoning:" to the end, or until "Decision:" if it appears after.
                start_of_reasoning_text = reasoning_index + len(reasoning_keyword)
                end_of_reasoning_search_area = len(full_model_output)

                # Check if "Decision:" appears *after* "Reasoning:"
                # To prevent reasoning from capturing a subsequent decision block
                decision_after_reasoning_index = -1
                if decision_index != -1 and decision_index > reasoning_index:
                     decision_after_reasoning_index = decision_index

                if decision_after_reasoning_index != -1:
                    end_of_reasoning_search_area = decision_after_reasoning_index

                extracted_reasoning = full_model_output[start_of_reasoning_text:end_of_reasoning_search_area].strip()
                if extracted_reasoning: # Ensure it's not empty
                    parsed_reasoning_text = extracted_reasoning
                    parsing_successful = True # Mark as successful if reasoning also found

            decision = parsed_decision # Update the main decision variable

            # ---- END PARSING LOGIC ----
            # --------------------------------------------------------------------

            reasoning_steps = [
                f"Received task: {task_description}",
                f"Analyzed context (first 100 chars): {context_str[:100]}...",
                f"Formatted prompt for model (first 100 chars): {prompt[:100]}...",
                f"Raw model output (first 100 chars): {str(full_model_output)[:100]}...",
            ]

            if parsing_successful:
                reasoning_steps.append("Parsing of model output: Successful.")
                reasoning_steps.append(f"Parsed Decision: {decision}")
                reasoning_steps.append(f"Parsed Reasoning: {parsed_reasoning_text}")
            else:
                reasoning_steps.append("Parsing of model output: Failed or keywords not found.")
                reasoning_steps.append(f"Default Decision: {decision}")
                reasoning_steps.append(f"Full Model Output (used as reasoning): {full_model_output}")

            # ---- XAI EXPLANATION ----
            feature_importance = {"info": "XAI explanations unavailable."} # Default if explainer fails
            if self.explainer:
                try:
                    decision_id = datetime.now().isoformat()
                    # According to XAIExplainer.explain_decision, it expects "decision" and "decision_id"
                    # "reasoning_text" and "full_output_text" are not explicitly used by the current
                    # XAIExplainer.explain_decision but good to include for future enhancements.
                    decision_data = {
                        "decision_id": decision_id,
                        "decision": decision, # This is `parsed_decision`
                        "reasoning_text": parsed_reasoning_text,
                        "full_output_text": full_model_output,
                        "context": context, # Pass context if explainer might use it
                        "task_description": task_description # Pass task_description if explainer might use it
                    }
                    explanation_results = self.explainer.explain_decision(decision_data)
                    feature_importance = explanation_results # Replace dummy data
                    reasoning_steps.append(f"XAI Explanation generated for decision_id: {decision_id}")
                except Exception as e:
                    print(f"Error during XAI explanation generation: {e}")
                    feature_importance = {"info": f"XAI explanation generation failed: {str(e)}"}
                    reasoning_steps.append(f"XAI Explanation generation failed: {str(e)}")
            else:
                reasoning_steps.append("XAIExplainer not available. Skipping explanation generation.")


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

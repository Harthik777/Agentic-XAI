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

        # Ensure pad_token_id is set for the tokenizer and model
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        if self.model.config.pad_token_id is None:
            self.model.config.pad_token_id = self.tokenizer.eos_token_id

        self.lime_explainer = LimeTextExplainer(class_names=['other', 'relevant_text'])
        # self.explanation_cache = {}
        
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
        # self.explanation_cache[decision_id] = explanation
        
        return explanation
    
    def _generate_shap_explanation(self, text: str) -> Dict[str, Any]:
        """
        Generate SHAP values for the input text.
        """
        # Tokenize the input
        # SHAP's Explainer for transformers often works best with text inputs or pre-tokenized IDs.
        # We'll pass the text and let the explainer handle tokenization if it's designed to.
        # However, for direct control and consistency, tokenizing here is also common.
        # The key is how the model passed to shap.Explainer expects its input.
        # For `shap.Explainer(self.model, self.tokenizer)`, it expects tokenized input.

        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        input_ids = inputs["input_ids"]
        # attention_mask = inputs["attention_mask"] # Might be needed if model uses it

        # Initialize SHAP explainer for transformer models
        # The (self.model, self.tokenizer) tuple tells SHAP how to process the input.
        explainer = shap.Explainer(self.model, self.tokenizer)
        
        # Get SHAP values
        # For text models, shap_values object can be complex.
        # Typically, for a single instance, shap_values.values[0] contains feature attributions.
        # And shap_values.data[0] contains the tokens.
        shap_values = explainer(input_ids) # Pass input_ids directly
        
        token_importance = {}
        # shap_values.data[0] should give the token IDs for the first (and only) instance
        # shap_values.values[0] should give the attribution values for each token for that instance.
        # The .sum() at the end is if the shap_values have multiple dimensions per token (e.g. per output logit)
        # For causal LMs, we usually care about the overall impact of the token.
        
        # Ensure we're looking at the correct attributes of the shap_values object
        # For new versions of SHAP with transformers, it might be shap_values[0].values and shap_values[0].data

        processed_values = shap_values.values
        processed_data = shap_values.data

        # If shap_values is a list (e.g. multiple output classes), take the first element.
        # For GPT2, it's usually a single output, but structure can vary.
        if isinstance(processed_values, list):
            processed_values = processed_values[0]
        if isinstance(processed_data, list):
            processed_data = processed_data[0]

        # The output of explainer(input_ids) for transformers typically results in shap_values where:
        # shap_values.values is an array (batch_size, num_tokens, num_output_features)
        # shap_values.data is an array (batch_size, num_tokens) of token strings or ids
        # Assuming batch_size = 1 for a single explanation

        num_tokens = processed_data.shape[1] if len(processed_data.shape) > 1 else len(processed_data)

        for i in range(num_tokens):
            token_text = self.tokenizer.decode(processed_data[0, i]) if len(processed_data.shape) > 1 else self.tokenizer.decode(processed_data[i])

            # Skip padding tokens if they are decoded as such, or check against pad_token_id
            # This check might need to be more robust depending on tokenizer behavior
            if token_text == self.tokenizer.pad_token or token_text == self.tokenizer.eos_token: # GPT2 uses eos as pad often
                 # Check if input_ids[0, i] is pad_token_id if token_text check is not robust
                if input_ids[0,i] == self.tokenizer.pad_token_id:
                    continue

            # Summing shap_values across the embedding dimension if necessary
            # For text models, shap_values.values[0][i] might be a vector if output_rank_order='max_tokens'
            # or if it's per logit. For simplicity, we sum their absolute values.
            # The instruction was float(np.abs(shap_values.values[0][i].sum()))
            # Ensure shap_values.values[0][i] is indeed an array/tensor to sum.
            # If it's already a scalar, .sum() might not be needed or work.

            current_shap_value_segment = processed_values[0, i] # This should be the attribution for token i

            # If current_shap_value_segment is a scalar (e.g. already aggregated)
            if isinstance(current_shap_value_segment, (float, np.float32, np.float64)):
                 token_val = float(np.abs(current_shap_value_segment))
            else: # If it's an array (e.g. per output dimension), sum its absolute values
                 token_val = float(np.abs(current_shap_value_segment).sum())

            token_importance[f"{token_text}_{i}"] = token_val # Add index to token if it's not unique

        return {
            "token_importance": token_importance,
            "method": "SHAP"
        }
    
    def _generate_lime_explanation(self, text: str) -> Dict[str, Any]:
        """
        Generate LIME explanation for the input text.
        """
        def predictor(texts: List[str]) -> np.ndarray:
            probs = np.zeros((len(texts), 2))
            # Determine device for model and tokenizer
            device = self.model.device if hasattr(self.model, 'device') else torch.device("cuda" if torch.cuda.is_available() else "cpu")

            for i, t_text in enumerate(texts):
                # Tokenize the perturbed text
                inputs = self.tokenizer(
                    t_text,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=self.tokenizer.model_max_length if self.tokenizer.model_max_length else 512
                ).to(device)

                input_ids_processed = inputs.input_ids

                # Get model logits for the perturbed text
                with torch.no_grad():
                    logits = self.model(**inputs).logits

                # Calculate probabilities of generating the tokens in the perturbed text
                probabilities = torch.softmax(logits, dim=-1)

                # Gather the probabilities of the actual tokens in the input
                # We need to handle potential empty input_ids_processed after truncation/padding
                if input_ids_processed.shape[1] == 0: # No tokens to gather
                    sentence_prob = 0.0
                else:
                    # Ensure input_ids_processed is correctly shaped for gather
                    # It should be (batch_size, seq_len, 1) for gather
                    # Logits are (batch_size, seq_len, vocab_size)
                    # Probabilities are (batch_size, seq_len, vocab_size)
                    # token_probs should be (batch_size, seq_len)
                    token_probs = torch.gather(probabilities, 2, input_ids_processed.unsqueeze(-1)).squeeze(-1)

                    # Mask out padding tokens if any (though LIME typically works with words, tokenizer might add special tokens)
                    # For simplicity, we assume all tokens contribute unless they are padding.
                    # A more robust way would be to use attention_mask from tokenizer output.
                    # attention_mask = inputs.attention_mask
                    # sentence_prob = (token_probs * attention_mask).sum(dim=1) / attention_mask.sum(dim=1)
                    # For now, simple mean of probabilities of non-pad tokens:

                    # Consider only non-padding tokens in the mean calculation
                    non_pad_mask = (input_ids_processed != self.tokenizer.pad_token_id)
                    if non_pad_mask.sum() == 0 : # all pads, or empty
                        sentence_prob = 0.0
                    else:
                        sentence_prob = (token_probs * non_pad_mask).sum(dim=1) / non_pad_mask.sum(dim=1).clamp(min=1e-9) # avoid div by zero
                    sentence_prob = sentence_prob.item()


                probs[i, 1] = sentence_prob  # P("relevant_text")
                probs[i, 0] = 1 - sentence_prob  # P("other")

            return probs

        # Generate LIME explanation
        # We want to explain class 1 ("relevant_text")
        exp = self.lime_explainer.explain_instance(
            text,
            predictor,
            num_features=10,
            top_labels=1,
            labels=(1,)
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
        # decision_data might not be used extensively in this simplified version.
        # decision = decision_data.get("decision", "") # Not used in the new text

        explanation = (
            "The agent's decision has been analyzed. "
            "SHAP analysis provides insights into token importance, "
            "and LIME analysis offers local feature attributions. "
            "These can help understand the basis of the decision."
        )
        
        return explanation
    
    def get_explanation(self, decision_id: str, format: str = "text") -> Dict[str, Any]:
        """
        Retrieve cached explanation for a decision.
        """
        # Caching is currently disabled. Explanations are generated on demand.
        # decision_id is not used here as there's no cache to retrieve from.
        # format parameter is also not used for the same reason.
        return {"message": "Explanations are generated on demand. Caching is currently disabled."}
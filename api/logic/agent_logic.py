import os
import asyncio
import logging
import re
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import httpx

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class Decision(BaseModel):
    decision: str
    confidence: float
    reasoning: List[str]
    key_factors: Dict[str, str]

class IntelligentAgent:
    """
    A sophisticated AI agent for decision-making, powered by a free-tier inference API.
    """
    _instance: Optional["IntelligentAgent"] = None

    def __init__(self):
        self.api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        self.hf_token = os.getenv("HUGGING_FACE_TOKEN")
        
        if not self.hf_token:
            logger.warning("HUGGING_FACE_TOKEN is not set. Using fallback responses.")
            self.use_fallback = True
        else:
            self.use_fallback = False
            logger.info("✅ Hugging Face token found.")
        
        self.http_client = httpx.AsyncClient(timeout=45.0)
        logger.info(f"✅ Agent initialized to use Inference API: {self.api_url}")

    @classmethod
    def get_instance(cls) -> "IntelligentAgent":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def generate_decision(self, task_description: str, context: Dict[str, Any]) -> Decision:
        # If no token is available, use fallback immediately
        if self.use_fallback:
            return self._fallback_decision("Hugging Face token not configured. Using demo response.")
        
        prompt = self._create_structured_prompt(task_description, context)
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.7,
                "return_full_text": False,
                "do_sample": True,
            }
        }

        try:
            response = await self.http_client.post(self.api_url, json=payload, headers=headers)
            response.raise_for_status()
            
            api_response = response.json()
            if api_response and api_response[0]['generated_text']:
                return self._parse_llm_output(api_response[0]['generated_text'])

            return self._fallback_decision("Inference API returned an empty or invalid response.")
            
        except httpx.HTTPStatusError as e:
            error_body = e.response.text
            logger.error(f"💥 Inference API request failed with status {e.response.status_code}: {error_body}")
            detail = f"API Error (Status {e.response.status_code})."
            if "currently loading" in error_body.lower():
                detail = "The model is currently loading, please try again in a few moments."
            return self._fallback_decision(detail)
        except Exception as e:
            logger.error(f"💥 LLM generation failed during task execution: {e}")
            return self._fallback_decision(f"An unexpected error occurred during the API call.")

    def _create_structured_prompt(self, task_description: str, context: Dict[str, Any]) -> str:
        context_str = "\n".join([f"- {key}: {value}" for key, value in context.items()])
        json_structure = """
{
  "decision": "YOUR_CLEAR_AND_CONCISE_DECISION",
  "confidence": YOUR_CONFIDENCE_SCORE_AS_FLOAT_BETWEEN_0_AND_1,
  "reasoning": [
    "STEP_1_OF_YOUR_REASONING",
    "STEP_2_OF_YOUR_REASONING",
    "..."
  ],
  "key_factors": {
    "FACTOR_1_NAME": "EXPLANATION_OF_FACTOR_1S_IMPACT",
    "FACTOR_2_NAME": "EXPLANATION_OF_FACTOR_2S_IMPACT",
    "..."
  }
}
"""
        return (
            f"[INST] You are an expert decision-making AI. Your goal is to provide a clear, well-reasoned decision based on the provided task and context. "
            f"Analyze the following information and then generate a structured response in a JSON format inside a markdown code block. Do not add any extra commentary before or after the JSON structure.\n\n"
            f"**TASK:**\n{task_description}\n\n"
            f"**CONTEXT:**\n{context_str if context else 'No context provided.'}\n\n"
            f"**REQUIRED JSON STRUCTURE:**\n```json\n{json_structure}\n```\n[/INST]"
        )

    def _parse_llm_output(self, output: str) -> Decision:
        try:
            json_match = re.search(r'```json\n(.*?)\n```', output, re.S)
            if json_match:
                json_str = json_match.group(1).strip()
                data = json.loads(json_str)
                return Decision(**data)
            
            logger.warning("Could not find a valid JSON block in the LLM output.")
            return self._fallback_decision("Failed to parse structured JSON from LLM output.")
        
        except (json.JSONDecodeError, TypeError, KeyError) as e:
            logger.error(f"💥 Failed to parse or validate LLM output JSON: {e}\nOutput was: {output}")
            return self._fallback_decision(f"Invalid JSON structure in LLM response: {e}")

    def _fallback_decision(self, reason: str) -> Decision:
        logger.warning(f"Executing fallback decision logic due to: {reason}")
        
        if "token not configured" in reason.lower() or "demo" in reason.lower():
            return Decision(
                decision="Demo response: Consider gathering more information before making this decision.",
                confidence=0.8,
                reasoning=[
                    "This is a demonstration response since the Hugging Face API token is not configured.",
                    "In a real scenario, I would analyze the provided context carefully.",
                    "I would weigh the pros and cons of each option.",
                    "I would provide data-driven recommendations based on the task requirements."
                ],
                key_factors={
                    "demo_mode": "This response is generated without AI model access",
                    "configuration": "Set HUGGING_FACE_TOKEN environment variable for full functionality",
                    "recommendation": "The system is working correctly, but needs API configuration"
                }
            )
        else:
            return Decision(
                decision="A decision could not be reached due to a system error.",
                confidence=0.0,
                reasoning=["The primary AI model failed to provide a valid response.", f"Error: {reason}"],
                key_factors={"System Status": "An internal error occurred.", "Error Details": reason}
            )

if __name__ == '__main__':
    # This allows for direct testing of the agent
    async def main():
        print("🤖 Initializing agent for a test run...")
        try:
            agent = IntelligentAgent.get_instance()
            print("✅ Agent initialized successfully.")
            
            task = "Should our company migrate our primary database from PostgreSQL to a distributed SQL database like CockroachDB?"
            context = {
                "current_db_size_gb": 500,
                "expected_daily_users": 75000,
                "team_sql_experience_years": 8,
                "data_consistency_requirement": "strong",
                "downtime_tolerance": "low"
            }
            
            print("\n🚀 Processing a test task...")
            decision = await agent.generate_decision(task, context)
            
            print("\n🎉 Decision received:")
            print(decision.json(indent=2))
            
        except Exception as e:
            print(f"🔥 An error occurred during the test run: {e}")

    asyncio.run(main()) 
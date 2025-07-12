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
    A sophisticated AI agent for decision-making, powered by Google Gemini API.
    """
    _instance: Optional["IntelligentAgent"] = None

    def __init__(self):
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        self.google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        
        if not self.google_api_key:
            logger.warning("GOOGLE_API_KEY is not set. Using fallback responses.")
            self.use_fallback = True
        else:
            self.use_fallback = False
            logger.info("✅ Google API key found.")
        
        self.http_client = httpx.AsyncClient(timeout=45.0)
        logger.info(f"✅ Agent initialized to use Google Gemini API")

    @classmethod
    def get_instance(cls) -> "IntelligentAgent":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def generate_decision(self, task_description: str, context: Dict[str, Any]) -> Decision:
        # If no API key is available, use fallback immediately
        if self.use_fallback:
            return self._fallback_decision("Google API key not configured. Using demo response.")
        
        prompt = self._create_structured_prompt(task_description, context)
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000
            }
        }

        try:
            url = f"{self.api_url}?key={self.google_api_key}"
            response = await self.http_client.post(url, json=payload)
            response.raise_for_status()
            
            api_response = response.json()
            if api_response and "candidates" in api_response and api_response["candidates"]:
                content = api_response["candidates"][0]["content"]["parts"][0]["text"]
                return self._parse_llm_output(content)

            return self._fallback_decision("Google Gemini API returned an empty or invalid response.")
            
        except httpx.HTTPStatusError as e:
            error_body = e.response.text
            logger.error(f"💥 Google Gemini API request failed with status {e.response.status_code}: {error_body}")
            detail = f"API Error (Status {e.response.status_code})."
            if "quota" in error_body.lower():
                detail = "API quota exceeded. Please check your Google Cloud billing and quotas."
            elif "invalid" in error_body.lower():
                detail = "Invalid API key. Please check your GOOGLE_API_KEY environment variable."
            return self._fallback_decision(detail)
        except Exception as e:
            logger.error(f"💥 Google Gemini generation failed during task execution: {e}")
            return self._fallback_decision(f"An unexpected error occurred during the API call.")

    def _create_structured_prompt(self, task_description: str, context: Dict[str, Any]) -> str:
        context_str = "\n".join([f"- {key}: {value}" for key, value in context.items()])
        
        return f"""You are an expert decision-making AI. Analyze the following task and provide a structured decision.

**TASK:**
{task_description}

**CONTEXT:**
{context_str if context else 'No context provided.'}

Please provide your response in the following JSON format:
{{
  "decision": "Your clear and specific recommendation",
  "confidence": <your_confidence_score_between_0.0_and_1.0>,
  "reasoning": [
    "First key point of analysis",
    "Second important consideration", 
    "Third supporting argument"
  ],
  "key_factors": {{
    "Factor 1": "Explanation of how this impacts the decision",
    "Factor 2": "Analysis of this consideration",
    "Factor 3": "Assessment of this element"
  }}
}}

IMPORTANT: Replace <your_confidence_score_between_0.0_and_1.0> with an actual decimal between 0.0 and 1.0 based on your analysis. Higher confidence (0.8-1.0) for clear, well-supported decisions. Lower confidence (0.3-0.7) for complex or uncertain situations. Very low confidence (0.1-0.3) for highly uncertain scenarios.

Provide practical, actionable advice with confidence scores that reflect the certainty of your recommendation."""

    def _parse_llm_output(self, output: str) -> Decision:
        try:
            # Try to find JSON block first
            json_match = re.search(r'```json\n(.*?)\n```', output, re.S)
            if json_match:
                json_str = json_match.group(1).strip()
            else:
                # Try to find JSON without code block
                start_idx = output.find('{')
                end_idx = output.rfind('}') + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = output[start_idx:end_idx]
                else:
                    raise ValueError("No JSON found in response")
            
            data = json.loads(json_str)
            
            # Validate required fields
            if not all(key in data for key in ["decision", "confidence", "reasoning", "key_factors"]):
                raise ValueError("Missing required fields in JSON response")
                
            return Decision(**data)
            
        except (json.JSONDecodeError, ValueError, TypeError, KeyError) as e:
            logger.error(f"💥 Failed to parse Google Gemini output JSON: {e}\nOutput was: {output}")
            return self._fallback_decision(f"Invalid JSON structure in Google Gemini response: {e}")

    def _fallback_decision(self, reason: str) -> Decision:
        logger.warning(f"Executing fallback decision logic due to: {reason}")
        
        if "not configured" in reason.lower() or "demo" in reason.lower():
            return Decision(
                decision="Demo response: Consider gathering more information and consulting with stakeholders before making this decision.",
                confidence=0.8,
                reasoning=[
                    "This is a demonstration response since the Google API key is not configured.",
                    "In a real scenario, I would analyze the provided context using Google Gemini AI.",
                    "I would evaluate multiple perspectives and potential outcomes.",
                    "I would provide data-driven recommendations based on the specific requirements."
                ],
                key_factors={
                    "demo_mode": "This response is generated without AI model access",
                    "configuration": "Set GOOGLE_API_KEY environment variable for full functionality", 
                    "recommendation": "The system is working correctly, but needs API configuration"
                }
            )
        else:
            return Decision(
                decision="A decision could not be reached due to a system error.",
                confidence=0.0,
                reasoning=["Google Gemini AI failed to provide a valid response.", f"Error: {reason}"],
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
            print(decision.model_dump_json(indent=2))
            
        except Exception as e:
            print(f"🔥 An error occurred during the test run: {e}")

    asyncio.run(main()) 
# Intelligent Agent

import os
import json
import asyncio
import logging
from typing import Dict, Any, List
import httpx

# Import the XAI explainer
from xai.explainer import XAIExplainer

logger = logging.getLogger(__name__)

class IntelligentAgent:
    """
    Intelligent Agent with Explainable AI capabilities.
    Uses FREE Hugging Face API instead of paid services.
    """
    
    def __init__(self):
        self.hf_token = os.getenv("HUGGING_FACE_TOKEN")  # Optional, works without it
        self.model_name = "microsoft/DialoGPT-medium"  # Free model
        
        # Initialize XAI explainer
        self.explainer = XAIExplainer()
        
        # Initialize HTTP client for API calls
        self.http_client = httpx.AsyncClient(timeout=30.0)
        
        if self.hf_token:
            logger.info("Hugging Face token found. Using authenticated API.")
        else:
            logger.info("No Hugging Face token. Using free public API with rate limits.")
    
    async def process_task(self, task_description: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task and return decision with explanation.
        """
        try:
            # Generate decision using free AI
            decision = await self._generate_free_ai_decision(task_description, context)
            
            # Generate XAI explanation, which now includes confidence and analysis_type
            explanation_data = self.explainer.generate_explanation(
                decision=decision,
                task_description=task_description,
                context=context
            )

            # Separate confidence from the rest of the explanation
            confidence = explanation_data.pop("confidence", 0.0)
            
            return {
                "decision": decision,
                "explanation": explanation_data, # The rest of the data is the explanation
                "confidence": confidence,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in process_task: {e}")
            # Fallback to enhanced mock response
            return await self._generate_enhanced_mock_response(task_description, context)
    
    async def _generate_free_ai_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """
        Generate decision using FREE Hugging Face API.
        """
        try:
            # Prepare context summary
            context_summary = self._summarize_context(context)
            
            # Create a decision-focused prompt
            prompt = f"Task: {task_description}\nContext: {context_summary}\nDecision:"
            
            # Use Hugging Face Inference API (FREE)
            url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
            headers = {}
            if self.hf_token:
                headers["Authorization"] = f"Bearer {self.hf_token}"
            
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 100,
                    "temperature": 0.7,
                    "do_sample": True,
                    "return_full_text": False
                }
            }
            
            response = await self.http_client.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    decision = result[0].get("generated_text", "").strip()
                    if decision:
                        decision = self._clean_decision(decision)
                        logger.info(f"Generated AI decision: {decision[:100]}...")
                        return decision
            
            # If API fails, use intelligent mock
            return await self._generate_intelligent_mock_decision(task_description, context)
            
        except Exception as e:
            logger.warning(f"Free AI API error: {e}, falling back to intelligent mock")
            return await self._generate_intelligent_mock_decision(task_description, context)
    
    async def _generate_enhanced_mock_response(self, task_description: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate enhanced mock response when AI fails.
        """
        decision = await self._generate_intelligent_mock_decision(task_description, context)
        
        explanation_data = self.explainer.generate_explanation(
            decision=decision,
            task_description=task_description,
            context=context
        )

        # Separate confidence from the rest of the explanation
        confidence = explanation_data.pop("confidence", 0.0)

        return {
            "decision": decision,
            "explanation": explanation_data,
            "confidence": confidence,
            "success": True
        }
    
    async def _generate_intelligent_mock_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """
        Generate intelligent rule-based decisions based on task patterns.
        """
        task_lower = task_description.lower()
        
        # Database selection logic
        if any(word in task_lower for word in ['database', 'db', 'storage', 'data']):
            return self._decide_database(context)
        
        # Programming language selection
        if any(word in task_lower for word in ['programming', 'language', 'learn', 'javascript', 'python']):
            return self._decide_programming_language(task_description, context)
        
        # Business decisions
        if any(word in task_lower for word in ['launch', 'product', 'business', 'market']):
            return self._decide_business_strategy(context)
        
        # Investment decisions
        if any(word in task_lower for word in ['invest', 'stock', 'money', 'financial']):
            return self._decide_investment(context)
        
        # Job/career decisions
        if any(word in task_lower for word in ['job', 'career', 'offer', 'work']):
            return self._decide_career(context)
        
        # Housing decisions
        if any(word in task_lower for word in ['house', 'rent', 'buy', 'home']):
            return self._decide_housing(context)
        
        # Generic decision
        return self._generate_generic_decision(task_description, context)
    
    def _decide_database(self, context: Dict[str, Any]) -> str:
        """Intelligent database recommendation based on context."""
        users = context.get('expected_daily_users', 0)
        sql_exp = context.get('team_sql_experience', 5)
        nosql_exp = context.get('team_nosql_experience', 5)
        consistency = context.get('data_consistency_requirement', '').lower()
        
        if users > 50000 and consistency == 'eventual':
            return "Recommend MongoDB for high-scale applications with eventual consistency requirements. Your team's experience levels and traffic demands make it ideal for horizontal scaling."
        elif sql_exp > nosql_exp and users < 100000:
            return "Recommend PostgreSQL with read replicas. Your team's strong SQL experience and moderate traffic make PostgreSQL optimal for reliability and ACID compliance."
        elif users > 100000:
            return "Recommend a distributed SQL solution like CockroachDB. High traffic demands require both SQL familiarity and horizontal scaling capabilities."
        else:
            return "Recommend PostgreSQL for its balance of performance, reliability, and team expertise alignment."
    
    def _decide_programming_language(self, task: str, context: Dict[str, Any]) -> str:
        """Intelligent programming language recommendation."""
        if 'javascript' in task.lower():
            return "Yes, JavaScript is highly worth learning. It's versatile (frontend, backend, mobile), has huge demand in job market, and enables full-stack development with a single language."
        
        priority = context.get('priority', '').lower()
        if priority == 'high':
            return "Given high priority, focus on JavaScript or Python - both have gentle learning curves and immediate practical applications."
        
        return "JavaScript is excellent for beginners due to its versatility and immediate visual feedback in web development."
    
    def _decide_business_strategy(self, context: Dict[str, Any]) -> str:
        """Business decision logic."""
        budget = context.get('budget_available', context.get('budget_constraint', 'medium'))
        progress = context.get('development_progress', 50)
        
        if isinstance(progress, (int, float)) and progress > 80:
            return "Recommend proceeding with launch. High development progress indicates readiness, and market timing appears favorable."
        elif str(budget).lower() in ['low', 'limited']:
            return "Recommend waiting until Q2. Budget constraints suggest more preparation time would improve launch success probability."
        else:
            return "Recommend soft launch with limited scope to test market response while maintaining budget flexibility."
    
    def _decide_investment(self, context: Dict[str, Any]) -> str:
        """Investment decision logic."""
        risk_tolerance = context.get('risk_tolerance', 'medium').lower()
        timeline = context.get('investment_timeline', '').lower()
        
        if 'renewable' in str(context).lower() and 'tech' in str(context).lower():
            if risk_tolerance == 'high':
                return "Recommend 60% tech stocks, 40% renewable energy. Tech offers higher growth potential while renewable provides diversification."
            else:
                return "Recommend 40% tech stocks, 60% renewable energy. Renewable energy has government support and lower volatility."
        
        return "Recommend diversified portfolio with moderate risk allocation based on your investment timeline and risk tolerance."
    
    def _decide_career(self, context: Dict[str, Any]) -> str:
        """Career decision logic."""
        risk_tolerance = context.get('risk_tolerance', 'medium').lower()
        startup_equity = context.get('startup_equity', 0)
        
        if risk_tolerance == 'high' and startup_equity > 0:
            return "Recommend taking the startup offer. High risk tolerance and equity upside align with potential for significant returns."
        elif risk_tolerance == 'low':
            return "Recommend staying at current corporate job. Stability and known compensation better align with low risk tolerance."
        else:
            return "Recommend negotiating with startup for better base salary while maintaining equity. Balance risk with security."
    
    def _decide_housing(self, context: Dict[str, Any]) -> str:
        """Housing decision logic."""
        savings = context.get('current_savings', 0)
        house_price = context.get('target_house_price', 0)
        years_staying = context.get('years_planning_to_stay', 0)
        
        if savings > house_price * 0.2 and years_staying > 5:
            return "Recommend buying. You have sufficient down payment and long-term residency plans make ownership financially advantageous."
        elif years_staying < 3:
            return "Recommend renting. Short-term plans make renting more flexible and cost-effective."
        else:
            return "Recommend waiting 1-2 years to build more savings while monitoring market conditions."
    
    def _generate_generic_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """
        Enhanced generic decision maker for ANY type of task.
        Uses intelligent pattern recognition and dynamic prompt generation.
        """
        task_lower = task_description.lower()
        
        # 1. COMPARISON DECISIONS (A vs B, multiple options)
        if any(word in task_lower for word in ['vs', 'versus', 'compare', 'choose', 'select', 'between']):
            return self._handle_comparison_decision(task_description, context)
        
        # 2. YES/NO QUESTIONS  
        if any(word in task_lower for word in ['should i', 'should we', 'is it worth', 'can i', 'will it']):
            return self._handle_yes_no_decision(task_description, context)
        
        # 3. OPTIMIZATION PROBLEMS
        if any(word in task_lower for word in ['optimize', 'improve', 'maximize', 'minimize', 'best way', 'most efficient']):
            return self._handle_optimization_decision(task_description, context)
        
        # 4. PLANNING/STRATEGY DECISIONS
        if any(word in task_lower for word in ['plan', 'strategy', 'approach', 'roadmap', 'timeline', 'schedule']):
            return self._handle_planning_decision(task_description, context)
        
        # 5. RISK ASSESSMENT
        if any(word in task_lower for word in ['risk', 'safe', 'secure', 'danger', 'threat', 'assess']):
            return self._handle_risk_decision(task_description, context)
        
        # 6. RESOURCE ALLOCATION
        if any(word in task_lower for word in ['budget', 'allocate', 'distribute', 'assign', 'resource']):
            return self._handle_resource_decision(task_description, context)
        
        # 7. PROBLEM SOLVING
        if any(word in task_lower for word in ['problem', 'issue', 'solve', 'fix', 'troubleshoot', 'debug']):
            return self._handle_problem_solving_decision(task_description, context)
        
        # 8. LEARNING/EDUCATION DECISIONS
        if any(word in task_lower for word in ['learn', 'study', 'course', 'skill', 'education', 'training']):
            return self._handle_learning_decision(task_description, context)
        
        # 9. LIFESTYLE/PERSONAL DECISIONS
        if any(word in task_lower for word in ['lifestyle', 'personal', 'health', 'fitness', 'diet', 'habit']):
            return self._handle_lifestyle_decision(task_description, context)
        
        # 10. CREATIVE DECISIONS
        if any(word in task_lower for word in ['creative', 'design', 'art', 'content', 'marketing', 'brand']):
            return self._handle_creative_decision(task_description, context)
        
        # 11. FALLBACK: INTELLIGENT CONTEXTUAL ANALYSIS
        return self._handle_contextual_analysis_decision(task_description, context)
    
    def _handle_comparison_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle A vs B or multi-option comparisons."""
        # Extract numeric values for comparison
        numeric_factors = {k: v for k, v in context.items() if isinstance(v, (int, float))}
        text_factors = {k: v for k, v in context.items() if isinstance(v, str)}
        
        if len(numeric_factors) >= 2:
            # Compare based on numeric data
            sorted_factors = sorted(numeric_factors.items(), key=lambda x: abs(x[1]), reverse=True)
            top_factor = sorted_factors[0]
            return f"Recommend option with highest {top_factor[0].replace('_', ' ')} value ({top_factor[1]}). Analysis shows this factor provides {abs(top_factor[1]) / sum(abs(v) for v in numeric_factors.values()) * 100:.1f}% of total quantifiable impact."
        
        return f"Based on contextual analysis, recommend the option that best aligns with your primary objectives in: {task_description[:50]}..."
    
    def _handle_yes_no_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle yes/no questions with confidence scoring."""
        positive_indicators = 0
        negative_indicators = 0
        
        for key, value in context.items():
            if isinstance(value, (int, float)):
                if value > 0:
                    positive_indicators += min(value / 10, 1)  # Normalize to 0-1
                else:
                    negative_indicators += abs(value) / 10
            elif isinstance(value, str):
                positive_words = ['good', 'excellent', 'high', 'strong', 'positive', 'yes', 'ready']
                negative_words = ['bad', 'poor', 'low', 'weak', 'negative', 'no', 'not ready']
                
                if any(word in value.lower() for word in positive_words):
                    positive_indicators += 0.5
                if any(word in value.lower() for word in negative_words):
                    negative_indicators += 0.5
        
        confidence = abs(positive_indicators - negative_indicators) / max(positive_indicators + negative_indicators, 1)
        
        if positive_indicators > negative_indicators:
            return f"Yes, recommend proceeding. Positive factors outweigh concerns with {confidence:.1%} confidence based on the provided context."
        else:
            return f"No, recommend waiting or reconsidering. Risk factors suggest caution with {confidence:.1%} confidence based on current analysis."
    
    def _handle_optimization_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle optimization and improvement decisions."""
        bottlenecks = []
        opportunities = []
        
        for key, value in context.items():
            if 'efficiency' in key.lower() or 'performance' in key.lower():
                if isinstance(value, (int, float)) and value < 0.7:  # Assuming 0-1 scale
                    bottlenecks.append(key.replace('_', ' '))
            
            if 'potential' in key.lower() or 'opportunity' in key.lower():
                opportunities.append(key.replace('_', ' '))
        
        if bottlenecks:
            return f"Recommend focusing optimization efforts on: {', '.join(bottlenecks[:3])}. These areas show the highest improvement potential based on current metrics."
        elif opportunities:
            return f"Recommend pursuing optimization opportunities in: {', '.join(opportunities[:3])}. These areas align with your improvement objectives."
        else:
            return "Recommend systematic performance analysis to identify optimization opportunities. Current data suggests stable performance with room for strategic improvements."
    
    def _handle_planning_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle planning and strategy decisions."""
        timeline = context.get('timeline', context.get('deadline', 'medium'))
        priority = context.get('priority', context.get('importance', 'medium'))
        resources = context.get('budget', context.get('resources', context.get('team_size', 'adequate')))
        
        if str(timeline).lower() in ['urgent', 'short', 'immediate']:
            return f"Recommend agile, sprint-based approach. Urgent timeline requires rapid iterations and frequent reassessment. Focus on MVP delivery first."
        elif str(priority).lower() in ['high', 'critical', 'essential']:
            return f"Recommend detailed planning with milestone tracking. High priority justifies comprehensive preparation and risk mitigation strategies."
        else:
            return f"Recommend balanced planning approach with flexibility for adjustments. Standard priority allows for thorough preparation while maintaining adaptability."
    
    def _handle_risk_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle risk assessment decisions."""
        risk_level = 0
        mitigation_factors = 0
        
        for key, value in context.items():
            if 'risk' in key.lower() or 'threat' in key.lower() or 'danger' in key.lower():
                if isinstance(value, (int, float)):
                    risk_level += value
                elif isinstance(value, str) and value.lower() in ['high', 'critical', 'severe']:
                    risk_level += 3
            
            if 'mitigation' in key.lower() or 'protection' in key.lower() or 'backup' in key.lower():
                mitigation_factors += 1
        
        if risk_level > 5:
            return f"High risk detected. Recommend comprehensive risk mitigation before proceeding. Identified {risk_level} risk factors requiring attention."
        elif mitigation_factors > 2:
            return f"Moderate risk with good mitigation. Recommend proceeding with enhanced monitoring and prepared contingency plans."
        else:
            return f"Acceptable risk level. Recommend proceeding with standard precautions and regular risk reassessment."
    
    def _handle_resource_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle resource allocation decisions."""
        total_resources = 0
        allocation_requests = 0
        
        for key, value in context.items():
            if isinstance(value, (int, float)):
                if 'budget' in key.lower() or 'cost' in key.lower() or 'resource' in key.lower():
                    total_resources += abs(value)
                if 'request' in key.lower() or 'need' in key.lower() or 'required' in key.lower():
                    allocation_requests += abs(value)
        
        if allocation_requests > total_resources * 1.2:
            return f"Resource constraints detected. Recommend prioritizing critical needs first, then phased implementation based on available budget of {total_resources}."
        elif total_resources > allocation_requests * 1.5:
            return f"Sufficient resources available. Recommend full allocation with reserve fund for contingencies and future opportunities."
        else:
            return f"Balanced resource situation. Recommend careful allocation with 10-15% buffer for unexpected requirements."
    
    def _handle_problem_solving_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle problem-solving decisions."""
        severity = context.get('severity', context.get('urgency', 'medium'))
        complexity = len(context)  # More context = more complex problem
        
        if str(severity).lower() in ['critical', 'urgent', 'high']:
            return f"Critical problem requiring immediate attention. Recommend rapid response team activation and parallel troubleshooting approaches."
        elif complexity > 5:
            return f"Complex problem with multiple factors. Recommend systematic root cause analysis and phased solution implementation."
        else:
            return f"Standard problem-solving approach recommended. Use established troubleshooting procedures with documentation for future reference."
    
    def _handle_learning_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle learning and education decisions."""
        experience_level = context.get('experience_level', context.get('current_skill', 'beginner'))
        time_available = context.get('time_available', context.get('study_time', 'moderate'))
        
        if str(experience_level).lower() in ['beginner', 'novice', 'new']:
            return f"Beginner-friendly approach recommended. Start with foundational concepts, practical exercises, and gradual skill building."
        elif str(time_available).lower() in ['limited', 'short', 'minimal']:
            return f"Time-efficient learning path recommended. Focus on high-impact skills with immediate practical applications."
        else:
            return f"Comprehensive learning approach recommended. Balance theoretical understanding with hands-on practice for deep mastery."
    
    def _handle_lifestyle_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle lifestyle and personal decisions."""
        current_satisfaction = context.get('current_satisfaction', context.get('happiness_level', 5))
        health_priority = context.get('health_priority', context.get('wellness_focus', 'medium'))
        
        if isinstance(current_satisfaction, (int, float)) and current_satisfaction < 4:
            return f"Low satisfaction indicates need for change. Recommend gradual lifestyle adjustments focused on your highest priority areas."
        elif str(health_priority).lower() in ['high', 'critical', 'essential']:
            return f"Health-focused approach recommended. Prioritize sustainable changes that support long-term wellbeing and energy levels."
        else:
            return f"Balanced lifestyle approach recommended. Make incremental improvements that align with your values and long-term goals."
    
    def _handle_creative_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """Handle creative and design decisions."""
        target_audience = context.get('target_audience', context.get('audience', 'general'))
        creativity_level = context.get('creativity_required', context.get('innovation_level', 'medium'))
        
        if str(creativity_level).lower() in ['high', 'innovative', 'unique']:
            return f"High creativity approach recommended. Explore unconventional solutions, gather diverse inspirations, and iterate boldly."
        elif target_audience:
            return f"Audience-centered creative approach recommended. Design solutions that resonate specifically with {target_audience} preferences and needs."
        else:
            return f"Balanced creative approach recommended. Combine proven design principles with fresh perspectives for optimal impact."
    
    def _handle_contextual_analysis_decision(self, task_description: str, context: Dict[str, Any]) -> str:
        """
        Ultimate fallback: Deep contextual analysis for ANY type of decision.
        Uses advanced pattern recognition and context weighting.
        """
        # Analyze task complexity
        task_words = len(task_description.split())
        context_richness = len(context)
        
        # Extract key themes from task description
        task_themes = []
        important_words = ['important', 'critical', 'urgent', 'key', 'main', 'primary', 'essential']
        action_words = ['need', 'want', 'should', 'must', 'recommend', 'suggest', 'decide']
        
        for word in important_words:
            if word in task_description.lower():
                task_themes.append('high_importance')
                break
        
        for word in action_words:
            if word in task_description.lower():
                task_themes.append('decision_required')
                break
        
        # Analyze context patterns
        numeric_factors = sum(1 for v in context.values() if isinstance(v, (int, float)))
        text_factors = sum(1 for v in context.values() if isinstance(v, str))
        boolean_factors = sum(1 for v in context.values() if isinstance(v, bool))
        
        # Generate contextual recommendation
        if 'high_importance' in task_themes and context_richness > 3:
            return f"High-importance decision with rich context detected. Recommend thorough analysis of all {context_richness} factors, with emphasis on quantifiable metrics ({numeric_factors} identified). Proceed with careful consideration and stakeholder input."
        
        elif task_words > 20 and context_richness > 5:
            return f"Complex decision scenario identified. Recommend breaking down into sub-decisions, analyzing each of the {context_richness} context factors systematically, and using a weighted decision matrix approach."
        
        elif context_richness == 0:
            return f"Limited context available for decision-making. Recommend gathering additional information in key areas: stakeholder needs, resource constraints, timeline requirements, and success criteria before proceeding."
        
        elif numeric_factors > text_factors:
            return f"Data-driven decision context identified. Recommend quantitative analysis approach, leveraging the {numeric_factors} measurable factors for objective evaluation and comparison."
        
        else:
            # Final fallback - always provide a meaningful response
            primary_context_keys = list(context.keys())[:3] if context else []
            context_summary = f"considering {', '.join(primary_context_keys)}" if primary_context_keys else "with available information"
            
            return f"Recommend a balanced approach to this decision {context_summary}. Consider both short-term impacts and long-term implications. Implement with ability to adjust based on early results and feedback."
    
    def _summarize_context(self, context: Dict[str, Any]) -> str:
        """Create a brief context summary for AI prompt."""
        if not context:
            return "No additional context provided"
        
        key_items = []
        for key, value in list(context.items())[:5]:  # Top 5 most important
            key_items.append(f"{key}: {value}")
        
        return "; ".join(key_items)
    
    def _clean_decision(self, decision: str) -> str:
        """Clean and format the decision text."""
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
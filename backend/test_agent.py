import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from app.models.agent import IntelligentAgent
from app.xai.explainer import XAIExplainer

class TestIntelligentAgent:
    """Test suite for IntelligentAgent class."""
    
    def setup_method(self):
        """Setup for each test method."""
        self.agent = IntelligentAgent()
    
    @pytest.mark.asyncio
    async def test_process_task_success(self):
        """Test successful task processing."""
        task_description = "Should I invest in tech stocks?"
        context = {"risk_tolerance": "medium", "investment_amount": 10000}
        
        result = await self.agent.process_task(task_description, context)
        
        assert result["success"] is True
        assert "decision" in result
        assert "explanation" in result
        assert isinstance(result["explanation"]["reasoning_steps"], list)
        assert isinstance(result["explanation"]["feature_importance"], dict)
    
    @pytest.mark.asyncio
    async def test_decision_patterns(self):
        """Test different decision patterns."""
        test_cases = [
            {
                "task": "Which database should I choose?",
                "context": {"expected_daily_users": 10000, "team_sql_experience": 8},
                "expected_keywords": ["database", "recommend"]
            },
            {
                "task": "Should I learn JavaScript?",
                "context": {"priority": "high", "current_experience": "beginner"},
                "expected_keywords": ["javascript", "worth", "learning"]
            },
            {
                "task": "Plan our product launch strategy",
                "context": {"budget": 50000, "timeline": "urgent"},
                "expected_keywords": ["recommend", "approach"]
            }
        ]
        
        for case in test_cases:
            result = await self.agent.process_task(case["task"], case["context"])
            decision = result["decision"].lower()
            
            # Check that decision contains relevant keywords
            assert any(keyword in decision for keyword in case["expected_keywords"])
            assert result["success"] is True
    
    @pytest.mark.asyncio
    async def test_context_analysis(self):
        """Test context feature importance analysis."""
        task_description = "Investment decision"
        context = {
            "amount": 50000,
            "risk_level": "medium",
            "timeline": "long_term",
            "experience": "intermediate"
        }
        
        result = await self.agent.process_task(task_description, context)
        feature_importance = result["explanation"]["feature_importance"]
        
        # All context keys should have importance scores
        for key in context.keys():
            assert key in feature_importance
            assert 0 <= feature_importance[key] <= 1
        
        # Feature importance should sum to approximately 1
        total_importance = sum(feature_importance.values())
        assert 0.9 <= total_importance <= 1.1
    
    @pytest.mark.asyncio
    async def test_confidence_estimation(self):
        """Test confidence score calculation."""
        # High confidence scenario
        detailed_task = "Should I invest in renewable energy stocks given my high risk tolerance and 10-year investment horizon?"
        rich_context = {
            "risk_tolerance": "high",
            "investment_horizon": 10,
            "portfolio_size": 100000,
            "sector_knowledge": "good",
            "market_research": "completed"
        }
        
        result = await self.agent.process_task(detailed_task, rich_context)
        reasoning_steps = result["explanation"]["reasoning_steps"]
        
        # Should have confidence assessment step
        confidence_step = [step for step in reasoning_steps if "confidence" in step.lower()]
        assert len(confidence_step) > 0
    
    @pytest.mark.asyncio
    async def test_free_ai_fallback(self):
        """Test fallback when free AI API fails."""
        with patch('httpx.AsyncClient.post') as mock_post:
            # Mock API failure
            mock_response = Mock()
            mock_response.status_code = 500
            mock_post.return_value = mock_response
            
            result = await self.agent.process_task("Test task", {"test": "context"})
            
            # Should still succeed with fallback
            assert result["success"] is True
            assert "decision" in result
    
    def test_context_summarization(self):
        """Test context summarization for AI prompts."""
        context = {
            "budget": 10000,
            "timeline": "3_months",
            "team_size": 5,
            "priority": "high",
            "complexity": "medium",
            "risk_tolerance": "low",
            "extra_param": "value"
        }
        
        summary = self.agent._summarize_context(context)
        
        # Should limit to top 5 items
        parts = summary.split(';')
        assert len(parts) <= 5
        assert "budget: 10000" in summary


class TestXAIExplainer:
    """Test suite for XAIExplainer class."""
    
    def setup_method(self):
        """Setup for each test method."""
        self.explainer = XAIExplainer()
    
    def test_feature_importance_calculation(self):
        """Test feature importance calculation."""
        context = {
            "numeric_high": 100,
            "numeric_low": 5,
            "string_long": "This is a very detailed description of something important",
            "string_short": "brief",
            "boolean_true": True,
            "boolean_false": False,
            "list_data": [1, 2, 3, 4, 5]
        }
        
        importance = self.explainer._calculate_feature_importance(context)
        
        # All features should have importance scores
        for key in context.keys():
            assert key in importance
            assert 0 <= importance[key] <= 1
        
        # Higher magnitude numeric values should have higher importance
        assert importance["numeric_high"] > importance["numeric_low"]
        
        # Longer strings should have higher importance
        assert importance["string_long"] > importance["string_short"]
        
        # True boolean should have higher importance than false
        assert importance["boolean_true"] > importance["boolean_false"]
    
    def test_task_analysis(self):
        """Test task description analysis."""
        task = "We need to analyze the market conditions and decide whether to launch our new product next quarter"
        
        analysis = self.explainer._analyze_task_description(task)
        
        assert "word_count" in analysis
        assert "unique_words" in analysis
        assert "complexity_score" in analysis
        assert "most_common_words" in analysis
        
        # Should identify action words
        assert "key_actions" in analysis
        assert len(analysis["key_actions"]) > 0
    
    def test_reasoning_steps_generation(self):
        """Test reasoning steps generation."""
        decision = "Recommend proceeding with the investment"
        task = "Should I invest in technology stocks?"
        context = {"budget": 10000, "risk_tolerance": "medium"}
        task_analysis = {"key_actions": ["invest"], "complexity_score": 3.2}
        
        steps = self.explainer._generate_reasoning_steps(
            decision, task, context, task_analysis
        )
        
        assert isinstance(steps, list)
        assert len(steps) >= 4  # Should have multiple reasoning steps
        
        # Should mention task, context, and decision
        combined_steps = " ".join(steps).lower()
        assert "task" in combined_steps or "analyzed" in combined_steps
        assert "context" in combined_steps or "parameter" in combined_steps
        assert "decision" in combined_steps or "recommend" in combined_steps
    
    def test_confidence_estimation(self):
        """Test confidence estimation."""
        # High confidence scenario
        detailed_task = "Should I invest in renewable energy stocks?"
        rich_context = {"amount": 10000, "risk": "low", "timeline": "long"}
        detailed_decision = "Recommend investing 60% in renewable energy ETFs"
        
        confidence = self.explainer._estimate_confidence(detailed_task, rich_context, detailed_decision)
        
        assert 0 <= confidence <= 1
        assert confidence > 0.4  # Should have reasonable confidence
        
        # Low confidence scenario
        vague_task = "Help"
        empty_context = {}
        vague_decision = "Do something"
        
        low_confidence = self.explainer._estimate_confidence(vague_task, empty_context, vague_decision)
        
        assert low_confidence < confidence  # Should be lower than detailed scenario
    
    def test_error_handling(self):
        """Test error explanation generation."""
        error_explanation = self.explainer._generate_error_explanation("Test error message")
        
        assert "reasoning_steps" in error_explanation
        assert "feature_importance" in error_explanation
        assert "model_details" in error_explanation
        
        # Should contain error message
        steps_text = " ".join(error_explanation["reasoning_steps"])
        assert "Test error message" in steps_text


class TestIntegration:
    """Integration tests for the complete system."""
    
    def setup_method(self):
        """Setup for each test method."""
        self.agent = IntelligentAgent()
    
    @pytest.mark.asyncio
    async def test_end_to_end_workflow(self):
        """Test complete end-to-end workflow."""
        # Real-world scenario
        task = "Our startup is considering whether to pivot our business model from B2C to B2B"
        context = {
            "current_revenue": 50000,
            "burn_rate": 30000,
            "team_size": 8,
            "b2c_conversion_rate": 0.02,
            "b2b_pilot_interest": 15,
            "runway_months": 8,
            "market_size_b2c": 1000000,
            "market_size_b2b": 500000
        }
        
        result = await self.agent.process_task(task, context)
        
        # Verify complete response structure
        assert result["success"] is True
        assert isinstance(result["decision"], str)
        assert len(result["decision"]) > 50  # Substantial decision
        
        explanation = result["explanation"]
        assert isinstance(explanation["reasoning_steps"], list)
        assert len(explanation["reasoning_steps"]) >= 4
        assert isinstance(explanation["feature_importance"], dict)
        assert len(explanation["feature_importance"]) > 0
        assert "model_details" in explanation
        
        # Verify feature importance analysis
        feature_importance = explanation["feature_importance"]
        for key in context.keys():
            assert key in feature_importance
        
        # Verify reasoning quality
        reasoning_text = " ".join(explanation["reasoning_steps"]).lower()
        assert any(word in reasoning_text for word in ["analyzed", "considered", "evaluated"])
    
    @pytest.mark.asyncio
    async def test_various_decision_types(self):
        """Test system handling of various decision types."""
        decision_scenarios = [
            {
                "type": "comparison",
                "task": "Python vs JavaScript for our web scraping project",
                "context": {"team_python_exp": 8, "team_js_exp": 6, "performance_critical": True}
            },
            {
                "type": "yes_no",
                "task": "Should we hire a senior developer?",
                "context": {"budget": 150000, "project_complexity": "high", "timeline": "tight"}
            },
            {
                "type": "optimization",
                "task": "How to optimize our database performance?",
                "context": {"current_queries_per_sec": 1000, "target_qps": 5000, "budget": 20000}
            },
            {
                "type": "risk_assessment", 
                "task": "Assess the security risks of our cloud migration",
                "context": {"data_sensitivity": "high", "compliance_required": True, "current_security": 7}
            }
        ]
        
        for scenario in decision_scenarios:
            result = await self.agent.process_task(scenario["task"], scenario["context"])
            
            assert result["success"] is True
            assert len(result["decision"]) > 30
            
            # Each decision type should produce relevant reasoning
            decision_lower = result["decision"].lower()
            if scenario["type"] == "comparison":
                assert any(word in decision_lower for word in ["recommend", "vs", "better", "choose"])
            elif scenario["type"] == "yes_no":
                assert any(word in decision_lower for word in ["yes", "no", "recommend"])
            elif scenario["type"] == "optimization":
                assert any(word in decision_lower for word in ["optimize", "improve", "focus"])
            elif scenario["type"] == "risk_assessment":
                assert any(word in decision_lower for word in ["risk", "recommend", "secure"])


# Performance and load testing
class TestPerformance:
    """Performance tests for the system."""
    
    def setup_method(self):
        """Setup for performance tests."""
        self.agent = IntelligentAgent()
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self):
        """Test handling of concurrent requests."""
        tasks = [
            self.agent.process_task(
                f"Decision task {i}",
                {"priority": "medium", "value": i * 10}
            )
            for i in range(5)
        ]
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks)
        
        # All should succeed
        for result in results:
            assert result["success"] is True
            assert "decision" in result
            assert "explanation" in result
    
    @pytest.mark.asyncio
    async def test_large_context_handling(self):
        """Test handling of large context data."""
        large_context = {f"parameter_{i}": f"value_{i}" for i in range(50)}
        large_context.update({
            "budget": 100000,
            "timeline": "6_months",
            "complexity": "high"
        })
        
        result = await self.agent.process_task(
            "Large scale project decision",
            large_context
        )
        
        assert result["success"] is True
        # Should handle large context gracefully
        assert len(result["explanation"]["feature_importance"]) > 0
    
    def test_memory_usage(self):
        """Test memory usage doesn't grow excessively."""
        import gc
        import sys
        
        initial_objects = len(gc.get_objects())
        
        # Process multiple tasks
        for _ in range(10):
            explainer = XAIExplainer()
            context = {"test": "value", "number": 42}
            explainer.generate_explanation("Test decision", "Test task", context)
        
        gc.collect()
        final_objects = len(gc.get_objects())
        
        # Memory growth should be reasonable
        growth = final_objects - initial_objects
        assert growth < 1000  # Arbitrary reasonable limit


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 
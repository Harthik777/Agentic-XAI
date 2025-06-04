import pytest
from datetime import datetime
from backend.app.xai.explainer import XAIExplainer # Adjusted import path

class TestXAIExplainer:

    def test_explainer_initialization(self):
        """Test that the explainer initializes without errors."""
        try:
            explainer = XAIExplainer()
            assert explainer is not None
            assert isinstance(explainer.explanation_cache, dict)
        except Exception as e:
            pytest.fail(f"XAIExplainer initialization failed: {e}")

    def test_explain_decision_structure_and_content(self):
        """Test the structure and content of the explanation."""
        explainer = XAIExplainer()
        decision_id = datetime.now().isoformat()
        decision_data = {
            "decision_id": decision_id,
            "decision": "Test Decision",
            "reasoning_text": "This is the test reasoning. It has multiple sentences! Yes it does.",
            "full_output_text": "Full model output including Test Decision and This is the test reasoning. It has multiple sentences! Yes it does.",
            "context": {"key": "value"},
            "task_description": "A test task"
        }

        explanation = explainer.explain_decision(decision_data)

        assert isinstance(explanation, dict)
        assert "text_property_analysis_shap_placeholder" in explanation
        assert "text_property_analysis_lime_placeholder" in explanation
        assert "natural_language_summary" in explanation

        # Test SHAP placeholder content
        shap_analysis = explanation["text_property_analysis_shap_placeholder"]
        assert shap_analysis["method"] == "Text Property Analysis (SHAP Placeholder)"
        assert shap_analysis["text_length_chars"] == len(decision_data["full_output_text"])
        assert shap_analysis["word_count"] == len(decision_data["full_output_text"].split())

        # Test LIME placeholder content
        lime_analysis = explanation["text_property_analysis_lime_placeholder"]
        assert lime_analysis["method"] == "Text Property Analysis (LIME Placeholder)"
        # Expected sentences: "Full model output including Test Decision and This is the test reasoning. It has multiple sentences! Yes it does." -> 3
        assert lime_analysis["sentence_count"] == 3 # Based on '.', '!', '?'

        # Test Natural Language Summary content
        nl_summary = explanation["natural_language_summary"]
        assert isinstance(nl_summary, str)
        assert decision_data["decision"] in nl_summary
        assert decision_data["reasoning_text"] in nl_summary
        assert "This explanation is based on the direct output from the agent" in nl_summary

        # Test caching
        assert explainer.explanation_cache.get(decision_id) is not None
        assert explainer.explanation_cache[decision_id] == explanation

    def test_generate_natural_language_explanation_handles_missing_data(self):
        explainer = XAIExplainer()
        decision_data_empty = {"decision_id": "empty_id"}
        nl_summary_empty = explainer._generate_natural_language_explanation(decision_data_empty)
        assert "N/A" in nl_summary_empty # Check for default values

        decision_data_partial = {"decision_id": "partial_id", "decision": "Only Decision"}
        nl_summary_partial = explainer._generate_natural_language_explanation(decision_data_partial)
        assert "Only Decision" in nl_summary_partial
        assert "reasoning: 'N/A'" in nl_summary_partial


    def test_explanation_caching_retrieval(self):
        """Test that explanations are cached and can be retrieved."""
        explainer = XAIExplainer()
        decision_id = "cache_test_id_123"
        decision_data = {
            "decision_id": decision_id,
            "decision": "Cache Test Decision",
            "reasoning_text": "Cache Test Reasoning.",
            "full_output_text": "Cache Test Full Output. Reasoning.",
        }

        explanation1 = explainer.explain_decision(decision_data)

        # Retrieve from cache using get_explanation
        cached_explanation_bundle_default = explainer.get_explanation(decision_id) # format="both" (default)
        cached_explanation_text = explainer.get_explanation(decision_id, format="text")
        cached_explanation_viz = explainer.get_explanation(decision_id, format="visualization")

        assert cached_explanation_bundle_default == explanation1
        assert cached_explanation_text["explanation"] == explanation1["natural_language_summary"]
        assert cached_explanation_viz["shap_analysis"] == explanation1["text_property_analysis_shap_placeholder"]
        assert cached_explanation_viz["lime_analysis"] == explanation1["text_property_analysis_lime_placeholder"]

        # Test get_explanation for non-existent ID
        non_existent_explanation = explainer.get_explanation("non_existent_id", format="text")
        assert "No natural language summary available" in non_existent_explanation["explanation"]

    def test_lime_placeholder_sentence_counting(self):
        explainer = XAIExplainer()
        assert explainer._generate_lime_explanation("Hello world.")["sentence_count"] == 1
        assert explainer._generate_lime_explanation("Hello world! How are you?")["sentence_count"] == 2
        assert explainer._generate_lime_explanation("No punctuation here")["sentence_count"] == 1
        assert explainer._generate_lime_explanation("")["sentence_count"] == 0
        assert explainer._generate_lime_explanation("...")["sentence_count"] == 3

    def test_shap_placeholder_word_counting(self):
        explainer = XAIExplainer()
        assert explainer._generate_shap_explanation("Hello world")["word_count"] == 2
        assert explainer._generate_shap_explanation("")["word_count"] == 0
        assert explainer._generate_shap_explanation(" OneWord ")["word_count"] == 1
        assert explainer._generate_shap_explanation("  Two  Words  ")["word_count"] == 2

    def test_explain_decision_handles_non_string_text_inputs(self):
        """ Test that analysis methods handle non-string text robustly """
        explainer = XAIExplainer()
        decision_id = datetime.now().isoformat()
        decision_data = {
            "decision_id": decision_id,
            "decision": "Test Decision",
            "reasoning_text": "Test Reasoning",
            "full_output_text": 12345, # Non-string input
        }
        explanation = explainer.explain_decision(decision_data)
        shap_analysis = explanation["text_property_analysis_shap_placeholder"]
        assert shap_analysis["text_length_chars"] == 5 # len(str(12345))
        assert shap_analysis["word_count"] == 1       # len(str(12345).split())

        lime_analysis = explanation["text_property_analysis_lime_placeholder"]
        assert lime_analysis["sentence_count"] == 1 # str(12345) has no standard terminators

    def test_decision_id_caching_optional(self):
        """Test that if decision_id is None, it doesn't break caching but also doesn't cache."""
        explainer = XAIExplainer()
        decision_data_no_id = {
            "decision_id": None, # No decision_id
            "decision": "No ID Decision",
            "reasoning_text": "No ID Reasoning.",
            "full_output_text": "No ID Full Output.",
        }
        explanation = explainer.explain_decision(decision_data_no_id)
        assert explanation is not None # Should still process
        assert len(explainer.explanation_cache) == 0 # Should not have cached

        # A subsequent call with an ID should cache
        decision_id = "id_present_test"
        decision_data_with_id = {
            "decision_id": decision_id,
            "decision": "ID Decision",
            "reasoning_text": "ID Reasoning.",
            "full_output_text": "ID Full Output.",
        }
        explainer.explain_decision(decision_data_with_id)
        assert len(explainer.explanation_cache) == 1
        assert explainer.explanation_cache.get(decision_id) is not None

# To run these tests:
# Ensure backend/app/tests/__init__.py exists
# From the root directory of the project:
# python -m pytest backend/app/tests/test_explainer.py
# or if in backend dir:
# python -m pytest app/tests/test_explainer.py
# (might need to adjust PYTHONPATH if imports fail, e.g., export PYTHONPATH="${PYTHONPATH}:./backend")
# For this specific environment, the tool usually handles pathing.
# If running locally and `backend.app` not found, try running from one level up or setting PYTHONPATH.
# Usually, `python -m pytest .` from `backend` dir works if structure is `backend/app` and `backend/tests`
# Or `python -m pytest backend/app/tests` from project root.
# The provided path `backend.app.xai.explainer` implies the test runner should be started from project root
# or a path that has `backend` in its sys.path.
# The test runner in this tool environment should be able to find `backend.app...`
# if the current working directory is the root of the repository.
# The `create_file_with_block` paths are relative to repo root.
# Assuming test execution context is repo root.
# If `backend.app.xai.explainer` fails, it could be `app.xai.explainer` if test runner is in `backend` dir.
# Let's assume `backend.app.xai.explainer` is correct for a runner at repo root.
# The path in `backend/app/models/agent.py` for `XAIExplainer` is `from ..xai.explainer import XAIExplainer`
# This means if `test_agent.py` imports `Agent`, the pathing should resolve.
# For `test_explainer.py` itself, direct import `from backend.app.xai.explainer import XAIExplainer`
# assumes `backend` is a top-level package visible in PYTHONPATH.
# This is common if tests are run from the project root.
# I've adjusted the import to `from backend.app.xai.explainer import XAIExplainer` assuming standard project layout
# and test execution from the project root.
# If `unittest.mock` is preferred over `pytest-mock` (which comes with pytest), it's fine.
# `unittest.mock` is part of Python's standard library.
# The `requirements-dev.txt` includes `unittest.mock`, which is actually not needed as it's built-in.
# I will remove `unittest.mock` from `requirements-dev.txt` in the next step when creating `test_agent.py` or at the end.
# For now, keeping the test file as is.
# Added a test for non-string input to analysis functions.
# Added a test for optional decision_id for caching.
# Added more specific tests for sentence and word counting.
# Added a test for initialization.
# Adjusted lime placeholder sentence count expectation.
# Corrected the import path in the test file based on typical project structure.
# `backend.app.xai.explainer` should work if tests are run from the root of the repo.
# `from ..xai.explainer import XAIExplainer` is for relative imports within the `app` package.
# Test files are usually outside the main package or in a sub-package of it, but run with PYTHONPATH set to find the main package.
# `from backend.app.xai.explainer import XAIExplainer` is the most robust for `pytest backend/app/tests`.Okay, `backend/app/tests/test_explainer.py` has been created with a good set of initial tests.

A note on `unittest.mock` in `requirements-dev.txt`: It's part of Python's standard library, so it's not needed there. I'll remove it when I update/create the `requirements-dev.txt` again or as a final cleanup step.

Now, I'll proceed to create `backend/app/tests/test_agent.py`. This will involve mocking the Replicate client and testing the task processing logic, including parsing and integration with the (mocked or actual) explainer.

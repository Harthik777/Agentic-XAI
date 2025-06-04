import pytest
import os
from unittest.mock import patch, AsyncMock # AsyncMock for async methods

# Set a dummy Replicate API token for tests BEFORE importing the agent
# This is to prevent the warning/error print during Agent initialization if token is checked.
os.environ["REPLICATE_API_TOKEN"] = "test_token_not_used_due_to_mocking"

from backend.app.models.agent import Agent
from backend.app.xai.explainer import XAIExplainer # To potentially mock its methods or check its state

# Helper for mock replicate output
def mock_replicate_output_iterator(output_string):
    class MockIterator:
        def __init__(self, text):
            self.text_parts = list(text) # Simulate char by char or word by word iteration
            self.index = 0

        def __iter__(self):
            return self

        def __next__(self):
            if self.index < len(self.text_parts):
                part = self.text_parts[self.index]
                self.index += 1
                return part
            else:
                raise StopIteration
    return MockIterator(output_string)


@pytest.mark.asyncio
class TestAgent:

    @pytest.fixture(autouse=True)
    def manage_env_vars(self, monkeypatch):
        """Ensure REPLICATE_API_TOKEN is set for tests and restore afterwards."""
        original_token = os.environ.get("REPLICATE_API_TOKEN")
        monkeypatch.setenv("REPLICATE_API_TOKEN", "test_token_for_agent_tests")
        yield
        if original_token is None:
            monkeypatch.delenv("REPLICATE_API_TOKEN", raising=False)
        else:
            monkeypatch.setenv("REPLICATE_API_TOKEN", original_token)


    def test_agent_initialization_success(self, monkeypatch):
        """Test Agent initializes, Replicate client and XAIExplainer are set up."""
        # Mock XAIExplainer's __init__ to prevent it from loading actual models if any
        # For the current lightweight XAIExplainer, this might not be strictly necessary,
        # but good practice if it were heavy.
        monkeypatch.setattr(XAIExplainer, '__init__', lambda self: setattr(self, 'explanation_cache', {}))

        agent = Agent()
        assert agent.replicate_client is not None, "Replicate client should be initialized"
        assert agent.explainer is not None, "XAIExplainer should be initialized"
        assert isinstance(agent.explainer.explanation_cache, dict)
        # If REPLICATE_API_TOKEN was missing, replicate_client might be None,
        # current Agent init logic allows this and prints a warning.
        # The fixture manage_env_vars should ensure token is present.

    def test_agent_initialization_no_token(self, monkeypatch):
        """Test Agent initialization when REPLICATE_API_TOKEN is missing."""
        monkeypatch.delenv("REPLICATE_API_TOKEN", raising=False)
        # XAIExplainer might print warnings if it had dependencies, mock if needed
        monkeypatch.setattr(XAIExplainer, '__init__', lambda self: setattr(self, 'explanation_cache', {}))

        # Capture print output to check for warnings
        with patch('builtins.print') as mock_print:
            agent = Agent()
            assert agent.replicate_client is None # Expect client to be None
            # Check if the specific warning for missing token was printed
            # This depends on the exact warning message in Agent.__init__
            missing_token_warning_found = False
            for call_args in mock_print.call_args_list:
                if "REPLICATE_API_TOKEN environment variable not found" in str(call_args):
                    missing_token_warning_found = True
                    break
            assert missing_token_warning_found, "Warning for missing REPLICATE_API_TOKEN not printed"


    @patch('replicate.Client.run', new_callable=AsyncMock) # Mock the replicate.Client.run
    async def test_process_task_successful_parsing(self, mock_replicate_run, monkeypatch):
        # Mock XAIExplainer methods to simplify agent testing and avoid their own logic
        monkeypatch.setattr(XAIExplainer, 'explain_decision', lambda self, data: {"info": "XAI Mocked for this test"})

        agent = Agent()
        mock_model_output = "Some preamble. Decision: Test Decision Alpha. Reasoning: This is the detailed test reasoning."
        mock_replicate_run.return_value = mock_replicate_output_iterator(mock_model_output)

        task_desc = "Test task description"
        context = {"user_id": 123, "data": "sample"}
        result = await agent.process_task(task_desc, context)

        assert result["decision"] == "Test Decision Alpha"

        reasoning_steps = result["explanation"]["reasoning_steps"]
        assert any("Parsing of model output: Successful." in step for step in reasoning_steps)
        assert any("Parsed Decision: Test Decision Alpha" in step for step in reasoning_steps)
        assert any("Parsed Reasoning: This is the detailed test reasoning." in step for step in reasoning_steps)
        assert "XAI Mocked for this test" == result["explanation"]["feature_importance"]
        mock_replicate_run.assert_called_once()


    @patch('replicate.Client.run', new_callable=AsyncMock)
    async def test_process_task_parsing_failure(self, mock_replicate_run, monkeypatch):
        monkeypatch.setattr(XAIExplainer, 'explain_decision', lambda self, data: {"info": "XAI Mocked"})

        agent = Agent()
        mock_model_output = "This output does not contain the specified keywords for decision or reasoning."
        mock_replicate_run.return_value = mock_replicate_output_iterator(mock_model_output)

        result = await agent.process_task("Another test task", {})

        assert result["decision"] == "Could not parse decision from model output."
        reasoning_steps = result["explanation"]["reasoning_steps"]
        assert any("Parsing of model output: Failed or keywords not found." in step for step in reasoning_steps)
        assert any(f"Full Model Output (used as reasoning): {mock_model_output}" in step for step in reasoning_steps)
        mock_replicate_run.assert_called_once()

    @patch('replicate.Client.run', new_callable=AsyncMock)
    async def test_process_task_replicate_api_error(self, mock_replicate_run, monkeypatch):
        monkeypatch.setattr(XAIExplainer, 'explain_decision', lambda self, data: {"info": "XAI Mocked"})

        agent = Agent()
        # Simulate a Replicate API error
        from replicate.exceptions import ReplicateError
        mock_replicate_run.side_effect = ReplicateError("Simulated Replicate API error")

        result = await agent.process_task("Task causing API error", {})

        assert result["decision"] == "Error during Replicate API call"
        assert "Replicate API Error: Simulated Replicate API error" in result["explanation"]["reasoning_steps"][0]
        mock_replicate_run.assert_called_once()

    async def test_process_task_replicate_client_not_initialized(self, monkeypatch):
        """Test behavior when replicate_client is None (e.g., token missing)."""
        monkeypatch.setattr(XAIExplainer, 'explain_decision', lambda self, data: {"info": "XAI Mocked"})

        # Temporarily remove token to ensure replicate_client is None
        monkeypatch.delenv("REPLICATE_API_TOKEN", raising=False)
        with patch('builtins.print'): # Suppress warning prints during this specific test
            agent = Agent()

        assert agent.replicate_client is None # Verify pre-condition for the test

        result = await agent.process_task("Test task with no client", {})

        assert result["decision"] == "Error"
        assert "Replicate client not initialized." in result["explanation"]["reasoning_steps"][0]
        # Depending on how specific the error message is, you might check more parts of it.
        assert "REPLICATE_API_TOKEN is not set." in result["explanation"]["reasoning_steps"][0]


    @patch('replicate.Client.run', new_callable=AsyncMock)
    async def test_process_task_xai_explainer_unavailable(self, mock_replicate_run, monkeypatch):
        mock_model_output = "Decision: XAI Test. Reasoning: XAI is off."
        mock_replicate_run.return_value = mock_replicate_output_iterator(mock_model_output)

        # Mock XAIExplainer.__init__ to simulate its failure
        monkeypatch.setattr(XAIExplainer, "__init__", Mock(side_effect=Exception("Simulated XAI init error")))

        with patch('builtins.print') as mock_print: # To catch the warning from Agent.__init__
            agent = Agent()

        assert agent.explainer is None # XAIExplainer should be None due to mocked init failure

        # Check that the warning for XAI init failure was printed
        xai_init_fail_warning_found = False
        for call_args in mock_print.call_args_list:
            if "Warning: XAIExplainer initialization failed: Simulated XAI init error" in str(call_args):
                xai_init_fail_warning_found = True
                break
        assert xai_init_fail_warning_found, "Warning for XAIExplainer init failure not printed"

        result = await agent.process_task("Test task", {})

        assert result["decision"] == "XAI Test" # Parsing should still work
        assert result["explanation"]["feature_importance"] == {"info": "XAI explanations unavailable."}
        assert any("XAIExplainer not available. Skipping explanation generation." in step for step in result["explanation"]["reasoning_steps"])
        mock_replicate_run.assert_called_once()

    @patch('replicate.Client.run', new_callable=AsyncMock)
    @patch.object(XAIExplainer, 'explain_decision', side_effect=Exception("Simulated XAI processing error"))
    async def test_process_task_xai_processing_error(self, mock_xai_explain_decision, mock_replicate_run, monkeypatch):
        # This test ensures XAIExplainer itself is initialized, but its explain_decision method fails
        agent = Agent() # Assumes XAIExplainer initializes successfully here
        assert agent.explainer is not None

        mock_model_output = "Decision: XAI Error Test. Reasoning: XAI will fail to explain."
        mock_replicate_run.return_value = mock_replicate_output_iterator(mock_model_output)

        result = await agent.process_task("Test task for XAI failure", {})

        assert result["decision"] == "XAI Error Test"
        assert result["explanation"]["feature_importance"] == {"info": "XAI explanation generation failed: Simulated XAI processing error"}
        assert any("XAI Explanation generation failed: Simulated XAI processing error" in step for step in result["explanation"]["reasoning_steps"])

        mock_replicate_run.assert_called_once()
        mock_xai_explain_decision.assert_called_once()

# To run these tests (ensure pytest and pytest-asyncio are installed):
# From the root directory of the project:
# python -m pytest backend/app/tests/test_agent.py
# Note: The import `from backend.app.models.agent import Agent` assumes that the tests
# are run from a context where 'backend' is a discoverable top-level package.
# This is typically the project root.
# The `unittest.mock.Mock` is used here, ensure it's available (standard library).
# If `pytest-mock` is used, `mocker` fixture could be used instead of `patch`.
# The `Mock` import from unittest.mock.
from unittest.mock import Mock # Add this if not already at the top for the XAIExplainer.__init__ mock
# The previous test file (`test_explainer.py`) was created with the assumption that the test runner
# would be invoked from the project root, making `backend.app.xai.explainer` a valid import.
# The same assumption is made here for `backend.app.models.agent`.
# The `autouse=True` fixture for `manage_env_vars` ensures it runs for every test in the class.
# Added a test for XAI processing error.
# Added a helper for mock replicate output iteration to be more realistic.
# Added check for print statements for warnings.The `backend/app/tests/test_agent.py` file has been created with a comprehensive set of tests.
These tests cover:
-   Agent initialization (with and without API token).
-   Successful parsing of model output.
-   Failure to parse model output.
-   Handling of Replicate API errors.
-   Behavior when the Replicate client is not initialized.
-   Behavior when `XAIExplainer` fails to initialize.
-   Behavior when `XAIExplainer` is initialized but fails during its `explain_decision` call.

Mocking is used extensively for `replicate.Client.run` and for `XAIExplainer` methods/init to isolate the agent's logic.
The use of `pytest.mark.asyncio` and `AsyncMock` correctly handles the asynchronous nature of `process_task`.
Environment variable handling for `REPLICATE_API_TOKEN` is also included using `pytest`'s `monkeypatch` fixture.

Final step is to update `backend/requirements-dev.txt` to remove the unnecessary `unittest.mock`.

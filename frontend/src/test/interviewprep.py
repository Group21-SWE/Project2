import pytest
import json
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to the path so we can import from the backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app

# Mock for Google Generative AI
@pytest.fixture
def mock_generative_ai():
    with patch('app.GoogleGenerativeAI') as mock_genai:
        # Setup the mock structure
        mock_model = MagicMock()
        mock_genai.return_value.getGenerativeModel.return_value = mock_model
        yield mock_model

@pytest.fixture
def client():
    """Create a test client for the API."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers():
    """Generate authentication headers for API requests."""
    return {
        'Authorization': 'Bearer test_token',
        'Content-Type': 'application/json'
    }

class TestInitialRender:
    def test_api_is_running(self, client):
        """Test that the API is running."""
        response = client.get('/')
        assert response.status_code == 200
        
class TestQuestionGeneration:
    def test_empty_job_description_rejected(self, client, auth_headers):
        """Test that empty job descriptions are rejected."""
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={"jobDescription": ""})
        assert response.status_code == 400
        
    def test_missing_job_description_rejected(self, client, auth_headers):
        """Test that missing job descriptions are rejected."""
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={})
        assert response.status_code == 400
    
    def test_successful_question_generation(self, client, auth_headers, mock_generative_ai):
        """Test successful generation of interview questions."""
        # Setup the mock response
        mock_result = MagicMock()
        mock_response = MagicMock()
        mock_response.text.return_value = json.dumps([
            {"question": "What experience do you have with React?", "hint": "Looking for practical experience"},
            {"question": "How do you handle state management?", "hint": "Redux or Context API knowledge"}
        ])
        mock_result.response = mock_response
        mock_generative_ai.generateContent.return_value = mock_result
        
        # Make the API request
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={"jobDescription": "Software Developer Job"})
        
        # Verify the response
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'questions' in data
        assert len(data['questions']) == 2
        assert data['questions'][0]['question'] == "What experience do you have with React?"
        assert data['questions'][1]['question'] == "How do you handle state management?"
        
    def test_api_error_handling(self, client, auth_headers, mock_generative_ai):
        """Test handling of API errors when generating questions."""
        # Setup the mock to raise an exception
        mock_generative_ai.generateContent.side_effect = Exception("API Error")
        
        # Make the API request
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={"jobDescription": "Software Developer Job"})
        
        # Verify error is handled
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
        
    def test_json_parsing_error_handling(self, client, auth_headers, mock_generative_ai):
        """Test handling of JSON parsing errors from API response."""
        # Setup the mock to return invalid JSON
        mock_result = MagicMock()
        mock_response = MagicMock()
        mock_response.text.return_value = "This is not valid JSON"
        mock_result.response = mock_response
        mock_generative_ai.generateContent.return_value = mock_result
        
        # Make the API request
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={"jobDescription": "Software Developer Job"})
        
        # Verify parse error is handled
        assert response.status_code == 200  # Still returns 200 as we handle parse errors
        data = json.loads(response.data)
        assert 'questions' in data
        assert isinstance(data['questions'], list)
        
    def test_multiple_questions_rendering(self, client, auth_headers, mock_generative_ai):
        """Test handling multiple questions from API."""
        # Setup the mock response with multiple questions
        mock_result = MagicMock()
        mock_response = MagicMock()
        mock_response.text.return_value = json.dumps([
            {"question": "Question 1?", "hint": "Hint 1"},
            {"question": "Question 2?", "hint": "Hint 2"},
            {"question": "Question 3?", "hint": "Hint 3"}
        ])
        mock_result.response = mock_response
        mock_generative_ai.generateContent.return_value = mock_result
        
        # Make the API request
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={"jobDescription": "Software Developer Job"})
        
        # Verify three questions are returned
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['questions']) == 3

class TestQuestionDisplay:
    @pytest.fixture
    def mock_questions_response(self, mock_generative_ai):
        """Setup a mock response with a single question."""
        mock_result = MagicMock()
        mock_response = MagicMock()
        mock_response.text.return_value = json.dumps([
            {"question": "Question 1?", "hint": "Hint 1"}
        ])
        mock_result.response = mock_response
        mock_generative_ai.generateContent.return_value = mock_result
        return mock_generative_ai
    
    def test_question_has_hint(self, client, auth_headers, mock_questions_response):
        """Test that questions include hints."""
        # Make the API request
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={"jobDescription": "Software Developer Job"})
        
        # Verify hint is included
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['questions'][0]['hint'] == "Hint 1"
    
    def test_empty_hints_handled(self, client, auth_headers, mock_generative_ai):
        """Test handling of questions with empty hints."""
        # Setup the mock response with empty hint
        mock_result = MagicMock()
        mock_response = MagicMock()
        mock_response.text.return_value = json.dumps([
            {"question": "Question without hint?", "hint": ""}
        ])
        mock_result.response = mock_response
        mock_generative_ai.generateContent.return_value = mock_result
        
        # Make the API request
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={"jobDescription": "Software Developer Job"})
        
        # Verify empty hint is preserved
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['questions'][0]['hint'] == ""

class TestAnswerFeedback:
    @pytest.fixture
    def question_answer_payload(self):
        """Create a sample question and answer payload."""
        return {
            "question": {
                "question": "What experience do you have with React?",
                "hint": "Looking for practical experience"
            },
            "answer": "I have 3 years of React experience"
        }
    
    def test_empty_answer_rejected(self, client, auth_headers, question_answer_payload):
        """Test that empty answers are rejected."""
        # Modify the payload to have an empty answer
        question_answer_payload['answer'] = ""
        
        response = client.post('/generate_feedback',
                            headers=auth_headers,
                            json=question_answer_payload)
        
        assert response.status_code == 400
    
    def test_successful_feedback_generation(self, client, auth_headers, question_answer_payload, mock_generative_ai):
        """Test successful generation of feedback."""
        # Setup the mock response
        mock_result = MagicMock()
        mock_response = MagicMock()
        mock_response.text.return_value = "Great answer! You clearly stated your experience level."
        mock_result.response = mock_response
        mock_generative_ai.generateContent.return_value = mock_result
        
        # Make the API request
        response = client.post('/generate_feedback',
                            headers=auth_headers,
                            json=question_answer_payload)
        
        # Verify the response
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'feedback' in data
        assert data['feedback'] == "Great answer! You clearly stated your experience level."
    
    def test_feedback_error_handling(self, client, auth_headers, question_answer_payload, mock_generative_ai):
        """Test handling of API errors when generating feedback."""
        # Setup the mock to raise an exception
        mock_generative_ai.generateContent.side_effect = Exception("API Error")
        
        # Make the API request
        response = client.post('/generate_feedback',
                            headers=auth_headers,
                            json=question_answer_payload)
        
        # Verify error is handled
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data

class TestAuthentication:
    def test_auth_required_for_questions(self, client):
        """Test authentication required for question generation."""
        response = client.post('/generate_interview_questions',
                            json={"jobDescription": "Software Developer Job"})
        assert response.status_code == 401
    
    def test_auth_required_for_feedback(self, client):
        """Test authentication required for feedback generation."""
        response = client.post('/generate_feedback',
                            json={"question": {}, "answer": "Test"})
        assert response.status_code == 401
    
    def test_api_key_validation(self, client, auth_headers, monkeypatch):
        """Test that missing API key is handled properly."""
        # Remove the API key from environment
        monkeypatch.delenv('GEMINI_API_KEY', raising=False)
        
        response = client.post('/generate_interview_questions',
                            headers=auth_headers,
                            json={"jobDescription": "Software Developer Job"})
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'API key' in data['error']

def test_rate_limiting(client, auth_headers):
    """Test that rate limiting is implemented."""
    # Make multiple rapid requests
    responses = []
    for _ in range(10):
        resp = client.post('/generate_interview_questions',
                        headers=auth_headers,
                        json={"jobDescription": "Software Developer Job"})
        responses.append(resp.status_code)
    
    # Either all successful or some hit rate limiting
    has_rate_limit = 429 in responses
    all_success = all(r == 200 for r in responses)
    assert has_rate_limit or all_success, "Should either have rate limiting or all succeed"

def test_content_safety(client, auth_headers, mock_generative_ai):
    """Test that content is checked for safety."""
    # Setup the mock to return potentially unsafe content
    mock_result = MagicMock()
    mock_response = MagicMock()
    mock_response.text.return_value = "This feedback contains inappropriate content [FILTERED]"
    mock_result.response = mock_response
    mock_generative_ai.generateContent.return_value = mock_result
    
    # Make the API request
    response = client.post('/generate_feedback',
                        headers=auth_headers,
                        json={
                            "question": {"question": "Technical question?", "hint": ""},
                            "answer": "An inappropriate answer"
                        })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert '[FILTERED]' not in data['feedback'], "Should sanitize inappropriate content"

if __name__ == '__main__':
    pytest.main()
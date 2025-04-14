import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InterviewPrepPage from '../interviewprep/InterviewPrepPage';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the GoogleGenerativeAI module
jest.mock('@google/generative-ai');

// Mock environment variables
process.env.REACT_APP_GEMINI_API_KEY = 'mock-api-key';

describe('InterviewPrepPage Component', () => {
  // Set up and reset mocks before each test
  let mockGenerateContent;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a fresh mock for generateContent
    mockGenerateContent = jest.fn();
    
    // Setup the mock chain for GoogleGenerativeAI
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => ({
        generateContent: mockGenerateContent
      }))
    }));
  });
  
  // Helper function to render the component and fill the job description
  const setupComponent = (jobDescription = '') => {
    const result = render(<InterviewPrepPage />);
    if (jobDescription) {
      const input = screen.getByPlaceholderText('Paste job description here...');
      fireEvent.change(input, { target: { value: jobDescription } });
    }
    return result;
  };
  
  // Helper to mock API response with questions
  const mockQuestions = (questions) => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(questions)
      }
    });
  };
  
  // Helper to generate questions and wait for them to appear
  const generateQuestionsAndWait = async (question = "What experience do you have with React?") => {
    const generateButton = screen.getByText('Generate Interview Questions');
    fireEvent.click(generateButton);
    await waitFor(() => {
      expect(screen.getByText(question)).toBeInTheDocument();
    });
  };
  
  describe('Initial Rendering', () => {
    test('job description input changes state correctly', () => {
      setupComponent();
      const input = screen.getByPlaceholderText('Paste job description here...');
      fireEvent.change(input, { target: { value: 'Software Developer Job' } });
      expect(input.value).toBe('Software Developer Job');
    });
    
    test('no interview questions are displayed initially', () => {
      setupComponent();
      expect(screen.queryByText('Interview Questions')).not.toBeInTheDocument();
    });
  });
  
  describe('Question Generation', () => {
    test('shows error when trying to generate questions with empty job description', () => {
      setupComponent();
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      expect(screen.getByText('Please enter a job description first.')).toBeInTheDocument();
      
      // API should not be called with empty job description
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });
    
    test('shows loading state when generating questions', () => {
      setupComponent('Software Developer Job');
      // Make the API call hang indefinitely
      mockGenerateContent.mockReturnValue(new Promise(() => {}));
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      expect(screen.getByText('Generating...')).toBeInTheDocument();
      expect(mockGenerateContent).toHaveBeenCalled();
    });
    
    test('successfully generates and displays interview questions', async () => {
      setupComponent('Software Developer Job');
      
      mockQuestions([
        { question: "What experience do you have with React?", hint: "Looking for practical experience" },
        { question: "How do you handle state management?", hint: "Redux or Context API knowledge" }
      ]);
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('What experience do you have with React?')).toBeInTheDocument();
        expect(screen.getByText('How do you handle state management?')).toBeInTheDocument();
      });
      
      expect(mockGenerateContent).toHaveBeenCalled();
    });
    
    test('handles API errors when generating questions', async () => {
      setupComponent('Software Developer Job');
      mockGenerateContent.mockRejectedValue(new Error('API Error'));
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to generate interview questions. Please try again.')).toBeInTheDocument();
      });
      
      expect(mockGenerateContent).toHaveBeenCalled();
    });
    
    test('handles JSON parsing errors from API response', async () => {
      setupComponent('Software Developer Job');
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => "This is not valid JSON"
        }
      });
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      // Wait for the component to process the invalid JSON
      await waitFor(() => {
        expect(mockGenerateContent).toHaveBeenCalled();
      });
      
      // Should not show Questions header if parsing failed
      expect(screen.queryByText('Questions')).not.toBeInTheDocument();
    });
    
    test('renders multiple questions correctly', async () => {
      setupComponent('Software Developer Job');
      
      mockQuestions([
        { question: "Question 1?", hint: "Hint 1" },
        { question: "Question 2?", hint: "Hint 2" },
        { question: "Question 3?", hint: "Hint 3" }
      ]);
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1?')).toBeInTheDocument();
        expect(screen.getByText('Question 2?')).toBeInTheDocument();
        expect(screen.getByText('Question 3?')).toBeInTheDocument();
      });
    });
    
    test('resets previous questions when generating new ones', async () => {
      // First set of questions
      setupComponent('Job 1');
      mockQuestions([{ question: "First job question?", hint: "Hint" }]);
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('First job question?')).toBeInTheDocument();
      });
      
      // Change job and generate new questions
      const input = screen.getByPlaceholderText('Paste job description here...');
      fireEvent.change(input, { target: { value: 'Job 2' } });
      
      // Reset mock to return new questions
      mockQuestions([{ question: "Second job question?", hint: "Hint" }]);
      
      // Click generate again
      fireEvent.click(screen.getByText('Generate Interview Questions'));
      
      await waitFor(() => {
        expect(screen.queryByText('First job question?')).not.toBeInTheDocument();
        expect(screen.getByText('Second job question?')).toBeInTheDocument();
      });
    });
  });
  
  describe('Question Display', () => {
    test('renders hints correctly for each question', async () => {
      setupComponent('Software Developer Job');
      mockQuestions([{ question: "Question 1?", hint: "Hint 1" }]);
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1?')).toBeInTheDocument();
        expect(screen.getByText('Hint:')).toBeInTheDocument();
        expect(screen.getByText('Hint 1')).toBeInTheDocument();
      });
    });
    
    test('handles questions with empty hints', async () => {
      setupComponent('Software Developer Job');
      mockQuestions([{ question: "Question without hint?", hint: "" }]);
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question without hint?')).toBeInTheDocument();
      });
    });
  });
  
  describe('Answer and Feedback', () => {
    // Helper to setup questions and provide an answer
    const setupQuestionAndAnswer = async (answer = 'I have 3 years of React experience') => {
      setupComponent('Software Developer Job');
      mockQuestions([{ question: "What experience do you have with React?", hint: "Looking for practical experience" }]);
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('What experience do you have with React?')).toBeInTheDocument();
      });
      
      const answerInput = screen.getByPlaceholderText('Type your answer here...');
      fireEvent.change(answerInput, { target: { value: answer } });
      
      return answerInput;
    };
    
    test('answer input changes state correctly', async () => {
      const answerInput = await setupQuestionAndAnswer();
      expect(answerInput.value).toBe('I have 3 years of React experience');
    });
    
    test('feedback button is disabled when answer is empty', async () => {
      setupComponent('Software Developer Job');
      mockQuestions([{ question: "What experience do you have with React?", hint: "Looking for practical experience" }]);
      
      const generateButton = screen.getByText('Generate Interview Questions');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('What experience do you have with React?')).toBeInTheDocument();
      });
      
      const feedbackButton = screen.getByText('Get Feedback');
      expect(feedbackButton).toBeDisabled();
    });
    
    test('feedback button becomes enabled when answer is entered', async () => {
      await setupQuestionAndAnswer();
      const feedbackButton = screen.getByText('Get Feedback');
      expect(feedbackButton).not.toBeDisabled();
    });
    
    test('shows loading state when getting feedback', async () => {
      await setupQuestionAndAnswer();
      
      // Reset the mock for the feedback API call and make it hang
      mockGenerateContent.mockReset();
      mockGenerateContent.mockReturnValue(new Promise(() => {}));
      
      const feedbackButton = screen.getByText('Get Feedback');
      fireEvent.click(feedbackButton);
      
      expect(screen.getByText('Getting feedback...')).toBeInTheDocument();
    });
    
    test('successfully generates and displays feedback', async () => {
      await setupQuestionAndAnswer();
      
      // Reset mock for the feedback call
      mockGenerateContent.mockReset();
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => "Great answer! You clearly stated your experience level."
        }
      });
      
      const feedbackButton = screen.getByText('Get Feedback');
      fireEvent.click(feedbackButton);
      
      await waitFor(() => {
        expect(screen.getByText('Great answer! You clearly stated your experience level.')).toBeInTheDocument();
      });
    });
    
    test('handles API errors when getting feedback', async () => {
      await setupQuestionAndAnswer();
      
      // Reset mock for the feedback call
      mockGenerateContent.mockReset();
      mockGenerateContent.mockRejectedValue(new Error('APIError'));
      
      const feedbackButton = screen.getByText('Get Feedback');
      fireEvent.click(feedbackButton);
      
      await waitFor(() => {
        expect(screen.getByText('Error generating feedback. Please try again.')).toBeInTheDocument();
      });
    });
    
    test('feedback is displayed with correct structure', async () => {
      await setupQuestionAndAnswer();
      
      // Reset mock for the feedback call
      mockGenerateContent.mockReset();
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => "This is feedback"
        }
      });
      
      const feedbackButton = screen.getByText('Get Feedback');
      fireEvent.click(feedbackButton);
      
      await waitFor(() => {
        expect(screen.getByText('Feedback:')).toBeInTheDocument();
        expect(screen.getByText('This is feedback')).toBeInTheDocument();
      });
    });
  });
  
  test('API key is passed correctly to GoogleGenerativeAI', async () => {
    setupComponent('Software Developer Job');
    
    // Setup a successful response
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify([{ question: "Test question?", hint: "Test hint" }])
      }
    });
    
    const generateButton = screen.getByText('Generate Interview Questions');
    fireEvent.click(generateButton);
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(screen.getByText('Test question?')).toBeInTheDocument();
    });
    
    // Verify the API key was passed
    expect(GoogleGenerativeAI).toHaveBeenCalledWith('mock-api-key');
  });
});
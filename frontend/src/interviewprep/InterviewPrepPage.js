import React, { Component } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import $ from 'jquery';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default class InterviewPrepPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
        jobDescription: '',
        interviewQuestions: [],
        answers: {}, // Store answers by question index
        feedback: {}, // Store feedback by question index
        loadingFeedback: {}, // Track loading state for each question
        loading: false,
        error: null
      };
  }

  handleInputChange = (event) => {
    this.setState({ jobDescription: event.target.value });
  }

  handleAnswerChange = (index, value) => {
    this.setState(prevState => ({
      answers: {
        ...prevState.answers,
        [index]: value
      }
    }));
  }

  generateInterviewPrep = async () => {
    // Don't run if the job description is empty
    if (!this.state.jobDescription.trim()) {
      this.setState({ error: 'Please enter a job description first.' });
      return;
    }

    this.setState({ loading: true, error: null });

    try {
      // Initialize the Gemini API
      // You'll need to get an API key from https://makersuite.google.com/app/apikey
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // Store this securely or use environment variables
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Create prompt for interview questions
      const prompt = `
        Based on the following job description, generate 5 potential interview questions 
        along with brief hints about what the interviewer might be looking for in an answer.
        Format the output as JSON with each question having a "question" field and a "hint" field.
        
        Job Description:
        ${this.state.jobDescription}
        
        Return ONLY the JSON array of questions with no additional text.
      `;

      // Generate content with Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse the response as JSON
      let questions;
      try {
        // Clean the text (remove markdown code blocks if present)
        const cleanedText = text.replace(/```json|```/g, '').trim();
        questions = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError);
        // Fallback: Try to extract questions manually
        const lines = text.split('\n').filter(line => line.includes('?'));
        questions = lines.map(line => ({ question: line, hint: "" }));
      }

      this.setState({
        interviewQuestions: questions || [],
        loading: false
      });

    } catch (error) {
      console.error('Error generating questions with Gemini:', error);
      this.setState({
        error: 'Failed to generate interview questions. Please try again.',
        loading: false
      });
    }
  }

  getFeedbackOnAnswer = async (questionIndex) => {
    const question = this.state.interviewQuestions[questionIndex];
    const answer = this.state.answers[questionIndex];
    
    if (!answer || !answer.trim()) {
      return;
    }

    // Set loading state for this specific question
    this.setState(prevState => ({
      loadingFeedback: {
        ...prevState.loadingFeedback,
        [questionIndex]: true
      }
    }));

    try {
      // Initialize the Gemini API
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Create prompt for feedback
      const prompt = `
        You are an expert interview coach. Evaluate the following answer to an interview question.
        Provide constructive feedback highlighting strengths and areas for improvement.
        Keep your feedback concise and actionable, approximately 3-4 sentences.
        
        Interview Question: ${question.question}
        
        Interviewer's expectations: ${question.hint || "No specific hint provided."}
        
        Candidate's Answer: ${answer}
        
        Feedback:
      `;

      // Generate feedback with Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const feedbackText = response.text();

      // Save the feedback
      this.setState(prevState => ({
        feedback: {
          ...prevState.feedback,
          [questionIndex]: feedbackText
        },
        loadingFeedback: {
          ...prevState.loadingFeedback,
          [questionIndex]: false
        }
      }));

    } catch (error) {
      console.error('Error generating feedback:', error);
      this.setState(prevState => ({
        feedback: {
          ...prevState.feedback,
          [questionIndex]: "Error generating feedback. Please try again."
        },
        loadingFeedback: {
          ...prevState.loadingFeedback,
          [questionIndex]: false
        }
      }));
    }
  }

  render() {
    const { jobDescription, interviewQuestions, answers, feedback, loading, loadingFeedback, error } = this.state;

    return (
      <Container>
        <Row className="mb-4">
          <Col>
            <h1 className="text-center my-4">Interview Preparation</h1>
            <p className="lead text-center">
              Generate customized interview questions based on job descriptions
            </p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header as="h5">Enter Job Description</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="jobDescriptionInput">
                    <Form.Control
                      as="textarea"
                      rows={6}
                      placeholder="Paste job description here..."
                      value={jobDescription}
                      onChange={this.handleInputChange}
                    />
                  </Form.Group>
                  
                  {error && (
                    <div className="text-danger mb-3">{error}</div>
                  )}
                  
                  <Button 
                    variant="primary"
                    onClick={this.generateInterviewPrep}
                    disabled={loading}
                    className="mt-3"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Generating...
                      </>
                    ) : (
                      'Generate Interview Questions'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {interviewQuestions.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header as="h5">Interview Questions</Card.Header>
                <Card.Body>
                  <ol className="interview-questions-list">
                    {interviewQuestions.map((question, index) => (
                      <li key={index} className="mb-5">
                        {/* Question */}
                        <div className="question font-weight-bold mb-2">{question.question}</div>
                        
                        {/* Hint */}
                        {question.hint && (
                          <div className="hint text-muted mb-3">
                            <small><strong>Hint:</strong> {question.hint}</small>
                          </div>
                        )}
                        
                        {/* Answer text area */}
                        <Form.Group className="mt-3">
                          <Form.Label>Your Answer:</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={answers[index] || ''}
                            onChange={(e) => this.handleAnswerChange(index, e.target.value)}
                            placeholder="Type your answer here..."
                          />
                        </Form.Group>
                        
                        {/* Submit button */}
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          className="mt-2"
                          onClick={() => this.getFeedbackOnAnswer(index)}
                          disabled={loadingFeedback[index] || !answers[index]}
                        >
                          {loadingFeedback[index] ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Getting feedback...
                            </>
                          ) : (
                            'Get Feedback'
                          )}
                        </Button>
                        
                        {/* Feedback display */}
                        {feedback[index] && (
                          <Card className="mt-3 bg-light">
                            <Card.Body>
                              <Card.Title className="h6">Feedback:</Card.Title>
                              <Card.Text>{feedback[index]}</Card.Text>
                            </Card.Body>
                          </Card>
                        )}
                      </li>
                    ))}
                  </ol>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

      </Container>
    );
  }
}
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
      loading: false,
      error: null
    };
  }

  handleInputChange = (event) => {
    this.setState({ jobDescription: event.target.value });
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

  render() {
    const { jobDescription, interviewQuestions, loading, error } = this.state;

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
                      <li key={index} className="mb-3">
                        <div className="question">{question.question}</div>
                        {question.hint && (
                          <div className="hint text-muted mt-2">
                            <small><strong>Hint:</strong> {question.hint}</small>
                          </div>
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
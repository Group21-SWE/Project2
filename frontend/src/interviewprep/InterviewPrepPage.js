import React, { Component } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import $ from 'jquery';

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

  generateInterviewPrep = () => {
    // Don't run if the job description is empty
    if (!this.state.jobDescription.trim()) {
      this.setState({ error: 'Please enter a job description first.' });
      return;
    }

    this.setState({ loading: true, error: null });

    $.ajax({
      url: 'http://127.0.0.1:5000/generate_interview_questions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ jobDescription: this.state.jobDescription }),
      success: (data) => {
        this.setState({
          interviewQuestions: data.questions || [],
          loading: false
        });
      },
      error: (xhr, status, error) => {
        console.error('Error generating questions:', error);
        this.setState({
          error: 'Failed to generate interview questions. Please try again.',
          loading: false
        });
      }
    });
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

        <Row className="mb-4">
          <Col className="text-center">
            <Button 
              variant="secondary"
              onClick={() => this.props.switchPage('CareerRoadmapPage')}
            >
              Back to Career Roadmap
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}
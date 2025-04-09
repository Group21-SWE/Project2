import React, { Component } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import $, { Callbacks } from 'jquery';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default class CoverLetterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobDescription: '',
      coverLetter: '',
      loading: false,
      error: null
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  generateCoverLetter = async () => {
    if (!this.state.jobDescription.trim() || !this.state.jobTitle.trim() || !this.state.companyName.trim()) {
      this.setState({ error: 'Please enter a job information first.' });
      return;
    }

    this.setState({ loading: true, error: null });

    try {
      // Initialize the Gemini API
      // You'll need to get an API key from https://makersuite.google.com/app/apikey
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Create prompt for cover letter
      const prompt = `
        Based on the following job description, the list of skills and resume, generate a cover letter.
        The cover letter should be professional and tailored to the job description. The cover letter should
        highlight the candidate's skills and experiences that are relevant to the job description.
        DO NOT include any skills not included in the resume or skill list.
        
        Job Title:
        ${this.state.jobTitle}

        Company Name:
        ${this.state.companyName}

        Job Description:
        ${this.state.jobDescription}
        
        Return ONLY the cover letter body with no additional text. Do not include any greetings or salutations.
      `;

      // Generate content with Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Generated Text:', text); // Debug log
      this.setState({ coverLetter: text });
    }
    catch (error) {
      console.error('Error generating cover letter:', error);
      this.setState({ error: 'Failed to generate cover letter. Please try again.' });
    }
    finally {
      this.setState({ loading: false });
    }

  }

  render() {
    return (
      <Container>
        <Row className="justify-content-center my-5">
          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title className="text-center">Generate Cover Letter</Card.Title>
                <Form>
                  <Form.Group controlId="jobInfo">
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      name="jobTitle"
                      value={this.state.jobTitle}
                      onChange={this.handleInputChange}
                      placeholder="Job Title"
                    />
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      name="companyName"
                      value={this.state.companyName}
                      onChange={this.handleInputChange}
                      placeholder="Company Name"
                    />
                  </Form.Group>
                  <Form.Group controlId="jobDescription">
                    <Form.Label>Job Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="jobDescription"
                      value={this.state.jobDescription}
                      onChange={this.handleInputChange}
                      placeholder="Enter the job description here..."
                    />
                  </Form.Group>
                  {this.state.error && (
                    <div className="text-danger text-center my-2">{this.state.error}</div>
                  )}
                  <Button
                    variant="primary"
                    onClick={this.generateCoverLetter}
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? (
                      <>
                        Generating...
                        <Spinner animation="border" size="sm" className="ms-2" />
                      </>
                    ) : (
                      'Generate Cover Letter'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {this.state.coverLetter && (
              <Card className="mt-4">
                <Card.Body>
                  <Card.Title>Generated Cover Letter</Card.Title>
                  <Card.Text>{this.state.coverLetter}</Card.Text>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    );
  }

}

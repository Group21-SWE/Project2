import React, { Component } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import $, { Callbacks, nodeName } from 'jquery';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CONSTANTS } from '../data/Constants';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default class CareerRoadMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      careerRoadMap: null,
      loading: false,
      error: null
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  fetchResumeFile = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/resume", {
        method: "GET",
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'Access-Control-Allow-Origin': 'http://127.0.0.1:3000',
          'Access-Control-Allow-Credentials': 'true',
        }
      });

      if (!response.ok) throw new Error("Failed to fetch resume");

      const blob = await response.blob();
      return new File([blob], "resume.pdf", { type: blob.type });
    } catch (error) {
      console.error("Error fetching resume:", error);
      this.setState({ error: "Could not load resume. Please upload one first." });
      return null;
    }
  };


  extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }
    return text;
  };


  generateCareerRoadMap = async () => {
    // if (!this.state.jobDescription.trim() || !this.state.jobTitle.trim() || !this.state.companyName.trim()) {
    //   this.setState({ error: 'Please enter a job information first.' });
    //   return;
    // }

    this.setState({ loading: true, error: null });

    try {
      // Initialize the Gemini API
      // You'll need to get an API key from https://makersuite.google.com/app/apikey
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });



      //get resume and extract text
      const resumeFile = await this.fetchResumeFile();
      const resumeText = resumeFile ? await this.extractTextFromPDF(resumeFile) : '';

      console.log(resumeText); // Debug log

      // Create prompt for career roadmap
      const prompt = `
      You are given a resume. Based on the candidate's education, work experience, and technical skills, generate a  response with the following three fields only:

      - "skill_building_paths": A list of recommended learning paths relevant to the candidate's profile.
      - "real_time_job_market_trends": A list of current job trends matching the candidate's background.
      - "certifications": A list of useful certifications the candidate could pursue next.
      
      Note that this text has to be human readable.
      ❗Important:
      - Do not include any explanation, headers, or markdown.
      - Respond with only the raw text ,nothing else.
      
      Here is the resume:

        Resume:
        ${resumeText}
        
        Return ONLY the career roadmap body with no additional text. Do not include any greetings or salutations.
      `;

      // Generate content with Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Generated Text:', text); // Debug log
      this.setState({ careerRoadMap: text });
    }
    catch (error) {
      console.error('Error generating career roadmap:', error);
      this.setState({ error: 'Failed to generate career roadmap. Please try again.' });
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
                <Card.Title className="text-center">Generate Career Roadmap</Card.Title>
                <Form>
                  {this.state.error && (
                    <div className="text-danger text-center my-2">{this.state.error}</div>
                  )}
                  <Button
                    variant="primary"
                    onClick={this.generateCareerRoadMap}
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? (
                      <>
                        Generating...
                        <Spinner animation="border" size="sm" className="ms-2" />
                      </>
                    ) : (
                      'Generate Career Roadmap'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {this.state.careerRoadMap && (
              <Card className="mt-4">
                <Card.Body>
                  <Card.Title>Generated Career Roadmap</Card.Title>
                  <div style={{ fontSize: '0.85em', color: '#888' }}>
                    Verify content before using.
                  </div>
                  <Card.Text>{this.state.careerRoadMap}</Card.Text>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    );
  }

}

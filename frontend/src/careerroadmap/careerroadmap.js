import React, { Component } from 'react'
import $ from 'jquery'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'


export default class CareerRoadmapPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paths: [],
      trends:[],
      certifications: []
    }

    console.log("***");
    console.log(localStorage.getItem('token'));
    this.generateCareerRoadmap();

  }

  async generateCareerRoadmap () {
    $.ajax({
          url: 'http://127.0.0.1:5000/career_roadmap',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Access-Control-Allow-Origin': 'http://127.0.0.1:3000',
            'Access-Control-Allow-Credentials': 'true'
          },
      credentials: 'include',
          success: (message, textStatus, response) => {
            console.log(response.getResponseHeader('x-fileName'))
            this.setState({ paths: response.data['skill-building paths']});
            this.setState({ trends: response.data['real-time job market trends']});
            this.setState({ certifications: response.data['certifications']});
          },
          error: (xhr, textStatus, errorThrown) => {
            console.error('Error:', textStatus, errorThrown);
            // Handle the error (e.g., show a message to the user)
            this.setState({ error: errorThrown });
          }
      })
    /*
    const url = `http://127.0.0.1:5000/career_roadmap`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Access-Control-Allow-Origin': 'http://127.0.0.1:3000',
          'Access-Control-Allow-Credentials': 'true'
        },
        credentials: 'include',
        mode: 'cors'
    });
    if (!response.ok || response.status != 200) {
        throw new Error('Network response was not ok '+response);
    }
    const data = response.data.json();
    this.setState({ paths: data['skill-building paths']});
    this.setState({ trends: data['real-time job market trends']});
    this.setState({ certifications: data['certifications']});
    */
}

render() {
    const { paths, trends, certifications } = this.state;
  
    return (
      <Container>
        <h1 className="text-center my-4">Career Roadmap</h1>
  
        {/* Skill-Building Paths Section */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header as="h5">Skill-Building Paths</Card.Header>
              <Card.Body>
                {paths.length > 0 ? (
                  <ul>
                    {paths.map((path, index) => (
                      <li key={index}>{path}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No skill-building paths available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
  
        {/* Real-Time Job Market Trends Section */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header as="h5">Real-Time Job Market Trends</Card.Header>
              <Card.Body>
                {trends.length > 0 ? (
                  <ul>
                    {trends.map((trend, index) => (
                      <li key={index}>{trend}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No job market trends available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
  
        {/* Certifications Section */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header as="h5">Certifications</Card.Header>
              <Card.Body>
                {certifications.length > 0 ? (
                  <ul>
                    {certifications.map((certification, index) => (
                      <li key={index}>{certification}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No certifications available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}
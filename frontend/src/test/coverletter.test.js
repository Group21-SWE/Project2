import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoverLetterPage from './CoverLetterPage'; // adjust path if needed
import '@testing-library/jest-dom';

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn(() => Promise.resolve({
        getTextContent: jest.fn(() => Promise.resolve({
          items: [{ str: 'Sample resume content' }]
        }))
      }))
    })
  }))
}));

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: jest.fn(() => Promise.resolve({
          response: {
            text: () => "Generated cover letter body"
          }
        }))
      })
    }))
  };
});

describe('CoverLetterPage', () => {
  const profile = {
    profile: {
      skills: [{ label: 'JavaScript' }, { label: 'React' }]
    }
  };

  beforeEach(() => {
    fetch.resetMocks();
  });

  test('renders form fields', () => {
    render(<CoverLetterPage {...profile} />);
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Description/i)).toBeInTheDocument();
  });

  test('shows error if fields are empty when generating', async () => {
    render(<CoverLetterPage {...profile} />);
    fireEvent.click(screen.getByText(/Generate Cover Letter/i));
    expect(await screen.findByText(/Please enter a job information/i)).toBeInTheDocument();
  });

  test('generates cover letter on valid input', async () => {
    fetch.mockResponseOnce(new Blob(['resume data']));

    render(<CoverLetterPage {...profile} />);

    fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'Software Engineer' } });
    fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: 'Tech Co' } });
    fireEvent.change(screen.getByLabelText(/Job Description/i), { target: { value: 'Build and maintain web apps' } });

    fireEvent.click(screen.getByText(/Generate Cover Letter/i));

    await waitFor(() => expect(screen.getByText(/Generated cover letter body/i)).toBeInTheDocument());
  });

  test('handles resume fetch error gracefully', async () => {
    fetch.mockRejectOnce(() => Promise.reject('API is down'));

    render(<CoverLetterPage {...profile} />);
    fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'Software Engineer' } });
    fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: 'Tech Co' } });
    fireEvent.change(screen.getByLabelText(/Job Description/i), { target: { value: 'Build and maintain web apps' } });

    fireEvent.click(screen.getByText(/Generate Cover Letter/i));

    await waitFor(() =>
      expect(screen.getByText(/Could not load resume/i)).toBeInTheDocument()
    );
  });
});
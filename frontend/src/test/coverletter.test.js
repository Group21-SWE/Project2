// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import CoverLetterPage from '../coverletter/CoverLetterPage';
// import '@testing-library/jest-dom/extend-expect';

// // // Mock Gemini API
// // jest.mock('@google/generative-ai', () => {
// //     return {
// //         GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
// //             getGenerativeModel: jest.fn().mockReturnValue({
// //                 generateContent: jest.fn().mockResolvedValue({
// //                     response: {
// //                         text: () => "This is a test generated cover letter."
// //                     }
// //                 })
// //             })
// //         }))
// //     };
// // });

// jest.mock('@google/generative-ai', () => {
//     return {
//         GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
//             getGenerativeModel: jest.fn(() => ({
//                 generateContent: jest.fn(() =>
//                     Promise.resolve({
//                         response: {
//                             text: () => "This is a test generated cover letter."
//                         }
//                     })
//                 )
//             }))
//         }))
//     };
// });


// // Mock pdfjs-dist
// jest.mock('pdfjs-dist', () => {
//     return {
//         GlobalWorkerOptions: { workerSrc: '' },
//         getDocument: jest.fn(() => ({
//             promise: Promise.resolve({
//                 numPages: 1,
//                 getPage: () => Promise.resolve({
//                     getTextContent: () => Promise.resolve({
//                         items: [{ str: "Test resume text." }]
//                     })
//                 })
//             })
//         }))
//     };
// });

// // // Mock fetch resume file
// // global.fetch = jest.fn(() =>
// //     Promise.resolve({
// //         ok: true,
// //         blob: () => Promise.resolve(new Blob(["Test PDF content"], { type: 'application/pdf' }))
// //     })
// // );
// global.fetch = jest.fn(() =>
//     Promise.resolve({
//         ok: true,
//         blob: () =>
//             Promise.resolve(
//                 new Blob(["Test PDF content"], { type: "application/pdf" })
//             )
//     })
// );


// // Mock localStorage
// beforeAll(() => {
//     Storage.prototype.getItem = jest.fn(() => "mockToken");
// });

// const mockProfile = {
//     profile: {
//         skills: [{ label: "React" }, { label: "Node.js" }]
//     }
// };

// describe("CoverLetterPage Component", () => {
//     test("renders form inputs", () => {
//         render(<CoverLetterPage {...mockProfile} />);

//         expect(screen.getByPlaceholderText(/Job Title/i)).toBeInTheDocument();
//         expect(screen.getByPlaceholderText(/Company Name/i)).toBeInTheDocument();
//         expect(screen.getByPlaceholderText(/Enter the job description/i)).toBeInTheDocument();
//     });

//     test("shows error if fields are empty", async () => {
//         render(<CoverLetterPage {...mockProfile} />);
//         fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));

//         expect(await screen.findByText(/Please enter a job information first/i)).toBeInTheDocument();
//     });

//     test("generates and displays cover letter", async () => {
//         render(<CoverLetterPage {...mockProfile} />);

//         fireEvent.change(screen.getByPlaceholderText(/Job Title/i), {
//             target: { value: "Software Engineer" }
//         });
//         fireEvent.change(screen.getByPlaceholderText(/Company Name/i), {
//             target: { value: "OpenAI" }
//         });
//         fireEvent.change(screen.getByPlaceholderText(/Enter the job description/i), {
//             target: { value: "We are hiring engineers." }
//         });

//         fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));

//         expect(await screen.findByText(/Generated Cover Letter/i)).toBeInTheDocument();
//         expect(await screen.findByText(/This is a test generated cover letter./i)).toBeInTheDocument();
//     });

//     test("handles Gemini API error gracefully", async () => {
//         const { GoogleGenerativeAI } = require('@google/generative-ai');
//         GoogleGenerativeAI.mockImplementation(() => ({
//             getGenerativeModel: () => ({
//                 generateContent: () => Promise.reject(new Error("Gemini failure"))
//             })
//         }));

//         render(<CoverLetterPage {...mockProfile} />);
//         fireEvent.change(screen.getByPlaceholderText(/Job Title/i), { target: { value: "Software Engineer" } });
//         fireEvent.change(screen.getByPlaceholderText(/Company Name/i), { target: { value: "OpenAI" } });
//         fireEvent.change(screen.getByPlaceholderText(/Enter the job description/i), {
//             target: { value: "We are hiring engineers." }
//         });

//         fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));

//         await waitFor(() =>
//             expect(screen.getByText(/Failed to generate cover letter/i)).toBeInTheDocument()
//         );
//     });
// });

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CoverLetterPage from '../coverletter/CoverLetterPage';
import '@testing-library/jest-dom/extend-expect';
import { GoogleGenerativeAI } from '@google/generative-ai';


jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: () => Promise.resolve({
        response: {
          text: () => "This is a test generated cover letter."
        }
      })
    })
  }))
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob(["PDF"], { type: 'application/pdf' }))
  })
);

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: () => Promise.resolve({
        getTextContent: () => Promise.resolve({
          items: [{ str: "Mock PDF text" }]
        })
      })
    })
  })
}));

const mockProfile = {
  profile: {
    skills: [{ label: "React" }, { label: "Node.js" }]
  }
};

describe("CoverLetterPage Component", () => {
  test("renders form inputs", () => {
    render(<CoverLetterPage {...mockProfile} />);
    expect(screen.getByPlaceholderText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter the job description/i)).toBeInTheDocument();
  });

  test("shows error if fields are empty", async () => {
    render(<CoverLetterPage {...mockProfile} />);
    fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));
    expect(await screen.findByText(/Please enter a job information first/i)).toBeInTheDocument();
  });

  test("handles Gemini API error gracefully", async () => {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: () => Promise.reject(new Error("Gemini failure"))
      })
    }));

    render(<CoverLetterPage {...mockProfile} />);
    fireEvent.change(screen.getByPlaceholderText(/Job Title/i), { target: { value: "SE" } });
    fireEvent.change(screen.getByPlaceholderText(/Company Name/i), { target: { value: "OpenAI" } });
    fireEvent.change(screen.getByPlaceholderText(/Enter the job description/i), { target: { value: "A job" } });

    fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));
    expect(await screen.findByText(/Failed to generate cover letter/i)).toBeInTheDocument();
  });
});
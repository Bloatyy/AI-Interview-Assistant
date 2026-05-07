# AI Interview Assistant

A web-based AI mock interview platform that helps users practice realistic interviews with AI-driven evaluation and feedback.

## Project Structure

- **`full-stack/`**: Next.js (React) application for the frontend and serverless backend (API routes).
  - Built with TypeScript and Vanilla CSS for a premium, custom design.
  - Implements the interview flow, webcam tracking interface, and performance reports.
- **`ml/`**: Machine Learning logic for AI evaluation, transcription, and cheating detection.
  - Contains Python logic for processing interview data and generating scores.

## Getting Started

### Full-Stack (Frontend & API)
1. Navigate to the `full-stack` directory:
   ```bash
   cd full-stack
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### ML Logic
1. Navigate to the `ml` directory:
   ```bash
   cd ml
   ```
2. (Optional) Set up a virtual environment and install requirements (to be defined by ML team).

## Features
- **Realistic Mock Interview**: Company-specific questions for Amazon, Google, and Meta.
- **Webcam Tracking**: Real-time monitoring for posture and gaze.
- **AI Evaluation**: Automated scoring based on keywords, clarity, and confidence.
- **Performance Report**: Detailed breakdown of strengths and weaknesses.

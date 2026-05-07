# AI Interview Assistant

A web-based AI mock interview platform that helps users practice realistic interviews with AI-driven evaluation and feedback.

## Project Structure

- **`full-stack/`**: Next.js (React) application for the frontend.
  - Built with TypeScript and Vanilla CSS.
  - Communicates with the Flask backend for interview logic and AI processing.
- **`ml/`**: **Flask Backend** & Machine Learning logic.
  - Handles API requests, interview flow, and AI evaluation.
  - Contains Python logic for processing interview data and generating scores.

## Getting Started

### 1. Start the Flask Backend
1. Navigate to the `ml` directory:
   ```bash
   cd ml
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`.

### 2. Start the Frontend
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

## Tech Stack
- **Frontend**: Next.js, React, Vanilla CSS
- **Backend**: Python, Flask, Flask-CORS
- **AI/ML**: MediaPipe, OpenAI Whisper
- **Storage**: AWS S3 & DynamoDB (via Boto3)

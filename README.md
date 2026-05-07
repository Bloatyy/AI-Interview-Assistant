# InterviewMitra

A premium AI-powered mock interview platform that provides realistic practice sessions with multi-modal analysis (Speech, Vision, and Logic).

## Project Structure

- **`frontend/`**: Vite + React + TypeScript application.
  - Premium UI with glassmorphism and smooth animations.
  - Integrated with local IndexedDB for session persistence.
- **`ml/`**: FastAPI Backend & Machine Learning logic.
  - **Transcription**: Powered by OpenAI Whisper.
  - **Evaluation**: Logic assessment via Groq (Llama 3).
  - **Anti-Cheat**: Real-time face and posture tracking using OpenCV SSD.

## Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- Groq API Key (Place in `ml/.env`)

### 2. Start the ML Backend
1. Navigate to the `ml` directory:
   ```bash
   cd ml
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   python main.py
   ```
   The backend will run on `http://localhost:8000`.

### 3. Start the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the provided local URL (usually `http://localhost:5173`) in your browser.

## Tech Stack
- **Frontend**: Vite, React, TypeScript, Vanilla CSS
- **Backend**: FastAPI, Uvicorn
- **AI/ML**: OpenAI Whisper, Groq (Llama 3), OpenCV, SSD Face Detection

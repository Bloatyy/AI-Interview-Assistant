# InterviewMitra: AI-Powered Interview Simulation Platform

## Project Overview
InterviewMitra is a state-of-the-art AI interview assistant designed to bridge the gap between candidate preparation and real-world hiring standards. The platform provides an immersive, high-pressure simulation environment for both **HR Behavioral** and **Technical Coding** interviews.

## Core Technology Stack
- **Frontend (Kunal)**: Built with **React 18**, **TypeScript**, and **Vite**. The UI features a premium "Glassmorphism" aesthetic with custom Vanilla CSS, utilizing **Framer Motion** for micro-animations and **IndexedDB** for efficient client-side session video buffering.
- **Backend**: **Node.js** & **Express** API serving as the orchestration layer, with **MongoDB Atlas** for persistent storage of user profiles and detailed performance reports.
- **ML Infrastructure (Dheer)**: A high-performance **FastAPI** backend in Python, leveraging **PyTorch** for neural inference and **OpenCV/Mediapipe** for real-time biometric tracking.

## Artificial Intelligence & Machine Learning (By Dheer)
The platform features a multi-modal AI evaluation engine that audits candidates across four major axes:

### 1. Computer Vision & Professionalism
- **Attire Classification**: A custom-trained **MobileNetV2** CNN model that distinguishes between "Formal" and "Informal" clothing with a strict 80% confidence threshold.
- **Grooming Detection**: A dedicated neural network trained to identify grooming standards (e.g., beard vs. clean-shaven) to enforce corporate professional requirements.
- **Biometric Auditing**: Real-time tracking of **Eye Gaze Stability**, **Posture Alignment**, and **Face Detection** using Mediapipe to calculate an "Integrity Score."

### 2. Natural Language Processing (NLP)
- **Transcription**: Integration with **Groq Whisper (distil-large-v3)** for near-instantaneous, high-accuracy speech-to-text conversion.
- **Semantic Evaluation**: Powered by **Groq Llama 3.3 (70B)**. The engine performs deep logic analysis on technical thought processes and evaluates behavioral answers for confidence, technical depth, and filler word density.
- **Anti-Cheat Logic**: Heuristic-based detection of environmental anomalies and screen-switching behavior during sessions.

## Team & Attribution
- **Dheer (ML & Backend Architecture)**: Responsible for the entire Machine Learning pipeline, model training (Attire/Grooming), computer vision integration, and the FastAPI evaluation engine.
- **Kunal (Frontend & UX Design)**: Responsible for the immersive user interface, real-time interview HUD, glassmorphic dashboard, and the dynamic reporting system.

---
**Status**: Production-ready for local simulation with real-time biometric feedback and AI-driven professionalism auditing.

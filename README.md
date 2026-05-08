# 🤖 AI Interview Assistant

> **Stop fumbling through interviews. Start owning them.**

An AI-powered interview prep platform that puts a brutally honest, infinitely patient coach in your corner — 24/7. Simulate real interviews, get instant structured feedback, and track your growth until you're dangerous.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-24+-green.svg)](https://nodejs.org/)

---

## ✨ Features

- 🎙️ **Real-time mock interviews** with live AI feedback
- 🧠 **Role-specific question banks** — SWE, PM, Design, and more
- 📊 **Performance analytics** — pinpoint exactly where you're weak
- 🔁 **Answer refinement loop** — iterate until your answers are airtight
- 📝 **STAR method enforcer** — structure your stories like a pro
- 🎯 **Difficulty scaling** — junior to staff-level
- 🏢 **Company-specific prep** — FAANG, startups, agencies
- 🔍 **Resume parsing** — upload your resume, get tailored questions

---

## 🏗️ Project Structure

```
AI-Interview-Assistant/
├── backend/          ← Express 5 API server (Node 24, TypeScript)
├── frontend/         ← React + Vite UI (Tailwind CSS + shadcn/ui)
└── ml/               ← Python ML models & scoring logic
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24 |
| Language | TypeScript 5.9 / Python |
| API Framework | Express 5 |
| Frontend | React + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| ML / Scoring | Python |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 24+
- pnpm 9+
- Python 3.10+
- PostgreSQL (local or hosted)

### Installation

```bash
# Clone the repo
git clone https://github.com/Bloatyy/AI-Interview-Assistant.git
cd AI-Interview-Assistant

# Install frontend & backend dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET

# Install Python dependencies (for ML)
cd ../ml && pip install -r requirements.txt
```

### Running Locally

```bash
# Start the backend (port 5000)
cd backend && npm run dev

# Start the frontend (separate terminal)
cd frontend && npm run dev
```

### Health Check

```bash
curl http://localhost:5000/api/healthz
# → {"status":"ok"}
```

---

## 🧬 How It Works

```
Upload Resume + Target Role
        ↓
AI maps your background to the role
        ↓
Interview session begins (behavioral, technical, or both)
        ↓
You answer
        ↓
AI scores: Clarity · Specificity · STAR adherence · Confidence
        ↓
Instant feedback + a stronger example answer
        ↓
Repeat until you're ready
        ↓
Performance report — know exactly what to drill
```

---

## 📡 API Endpoints

```
POST   /api/sessions              ← Start a new interview session
GET    /api/sessions/:id          ← Retrieve session + transcript
POST   /api/sessions/:id/answer   ← Submit an answer, get AI feedback
GET    /api/questions             ← Fetch role-specific question bank
GET    /api/reports/:userId       ← Performance analytics over time
POST   /api/resume/parse          ← Parse resume, extract experience signals
```

---

## 🤝 Contributing

PRs are welcome. If you have an idea that makes interviews less painful — open an issue or ship a PR.

1. Fork the repo
2. Create your branch: `git checkout -b feat/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a pull request

---

## 📜 License

[MIT](LICENSE) — take it, use it, build on it.

---

> Built with ☕ and a deep hatred for bad interviews.  
> No more "tell me about yourself" panic. No more blanking on system design.  
> **Get ready. Get sharp. Get hired.**

🤖 Your AI-Powered Interview Coach. Built to Make You Unstoppable.

Unsupported image
Unsupported image
Unsupported image
Unsupported image
Unsupported image
Unsupported image

    "Stop fumbling through interviews. Start owning them."

⚡ What Is This?

AI Interview Assistant is a next-generation interview prep platform that puts an AI in your corner — 24/7, brutally honest, and infinitely patient. No more awkward silences. No more blanking on behavioral questions. No more leaving an interview thinking "I had the perfect answer five minutes after I left."

This tool simulates real interview scenarios, tears apart your answers, rebuilds them stronger, and tracks your growth over time — all powered by AI that actually understands what interviewers are looking for.
🔥 Features (the heat)

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   🎙️  Real-time mock interviews with live AI feedback       │
│   🧠  Role-specific question banks (SWE, PM, Design...)     │
│   📊  Performance analytics — see where you're weak        │
│   🔁  Answer refinement loop — iterate until perfect        │
│   📝  STAR method enforcer — structure your stories         │
│   🎯  Difficulty scaling — junior to staff-level            │
│   🏢  Company-specific prep (FAANG, startups, agencies)     │
│   🔍  Resume parsing + tailored question generation         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

🏗️ Architecture

This isn't a hobby project duct-taped together. This is a production-grade monorepo built with the stack that scales.

ai-interview-assistant/
├── 🖥️  artifacts/
│   ├── api-server/          ← Express 5 backend (Node 24, lightning fast)
│   └── mockup-sandbox/      ← Component preview + design system
│
├── 📦  lib/
│   ├── api-spec/            ← OpenAPI 3.1 — single source of truth
│   ├── api-client-react/    ← Auto-generated React Query hooks (via Orval)
│   ├── api-zod/             ← Auto-generated Zod schemas
│   └── db/                  ← Drizzle ORM schema + migrations
│
└── 🔧  scripts/             ← Utility tooling

The Stack That Hits Different
Layer	Technology	Why
Runtime	Node.js 24	Latest. Fastest. No compromises.
Language	TypeScript 5.9	Strict. Type-safe. Ship with confidence.
API Framework	Express 5	Battle-tested, now with async/await native
Database	PostgreSQL + Drizzle ORM	Relational power, TypeScript-first queries
Validation	Zod v4	Runtime safety at every boundary
API Contract	OpenAPI 3.1 + Orval	Contract-first. Frontend never guesses.
Frontend	React + Vite	HMR so fast you'll think it's broken
Styling	Tailwind CSS + shadcn/ui	Design system out of the box
Package Manager	pnpm workspaces	Monorepo, done right
🚀 Getting Started
Prerequisites

    Node.js 24+
    pnpm 9+
    PostgreSQL (local or hosted)

Installation

# Clone the beast
git clone https://github.com/Bloatyy/AI-Interview-Assistant.git
cd AI-Interview-Assistant
# Install all workspace dependencies
pnpm install
# Set your environment variables
cp .env.example .env
# Fill in DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET

Running It

# Start the API server (port 5000)
pnpm --filter @workspace/api-server run dev
# Start the frontend
pnpm --filter @workspace/web run dev
# Regenerate API hooks after spec changes
pnpm --filter @workspace/api-spec run codegen
# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

Health Check

curl http://localhost:5000/api/healthz
# → {"status":"ok"}  ✓

🧬 How It Works

You → Upload Resume + Target Role
         ↓
AI parses your background and maps it to the role requirements
         ↓
Interview session begins — behavioral, technical, or both
         ↓
You answer (text or voice)
         ↓
AI scores: Clarity · Specificity · STAR adherence · Confidence signals
         ↓
Instant feedback + example of a stronger answer
         ↓
Repeat until you're dangerous
         ↓
Performance report — know exactly what to drill

📡 API Design

The API is contract-first. The OpenAPI spec lives in lib/api-spec/openapi.yaml and is the single source of truth. React Query hooks and Zod validation schemas are auto-generated — no handwritten client code, no drift between frontend and backend.

Key endpoints (coming hot):

POST /api/sessions          ← Start a new interview session
GET  /api/sessions/:id      ← Retrieve session + transcript
POST /api/sessions/:id/answer ← Submit an answer, get AI feedback
GET  /api/questions         ← Fetch role-specific question bank
GET  /api/reports/:userId   ← Performance analytics over time
POST /api/resume/parse      ← Parse resume, extract experience signals

🗄️ Database Schema

Built on PostgreSQL with Drizzle ORM — fully type-safe, migration-tracked, zero-handwritten-SQL required.

users ──────────────── sessions ──────────── answers
  │                        │                    │
  └─── resumes             └─── questions       └─── feedback_scores

🛠️ Developer Commands

pnpm run typecheck          # Full typecheck across all packages
pnpm run build              # Typecheck + build everything
pnpm run typecheck:libs     # Composite libs only (fast)
pnpm --filter @workspace/api-spec run codegen   # Regenerate API hooks
pnpm --filter @workspace/db run push            # Push schema to DB

🤝 Contributing

This project is actively in development and PRs are welcome. If you have an idea that makes interviews less painful for people everywhere — open an issue or drop a PR.

    Fork it
    Create your feature branch: git checkout -b feat/my-killer-feature
    Commit: git commit -m "feat: add killer feature"
    Push: git push origin feat/my-killer-feature
    Open a PR and describe what you built

📜 License

MIT — take it, use it, build on it.

Built with ☕ and a deep hatred for bad interviews.

No more "tell me about yourself" panic. No more blanking on system design. No more leaving the room knowing you had the answer five minutes too late.

Get ready. Get sharp. Get hired.

# 🧠 MindTrace — AI Learning Diagnostic Engine

> **A longitudinal AI learning diagnostic system that pinpoints what students actually understand, detects underlying misconceptions, and tracks cognitive improvement over time.**

MindTrace is not an AI tutor, chatbot, quiz generator, PDF summarizer, or LMS. It is an intelligent diagnostic engine built around the core student question:
> *"What do I actually know, what do I misunderstand, why am I struggling, what should I learn next, and did I actually improve?"*

---

## 🚀 Sprint 1: Foundation & Runnable Vertical Skeleton

Sprint 1 delivers a runnable end-to-end foundation:
- **Modular Monolith**: React 18 frontend + Node.js/Express TypeScript backend.
- **Curated Domain**: Class 10 CBSE Mathematics — Quadratic Equations with 7 seed subtopics.
- **Longitudinal Data Model**: Prisma schema tracking user context, questions, attempts, and diagnostic summaries.
- **AI Provider Abstraction**: `AIProvider` contract with `OpenAIProvider` (structured JSON outputs) and deterministic `MockAIProvider` fallback for zero-API-key local testing.
- **Complete User Journey**: Academic context setup → Subtopic self-assessment → Test / Learn from scratch routing → Multi-signal diagnostic question execution → Learning X-Ray presentation.

---

## 🛠️ Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router 6, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Zod, CORS.
- **Database**: PostgreSQL with Prisma ORM.
- **AI Engine**: OpenAI Structured Outputs with resilient `MockAIProvider` fallback.

---

## 📦 Quick Start & Installation

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+`

### 1. Install Dependencies
Run from the repository root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in the backend folder:
```bash
cp backend/.env.example backend/.env
```

Default variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mindtrace?schema=public"
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
JWT_SECRET=mindtrace_super_secret_jwt_key_sprint1
FRONTEND_URL=http://localhost:5173
```
*Note: If `OPENAI_API_KEY` is not provided, the system automatically uses the deterministic `MockAIProvider` with zero runtime errors.*

### 3. Database Setup (Optional if PostgreSQL is running)
```bash
cd backend
npm run prisma:generate
# To push schema to your local Postgres:
npm run prisma:push
# To seed Class 10 CBSE Quadratic Equations:
npm run prisma:seed
```
*Note: If PostgreSQL is not configured on your machine, the backend seamlessly runs with in-memory resilient data stores for all Sprint 1 demo interactions.*

### 4. Run the Application
Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🧭 Routes

| Route | Purpose |
|---|---|
| `/` | Application Overview & 10-Sprint Diagnostic Loop |
| `/profile` | Step 1: Explicit Academic Context (Class 10 CBSE Math) |
| `/learn` | Steps 2 & 3: Self-Assessment & Subtopic Rating |
| `/diagnostic` | Step 4: Multi-Signal Diagnostic Runner |
| `/diagnostic/:sessionId` | Step 4: Live Diagnostic Session |
| `/learning-xray` | Step 5: Learning X-Ray Cognitive Synthesis |
| `/intervention` | Step 6: Targeted Teaching (Sprint 7 Spec) |
| `/reassessment` | Step 7: Explain-Back & Reassessment (Sprint 8 Spec) |
| `/history` | Step 8: Longitudinal Learning History (Sprint 9 Spec) |

---

## 🔬 Multi-Signal Diagnostic Methodology
MindTrace does not simply grade A/B/C/D choices:
1. **Procedural & Conceptual Selection**: Multiple choice and numeric inputs.
2. **Step-by-Step Reasoning**: Student explains why their logic holds, exposing algebraic reduction gaps.
3. **Confidence Rating (1-5)**: Calibrates self-perception against actual accuracy to identify overconfidence vs impostor syndrome.
4. **Misconception Detection**: Flags cognitive distortions (e.g. ignoring leading coefficient $a \neq 0$).

---

## 📁 Architecture Documentation
Detailed architectural specifications are located in [`docs/architecture/overview.md`](docs/architecture/overview.md).

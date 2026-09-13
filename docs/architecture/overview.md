# MindTrace — Architecture Overview

## 1. System Vision
MindTrace is a **longitudinal AI learning diagnostic engine**. Unlike conventional AI chatbots, tutors, or quiz generators, MindTrace does not focus on answering student questions or generating generic summaries. Instead, it continuously models what the student actually understands, identifies underlying misconceptions and prerequisite gaps, verifies cognitive transfer, and tracks learning progression over time.

---

## 2. Sprint 1 Architecture (Modular Monolith)

```
mindtrace/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── providers/        # AIProvider interface, OpenAIProvider, MockAIProvider
│   │   │   └── schemas/          # Structured JSON schemas for diagnostic inference
│   │   ├── config/               # Environment & configuration
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── middleware/           # CORS, logging, error handling
│   │   ├── routes/               # API endpoint routing (/api/v1 & /api)
│   │   ├── services/             # Business & diagnostic logic
│   │   └── server.ts             # Express application bootstrap
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI cards, badges, progress bars
│   │   ├── layouts/              # AppLayout shell with navigation & health status
│   │   ├── pages/                # Route views (Profile, Learn, Diagnostic, X-Ray)
│   │   ├── services/             # API client services
│   │   ├── styles/               # Design system & Tailwind tokens
│   │   └── types/                # Domain models & diagnostic contracts
│   └── vite.config.ts
├── prisma/
│   ├── schema.prisma             # Longitudinal learning domain schema
│   └── seed.ts                   # Class 10 CBSE Math Quadratic Equations seed
├── docs/                         # Specifications & sprint docs
└── README.md
```

---

## 3. Data Model Design (Longitudinal Learning State)

The database schema is structured around a student's evolving cognitive journey rather than isolated quiz scores:

- **`User`**: The student identity.
- **`LearningContext`**: Academic background (Grade, Board, Subject, Target Topic).
- **`Topic` & `Subtopic`**: Extensible domain knowledge tree (e.g. Quadratic Equations -> Factorization, Discriminant, Nature of Roots, Word Problems).
- **`DiagnosticSession`**: Encapsulates a multi-signal diagnostic run, recording self-assessment ratings and active question attempts.
- **`Question` & `QuestionAttempt`**: Multi-dimensional questions capturing not just correct/incorrect answers, but:
  - Procedural vs Reasoning vs Transfer questions
  - Student confidence rating (1-5 scale)
  - Student written step-by-step reasoning & explain-backs
- **`ReasoningEvidence` & `Misconception`** (Sprint 4-6): Structured outputs from the AI provider detailing detected misconceptions and confidence calibrations.

---

## 4. AI Provider Abstraction

MindTrace isolates AI model calls behind a clean provider interface:

```typescript
export interface AIProvider {
  evaluateDiagnosticAttempt(input: DiagnosticEvaluationInput): Promise<DiagnosticEvaluationResult>;
}
```

- **`OpenAIProvider`**: Uses JSON-mode / structured output to extract step analysis, misconception indicators, and confidence calibration.
- **`MockAIProvider`**: Activated automatically if `OPENAI_API_KEY` is not present, delivering deterministic structured diagnostics without external network dependencies.
- **Zero Hidden Chain-of-Thought Dependency**: The system requests concise, structured evidence suitable for educational diagnosis and explain-backs.

---

## 5. End-to-End User Journey (Sprint 1)

1. **Academic Context**: Student selects Class 10 -> CBSE -> Mathematics -> Quadratic Equations.
2. **Self-Assessment**: Student rates perceived familiarity (e.g. *Comfortable*, *Some basics*) and individual subtopics (*Know*, *Partially know*, *Don't know*).
3. **Intent Selection**: Student chooses **Test what I know** or **Learn from scratch**.
4. **Diagnostic Execution**: Session created on backend, presenting multi-signal questions (answer, explanation, confidence).
5. **Evaluation & Learning X-Ray**: Backend evaluates response via AI provider abstraction and outputs structured diagnosis.

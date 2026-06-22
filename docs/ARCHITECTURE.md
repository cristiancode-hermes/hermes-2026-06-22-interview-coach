# Architecture — Interview Coach

## System Design

The Interview Coach follows a classic three-tier architecture with an AI agent layer:

```
┌─────────────────────┐
│   Angular 22 SPA    │
│  (Signals/Zoneless) │
├─────────────────────┤
│   HTTP (REST API)   │
├─────────────────────┤
│    NestJS Backend   │
│  ┌────────────────┐ │
│  │  Feature Modules│ │
│  │  Auth/Users     │ │
│  │  Interviews     │ │
│  │  Questions      │ │
│  │  Answers        │ │
│  │  Feedback       │ │
│  │  AI Agent       │ │
│  │  Seed           │ │
│  └────────────────┘ │
├─────────────────────┤
│  TypeORM / SQLite   │
└─────────────────────┘
```

## Key Design Decisions

### Frontend: Signal-First Angular 22
- All component state managed via `signal()`, `computed()`, `input()`, `output()`
- Zoneless change detection via `provideZonelessChangeDetection()`
- Standalone components with lazy-loaded routes
- Tailwind CSS v4 via PostCSS for all styling
- No RxJS in components — signals and `computed()` handle reactive data flow

### Backend: Modular NestJS
- Feature-based module structure with clear separation of concerns
- TypeORM with object-syntax relations (`{ user: true }`)
- Global ValidationPipe with whitelist and transform
- JWT auth via Passport.js with bcryptjs password hashing
- Swagger docs at `/api/docs`

### AI Agent: Strategy Pattern
The AI analysis uses the Strategy Pattern to support both real LLM calls and local heuristic analysis:

```
AIAgentCoordinator
  ├── InterviewStrategy (interface)
  │   ├── LocalStrategy (selected when OPENAI_API_KEY is empty)
  │   └── OpenAIStrategy (selected when OPENAI_API_KEY is set)
  ├── AnswerAnalyzerAgent
  ├── QuestionAdapterAgent  
  └── ProgressTrackerAgent
```

### Database: SQLite with PostgreSQL Compatibility
- Development uses SQLite (better-sqlite3) for zero-config setup
- Schema designed for PostgreSQL compatibility:
  - `text` instead of `VARCHAR` for strings
  - `TEXT` for JSON arrays (parsed in application layer)
  - `real` for decimal scores
  - `date` type for timestamps
- Neon-ready for production deployment

## Data Flow

1. User creates interview → POST /api/interviews
2. Backend generates 5 questions (preset or AI-generated)
3. User answers question → POST /api/interviews/:id/answers
4. Backend triggers AI Agent Coordinator
5. Coordinator selects strategy (local/OpenAI)
6. Strategy analyzes answer → returns structured feedback
7. Feedback persisted and returned to frontend
8. User progresses through all 5 questions
9. Session summary shows aggregated scores by category

# Interview Coach

**AI-powered interview preparation platform** — practice with realistic mock interviews, get instant structured feedback, and track your progress across roles and categories.

## Features

- **Mock Interviews** — Custom sessions by role (Frontend, Backend, Fullstack, Data, DevOps), seniority, and question type
- **AI-Powered Feedback** — Detailed analysis across 5 dimensions: structure, clarity, depth, examples, keywords
- **Timed Practice** — Configurable countdown timer (2/3/5 min) with auto-submit
- **Adaptive Mode** — Questions adjust difficulty based on your performance history
- **Progress Tracking** — Dashboard with stats, weakness profile, and session history
- **Dark Mode** — Full dark theme with system preference detection
- **JWT Auth** — Secure registration and login with password hashing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (Signals, Zoneless, Standalone) |
| Styling | Tailwind CSS v4 (PostCSS) |
| Backend | NestJS 11 (TypeORM, Swagger) |
| Database | SQLite (dev) / Neon PostgreSQL (prod) |
| Auth | JWT + Passport.js + bcryptjs |
| AI | Strategy Pattern (OpenAI + Local heuristic fallback) |

## Architecture Overview

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Angular  │────▶│ NestJS   │────▶│ SQLite   │
│ (Signals)│     │ (REST)   │     │ (TypeORM)│
└──────────┘     └──────────┘     └──────────┘
                       │
                 ┌─────┴──────┐
                 │ AI Agent   │
                 │ Coordinator│
                 ├────────────┤
                 │ Local      │
                 │ Strategy   │
                 │ (heuristic)│
                 ├────────────┤
                 │ OpenAI     │
                 │ Strategy   │
                 │ (when key) │
                 └────────────┘
```

## Prerequisites

- Node.js 22+
- npm 10+

## Local Setup

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd hermes-2026-06-22-interview-coach

# 2. Install backend
cd apps/api
npm install
cp ../../.env.example .env  # or link to root .env

# 3. Install frontend
cd ../web
npm install

# 4. Set up environment
cd ../..
cp .env.example .env
# Edit .env with your JWT_SECRET (optional — defaults to 'dev-secret')

# 5. Run database seed (auto-seeds on first start)
cd apps/api
npm run start:dev

# 6. In another terminal, run frontend
cd apps/web
npm run start
```

Visit `http://localhost:4200` for the app and `http://localhost:3000/api/docs` for Swagger API docs.

### Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| demo@example.com | demo1234 | Demo User |
| admin@example.com | admin1234 | Admin User |

## Project Structure

```
├── apps/
│   ├── api/                   # NestJS backend
│   │   └── src/
│   │       ├── auth/          # JWT auth, register, login, profile
│   │       ├── users/         # User stats & weaknesses
│   │       ├── interviews/    # Interview CRUD + filtering
│   │       ├── questions/     # Question management + generation
│   │       ├── answers/       # Answer submission
│   │       ├── feedback/      # Feedback retrieval
│   │       ├── ai-agent/      # AI Coordinator + Strategy Pattern
│   │       ├── seed/          # Demo data seeder
│   │       └── main.ts
│   └── web/                   # Angular frontend
│       └── src/app/
│           ├── pages/         # 11 lazy-loaded pages
│           ├── components/    # Layout + shared components
│           ├── services/      # 7 API services
│           ├── guards/        # Auth guard
│           ├── interceptors/  # JWT interceptor
│           └── models/        # TypeScript interfaces
├── docs/                      # Documentation
└── .env.example
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/profile | JWT | Get user profile |
| PATCH | /api/auth/profile | JWT | Update profile |
| POST | /api/auth/change-password | JWT | Change password |
| GET | /api/users/me/stats | JWT | Dashboard stats |
| GET | /api/users/me/weaknesses | JWT | Per-category weaknesses |
| GET | /api/interviews | JWT | List interviews (paginated) |
| POST | /api/interviews | JWT | Create interview |
| GET | /api/interviews/recent | JWT | Recent 5 interviews |
| GET | /api/interviews/:id | JWT | Interview detail |
| PATCH | /api/interviews/:id | JWT | Update interview |
| DELETE | /api/interviews/:id | JWT | Delete interview |
| POST | /api/ai/analyze/:answerId | JWT | Analyze answer |
| GET | /api/ai/profile | JWT | AI weakness profile |
| POST | /api/ai/suggest-topics | JWT | Suggest study topics |

## Frontend Routes

| Path | Page | Auth |
|------|------|------|
| / | Landing | No |
| /login | Login | No |
| /register | Register | No |
| /dashboard | Dashboard | Yes |
| /interview/new | New Interview Wizard | Yes |
| /interview/:id | Active Session | Yes |
| /interview/:id/summary | Session Summary | Yes |
| /history | Interview History | Yes |
| /history/:id | Interview Detail | Yes |
| /profile | Profile & Settings | Yes |

## Roadmap

- [ ] OpenAI integration (when API key is available)
- [ ] Frontend component tests
- [ ] PDF export of interview results
- [ ] Share sessions with mentors
- [ ] Real-time collaboration during practice
- [ ] Email/push reminders for practice streaks

## License

MIT

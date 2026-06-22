# API Reference — Interview Coach

Base URL: `http://localhost:3000/api`

Swagger UI: `http://localhost:3000/api/docs`

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

### POST /api/auth/register
Register a new user.

```json
// Request
{ "email": "user@example.com", "password": "secret1234", "name": "John Doe" }

// Response (201)
{ "user": { "id": 1, "email": "user@example.com", "name": "John Doe" }, "accessToken": "eyJhbG..." }
```

### POST /api/auth/login
Login and receive JWT token (expires in 7 days).

```json
// Request
{ "email": "user@example.com", "password": "secret1234" }

// Response (200)
{ "user": { "id": 1, "email": "user@example.com", "name": "John Doe" }, "accessToken": "eyJhbG..." }
```

### GET /api/auth/profile (JWT)
Get current user profile.

### PATCH /api/auth/profile (JWT)
Update user name.

```json
// Request
{ "name": "Jane Doe" }
```

### POST /api/auth/change-password (JWT)
Change password (requires current password verification).

```json
// Request
{ "currentPassword": "old1234", "newPassword": "new5678" }
```

## Users

### GET /api/users/me/stats (JWT)
Dashboard statistics.

```json
// Response
{ "totalInterviews": 12, "totalQuestions": 48, "avgScore": 7.4, "streak": 3 }
```

### GET /api/users/me/weaknesses (JWT)
Per-category weakness profile, sorted weakest-first.

```json
// Response
{ "categories": [
  { "category": "system_design", "score": 3.5, "maxScore": 10, "totalQuestions": 8 },
  { "category": "behavioral", "score": 7.2, "maxScore": 10, "totalQuestions": 12 }
]}
```

## Interviews

### GET /api/interviews
Paginated list with optional filters.

Query params: `page`, `limit`, `status`, `role`, `type`

```json
// Response
{ "data": [...], "total": 25, "page": 1, "limit": 10, "totalPages": 3 }
```

### POST /api/interviews
Create new interview session.

```json
// Request
{ "role": "frontend", "seniority": "mid", "type": "mixed", "technologies": "React,TypeScript", "adaptiveMode": false }

// Response (201)
{ "id": 1, "userId": 1, "role": "frontend", "status": "in_progress", "totalQuestions": 5, "questions": [...] }
```

### GET /api/interviews/recent
Last 5 completed interviews for dashboard.

### GET /api/interviews/:id
Full detail with nested questions, answers, and feedback.

## AI Agent

### POST /api/ai/analyze/:answerId
Analyze an answer. Returns structured feedback with 5 dimension scores, strengths, improvements, and sample answer.

```json
// Response
{
  "overallScore": 7.5,
  "structureScore": 8.0,
  "clarityScore": 7.0,
  "depthScore": 6.5,
  "examplesScore": 8.0,
  "keywordsScore": 7.5,
  "strengths": ["Good structure", "Clear examples"],
  "improvements": ["Add more depth", "Include trade-offs"],
  "sampleAnswer": "A strong answer would...",
  "resources": [{ "title": "MDN Web Docs", "url": "https://..." }],
  "modelUsed": "gpt-4"
}
```

### GET /api/ai/profile
Aggregated performance profile across all interviews.

### POST /api/ai/suggest-topics
Personalized study suggestions based on weakest areas.

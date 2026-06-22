# Database Schema — Interview Coach

**Driver:** better-sqlite3 (dev) / PostgreSQL (prod with Neon)
**ORM:** TypeORM 1.0 (object-syntax relations)

## Entity Relationship Diagram

```
┌────────────┐     ┌──────────────────┐     ┌──────────────┐
│    User    │1──N│ InterviewSession │1──N│   Question    │
└────────────┘     └──────────────────┘     └──────────────┘
       │                    │                        │1
       │                    │                        │
       │                    │1                       ▼
       │                    │                 ┌──────────────┐
       │                    │                 │    Answer    │
       │                    ▼                 └──────────────┘
       │            ┌──────────────┐                │1
       │            │   Feedback   │◄────────────────┘
       └────────────┘──────────────┘
```

## Entities

### User
| Field | Type | Notes |
|-------|------|-------|
| id | integer | PK, autoincrement |
| email | text | UNIQUE, NOT NULL |
| password | text | bcrypt hashed |
| name | text | Display name |
| createdAt | text | ISO 8601 timestamp |

### InterviewSession
| Field | Type | Notes |
|-------|------|-------|
| id | integer | PK |
| userId | integer | FK → User.id |
| role | text | frontend/backend/fullstack/data/devops |
| seniority | text | junior/mid/senior/staff |
| type | text | technical/behavioral/mixed |
| status | text | draft/in_progress/completed/cancelled |
| avgScore | real | Computed after completion |
| totalQuestions | integer | Default 5 |

### Question
| Field | Type | Notes |
|-------|------|-------|
| id | integer | PK |
| interviewId | integer | FK → InterviewSession |
| content | text | Question text |
| category | text | algorithms/system_design/frontend/backend/behavioral |
| difficulty | text | easy/medium/hard |
| orderIndex | integer | 1-based position |
| timeLimit | integer | Seconds, default 180 |

### Answer
| Field | Type | Notes |
|-------|------|-------|
| id | integer | PK |
| questionId | integer | FK → Question.id (UNIQUE) |
| userId | integer | FK → User.id |
| content | text | User's answer |
| timeSpent | integer | Seconds taken |

### Feedback
| Field | Type | Notes |
|-------|------|-------|
| id | integer | PK |
| answerId | integer | FK → Answer.id (UNIQUE) |
| overallScore | real | 1-10 |
| structureScore | real | 1-10 |
| clarityScore | real | 1-10 |
| depthScore | real | 1-10 |
| examplesScore | real | 1-10 |
| keywordsScore | real | 1-10 |
| strengths | text | JSON array |
| improvements | text | JSON array |
| sampleAnswer | text | Model answer |
| resources | text | JSON array of { title, url } |
| modelUsed | text | 'openai' or 'local' |

## Migration Strategy

For development, TypeORM `synchronize: true` auto-creates tables. For production:

1. Migrations stored in `/apps/api/migrations/` as SQL files
2. Run with `typeorm migration:run` 
3. Switch to PostgreSQL by changing DATABASE_URL in .env
4. Enable pgvector extension for embedding-based search (future)

## Indexes

```sql
CREATE INDEX idx_interview_user ON interview_session(userId);
CREATE INDEX idx_interview_status ON interview_session(status);
CREATE INDEX idx_interview_user_status ON interview_session(userId, status);
CREATE INDEX idx_question_interview ON question(interviewId);
CREATE INDEX idx_question_order ON question(interviewId, orderIndex);
CREATE INDEX idx_answer_user ON answer(userId);
CREATE INDEX idx_feedback_score ON feedback(overallScore);
```

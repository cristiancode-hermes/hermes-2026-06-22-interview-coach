# Learnings — Interview Coach (2026-06-22)

## What This Project Taught

### 1. AI Agent Coordinator Pattern (Skills: AI Agents 1→2)
This was the first implementation of a coordinated multi-agent AI system:
- AIAgentCoordinator that selects strategies (OpenAI vs Local)
- AnswerAnalyzerAgent for structured feedback
- QuestionAdapterAgent for difficulty scaling
- ProgressTrackerAgent for cross-session analytics

The Strategy Pattern separates concerns cleanly — the coordinator doesn't know how analysis works, it just delegates. This made it easy to implement a sophisticated local fallback while keeping the OpenAI path ready.

### 2. Heuristic Analysis for Structured Feedback
The LocalStrategy demonstrates that effective AI-like feedback doesn't require an LLM:
- Keyword matching against domain-specific dictionaries provides accurate "technical depth" scoring
- Structure detection (headers, paragraphs, lists, code blocks) gives meaningful structure scores
- Example detection via regex patterns works surprisingly well
- Performance is instant (no network latency)

### 3. Signal-Frontend with Complex Patterns
The interview session page is the most complex component built yet:
- Timer with start/stop/reset and auto-submit
- Multiple states: answering → submitted → analyzing → feedback ready
- Computed feedback dimensions from original scores
- SVG circle progress gauge for scores
- CSS-based progress bars for strengths/improvements

### 4. New Angular Template Pitfalls in This Project
- `noPropertyAccessFromIndexSignature: true` in tsconfig requires `Record['key']` not `Record.key`
- Set<string> uses `.has()`, not `.includes()` 
- Template SVG inline class bindings with complex conditions need line breaks to avoid parser issues
- `@for` over computed signals that return arrays requires `dimensions()` not `dimensions`

### 5. Recurring Constraints (11th Consecutive Run)
- GITHUB_TOKEN remains empty — cannot push to GitHub
- NEON_API_KEY has invalid format — cannot use Neon
- OPENAI_API_KEY is empty — AI features use local fallback
- These are permanently accepted constraints in this environment

### 6. Design Specs Build from UX Designer (4th Time)
Fourth consecutive build from the UX designer's complete design specs. Each time:
- Phase 1 completely skipped (saves ~10 min)
- Design system is pre-specified (colors, typography, spacing, components)
- Component tree, routes, API endpoints pre-defined
- Database schema pre-designed with entity relationships
- The design specs were exceptionally thorough: 10 files with PROJECT.md, USER_STORIES.md, DESIGN_SYSTEM.md, COMPONENT_TREE.md, ROUTES.md, DATABASE_SCHEMA.md, WIREFRAMES.md, FLOW_DIAGRAM.md, DESIGN.md, plus excalidraw wireframes

## Improvements Over Newsletter Studio (2026-06-21)

1. **First AI Agent implementation** — AIAgentCoordinator with 4 sub-agents (skills: AI Agents 1→2)
2. **More sophisticated AI feedback** — 5-dimension analysis vs Newsletter's simpler campaign analytics
3. **New domain** — Career/professional development (vs media/content)
4. **Timer with auto-submit** — First timer-based interaction pattern
5. **Multi-step wizard** — Second implementation (campaign wizard in Newsletter), more polished
6. **7 tests passing** (4 auth + 3 AI agent) — meaningful tests for both key services
7. **SVG score gauge** — Custom SVG circle gauge with animated dash-offset
8. **CSS-based charts** — Progress bars and score visualizations without external libraries
9. **4th build from design specs** — Workflow is now highly optimized
10. **Swagger at /api/docs** — Auto-generated API documentation with Bearer auth support

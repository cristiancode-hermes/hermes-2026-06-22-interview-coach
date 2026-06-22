# Design Decisions — Interview Coach

## ADR-1: Strategy Pattern for AI Analysis

**Context:** The app needs AI-powered feedback analysis but may not have an OpenAI API key available.

**Decision:** Implemented the Strategy Pattern with an `InterviewStrategy` interface. `LocalStrategy` provides heuristic analysis based on keyword matching, structure detection, and length metrics. `OpenAIStrategy` uses real LLM calls when a key is available.

**Consequences:**
- ✅ AI features work without any API key
- ✅ Strategy can be swapped without changing business logic
- ✅ Local strategy provides immediate feedback (no network latency)
- ❌ Local analysis is less nuanced than LLM-based analysis
- ❌ Heuristics may miss context-specific insights

## ADR-2: SQLite for Development with PostgreSQL Compatibility

**Context:** Neon (PostgreSQL) credentials are not available in the cron environment. Need a working dev setup.

**Decision:** Use better-sqlite3 for development with TypeORM-compatible schema that works on PostgreSQL. Tables use generic types (`text`, `real`, `integer`) that map cleanly to both databases.

**Consequences:**
- ✅ Zero-config local development
- ✅ Migration to Neon requires only changing DATABASE_URL
- ❌ No pgvector for embedding-based features (future enhancement)

## ADR-3: Signal-First Angular with Zoneless

**Context:** Angular 22 brings stable signals and zoneless change detection. Previous projects used these successfully.

**Decision:** Use `provideZonelessChangeDetection()`, signal-based inputs/outputs via `input()`/`output()`, and signals for all component state. No RxJS except for HTTP calls bridged via `firstValueFrom()`.

**Consequences:**
- ✅ Smaller bundle (no zone.js)
- ✅ Predictable change detection (only signal changes trigger updates)
- ✅ Simpler mental model (no async pipe, no subscription management)
- ❌ ngModel with signals requires careful handling (signal() for plain properties)

## ADR-4: Tailwind CSS v4 with PostCSS

**Context:** Tailwind CSS v4 moved from `tailwind.config.js` to CSS-first configuration. Angular 22's Vite build supports PostCSS.

**Decision:** Use `@tailwindcss/postcss` plugin with `postcss.config.js`. Define all custom tokens in `styles.css` via `@theme`.

**Consequences:**
- ✅ Works with Angular 22's build system
- ✅ Cleaner configuration (no config file)
- ✅ Full design system encapsulated in one CSS file
- ❌ Dark mode requires `@custom-variant dark` and manual class toggling

## ADR-5: Standalone Components with Lazy Routes

**Context:** No NgModules needed in modern Angular.

**Decision:** All components are standalone. Routes use `loadComponent` for lazy loading. No `app.module.ts`.

**Consequences:**
- ✅ Smaller initial bundle (pages loaded on demand)
- ✅ Simpler dependency graph
- ✅ Consistent with Angular 22 best practices

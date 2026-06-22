# Frontend Architecture — Interview Coach

## Signal Architecture

### State Management Pattern

Every page component follows the same signal pattern:

```typescript
const data = signal<T | null>(null);
const loading = signal(true);
const error = signal<string | null>(null);
```

Template rendering uses `@if` control flow:

```html
@if (loading()) { <skeleton /> }
@else if (error()) { <error-state /> }
@else if (!data()) { <empty-state /> }
@else { <content /> }
```

### Key Signal Patterns

**Loading/Empty/Error states** — Three-signal pattern on every data-driven page. Skeletons for loading, illustrations for empty, toasts for errors.

**Computed derived values** — Dashboard stats, category scores, and timer progress use `computed()` for reactive derived state.

**Timer management** — `setInterval`-based timer with cleanup in `ngOnDestroy`. Uses `signal()` with `update()` for countdown.

### Component Communication

- Parent → Child: signal inputs (`input<T>()`)
- Child → Parent: signal outputs (`output<T>()`)
- Services: shared signals via `providedIn: 'root'`

### Zoneless Notes

- All HTTP calls use `firstValueFrom()` to convert RxJS Observables to Promises
- No `async` pipe — template reads signals directly
- ngModel bindings work with signals but require calling the signal (e.g., `[value]="confirmPassword()"`)
- Angular 22's `noPropertyAccessFromIndexSignature: true` in tsconfig requires bracket notation for Record access (e.g., `errors['field']` instead of `errors.field`)

## Design System

All tokens are defined in `apps/web/src/styles.css` using Tailwind CSS v4's `@theme` directive:

```css
@theme {
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-accent-500: #a855f7;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

## Page Structure

| Page | Signals | Computed |
|------|---------|----------|
| Dashboard | stats, loading, error | — |
| New Interview | currentStep, submitting, selectedTechs | — |
| Interview Session | session, currentIndex, answer, remaining, feedback | currentQuestion, timerPercent, dimensions |
| Interview Summary | session, questions, loading | avgScore, categoryScores |
| Interview History | interviews, loading | — |
| Interview Detail | session, expandedQuestions | — |
| Profile | savingName, savingPassword, passwordErrors | — |

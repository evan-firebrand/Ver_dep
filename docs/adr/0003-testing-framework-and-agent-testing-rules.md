# ADR-0003: Testing Framework and Agent Testing Rules

## Status

Accepted

## Date

2026-04-09

## Context

The project had no test runner. The pre-push checklist enforced lint, typecheck, format, and build — but not tests. For agentic development, this is a critical gap:

- Agents can produce code that compiles and type-checks but doesn't work correctly (hallucinated logic).
- Without tests, regression detection depends entirely on `npm run build` (which only checks types and compilation) and human review.
- Tests serve as executable specifications that persist across agent sessions — a stronger contract than comments or documentation.

Next.js 16's official docs (`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`) recommend Vitest for unit/component testing and note that `async` Server Components cannot be unit-tested (E2E recommended for those).

## Decision

### Test Framework

- **Vitest** for unit and component tests — native ESM, fast startup, TypeScript via Vite, minimal config.
- **React Testing Library** (`@testing-library/react`) for component rendering and assertions.
- **`@testing-library/jest-dom`** for DOM matchers (`toHaveTextContent`, `toBeVisible`, etc.) via Vitest integration.
- **jsdom** as the test environment (simulates browser DOM).
- **Path aliases** resolved via Vite's native `resolve.tsconfigPaths: true` (no `vite-tsconfig-paths` plugin needed).

### Test Location and Naming

- **Co-located tests**: test files live next to their source (`src/lib/foo.ts` → `src/lib/foo.test.ts`).
- **Pattern**: `src/**/*.test.{ts,tsx}` (configured in `vitest.config.mts`).
- **Setup file**: `src/test-setup.ts` (loads `@testing-library/jest-dom/vitest` matchers globally).

### Agent Testing Rules

Nine rules added to CLAUDE.md:

1. Co-locate tests with source.
2. Test behavior, not implementation.
3. No snapshot tests.
4. Every module with logic gets a test.
5. Don't test the framework.
6. async Server Components → E2E only.
7. Test the unhappy path.
8. No coverage thresholds.
9. Use `npm run test` (not watch mode) in CI and pre-push.

### CI Integration

- `npm run test` added to the `checks` CI job (runs between Format and Build).
- `npm run test` added to the pre-push checklist (now 5 commands).
- `change-reminders` job now detects new source files without corresponding test files and posts an advisory reminder.

### E2E Testing (Deferred)

Playwright for E2E/async Server Component testing is deferred until there are actual user flows to test. The current project is a scaffolded Next.js starter with no application logic requiring E2E coverage.

## Consequences

- Agents must write tests for new logic — CI will fail if tests break, and change-reminders will flag missing tests.
- The pre-push checklist is now 5 commands (adds ~2-3 seconds locally).
- CI time increases by ~3-5 seconds (Vitest runs are fast).
- No coverage enforcement — test quality is assessed via PR review, not metrics.
- Snapshot testing is explicitly banned to prevent noisy agent diffs.

## Alternatives Considered

- **Jest:** Rejected — requires more configuration for ESM/TypeScript, slower startup, and Next.js 16 docs list Vitest first.
- **Coverage thresholds:** Rejected — percentage-based coverage creates perverse incentives for agents (writing trivial tests to hit numbers rather than testing behavior that matters).
- **`__tests__/` directory convention:** Rejected — co-location is better for agents because they see tests when reading source files, reducing context switching.
- **Snapshot tests:** Rejected — they break on any render change, creating false-positive failures and noisy diffs in agent PRs.

---

## Agent-Specific Sections

### Invariants

- [ ] `vitest.config.mts` exists at repo root
- [ ] `src/test-setup.ts` loads `@testing-library/jest-dom/vitest`
- [ ] `npm run test` runs `vitest run` (not watch mode)
- [ ] Test files use `.test.ts` or `.test.tsx` extension
- [ ] Test files are co-located with source (not in a separate `__tests__/` directory)
- [ ] No snapshot tests (`toMatchSnapshot`, `toMatchInlineSnapshot`)
- [ ] CI `checks` job includes a Test step

### Touchpoints

- `vitest.config.mts` — test runner configuration
- `src/test-setup.ts` — global test setup (matchers)
- `package.json` — `test` and `test:watch` scripts
- `.github/workflows/ci.yml` — Test step in checks job, missing-test reminder in change-reminders job
- `CLAUDE.md` — Testing section with rules, pre-push checklist
- `.github/pull_request_template.md` — Session Hygiene checklist

### Revisit Triggers

- Vitest major version bump that changes config format
- Need for E2E testing (add Playwright, write ADR-0004)
- Team decides coverage thresholds are needed after all
- React Testing Library drops jsdom support or recommends alternative
- Next.js adds native test support that replaces Vitest

### Related ADRs

- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — established CI pipeline this ADR extends
- [ADR-0002](./0002-intelligent-pr-validation.md) — established change-reminders job this ADR extends

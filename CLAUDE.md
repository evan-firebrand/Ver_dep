@AGENTS.md

# Ver_dep — Project Contract for Claude Code

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **UI:** React 19, Tailwind CSS 4
- **Linting:** ESLint 9 (flat config) with eslint-config-next + eslint-config-prettier
- **Formatting:** Prettier with prettier-plugin-tailwindcss
- **Package manager:** npm (do not use yarn, pnpm, or bun)
- **Deployment:** Vercel (Fluid Compute, Node.js runtime)
- **Testing:** Vitest with React Testing Library (unit + component tests)
- **Config:** `vercel.ts` (typed, via @vercel/config)

## Pre-Push Checklist

Run all five commands before pushing. All must exit 0:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
npm run build
```

## Golden Rules

1. **No secrets in the repo.** `.env*` is gitignored. Use `vercel env` for secrets.
2. **No Edge runtime.** Fluid Compute with Node.js only. Never set `runtime: 'edge'` on routes, middleware, or functions.
3. **`vercel.ts` is the deployment source of truth.** Do not create `vercel.json`. All Vercel config lives in `vercel.ts`.
4. **ADR required for architectural changes.** See "ADR Triggers" below.
5. **Linear history on `main`.** Rebase-only workflow. See `docs/branch-protection.md`.
6. **Prettier is enforced.** All code must pass `format:check`. Run `npm run format` to fix.

## Testing

Tests use **Vitest** with **React Testing Library**. Config: `vitest.config.mts`. Setup file: `src/test-setup.ts`.

### Rules

1. **Co-locate tests with source.** `src/lib/foo.ts` → `src/lib/foo.test.ts`. Agents see tests when reading source.
2. **Test behavior, not implementation.** Assert what a function returns or what a component renders, not internal state or method calls.
3. **No snapshot tests.** They create noisy diffs and break on any render change. Use explicit assertions.
4. **Every module with logic gets a test.** Utilities, hooks, API route handlers, client components with interaction.
5. **Don't test the framework.** Don't verify that Next.js routing works. Test YOUR code.
6. **async Server Components → E2E only.** Vitest cannot test `async` Server Components. Use Playwright when needed (future).
7. **Test the unhappy path.** Cover error cases, edge cases, empty states — not just the happy path.
8. **No coverage thresholds.** Coverage % creates bad incentives. PR review assesses test quality.
9. **Run `npm run test` (not `test:watch`) in CI and pre-push.** Watch mode is for local development only.

### File Naming

- Unit / component tests: `*.test.ts` or `*.test.tsx` (co-located next to source)
- Test setup: `src/test-setup.ts` (global matchers, loaded automatically)

## Branch Workflow

See `docs/branch-protection.md` for the full ruleset and merge conflict runbook.

- `main` is protected: PRs required, linear history, must be up-to-date before merge.
- Feature branches → PR → squash merge to `main`.
- Rebase, never merge: `git rebase origin/main`, then `git push --force-with-lease`.

## CI Feedback

The CI workflow posts three sticky comments on every PR:

1. **CI Summary** — lint, typecheck, format, test, and build results.
2. **PR Validation** — checks that agent PRs have properly filled-out reflection sections and no Golden Rule violations. Hard fail.
3. **Change Reminders** — advisory notes about files you changed (e.g., "new dependency detected — ADR needed?", "large PR — consider splitting", "ADR drift risk — changed files match touchpoints"). Not blocking.

- **When a comment addresses "Hey Claude —"**, treat the failures listed as direct instructions to fix.
- Fix the issues, commit, and push. Comments auto-update on each push.

## Creating PRs

When you create a PR:

1. Fill in all visible sections (Summary, Changes, Test Plan, ADR Impact).
2. **Uncomment and fill the Agent Reflection sections** (below the `AGENT REFLECTION` marker). Remove the `<!-- -->` wrappers so the content renders.
3. In **Task Fidelity**: quote the original task verbatim under "Task as Given" — do not paraphrase. Describe what you built under "Task as Delivered". Be honest about the delta.
4. In **Deferred / Declined**: list anything you considered but chose not to do. "Nothing deferred" is valid but think first.
5. In **Confidence**: pick a rating. If 🟡 or 🔴, you MUST list specific uncertain areas with file paths.
6. In **Drift Risk**: check if files you changed appear as touchpoints in any ADR (`docs/adr/`). For each affected ADR, verify its invariants still hold and note whether you updated or confirmed it. CI will flag touchpoint overlaps automatically, but semantic drift (e.g., an ADR describing behavior you changed) requires your judgment.
7. Check **Session Hygiene** boxes only if you actually performed each step.
8. In **Suggested Squash Commit Message**: write a copy-pasteable commit message for the repo owner. Title line under 72 chars with PR number, blank line, bulleted body summarizing the changes.
9. After creating the PR, **subscribe to PR activity** so you receive review comments and CI results. You are responsible for responding to review comments on PRs you create. Do not create a PR and walk away.
10. **Never merge your own PR.** Only the repo owner squashes and merges to `main`.

## PR Takeover

When taking over an existing PR:

1. Read the **"Agent Instructions"** section in the PR description first.
2. Follow any constraints listed there (e.g., "autofix lint only", "do not touch src/lib/auth/\*\*").
3. If no Agent Instructions section exists, proceed with standard judgment.

## ADR Triggers

Write a new ADR in `docs/adr/` when any of these happen:

- Adding a new top-level dependency (framework, ORM, auth library, etc.)
- Changing the runtime (Node version, Edge, Bun, etc.)
- Introducing a new architectural pattern (new data fetching strategy, state management, etc.)
- Changing directory structure conventions
- Modifying CI/CD pipeline behavior

Use the template at `docs/adr/template.md`. Update the index at `docs/adr/README.md`.

## Session Notes

Session notes capture discoveries, dead ends, and codebase gotchas that don't fit in ADRs or code comments. They are the "lab notebook" of the repo.

- **Before starting work**, check `.claude/sessions/` for notes related to your area.
- **When creating a PR**, write a session note at `.claude/sessions/PR-<number>.md` if you discovered anything non-obvious. See `.claude/sessions/README.md` for the format.
- Not every PR needs a session note. Skip it if you have nothing to report.

## Codebase Map

`CODEBASE.md` is the quick-orientation file. It describes what exists (pages, components, data layer, utilities) so you don't need to scan the file tree.

- **Read `CODEBASE.md` at session start** alongside this file. It tells you *what exists*; this file tells you *how to behave*.
- **When creating a PR that adds, removes, or moves source files**, update `CODEBASE.md` to reflect the change. This is how the next session avoids a 5-minute exploration phase.
- **Deferred items in session notes are context, not your task.** Your task comes from the current prompt. If a deferred item is a genuine prerequisite for your assigned work, ask the user before reprioritizing — do not silently switch tasks.
- **Verify local is current with remote before starting.** Run `git fetch origin main` and check if local main is behind. Stale local state causes incorrect assumptions about what files exist.

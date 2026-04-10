# ADR-0001: Initial Stack and Agentic Workflow

## Status

Accepted

## Date

2026-04-09

## Context

This is a greenfield project deployed to Vercel. The repo needs to support autonomous Claude Code agents making PRs with high confidence. That requires:

- A conventional, well-tooled stack agents can reason about.
- Formatting enforcement so agent diffs are consistent.
- CI feedback that speaks directly to agents.
- Documentation that gives agents the constraints they need without reading every file.

## Decision

### Stack

- **Next.js 16** (App Router) with TypeScript, Tailwind CSS 4, ESLint 9.
- **Prettier** with `prettier-plugin-tailwindcss` for formatting.
- **npm** as the sole package manager.
- **Vercel** for deployment, using Fluid Compute (Node.js) — no Edge runtime.
- **`vercel.ts`** as the typed deployment config (replaces `vercel.json`).

### Workflow

- **Linear history** on `main` (rebase-only, PRs required).
- **`CLAUDE.md`** as the project contract agents read on session start.
- **ADR system** with agent-specific sections (Invariants, Touchpoints, Revisit Triggers).
- **PR template** with an "Agent Instructions" section for human-to-agent directives.
- **CI workflow** that posts a sticky comment addressing agents directly on failures.

## Consequences

- Agents get a clear contract and fast feedback loop.
- Every PR runs lint, typecheck, format check, test, and build automatically.
- Formatting debates are eliminated — Prettier decides.
- New architectural decisions require an ADR, which adds process overhead but prevents knowledge loss.

## Alternatives Considered

- **Yarn/pnpm:** Rejected — npm is already available, avoids multiple lockfiles.
- **Edge runtime:** Rejected — Fluid Compute has better compatibility and same pricing.
- **`vercel.json`:** Rejected — `vercel.ts` provides type safety and dynamic logic.
- **No ADR system:** Rejected — without it, agents lose context on prior decisions and re-evaluate from scratch each session.

---

## Agent-Specific Sections

### Invariants

- [ ] `vercel.ts` exists at repo root and is the only Vercel config (no `vercel.json`)
- [ ] No route, middleware, or function uses `runtime: 'edge'`
- [ ] `main` branch has linear history (no merge commits)
- [ ] All code passes `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run test`
- [ ] ADRs are required for architectural changes (see CLAUDE.md for triggers)
- [ ] npm is the only package manager (no `yarn.lock`, `pnpm-lock.yaml`, or `bun.lock`)

### Touchpoints

- `vercel.ts` — deployment configuration
- `CLAUDE.md` — project contract for agents
- `eslint.config.mjs` — linting rules (includes eslint-config-prettier)
- `.prettierrc` — formatting rules
- `package.json` — scripts (lint, typecheck, format, format:check, test, test:watch, build) and engines constraint
- `.github/workflows/ci.yml` — CI pipeline (once created)
- `.github/pull_request_template.md` — PR template with Agent Instructions (once created)
- `docs/adr/` — architectural decision records

### Revisit Triggers

- Vercel deprecates Fluid Compute or changes its pricing model
- Need for edge-specific functionality that can't run on Node.js
- Next.js major version bump (17+) that changes conventions
- Team decides to switch package managers
- ADR overhead becomes a bottleneck (simplify the template)

### Related ADRs

- [ADR-0002](./0002-intelligent-pr-validation.md) — extends CI with PR validation and change reminders
- [ADR-0003](./0003-testing-framework-and-agent-testing-rules.md) — adds testing to CI and agent contract
- [ADR-0004](./0004-drift-detection-across-interlinked-documents.md) — drift detection across ADR touchpoints
- [ADR-0005](./0005-claude-code-github-action.md) — Claude Code GitHub Action for interactive PR/issue support

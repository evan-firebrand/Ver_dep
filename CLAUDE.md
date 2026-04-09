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
- **Config:** `vercel.ts` (typed, via @vercel/config)

## Pre-Push Checklist

Run all four commands before pushing. All must exit 0:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Golden Rules

1. **No secrets in the repo.** `.env*` is gitignored. Use `vercel env` for secrets.
2. **No Edge runtime.** Fluid Compute with Node.js only. Never set `runtime: 'edge'` on routes, middleware, or functions.
3. **`vercel.ts` is the deployment source of truth.** Do not create `vercel.json`. All Vercel config lives in `vercel.ts`.
4. **ADR required for architectural changes.** See "ADR Triggers" below.
5. **Linear history on `main`.** Rebase-only workflow. See `docs/branch-protection.md`.
6. **Prettier is enforced.** All code must pass `format:check`. Run `npm run format` to fix.

## Branch Workflow

See `docs/branch-protection.md` for the full ruleset and merge conflict runbook.

- `main` is protected: PRs required, linear history, must be up-to-date before merge.
- Feature branches → PR → squash merge to `main`.
- Rebase, never merge: `git rebase origin/main`, then `git push --force-with-lease`.

## CI Feedback

The CI workflow posts a sticky comment on every PR with lint, typecheck, and build results.

- **When the comment addresses "Hey Claude —"**, treat the failures listed as direct instructions to fix.
- Fix the issues, commit, and push. The comment auto-updates on each push.

## Creating PRs

When you create a PR:

1. Fill in all visible sections (Summary, Changes, Test Plan, ADR Impact).
2. **Uncomment and fill the Agent Reflection sections** (below the `AGENT REFLECTION` marker). Remove the `<!-- -->` wrappers so the content renders.
3. In **Task Fidelity**: quote the original task verbatim under "Task as Given" — do not paraphrase. Describe what you built under "Task as Delivered". Be honest about the delta.
4. In **Deferred / Declined**: list anything you considered but chose not to do. "Nothing deferred" is valid but think first.
5. In **Confidence**: pick a rating. If 🟡 or 🔴, you MUST list specific uncertain areas with file paths.
6. Check **Session Hygiene** boxes only if you actually performed each step.
7. In **Suggested Squash Commit Message**: write a copy-pasteable commit message for the repo owner. Title line under 72 chars with PR number, blank line, bulleted body summarizing the changes.
8. After creating the PR, **subscribe to PR activity** so you receive review comments and CI results. You are responsible for responding to review comments on PRs you create. Do not create a PR and walk away.
9. **Never merge your own PR.** Only the repo owner squashes and merges to `main`.

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

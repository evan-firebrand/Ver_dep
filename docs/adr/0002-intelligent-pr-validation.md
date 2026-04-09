# ADR-0002: Intelligent PR Validation and Agent Session Notes

## Status

Accepted

## Date

2026-04-09

## Context

PR #2 established a reflective PR template and CI pipeline, but compliance was honor-system only. Nothing prevented an agent from skipping reflection sections, violating Golden Rules, or creating oversized PRs. Additionally, each Claude Code session starts with no memory of prior sessions, leading to repeated discovery of the same codebase gotchas.

## Decision

### CI Guardian Checks

Add two new jobs to the CI workflow, running in parallel with lint/typecheck/build:

1. **`pr-validation`** (hard fail) — validates PR description completeness and checks for Golden Rule violations:
   - Agent reflection sections must be uncommented and filled (required headings, substantive content, confidence rating, squash commit message)
   - No `vercel.json`, no `runtime: 'edge'`, no wrong package manager lockfiles, no `.env` files
   - Human and Dependabot PRs skip description validation automatically (Golden Rule checks still apply)

2. **`change-reminders`** (advisory, never fails) — contextual reminders based on changed files:
   - New dependency → ADR trigger reminder
   - Deployment/tooling config changes → verification reminders
   - CI pipeline or agent contract changes → ADR trigger reminder
   - PR size guardrails: warns if >500 lines changed or >15 files touched
   - New source files without tests → co-location reminder (added by ADR-0003)
   - ADR drift detection → flags when changed files match ADR touchpoints (added by ADR-0004)

Each job posts its own sticky comment with a distinct header so comments don't overwrite each other.

### Agent Session Notes

A `.claude/sessions/` directory for agents to capture discoveries, dead ends, and codebase gotchas per PR. Session notes are informal, discovery-focused, and optional — only written when an agent has something non-obvious to report.

## Consequences

- Agent PRs that skip reflection sections get a hard CI failure and a "Hey Claude —" message telling them what to fix.
- Golden Rule violations are caught before human review.
- Change-aware reminders act as institutional memory — conventions are enforced even for fresh agent sessions.
- PR size warnings catch scope creep early.
- Session notes reduce repeated discovery across agent sessions.
- Adds ~30 seconds to CI time (new jobs are lightweight, run in parallel).
- Human PRs are not penalized by the description validator.

## Alternatives Considered

- **Single job for all checks:** Rejected — keeping validation and reminders in separate jobs allows the advisory checks to always pass while validation can hard-fail.
- **External actions for PR linting:** Rejected — `actions/github-script` is sufficient and avoids adding third-party dependencies.
- **Session notes in PR comments:** Rejected — comments are ephemeral and hard to search. Files in the repo are grep-able and version-controlled.

---

## Agent-Specific Sections

### Invariants

- [ ] `pr-validation` job MUST fail the build on Golden Rule violations
- [ ] `pr-validation` job MUST skip description checks for human and Dependabot PRs
- [ ] `change-reminders` job MUST NOT fail the build under any circumstances
- [ ] All three sticky comments use distinct `header` values (`ci-summary`, `pr-validation`, `change-reminders`)
- [ ] Session notes directory exists at `.claude/sessions/`

### Touchpoints

- `.github/workflows/ci.yml` — all three CI jobs
- `.github/pull_request_template.md` — the template being validated
- `CLAUDE.md` — CI Feedback section (documents all three comments), Session Notes section
- `.claude/sessions/README.md` — session notes format and guidance

### Revisit Triggers

- PR template structure changes significantly (heading names, section order)
- GitHub adds native support for required PR template fields
- False positives from description validator become burdensome
- Session notes directory grows large enough to need indexing or archival

### Related ADRs

- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — established the CI pipeline and PR template this ADR extends
- [ADR-0003](./0003-testing-framework-and-agent-testing-rules.md) — adds missing-test-file reminder to the change-reminders job

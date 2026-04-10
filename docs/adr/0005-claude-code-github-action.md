# ADR-0005: Claude Code GitHub Action for Interactive PR/Issue Support

## Status

Accepted

## Date

2026-04-10

## Context

Claude Code agents currently operate only through manual CLI sessions. When a human opens a PR or files an issue, an agent must be launched in a local terminal, given context, and manually pointed at the work. This creates friction:

- Contributors cannot ask questions or request changes directly on GitHub.
- CI posts "Hey Claude" failure messages, but no agent is listening to act on them.
- Issue triage and labeling require a human to start a session.

Anthropic ships [`claude-code-action`](https://github.com/anthropics/claude-code-action), a GitHub Action that embeds Claude Code in the CI/CD pipeline. It supports interactive mode (`@claude` mentions) and automation mode (prompt-driven tasks on events like PR open). The action reads `CLAUDE.md` and project MCP configs automatically, so it inherits the project contract without additional configuration.

## Decision

Add a new workflow `.github/workflows/claude.yml` that enables **interactive mode**:

- **Trigger phrase:** `@claude` (default) in any PR comment, issue comment, or review comment.
- **Issue assignment:** assigning the `claude` user to an issue triggers the action.
- **Label trigger:** applying a `claude` label to an issue triggers the action.
- **CI access:** `actions: read` permission lets Claude inspect workflow logs and diagnose failures.
- **Write access:** `contents: write` lets Claude make code changes and push commits when requested.

This is a **separate workflow** from `ci.yml`. The existing CI pipeline (`checks`, `pr-validation`, `change-reminders`) is unchanged. The Claude Action workflow runs independently, triggered by comment/assignment events rather than PR pushes.

Automated PR review (triggering on `pull_request` events with a review prompt) is intentionally deferred. It can be added as a second job in this workflow once interactive mode is validated.

## Consequences

- Contributors can `@claude` on any PR or issue to get answers, request code changes, or ask for reviews.
- Agents invoked via the action inherit `CLAUDE.md`, so Golden Rules, ADR awareness, and testing requirements apply.
- API costs scale with usage — each `@claude` mention triggers an API call. No automated triggers means costs are human-initiated only.
- The action uses `GITHUB_TOKEN` by default for GitHub operations. A custom GitHub App is optional but not required.
- `ANTHROPIC_API_KEY` must be added as a repository secret.

## Alternatives Considered

- **Automated PR review on every push:** Rejected for initial rollout — adds API cost on every commit and may produce noisy feedback before the team calibrates prompts. Can be added later as a second job.
- **Self-hosted runner with persistent Claude session:** Rejected — over-engineered for the current project size. The action's per-invocation model is simpler.
- **Using only the Claude Code CLI in local terminals:** This is the status quo. It works but doesn't enable GitHub-native interaction.

---

## Agent-Specific Sections

### Invariants

- [ ] `.github/workflows/claude.yml` exists and is the only Claude Action workflow
- [ ] The workflow does NOT trigger on `pull_request` events (automated review is deferred)
- [ ] `ANTHROPIC_API_KEY` is configured as a repository secret (not committed to the repo)
- [ ] The workflow does not modify or duplicate any checks from `ci.yml`
- [ ] `contents: write` permission is present (Claude needs to push code changes)
- [ ] `actions: read` permission is present (Claude needs to read CI logs)

### Touchpoints

- `.github/workflows/claude.yml` — the Claude Code Action workflow
- `.github/workflows/ci.yml` — existing CI pipeline (must remain independent)
- `CLAUDE.md` — project contract automatically read by the action
- `AGENTS.md` — agent instructions automatically read by the action

### Revisit Triggers

- Claude Code Action releases a major version (v2) with breaking changes
- Team wants automated PR review (add `pull_request` trigger and review prompt as a second job)
- API costs become a concern (add rate limiting, model selection, or max-turns constraints)
- Team adopts a custom GitHub App for commit signing or enhanced permissions

### Related ADRs

- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — defines the CI pipeline this workflow complements
- [ADR-0002](./0002-intelligent-pr-validation.md) — PR validation and "Hey Claude" feedback messages that the action can now respond to

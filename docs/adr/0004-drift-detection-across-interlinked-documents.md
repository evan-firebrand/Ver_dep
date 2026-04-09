# ADR-0004: Drift Detection Across Interlinked Documents

## Status

Accepted

## Date

2026-04-09

## Context

The project's documentation system — CLAUDE.md, ADRs, CI workflow, and PR template — contains interlinked references to the same concepts (e.g., the pre-push checklist, CI step names, tooling config files). When one document changes, the others can silently go stale. This was demonstrated when ADR-0003 (testing) added a test step to CI but left ADR-0001's invariants, consequences, and touchpoints referencing only the original 3 checks.

For agentic development, stale invariants are especially dangerous: agents treat ADR invariants as ground truth. A stale invariant can cause an agent to enforce an outdated constraint or miss a required check.

The root cause is that the same fact lives in multiple places with no mechanism to detect when they diverge.

## Decision

### Three-Layer Drift Detection

#### Layer 1: Agent Awareness (CLAUDE.md instruction)

Add a step to "Creating PRs" that tells agents to check if files they changed appear as touchpoints in any ADR. Agents must verify invariants still hold and report their assessment in the PR.

This ensures agents _think about_ cross-system impact during PR creation. It catches semantic drift that file-level checks cannot (e.g., "I changed how tests work but ADR-0001 still describes the old behavior").

#### Layer 2: Agent Self-Report (PR template — Drift Risk section)

Add a `## Drift Risk` section to the agent reflection template. Agents fill in a table listing which ADRs have touchpoints overlapping with their changes, and whether they verified or updated each one. PR validation (hard fail) requires this section to have real content — either an ADR table or an explicit "No drift risk" statement.

This creates an audit trail: reviewers see whether the agent considered drift, and what it concluded.

#### Layer 3: CI Automated Detection (change-reminders)

Add ADR touchpoint parsing to the `change-reminders` CI job. The job reads all ADR files, extracts touchpoints from the `### Touchpoints` section, and cross-references against the PR's changed files. When overlaps are found, it posts an advisory reminder listing the affected ADRs and touchpoints.

This catches cases where the agent forgot to check or assessed incorrectly. It is advisory (never fails) because file-level overlap does not guarantee drift — the agent's judgment determines whether invariants actually need updating.

### Touchpoint Format Convention

ADR touchpoints follow a machine-parseable format that CI depends on:

```markdown
- `path/to/file.ts` — description
- `path/to/directory/` — trailing slash for directories
```

The CI parser:

- Only reads lines under `### Touchpoints` (avoids false matches elsewhere in ADRs)
- Skips `template.md` and `README.md`
- Filters out non-path entries (lines starting with `npm `, `grep `, etc.)
- Matches directory touchpoints (ending with `/`) against any changed file under that prefix

### Principle: Reference, Don't Restate

To reduce future drift, ADR invariants that duplicate state from CLAUDE.md should prefer referencing the canonical source (e.g., "All pre-push checks pass — see CLAUDE.md") over restating the full list. The canonical locations are:

- **Pre-push checklist**: CLAUDE.md → "Pre-Push Checklist"
- **Golden Rules**: CLAUDE.md → "Golden Rules"
- **Testing rules**: CLAUDE.md → "Testing"
- **CI check steps**: `.github/workflows/ci.yml` (the code is the source of truth)

## Consequences

- Agents are now explicitly responsible for assessing drift when creating PRs.
- Reviewers can verify drift assessment via the Drift Risk section.
- CI automatically flags file-level touchpoint overlaps as advisory reminders.
- The ADR template documents the touchpoint format convention that CI depends on.
- PR validation requires the Drift Risk section, adding one more field for agents to fill.
- The change-reminders job reads ADR files on each PR (~3 ADRs today, milliseconds; scales to hundreds before being a concern).

## Alternatives Considered

- **Structured invariants file (JSON):** Rejected for now — adds complexity at 3 ADRs. Revisit at 8+ ADRs if convention-based approach breaks down.
- **Hard-fail on touchpoint overlap:** Rejected — file overlap does not guarantee drift. Making it advisory avoids false-positive CI failures that would train agents to ignore the check.
- **Automated invariant validation (CI checks CLAUDE.md against ADR content):** Rejected — too brittle. Natural language invariants can't be reliably machine-compared. The three-layer approach uses the agent's judgment for semantic checking and CI for file-level checking.
- **Single-source-of-truth with no duplication:** Not fully achievable — CI is code (YAML), docs are prose (Markdown), PR templates are forms. Some redundancy is inherent. The goal is to detect and manage drift, not eliminate all duplication.

---

## Agent-Specific Sections

### Invariants

- [ ] CLAUDE.md "Creating PRs" section includes drift check instruction
- [ ] PR template has a `## Drift Risk` section in the agent reflection
- [ ] PR validation requires the `Drift Risk` heading for agent PRs
- [ ] PR validation rejects placeholder content in Drift Risk
- [ ] `change-reminders` job parses ADR touchpoints and flags overlaps with changed files
- [ ] `change-reminders` drift detection is advisory (never fails the build)
- [ ] ADR template documents the touchpoint format convention
- [ ] Touchpoint parsing skips `template.md` and `README.md`

### Touchpoints

- `CLAUDE.md` — "Creating PRs" step 6 (drift check instruction), "CI Feedback" item 3 (change reminders description)
- `.github/pull_request_template.md` — Drift Risk section in agent reflection
- `.github/workflows/ci.yml` — PR validation (Drift Risk heading + content check), change-reminders (ADR drift detection block)
- `docs/adr/template.md` — Touchpoints format guidance

### Revisit Triggers

- ADR count exceeds ~8 and touchpoint parsing becomes noisy (too many reminders)
- Touchpoint format changes break the CI parser
- Agents consistently report "No drift risk" without actually checking (gaming the system)
- Structured invariants file (JSON) becomes worthwhile at scale

### Related ADRs

- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — established ADR system with touchpoints format
- [ADR-0002](./0002-intelligent-pr-validation.md) — established change-reminders job this ADR extends
- [ADR-0003](./0003-testing-framework-and-agent-testing-rules.md) — the drift event that motivated this ADR

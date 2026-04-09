# ADR-NNNN: Title

## Status

Proposed | Accepted | Superseded by [ADR-XXXX](./XXXX-title.md)

## Date

YYYY-MM-DD

## Context

What is the issue that we're seeing that motivates this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

## Alternatives Considered

What other options were evaluated and why were they rejected?

---

## Agent-Specific Sections

### Invariants

Checkable statements that future agents MUST NOT break. Write these as assertions:

- [ ] Example: `vercel.ts` exists and is the only Vercel config file (no `vercel.json`)
- [ ] Example: No route or function uses `runtime: 'edge'`

### Touchpoints

File paths that implement this decision. CI parses this section to detect drift — when a PR changes a file listed here, the change-reminders comment flags it. Use this exact format:

- `path/to/file.ts` — description of relevance
- `path/to/directory/` — trailing slash for directory-level touchpoints

### Revisit Triggers

Conditions under which an agent should propose superseding this ADR:

- Example: "If Vercel deprecates Fluid Compute"
- Example: "If Next.js drops support for X"

### Related ADRs

- [ADR-XXXX](./XXXX-title.md) — relationship description

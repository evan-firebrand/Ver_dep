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

File paths, symbols, or grep strings that implement this decision. Agents should check these files when evaluating whether the decision still holds:

- `path/to/file.ts` — description of relevance
- `grep -r "pattern"` — what this search reveals

### Revisit Triggers

Conditions under which an agent should propose superseding this ADR:

- Example: "If Vercel deprecates Fluid Compute"
- Example: "If Next.js drops support for X"

### Related ADRs

- [ADR-XXXX](./XXXX-title.md) — relationship description

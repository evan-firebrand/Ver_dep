# Agent Session Notes

## What This Is

Session notes capture what an agent _discovered_ during a session — gotchas, dead ends, codebase quirks, non-obvious dependencies. This is knowledge that doesn't fit in an ADR (it's not an architectural decision) and doesn't fit in code comments (it's not about a specific line).

## Why This Exists

Each Claude Code session starts fresh with no memory of prior sessions. Without session notes, agents re-discover the same gotchas, waste context window exploring dead ends, and lose tribal knowledge that would help future work.

Session notes are the "lab notebook" of the repo — informal, discovery-focused, and indexed by PR for traceability.

## When to Write a Session Note

Write a session note when you create a PR and any of these apply:

- You discovered something non-obvious about the codebase
- You hit a dead end that a future agent should avoid
- You found an undocumented dependency between components
- You learned something about the deployment or runtime behavior
- You identified tech debt or fragile areas worth noting

If none of these apply, skip it — not every PR needs a session note.

## Format

File: `.claude/sessions/PR-<number>.md`

```markdown
# Session Notes — PR #<number>: <short title>

## Date

YYYY-MM-DD

## Discoveries

- What you learned that wasn't obvious from reading the code

## Dead Ends

- Approaches you tried that didn't work, and why

## Codebase Gotchas

- Non-obvious behavior, implicit dependencies, fragile areas

## Future Agent Advice

- What you'd tell a future agent working in the same area
```

Sections are optional — only include sections that have content. An empty section is noise.

## For Future Agents

Before starting work on an area of the codebase, check if relevant session notes exist:

```
ls .claude/sessions/
```

Read any notes related to the area you're working in. They may save you significant time.

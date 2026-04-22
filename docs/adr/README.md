# Architecture Decision Records (ADRs)

## What Are ADRs?

ADRs document significant architectural decisions. Each ADR captures the context, decision, consequences, and — critically for this repo — **agent-specific metadata** that helps Claude Code agents understand constraints without re-reading the entire codebase.

## When to Write an ADR

See `CLAUDE.md` → "ADR Triggers" for the full list. In short: any change that affects how the system is structured, deployed, or maintained.

## How to Write an ADR

1. Copy `template.md` to `NNNN-short-title.md` (next sequential number).
2. Fill in all sections, especially the agent-specific ones (Invariants, Touchpoints, Revisit Triggers).
3. Add the entry to the index below.
4. Include the ADR in the same PR as the change it documents.

## Index

| ADR                                                            | Title                                        | Status     | Date       |
| -------------------------------------------------------------- | -------------------------------------------- | ---------- | ---------- |
| [0001](./0001-initial-stack-and-agentic-workflow.md)           | Initial Stack and Agentic Workflow           | Accepted   | 2026-04-09 |
| [0002](./0002-intelligent-pr-validation.md)                    | Intelligent PR Validation and Session Notes  | Accepted   | 2026-04-09 |
| [0003](./0003-testing-framework-and-agent-testing-rules.md)    | Testing Framework and Agent Testing Rules    | Accepted   | 2026-04-09 |
| [0004](./0004-drift-detection-across-interlinked-documents.md) | Drift Detection Across Interlinked Documents | Accepted   | 2026-04-09 |
| [0005](./0005-claude-code-github-action.md)                    | Claude Code GitHub Action                    | Accepted   | 2026-04-10 |
| [0006](./0006-notion-read-only-data-layer.md)                  | Notion as Read-Only Data Layer               | Superseded | 2026-04-13 |
| [0007](./0007-use-cache-for-notion-queries.md)                 | Use Cache Directive for Query Caching        | Accepted   | 2026-04-13 |
| [0008](./0008-supabase-read-only-data-layer.md)                | Supabase as Read-Only Data Layer             | Accepted   | 2026-04-14 |
| [0009](./0009-nav-suspense-island.md)                          | Nav Renders a Client Island Inside Suspense  | Accepted   | 2026-04-22 |
| [0010](./0010-font-strategy.md)                                | Self-Host Geist Fonts as Local woff2 Files   | Accepted   | 2026-04-22 |

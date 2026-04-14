# Current State — NOLA Music Tracker (as of 2026-04-14)

## What's on main (11 commits)

| PR | Content |
|---|---|
| #1 | Next.js 16 scaffold |
| #2 | Dev tooling, Vercel config, CLAUDE.md, ADR-0001, CI, PR template |
| #3 | PR validation, change-reminders, session notes, ADR-0002 |
| #4 | Node.js 20 deprecation fix |
| #5 | GitHub Actions upgrade to Node.js 24 |
| #6 | Vitest + RTL, ADR-0003, ADR-0004 (drift detection) |
| #7 | Claude Code GitHub Action, ADR-0005 |
| #11 | Notion client, types, mappers, queries, ADR-0006 |
| #12 | Landing page, events, venues, components, Nav, font fix |
| #13 | `use cache`, Partial Prerender, ADR-0007, AGENTS.md fix |

## Unmerged branches

| Branch | Content | Action needed |
|---|---|---|
| `claude/build-weekly-events-view-fK5rR` | Phase 3: This-week view, filters, formatters, FilterBar, ThisWeekView | Merge — all new files, no conflicts |
| `claude/build-acts-pages-0cexO` | Acts pages, ActCard, resolve-relations, search stub | Rebase onto main after Phase 3 merges, then merge |
| `claude/browser-use-feature-OSRMV` | Quarantined session note (stress test planning) | Keep until Phase 8 |
| `claude/supabase-seed-script` | Seed SQL generation script, CSV data | Merge or keep as utility branch |
| `evan/upload-dats-acts-venues-events` | Raw CSV exports + acts pages (duplicate of above) | Delete after seed data confirmed |

## ADRs (7 total)

| ADR | Decision |
|---|---|
| 0001 | Initial stack + agentic workflow |
| 0002 | PR validation + change reminders |
| 0003 | Testing framework + rules |
| 0004 | Drift detection (three-layer) |
| 0005 | Claude Code GitHub Action |
| 0006 | Notion as data layer (BEING REPLACED — pivot to Supabase) |
| 0007 | `use cache` for Notion queries (needs update for Supabase) |

## Session notes

| File | Content |
|---|---|
| PR-12.md | Google Fonts fix, RTL cleanup bug, Next.js 16 params, Notion IDs as slugs |
| PR-13.md | `connection()` required for `use cache`, error bypass at prerender, mock patterns |

## Database (Supabase)

- **Project:** NolaMusicTracker
- **Tables:** venues (56), acts (14), events (126), event_acts (empty)
- **Schema:** serial IDs, foreign keys, RLS with public read, indexes on date/venue/type
- **Seed script:** `scripts/generate-seed-sql.mjs` reads CSVs from `data/csv/`

## Environment variables needed

| Variable | Where | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | `https://fmjiwsvdesswawfstnxz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Publishable key from Supabase dashboard |
| `ANTHROPIC_API_KEY` | Vercel (repo secret) | For Claude Code GitHub Action |

## Next steps

1. Merge Phase 3 branch (this-week view)
2. Rebase and merge Phase 4 branch (acts pages)
3. Swap data layer from Notion to Supabase (new agent session)
4. Update ADR-0006 and ADR-0007 for Supabase
5. Fix PR validation regex for Drift Risk (`[ADR-0001]` format)
6. Add CLAUDE.md rule: deferred items are context, not assigned task
7. Add CLAUDE.md instruction: check local is current with remote before starting
8. Continue Phases 5-8 of stress test

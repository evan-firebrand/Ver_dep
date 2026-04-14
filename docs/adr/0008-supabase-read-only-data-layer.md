# ADR-0008: Supabase as Read-Only Data Layer for NOLA Music Tracker

## Status

Accepted

## Date

2026-04-14

## Context

ADR-0006 established Notion as the read-only data layer for this app, with the Supabase migration listed as a "Revisit Trigger". That trigger has now fired: a Supabase project (`NolaMusicTracker`) has been created and pre-populated with the same event, venue, and act data that previously lived in Notion databases.

Supabase provides a standard PostgreSQL database with an auto-generated REST API (via PostgREST), a typed JavaScript client (`@supabase/supabase-js`), row-level security, and Vercel-compatible serverless query patterns. Migrating to Supabase eliminates the dependency on the Notion `@notionhq/client` SDK and its bespoke property-extraction layer.

## Decision

Use `@supabase/supabase-js` as the sole mechanism for reading application data. All database access is encapsulated in `src/lib/supabase/`:

- **`types.ts`** — clean TypeScript interfaces mirroring the Supabase schema; enum-like union types for all enum-style text columns
- **`client.ts`** — lazy singleton wrapping `createClient` from `@supabase/supabase-js`; reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the environment
- **`queries.ts`** — one async function per table (`getEvents`, `getVenues`, `getActs`) with inline row mapping; events query joins `event_acts` to resolve act associations
- **`resolve-relations.ts`** — `buildLookup` / `resolveIds` utilities for O(1) cross-entity lookups (unchanged from the Notion layer)
- **`index.ts`** — barrel export of types and query functions

**Supabase is read-only from the frontend.** No writes are made from application code.

**`SUPABASE_URL` and `SUPABASE_ANON_KEY`** must be set in Vercel environment variables (not committed to the repo, per Golden Rule 1). The anon key is a publishable key by design — RLS policies control actual data access.

**Schema and type mapping:**

| Table        | Domain type | Notes                                                                                                    |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------- |
| `events`     | `NolaEvent` | `venue_id` (single FK integer) maps to `venueId: string \| null`; act IDs resolved via `event_acts` join |
| `venues`     | `Venue`     | Direct column mapping                                                                                    |
| `acts`       | `Act`       | `genres` is a native `text[]` array                                                                      |
| `event_acts` | —           | Junction table; joined into `getEvents()` to populate `actIds`                                           |

Integer primary keys are stringified (`String(row.id)`) at the mapping layer so all existing page routing (URL params are strings) and lookup logic remains unchanged.

The `Organization` and `Resource` entities from the Notion layer have no corresponding Supabase tables and are not implemented.

## Consequences

**Easier:**

- No bespoke property-extraction layer. Supabase returns typed JSON that maps directly to domain types.
- Standard SQL querying — no Notion-specific pagination loops, no `isFullPage` guards.
- Schema changes in Supabase are reflected after updating `types.ts` and the inline mappers in `queries.ts`.

**Harder:**

- Row-level security policies must be configured to allow the anon key to read the necessary tables. If RLS blocks queries, data will silently appear empty.
- Supabase integer PKs are stringified. Any new code that compares IDs must use string equality, not numeric comparison.
- The `event_acts` junction table is queried via a nested select (`event_acts(act_id)`). If the schema adds more junction tables, each will need its own join in the relevant query function.

## Alternatives Considered

- **Keep Notion as data layer:** Notion's `@notionhq/client` SDK uses a non-standard pagination API (`dataSources.query`) and requires significant boilerplate (property-utils, mappers) for every schema change. Rejected in favour of Supabase's simpler query model.
- **Static JSON export from Notion:** Snapshot-based, no live data, requires scheduled rebuilds. Rejected.
- **Direct `fetch` against Supabase REST API:** Avoids adding `@supabase/supabase-js` but loses the typed client, auto-generated types, and PostgREST query helpers. Rejected.

---

## Agent-Specific Sections

### Invariants

- [ ] `src/lib/supabase/` contains all Supabase access; no other file imports `@supabase/supabase-js` directly
- [ ] `SUPABASE_URL` and `SUPABASE_ANON_KEY` are never committed to the repo (environment variables only)
- [ ] All query functions are read-only (`supabase.from(...).select(...)`, never `.insert()`, `.update()`, or `.delete()`)
- [ ] Integer PKs from Supabase are stringified (`String(row.id)`) before entering domain types
- [ ] `@notionhq/client` is not present in `package.json`

### Touchpoints

- `src/lib/supabase/` — entire directory implements this decision
- `package.json` — `@supabase/supabase-js` production dependency; `@notionhq/client` removed
- `docs/adr/0001-initial-stack-and-agentic-workflow.md` — Golden Rule: no secrets in repo
- `docs/adr/0006-notion-read-only-data-layer.md` — superseded by this ADR

### Revisit Triggers

- The project requires write access to Supabase from the frontend (switch to service-role key with appropriate auth)
- Schema changes require updating `types.ts` and inline mappers in `queries.ts`
- The data layer needs to support Organizations or Resources (add new tables and query functions)
- `@supabase/supabase-js` has a breaking API change requiring client updates

### Related ADRs

- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — stack and Golden Rules (no secrets in repo)
- [ADR-0006](./0006-notion-read-only-data-layer.md) — superseded; Notion was the previous data layer
- [ADR-0007](./0007-use-cache-for-notion-queries.md) — caching strategy (updated for Supabase tags)

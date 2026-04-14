# ADR-0006: Notion as Read-Only Data Layer for NOLA Music Tracker

## Status

Superseded

## Superseded By

[ADR-0008](./0008-supabase-read-only-data-layer.md) — 2026-04-14

## Date

2026-04-13

## Context

The NOLA Music Tracker is a Next.js frontend that needs to display event, venue, act, organization, and resource data. That data already lives in a Notion workspace with five databases managed by the repo owner. Rather than maintaining a separate backend database and sync pipeline, this project treats Notion as the data layer directly — reading from it at request time (or build time for static pages).

The five databases and their schemas are documented in the Notion workspace at `Claude Agent Instructions — NOLA Music Tracker`. The database IDs are canonical and stable.

## Decision

Use `@notionhq/client` as the sole mechanism for reading data from Notion. All database access is encapsulated in `src/lib/notion/`:

- **`constants.ts`** — stable Notion database IDs (Events, Venues, Acts, Organizations, Resources)
- **`types.ts`** — clean TypeScript interfaces that mirror each database's schema; enum-like union types for all select/multi-select fields
- **`property-utils.ts`** — pure functions that extract typed values from Notion's `PageObjectResponse.properties`; safe defaults on absent/mismatched fields
- **`mappers.ts`** — one mapper per entity that converts a raw `PageObjectResponse` into the corresponding domain type
- **`client.ts`** — lazy singleton wrapping `@notionhq/client`'s `Client`; reads `NOTION_API_KEY` from the environment
- **`queries.ts`** — one async function per database (`getEvents`, `getVenues`, etc.) with automatic pagination via `collectAll`
- **`index.ts`** — barrel export of types and query functions

**Notion is read-only from the frontend.** No writes are made from application code. All data entry continues via direct Notion UI or Claude Agent sessions.

**`NOTION_API_KEY`** must be set in Vercel environment variables (not committed to the repo, per Golden Rule 1).

## Consequences

**Easier:**

- No separate database or sync pipeline to operate.
- Schema changes in Notion are reflected immediately; only types and mappers need updating.
- Event data can be managed entirely in Notion's familiar UI.

**Harder:**

- Every page load that calls a query function is a live Notion API call. Caching (Next.js `unstable_cache`, ISR, or static generation) is required to avoid rate limits and latency.
- The Notion API returns `PageObjectResponse | PartialPageObjectResponse`; partial pages are silently skipped by `isFullPage`. This is the expected behavior for shared-database rows.
- Schema drift (renaming a Notion property) will silently produce null values in the mapped type rather than a build-time error. Mappers must be updated to match any Notion schema change.

## Alternatives Considered

- **Supabase / PlanetScale:** Requires a sync pipeline from Notion → SQL. Adds infrastructure that doesn't exist yet.
- **Static JSON export:** Snapshot-based, no live data. Workable but requires a scheduled rebuild for freshness.
- **Direct Notion HTTP API (fetch):** Avoids adding a dependency but loses the typed client, pagination helpers, and retry logic.

---

## Agent-Specific Sections

### Invariants

- [ ] `src/lib/notion/` contains all Notion access; no other file imports `@notionhq/client` directly
- [ ] `NOTION_API_KEY` is never committed to the repo (environment variable only)
- [ ] All query functions are read-only (`notion.databases.query`, never `notion.pages.create` or `notion.pages.update`)
- [ ] `DATABASE_IDS` in `src/lib/notion/constants.ts` matches the canonical IDs in the Notion `Claude Agent Instructions` page
- [ ] The Organizations database is noted as suspended in both `constants.ts` and `queries.ts`

### Touchpoints

- `src/lib/notion/` — entire directory implements this decision
- `package.json` — `@notionhq/client` production dependency
- `docs/adr/0001-initial-stack-and-agentic-workflow.md` — Golden Rule: no secrets in repo

### Revisit Triggers

- Notion deprecates or breaks-changes the `@notionhq/client` API
- The project requires write access to Notion from the frontend
- Notion API rate limits become a blocking problem and a cache layer is not sufficient
- The data layer needs to support offline builds (switch to static JSON export)
- A separate application database (Supabase, etc.) is introduced

### Related ADRs

- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — stack and Golden Rules (no secrets in repo)
- [ADR-0003](./0003-testing-framework-and-agent-testing-rules.md) — testing framework (Vitest, co-located tests)

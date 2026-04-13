# ADR-0007: Use Cache Directive for Cross-Request Notion Query Caching

## Status

Accepted

## Date

2026-04-13

## Context

The Notion query functions in `src/lib/notion/queries.ts` make live API calls to Notion on every request. Without caching, each page load incurs a full Notion API round-trip, risking rate limit exhaustion and adding latency. ADR-0006 explicitly lists this as a required mitigation before production.

The previous session (PR #12) deferred caching because the viable approach — the `use cache` directive — requires enabling the `cacheComponents` flag in `next.config.ts`, which needed a documented ADR before activation.

## Decision

Enable Next.js 16's Cache Components feature (`cacheComponents: true` in `next.config.ts`) and apply the `use cache` directive at the function level to all five Notion query functions (`getEvents`, `getVenues`, `getActs`, `getOrganizations`, `getResources`).

Each function uses:

- **`cacheLife('hours')`** — server-side revalidation every hour, client stale for 5 minutes, expires after 1 day. Appropriate for Notion data updated infrequently throughout the day.
- **`cacheTag('notion-<entity>')`** — per-entity tags (`notion-events`, `notion-venues`, etc.) enabling targeted on-demand invalidation via `revalidateTag` if needed in the future.

**Page-level streaming pattern:** With `cacheComponents: true`, Next.js attempts to prerender any async component that calls `use cache` functions at build time. Since Notion is not available during builds, all pages that fetch Notion data use this pattern:

1. The page component is a **sync function** that renders a static shell with a `<Suspense>` boundary.
2. The data-fetching content is an **inner async component** inside `<Suspense>` that calls `await connection()` (from `next/server`) at the top to explicitly opt out of prerendering.
3. The static shell (heading, layout) is prerendered; the content streams at request time.

This produces **Partial Prerender** (◐) for all Notion-backed routes: instant static shells with streamed dynamic content.

The `React.cache()` wrappers at the page level are kept for intra-request deduplication (harmless with `use cache`).

## Consequences

**Easier:**

- Notion API calls are cached cross-request with 1-hour revalidation; repeated page loads hit the cache instead of Notion.
- Cache can be invalidated per-entity (`revalidateTag('notion-events')`) from a future admin route or Server Action without clearing other entities.
- All pages use Partial Prerender: static shell served instantly from CDN, Notion data streamed in on first request (then served from cache).

**Harder:**

- `next.config.ts` now opts into the Cache Components feature, which affects the entire application's caching model. Any future async Server Component or function must be aware of `use cache` semantics (serializable args/returns, no request-time API access inside cache boundaries).
- Tests that call the cached query functions must mock `next/cache` (`cacheLife`, `cacheTag`) because those are server-only APIs that throw in jsdom/Vitest environments.
- On Vercel (serverless/Fluid Compute), in-memory runtime caches don't persist across cold starts. The 1-hour `cacheLife` applies to Vercel's Data Cache (persisted across instances) rather than local memory only.

## Alternatives Considered

- **`unstable_cache` from `next/cache`**: The previous model's approach, still functional in Next.js 16 but on a deprecation path. `use cache` is the stable, idiomatic v16 API. Rejected in favor of the stable path.
- **Route segment `revalidate` config**: Exporting `export const revalidate = 3600` from page files sets ISR at the route level. This is coarser than function-level caching — all data on a page shares the same revalidation window and there is no per-entity tag invalidation. Rejected.
- **Static generation (`force-static`)**: Caches at build time indefinitely until a new deployment. Too stale for event data that may be updated intraday. Rejected.

---

## Agent-Specific Sections

### Invariants

- [ ] `cacheComponents: true` is set in `next.config.ts`
- [ ] All five Notion query functions (`getEvents`, `getVenues`, `getActs`, `getOrganizations`, `getResources`) have `'use cache'`, `cacheLife('hours')`, and a `cacheTag('notion-<entity>')` inside their body
- [ ] No request-time APIs (`cookies()`, `headers()`, `searchParams`) are used inside any `use cache` function body
- [ ] Tests that import from `src/lib/notion/queries` mock `next/cache` (`cacheLife`, `cacheTag`)
- [ ] Page components that fetch Notion data use the Partial Prerender pattern: sync outer page → `<Suspense>` → async inner component with `await connection()` at the top

### Touchpoints

- `next.config.ts` — `cacheComponents: true` enables Cache Components
- `src/lib/notion/queries.ts` — all query functions use `use cache`
- `src/lib/notion/queries.test.ts` — mocks `next/cache` to allow unit testing
- `src/app/events/page.tsx` — listing page using Partial Prerender pattern
- `src/app/venues/page.tsx` — listing page using Partial Prerender pattern
- `src/app/events/[id]/page.tsx` — detail page using Partial Prerender pattern (`params` as runtime API)
- `src/app/venues/[id]/page.tsx` — detail page using Partial Prerender pattern (`params` as runtime API)

### Revisit Triggers

- Next.js deprecates `cacheComponents` or changes the `use cache` API
- Notion data freshness requirements change (e.g., near-real-time display needs shorter cache like `'minutes'`)
- On-demand revalidation via `revalidateTag` is wired up to a webhook or admin route (update tags/profiles accordingly)
- A `use cache: remote` handler (Redis, KV) is configured for multi-instance deployments

### Related ADRs

- [ADR-0006](./0006-notion-read-only-data-layer.md) — Notion as read-only data layer; caching is listed as a required consequence
- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — stack (Next.js 16, Node.js runtime, Vercel Fluid Compute)

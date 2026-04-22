# ADR-0007: Use Cache Directive for Cross-Request Query Caching

## Status

Accepted

## Date

2026-04-13 (updated 2026-04-14 to reflect Supabase migration)

## Context

The Supabase query functions in `src/lib/supabase/queries.ts` make live API calls to Supabase on every request. Without caching, each page load incurs a full database round-trip, adding latency and increasing load. ADR-0008 explicitly lists this as a required mitigation before production.

The previous session (PR #12) deferred caching because the viable approach — the `use cache` directive — requires enabling the `cacheComponents` flag in `next.config.ts`, which needed a documented ADR before activation.

## Decision

Enable Next.js 16's Cache Components feature (`cacheComponents: true` in `next.config.ts`) and apply the `use cache` directive at the function level to all three Supabase query functions (`getEvents`, `getVenues`, `getActs`).

Each function uses:

- **`cacheLife('hours')`** — server-side revalidation every hour, client stale for 5 minutes, expires after 1 day. Appropriate for data updated infrequently throughout the day.
- **`cacheTag('supabase-<entity>')`** — per-entity tags (`supabase-events`, `supabase-venues`, `supabase-acts`) enabling targeted on-demand invalidation via `revalidateTag` if needed in the future.

**Page-level streaming pattern:** With `cacheComponents: true`, Next.js attempts to prerender any async component that calls `use cache` functions at build time. Since Supabase credentials are not available during builds (and data should be live), all pages that fetch data use this pattern:

1. The page component is a **sync function** that renders a static shell with a `<Suspense>` boundary.
2. The data-fetching content is an **inner async component** inside `<Suspense>` that calls `await connection()` (from `next/server`) at the top to explicitly opt out of prerendering.
3. The static shell (heading, layout) is prerendered; the content streams at request time.

This produces **Partial Prerender** (◐) for all data-backed routes: instant static shells with streamed dynamic content.

The `React.cache()` wrappers at the page level are kept for intra-request deduplication (harmless with `use cache`).

## Consequences

**Easier:**

- Supabase queries are cached cross-request with 1-hour revalidation; repeated page loads hit the cache instead of the database.
- Cache can be invalidated per-entity (`revalidateTag('supabase-events')`) from a future admin route or Server Action without clearing other entities.
- All pages use Partial Prerender: static shell served instantly from CDN, data streamed in on first request (then served from cache).

**Harder:**

- `next.config.ts` now opts into the Cache Components feature, which affects the entire application's caching model. Any future async Server Component or function must be aware of `use cache` semantics (serializable args/returns, no request-time API access inside cache boundaries).
- Tests that call the cached query functions must mock `next/cache` (`cacheLife`, `cacheTag`) because those are server-only APIs that throw in jsdom/Vitest environments.
- On Vercel (serverless/Fluid Compute), in-memory runtime caches don't persist across cold starts. The 1-hour `cacheLife` applies to Vercel's Data Cache (persisted across instances) rather than local memory only.

## Operational Risks

### Empty-result cache persistence

If a cached query throws or returns an empty result on its first
invocation (e.g. transient Supabase outage, misconfigured key, empty
database), the `use cache` directive persists that empty output for the
full `cacheLife('hours')` window. Subsequent requests serve the empty
array from cache instead of retrying the upstream call, so a brief
upstream failure can surface as what appears to be "no data" for up to
an hour after the upstream recovers.

This was first encountered during PR #17 (Notion → Supabase migration)
when a failed early run cached an empty result locally.

**Local recovery:** `rm -rf .next && npm run dev`. Emptying the Next.js
build cache clears the persisted `use cache` entries.

**Production recovery:** call `revalidateTag('supabase-<entity>')` from a
Server Action or admin route for the affected entity, or redeploy the
Vercel function. Redeploy is the blunt instrument; tag revalidation is
preferred once an admin surface exists.

**Preferred guard when writing new `use cache` functions:** validate the
upstream response before returning. Throwing on `response.error` (rather
than falling back to `[]`) means a failure propagates to the caller and
is never cached. Accept an empty upstream response only when empty is a
legitimate business state (e.g. "no events scheduled"), not a failure
mode.

## Alternatives Considered

- **`unstable_cache` from `next/cache`**: Still functional in Next.js 16 but on a deprecation path. `use cache` is the stable, idiomatic v16 API. Rejected in favor of the stable path.
- **Route segment `revalidate` config**: Exporting `export const revalidate = 3600` from page files sets ISR at the route level. This is coarser than function-level caching — all data on a page shares the same revalidation window and there is no per-entity tag invalidation. Rejected.
- **Static generation (`force-static`)**: Caches at build time indefinitely until a new deployment. Too stale for event data that may be updated intraday. Rejected.

---

## Agent-Specific Sections

### Invariants

- [ ] `cacheComponents: true` is set in `next.config.ts`
- [ ] All three Supabase query functions (`getEvents`, `getVenues`, `getActs`) have `'use cache'`, `cacheLife('hours')`, and a `cacheTag('supabase-<entity>')` inside their body
- [ ] No request-time APIs (`cookies()`, `headers()`, `searchParams`) are used inside any `use cache` function body
- [ ] Tests that import from `src/lib/supabase/queries` mock `next/cache` (`cacheLife`, `cacheTag`)
- [ ] Page components that fetch data use the Partial Prerender pattern: sync outer page → `<Suspense>` → async inner component with `await connection()` at the top
- [ ] New `use cache` functions throw on upstream failure rather than returning `[]`, to avoid persisting empty-result caches (see Operational Risks)

### Touchpoints

- `next.config.ts` — `cacheComponents: true` enables Cache Components
- `src/lib/supabase/queries.ts` — all query functions use `use cache`
- `src/lib/supabase/queries.test.ts` — mocks `next/cache` to allow unit testing
- `src/app/events/page.tsx` — listing page using Partial Prerender pattern
- `src/app/venues/page.tsx` — listing page using Partial Prerender pattern
- `src/app/acts/page.tsx` — listing page using Partial Prerender pattern
- `src/app/events/[id]/page.tsx` — detail page using Partial Prerender pattern (`params` as runtime API)
- `src/app/venues/[id]/page.tsx` — detail page using Partial Prerender pattern (`params` as runtime API)
- `src/app/acts/[id]/page.tsx` — detail page using Partial Prerender pattern (`params` as runtime API)

### Revisit Triggers

- Next.js deprecates `cacheComponents` or changes the `use cache` API
- Data freshness requirements change (e.g., near-real-time display needs shorter cache like `'minutes'`)
- On-demand revalidation via `revalidateTag` is wired up to a webhook or admin route (update tags/profiles accordingly)
- A `use cache: remote` handler (Redis, KV) is configured for multi-instance deployments

### Related ADRs

- [ADR-0008](./0008-supabase-read-only-data-layer.md) — Supabase as read-only data layer; caching is listed as a required consequence
- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — stack (Next.js 16, Node.js runtime, Vercel Fluid Compute)

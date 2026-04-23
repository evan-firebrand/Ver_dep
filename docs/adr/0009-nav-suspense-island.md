# ADR-0009: Nav Renders a Client Island Inside a Suspense Boundary

## Status

Accepted

## Date

2026-04-22

## Context

`cacheComponents: true` (ADR-0007) changes how Next.js 16 treats async
Server Components and client islands during prerender. The build attempts
to render every page at build time, including its shared layout. That
layout renders `<Nav />`, which needs to highlight the active route.

`usePathname()` is a client-only hook — it reads request-time state. With
Cache Components enabled, a client component that reads request-time
state without being wrapped in `<Suspense>` causes the prerender to fail
at build time: the component cannot be statically resolved because its
output depends on information that is unknown until a request arrives.

PR #30 hit this empirically. The 🟡 "Verify" note on that PR explicitly
asked a reviewer familiar with Cache Components to sanity-check whether
the fix was idiomatic. No ADR had captured the pattern, so every
subsequent agent touching `Nav.tsx` would have to rediscover it.

## Decision

`Nav` is a Server Component. It renders a static shell (logo, container)
and wraps the interactive link group in a `<Suspense>` boundary:

```tsx
// src/components/Nav.tsx
export function Nav() {
  return (
    <nav>
      <Link href="/">NOLA Music Tracker</Link>
      <Suspense fallback={<NavLinksFallback />}>
        <NavLinks />
      </Suspense>
    </nav>
  );
}
```

`NavLinks` is the `'use client'` component that calls `usePathname()`.
`NavLinksFallback` is a sibling export from the same file that renders
the same link list without any active-state highlighting — it matches
the final layout so there is no CLS when `NavLinks` resolves.

This pattern generalizes: **any client component that reads request-time
state and renders inside a layout or cached component must sit inside a
`<Suspense>` boundary, and that boundary must have a fallback that
matches the final layout to avoid CLS.**

## Consequences

**Easier:**

- Pages render statically at build time; the Nav streams its active state
  at request time. The page body and the rest of the layout are not
  blocked on the Nav's active-route computation.
- Adding more pages to `NavLinks` is a one-line change in a single file.
  The fallback stays in sync automatically because both functions share
  the same `LINKS` array.

**Harder:**

- Any future agent adding a new top-level nav item, or a new client
  island with the same constraint elsewhere in the app, must repeat this
  pattern. The fallback duplication (two renders of the same link list,
  differing only in active styling) is the accepted cost.
- The fallback's class bindings must match the "inactive" state of the
  real component exactly. If `NavLinks` changes its inactive style,
  `NavLinksFallback` must change with it.

## Alternatives Considered

- **`export const dynamic = 'force-dynamic'` on each page that renders
  Nav.** Rejected: the constraint belongs to Nav, not to each consuming
  page. Forcing every page to be fully dynamic would also defeat the
  Partial Prerender benefits from ADR-0007.
- **Making `Nav.tsx` itself a `'use client'` component.** Rejected: then
  the layout boundary itself becomes a client component, which breaks
  Partial Prerender for every page and makes future Server Component
  additions (e.g. a user menu that reads a session) structurally
  impossible without refactoring.
- **Dropping active-route highlighting.** Rejected: it is a core UX
  affordance, not optional polish.
- **Computing the active link on the server by reading `headers()`.**
  Rejected: `headers()` inside a cached component throws; inside a
  non-cached component it works but forces the entire Nav (and everything
  it contains) out of the cache. The Suspense-bounded client island is
  the narrowest mitigation.

---

## Agent-Specific Sections

### Invariants

- [ ] `src/components/Nav.tsx` is a Server Component (no `'use client'` directive)
- [ ] `src/components/NavLinks.tsx` starts with `'use client'`
- [ ] `Nav` wraps `<NavLinks />` in `<Suspense fallback={<NavLinksFallback />}>`
- [ ] `NavLinksFallback` renders the same `LINKS` array as `NavLinks`, using the same wrapper and inactive class constants
- [ ] No client component that calls `usePathname()`, `useSearchParams()`, or other request-time hooks is rendered outside a Suspense boundary when its parent is cached or prerendered

### Touchpoints

- `src/components/Nav.tsx` — the Server Component shell and Suspense boundary
- `src/components/NavLinks.tsx` — the client island and its fallback

### Revisit Triggers

- Next.js 17+ changes the Cache Components / Suspense contract for client islands reading request-time state
- A second client island with the same constraint appears in the app — extract a shared helper or pattern doc at that point
- The `geist` display font or any other client-side CSS-in-JS binding is added to `Nav` that forces a client-component boundary further up

### Related ADRs

- [ADR-0007](./0007-use-cache-for-notion-queries.md) — `cacheComponents: true` and the Partial Prerender pattern; this ADR extends ADR-0007's pattern to layout-level client islands
- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — Next.js 16 App Router, Node.js runtime

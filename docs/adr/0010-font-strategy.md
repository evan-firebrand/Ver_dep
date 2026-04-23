# ADR-0010: Self-Host Geist Fonts as Local woff2 Files

## Status

Accepted

## Date

2026-04-22

## Context

`next/font/google` (the default pattern for Geist) makes an outbound
request to `fonts.googleapis.com` and `fonts.gstatic.com` during
`next build`. In PR #11 the build failed in an offline sandbox for
exactly this reason, and in PR #12 the agent worked around it by copying
`geist-latin.woff2` and `geist-mono-latin.woff2` out of
`node_modules/next/dist/next-devtools/server/font/` into
`public/fonts/` and switching the layout to `next/font/local`.

That workaround has shipped and served correctly since PR #12. But the
🟡 Confidence note on that PR explicitly flagged two concerns that have
lingered with no ADR-level decision:

1. The `next/font/local` `src` path is relative to the calling file
   (`../../public/fonts/geist-latin.woff2` in `src/app/layout.tsx`). If
   `layout.tsx` moves, the path silently breaks.
2. The binary source — a devtools bundle that Next.js does not guarantee
   as a stable public surface — is unconventional. The binaries could
   move or change subset between Next versions.

Those concerns lived in a merged PR's review-guidance section for months
with no tracking mechanism, which is exactly the failure mode ADR-0004
exists to prevent. This ADR records the current decision so the next
agent inherits context instead of rediscovering it.

## Decision

Keep the self-hosted local woff2 files. The layout file continues to use
`next/font/local` with paths relative to `src/app/layout.tsx`.

Accepted tradeoffs:

- **No outbound font requests at build time.** Builds succeed in
  restricted network environments (Claude Code sandboxes, offline CI).
- **Non-standard binary source.** The woff2 files were originally copied
  from a Next.js devtools bundle. They are the correct Geist Latin
  subset and they are served directly — Next.js devtools internals are
  not in the runtime path.
- **Fragile path.** The `../../public/fonts/*` path breaks if
  `src/app/layout.tsx` moves. The route is uncommon (App Router root
  layouts don't move), but agents should treat this path as load-bearing.

This is a deliberate deferral of the cleaner alternative (`geist` npm
package). That migration is scoped separately and documented under
Revisit Triggers below.

## Consequences

**Easier:**

- Offline builds work. This matters for restricted sandboxes and for any
  future CI environment that denies `fonts.googleapis.com`.
- No run-time DNS cost on the user's first paint — woff2 files ship from
  the same origin as the app.

**Harder:**

- The origin of the binary files is not reproducible from `package.json`
  alone. A future agent cannot regenerate them without fetching Geist
  from an external source.
- `src/app/layout.tsx` carries a relative path that will break on a file
  move. Refactors that relocate the root layout must update the font
  paths or move the woff2 files alongside the layout.
- Any future update to Geist requires manually replacing the woff2 files
  (or migrating to the `geist` npm package).

## Alternatives Considered

- **`next/font/google` (default Geist pattern).** Rejected: requires
  outbound HTTPS at build time, which fails in the repo's sandbox
  environments and risks flakiness in CI.
- **`geist` npm package (official self-host).** This is the cleanest
  long-term answer: declared dependency, reproducible binary source, no
  path-relative brittleness. Not chosen yet because it was not the
  minimum viable fix during PR #12, and because it adds a top-level
  dependency (a CLAUDE.md "ADR Triggers" item). Documented as a Revisit
  Trigger so the migration has a tracked home.
- **Move fonts to `src/fonts/` alongside the layout.** Rejected for now:
  Next.js public-asset conventions prefer `public/`, and the path
  relative-ness problem would remain; only the blast radius of a
  relocation would change.

---

## Agent-Specific Sections

### Invariants

- [ ] `src/app/layout.tsx` loads Geist via `next/font/local`, not `next/font/google`
- [ ] `public/fonts/geist-latin.woff2` and `public/fonts/geist-mono-latin.woff2` exist and are the referenced assets
- [ ] No other file imports fonts from `next/font/google` without explicit ADR supersedure
- [ ] If `src/app/layout.tsx` moves, the relative `src` path in both `localFont({ src: ... })` calls is updated in the same change

### Touchpoints

- `src/app/layout.tsx` — loads both Geist faces via `next/font/local`
- `public/fonts/geist-latin.woff2` — sans face binary
- `public/fonts/geist-mono-latin.woff2` — mono face binary

### Revisit Triggers

- An agent is asked to refresh Geist, or `package.json` grows a new top-level font dependency — migrate to the `geist` npm package, delete `public/fonts/geist-*.woff2`, and supersede this ADR
- The root layout moves out of `src/app/layout.tsx`
- CI gains reliable outbound access to Google Fonts and build reproducibility is re-evaluated
- A new face (variable weight, Cyrillic subset, etc.) is needed — the current two-file approach does not scale, migrate to `geist`

### Related ADRs

- [ADR-0001](./0001-initial-stack-and-agentic-workflow.md) — Next.js 16 App Router, Tailwind, npm as the sole package manager

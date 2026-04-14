# Codebase Orientation Map

NOLA Music Tracker -- a read-only event/venue/act listing site for New Orleans music.

## Data Layer

| Item             | Detail                                                                           |
| ---------------- | -------------------------------------------------------------------------------- |
| Database         | Supabase (PostgreSQL), read-only via publishable key                             |
| Tables           | `events`, `venues`, `acts`, `event_acts` (junction)                              |
| Env vars         | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`               |
| Client           | `src/lib/supabase/client.ts` -- singleton `@supabase/ssr` server client, no auth |
| Query functions  | `src/lib/supabase/queries.ts` -- `getEvents()`, `getVenues()`, `getActs()`       |
| Types            | `src/lib/supabase/types.ts` -- `NolaEvent`, `Venue`, `Act` + all union types     |
| Barrel           | `src/lib/supabase/index.ts` -- re-exports queries, types, and relation helpers   |
| Relation helpers | `src/lib/supabase/resolve-relations.ts` -- `buildLookup()`, `resolveIds()`       |

## Pages

| Route            | File                             | Description                                                                           |
| ---------------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| (layout)         | `src/app/layout.tsx`             | App shell — `<html>`/`<body>`, Nav, Geist fonts (local woff2), globals.css import     |
| `/`              | `src/app/page.tsx`               | Static hero landing page with links to events/venues                                  |
| `/events`        | `src/app/events/page.tsx`        | All events, sorted by date, grid of EventCards                                        |
| `/events/[id]`   | `src/app/events/[id]/page.tsx`   | Event detail -- date, venue link, performers (ActBadge), notes                        |
| `/acts`          | `src/app/acts/page.tsx`          | All acts, sorted alphabetically, server-side genre filter via `?genre=`               |
| `/acts/[id]`     | `src/app/acts/[id]/page.tsx`     | Act detail -- genres, website, upcoming performances                                  |
| `/venues`        | `src/app/venues/page.tsx`        | All venues, sorted alphabetically, with event counts                                  |
| `/venues/[id]`   | `src/app/venues/[id]/page.tsx`   | Venue detail -- address, website, events at this venue                                |
| `/this-week`     | `src/app/this-week/page.tsx`     | Events for next 7 days with client-side filters (day, cost, neighborhood, event type) |
| `/series`        | `src/app/series/page.tsx`        | Series index -- cards for each event series with event counts                         |
| `/series/[slug]` | `src/app/series/[slug]/page.tsx` | Series detail -- events filtered by series, sorted by date, grid of EventCards        |
| `/search`        | `src/app/search/page.tsx`        | **Stub.** Types defined but logic is TODO. Not in nav.                                |

## Components

| Component               | File                                        | What it renders                                                                |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `Nav`                   | `src/components/Nav.tsx`                    | Top nav bar -- links to Events, Acts, Venues, Series                           |
| `EventCard`             | `src/components/EventCard.tsx`              | Card link with event name, date, venue, type badge, cost, status               |
| `VenueCard`             | `src/components/VenueCard.tsx`              | Card link with venue name, neighborhood, address, type badge, event count      |
| `ActCard`               | `src/components/ActCard.tsx`                | Card link with act name, genres, type badge, event count                       |
| `ActBadge`              | `src/components/ActBadge.tsx`               | Inline pill showing act name + first genre (used on event detail)              |
| `ThisWeekView`          | `src/components/this-week/ThisWeekView.tsx` | `'use client'` -- applies filters to event list, renders EventCards            |
| `FilterBar`             | `src/components/this-week/FilterBar.tsx`    | `'use client'` -- day tabs, cost toggle, neighborhood select, event type pills |
| `EventCard` (this-week) | `src/components/this-week/EventCard.tsx`    | Richer event card with venue + neighborhood, cost label, time, external link   |

## Utilities

| Module              | File(s)                                 | What it does                                                                                                                       |
| ------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `format-date`       | `src/lib/format-date.ts`                | `formatEventDate()` -- formats `EventDate` for display (date-only vs datetime)                                                     |
| `events/filters`    | `src/lib/events/filters.ts`             | `filterThisWeek()`, `filterByDate()`, `filterByCost()`, `filterByNeighborhood()`, `filterByEventType()`, `applyFilters()`          |
| `events/formatters` | `src/lib/events/formatters.ts`          | `formatEventDate()` (NOLA tz), `formatEventTime()`, `formatCost()`, `getThisWeekDays()`, `toLocalDateString()`, `formatDayLabel()` |
| `events/index`      | `src/lib/events/index.ts`               | Barrel re-export of filters + formatters                                                                                           |
| `resolve-relations` | `src/lib/supabase/resolve-relations.ts` | `buildLookup()` (array to Map), `resolveIds()` (IDs to objects via Map)                                                            |
| `series`            | `src/lib/series.ts`                     | `SERIES` config array, `getSeriesBySlug()`, `getAllSeriesSlugs()` -- slug-to-EventSeries mapping for /series routes                |

## Key Patterns

- **Data fetching:** Async Server Components call `getEvents()`/`getVenues()`/`getActs()`. Each query function uses `'use cache'` + `cacheLife('hours')` + `cacheTag('supabase-*')`.
- **Partial Prerender (PPR):** Sync outer page component wraps `<Suspense>` around an async inner component. The inner component calls `await connection()` to opt out of prerendering.
- **Per-request dedup:** `React.cache()` wraps query calls at the page level to avoid duplicate fetches within a single render tree.
- **`params` and `searchParams` are Promises** in Next.js 16. Must `await` before destructuring.
- **Component conventions:** Card components are server components (no `'use client'`). Only `this-week/` components are client components. All cards are `<Link>` wrappers.
- **Color maps:** Each card component has a `Record<SomeType, string>` mapping type values to Tailwind color classes. Adding a new type value causes a compile error until the color is added.
- **Error handling:** Query calls are wrapped in `try/catch` with empty catch blocks -- renders empty state when Supabase is unavailable.
- **Timezone:** NOLA timezone is `America/Chicago`. Formatters in `src/lib/events/formatters.ts` use `Intl.DateTimeFormat` with this timezone.

## ADRs

| #    | Title                                        | Status                            |
| ---- | -------------------------------------------- | --------------------------------- |
| 0001 | Initial Stack and Agentic Workflow           | Accepted                          |
| 0002 | Intelligent PR Validation and Session Notes  | Accepted                          |
| 0003 | Testing Framework and Agent Testing Rules    | Accepted                          |
| 0004 | Drift Detection Across Interlinked Documents | Accepted                          |
| 0005 | Claude Code GitHub Action                    | Accepted                          |
| 0006 | Notion as Read-Only Data Layer               | **Superseded** (replaced by 0008) |
| 0007 | Use Cache Directive for Query Caching        | Accepted                          |
| 0008 | Supabase as Read-Only Data Layer             | Accepted                          |

ADR files: `docs/adr/NNNN-*.md`. Template: `docs/adr/template.md`. Index: `docs/adr/README.md`.

## Session Notes

| File       | Covers                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PR-12.md` | Local fonts (no Google Fonts at build), RTL cleanup in Vitest, `params` as Promise in Next.js 16, `unstable_cache` vs `use cache`                     |
| `PR-13.md` | `connection()` required to prevent prerender, `use cache` errors bypass try/catch at prerender, PPR pattern established, `cacheTag` naming convention |
| `PR-14.md` | `searchParams` is a Promise, genre filter validation, search stub left as TODO, `resolveIds` unused, act detail shows only upcoming performances      |

Session notes directory: `.claude/sessions/`.

## Tests

Tests are co-located with source (`*.test.ts` / `*.test.tsx`). See CLAUDE.md for the 9 testing rules.

| Test file                                    | What it covers                                             |
| -------------------------------------------- | ---------------------------------------------------------- |
| `src/app/page.test.tsx`                      | Landing page renders heading and nav links                 |
| `src/components/EventCard.test.tsx`          | EventCard badges, date, cost, status, interested indicator |
| `src/components/VenueCard.test.tsx`          | VenueCard neighborhood, address, type badge, event count   |
| `src/components/ActCard.test.tsx`            | ActCard genres, type badge, event count                    |
| `src/components/ActBadge.test.tsx`           | ActBadge pill rendering with name + genre                  |
| `src/lib/format-date.test.ts`                | Date formatting for date-only vs datetime                  |
| `src/lib/events/filters.test.ts`             | All filter functions, edge cases, empty states             |
| `src/lib/events/formatters.test.ts`          | Date/time/cost formatting, NOLA timezone handling          |
| `src/lib/supabase/queries.test.ts`           | Supabase query functions with mocked client                |
| `src/lib/supabase/resolve-relations.test.ts` | buildLookup and resolveIds utilities                       |
| `src/lib/series.test.ts`                     | Series config, slug mapping, getAllSeriesSlugs             |

Setup: `src/test-setup.ts` (loads `@testing-library/jest-dom/vitest` + `afterEach(cleanup)`).

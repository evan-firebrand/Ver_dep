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

| Route          | File                           | Description                                                                                              |
| -------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| (layout)       | `src/app/layout.tsx`           | App shell — `<html>`/`<body>`, Nav, Footer, Geist fonts (local woff2), globals.css import                |
| `/`            | `src/app/page.tsx`             | Dynamic home: compact hero + quick picks + Tonight/Tomorrow/This Weekend sections                        |
| `/events`      | `src/app/events/page.tsx`      | Filtered events via `?cost=…&neighborhood=…&type=…&date=…`, grouped by date bucket (Today, Tomorrow, …)  |
| `/events/[id]` | `src/app/events/[id]/page.tsx` | Event detail — date, venue link, performers (ActBadge → /acts/[id]), notes                               |
| `/acts`        | `src/app/acts/page.tsx`        | All acts sorted by next upcoming show, server-side genre filter via `?genre=`                            |
| `/acts/[id]`   | `src/app/acts/[id]/page.tsx`   | Act detail — genres, website, upcoming performances                                                      |
| `/venues`      | `src/app/venues/page.tsx`      | All venues grouped by neighborhood, with event counts                                                    |
| `/venues/[id]` | `src/app/venues/[id]/page.tsx` | Venue detail — address (Google Maps link), website, events at this venue                                 |
| `/this-week`   | `src/app/this-week/page.tsx`   | Events for next 7 days with client-side filters (day, cost, neighborhood, event type); defaults to Today |

## Components

| Component      | File                                        | What it renders                                                                                       |
| -------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Nav`          | `src/components/Nav.tsx`                    | `'use client'` — top nav with This Week, Events, Acts, Venues; highlights active route                |
| `Footer`       | `src/components/Footer.tsx`                 | Site description, "Submit an event" mailto, source link                                               |
| `EventCard`    | `src/components/EventCard.tsx`              | Card with title-as-link; badges (event type, neighborhood, "Free") are filter links into /events      |
| `VenueCard`    | `src/components/VenueCard.tsx`              | Card link with venue name, neighborhood, address, type badge, event count                             |
| `ActCard`      | `src/components/ActCard.tsx`                | Card link with act name, genres, type badge, event count                                              |
| `ActBadge`     | `src/components/ActBadge.tsx`               | Inline pill with act name + first genre; links to /acts/[id] when `id` is provided                    |
| `ThisWeekView` | `src/components/this-week/ThisWeekView.tsx` | `'use client'` — applies filters to events, renders EventCards; defaults filter.date to today         |
| `FilterBar`    | `src/components/this-week/FilterBar.tsx`    | `'use client'` — day tabs, cost toggle, neighborhood select, event-type pills (callback-driven)       |
| `FilterBarUrl` | `src/components/events/FilterBarUrl.tsx`    | `'use client'` — same UX as FilterBar but pushes `router.push(/events?…)` instead of calling onChange |

## Utilities

| Module                   | File(s)                                 | What it does                                                                                                                               |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `events/filters`         | `src/lib/events/filters.ts`             | `filterThisWeek()`, `filterByDate()`, `filterByCost()`, `filterByNeighborhood()`, `filterByEventType()`, `applyFilters()`, `isFreeEvent()` |
| `events/formatters`      | `src/lib/events/formatters.ts`          | `formatEventDate()` (NOLA tz), `formatEventTime()`, `formatCost()`, `getThisWeekDays()`, `toLocalDateString()`, `formatDayLabel()`         |
| `events/search-params`   | `src/lib/events/search-params.ts`       | `parseEventFilters()`, `serializeEventFilters()`, `buildEventsHref()`; runtime `EVENT_TYPES` + `NEIGHBORHOODS` arrays                      |
| `events/bucket-by-date`  | `src/lib/events/bucket-by-date.ts`      | `bucketByDate()` groups events into Today/Tomorrow/This Weekend/Later This Week/Next Week/Later/Undated                                    |
| `events/weekend`         | `src/lib/events/weekend.ts`             | `isWeekend(dow)` predicate and `weekendDaysInRange(start, { daysAhead, skipFromStart })`; used by `page.tsx` and `bucket-by-date.ts`       |
| `events/index`           | `src/lib/events/index.ts`               | Barrel re-export of filters + formatters                                                                                                   |
| `acts/sort-by-next-show` | `src/lib/acts/sort-by-next-show.ts`     | `sortActsByNextShow()` orders acts by earliest upcoming event; no-upcoming acts fall to end alphabetically                                 |
| `resolve-relations`      | `src/lib/supabase/resolve-relations.ts` | `buildLookup()` (array to Map), `resolveIds()` (IDs to objects via Map)                                                                    |

## Key Patterns

- **Data fetching:** Async Server Components call `getEvents()`/`getVenues()`/`getActs()`. Each query function uses `'use cache'` + `cacheLife('hours')` + `cacheTag('supabase-*')`.
- **Partial Prerender (PPR):** Sync outer page component wraps `<Suspense>` around an async inner component. The inner component calls `await connection()` to opt out of prerendering.
- **Per-request dedup:** `React.cache()` wraps query calls at the page level to avoid duplicate fetches within a single render tree.
- **`params` and `searchParams` are Promises** in Next.js 16. Must `await` before destructuring.
- **URL-driven filter state** on `/events`: the page reads searchParams via `parseEventFilters()`, and `FilterBarUrl` writes them via `router.push(buildEventsHref(...))`. Unknown values are silently dropped.
- **Card link pattern:** EventCard uses title-as-link (`<h3><Link>...</Link></h3>`) rather than wrapping the whole card. Badges are siblings of the title and act as independent filter links into /events. Avoids nested interactive elements.
- **Color maps:** EventCard, VenueCard, ActCard each have a `Record<SomeType, string>` mapping type values to Tailwind color classes. Adding a new type value causes a compile error until the color is added.
- **Error handling:** Query calls are wrapped in `try/catch` with empty catch blocks -- renders empty state when Supabase is unavailable.
- **Empty states** offer at least one escape-hatch link (browse venues, clear filters, see this week) rather than being a dead end.
- **Timezone:** NOLA timezone is `America/Chicago`. Formatters in `src/lib/events/formatters.ts` use `Intl.DateTimeFormat` with this timezone. Home and /events derive `todayStr` via `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' })`.

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

| Test file                                        | What it covers                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `src/app/page.test.tsx`                          | Home shell: heading, CTAs, quick-pick URLs (async UpcomingSections not unit tested)  |
| `src/components/Nav.test.tsx`                    | Nav renders all links and marks active route via usePathname                         |
| `src/components/Footer.test.tsx`                 | Footer description, data-freshness, submit-event link, source link                   |
| `src/components/EventCard.test.tsx`              | Title-as-link, badge filter links, external-link icon, cost/date/time display        |
| `src/components/VenueCard.test.tsx`              | VenueCard neighborhood, address, type badge, event count                             |
| `src/components/ActCard.test.tsx`                | ActCard genres, type badge, event count                                              |
| `src/components/ActBadge.test.tsx`               | ActBadge pill, id-driven Link vs static span                                         |
| `src/components/this-week/ThisWeekView.test.tsx` | Defaults to today; "All Days" expands to full week                                   |
| `src/components/events/FilterBarUrl.test.tsx`    | router.push URLs for cost/type toggles, clear-filters, aria-pressed state            |
| `src/lib/events/filters.test.ts`                 | All filter functions, edge cases, empty states                                       |
| `src/lib/events/formatters.test.ts`              | Date/time/cost formatting, NOLA timezone handling                                    |
| `src/lib/events/search-params.test.ts`           | parseEventFilters, serializeEventFilters, buildEventsHref (round-trip, invalids)     |
| `src/lib/events/bucket-by-date.test.ts`          | Today/Tomorrow/Weekend/Next Week bucketing, Fri/Sat/Sun edge cases, year rollover    |
| `src/lib/events/weekend.test.ts`                 | `isWeekend` predicate for all 7 days, `weekendDaysInRange` skip/window/year boundary |
| `src/lib/acts/sort-by-next-show.test.ts`         | Ordering by next show, no-upcoming fallback, multi-day spanning today                |
| `src/lib/supabase/queries.test.ts`               | Supabase query functions with mocked client                                          |
| `src/lib/supabase/resolve-relations.test.ts`     | buildLookup and resolveIds utilities                                                 |

Setup: `src/test-setup.ts` (loads `@testing-library/jest-dom/vitest` + `afterEach(cleanup)`).

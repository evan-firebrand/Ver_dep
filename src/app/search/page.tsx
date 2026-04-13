import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search events, acts, and venues in New Orleans.',
};

// ─── Types ────────────────────────────────────────────────────────────────────

/** The three entity types that can appear in search results. */
export type SearchResultKind = 'event' | 'act' | 'venue';

/** A single matched item returned by the search. */
export interface SearchResult {
  kind: SearchResultKind;
  id: string;
  name: string;
  /** Secondary descriptor shown below the name (e.g. date, genre, neighborhood). */
  subtitle: string | null;
}

/** Grouped search results keyed by entity type. */
export interface SearchResults {
  events: SearchResult[];
  acts: SearchResult[];
  venues: SearchResult[];
  /** Total number of matched items across all entity types. */
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  // TODO: Implement search logic.
  //
  // Suggested approach:
  //   1. Fetch all events, acts, and venues in parallel via Promise.all().
  //   2. Normalise `query` to lowercase and filter each collection:
  //      - Events: match on name, eventType, series, cost, notes.
  //      - Acts: match on name, actType, genres, notes.
  //      - Venues: match on name, venueType, neighborhood, address.
  //   3. Map each match to a SearchResult, populating `subtitle` with the most
  //      useful secondary descriptor (e.g. formatEventDate for events, first
  //      genre for acts, neighborhood for venues).
  //   4. Assemble a SearchResults object and render three grouped sections.
  //
  // Edge cases to handle:
  //   - Empty query → show a prompt, not an empty result list.
  //   - Notion unavailable → catch and render an error state.
  //   - Zero results for a non-empty query → "No results for '…'" message.
  //
  // Future consideration: if the full Notion dataset grows large, move filtering
  // to a Server Action so it can be triggered incrementally as the user types
  // (requires a client component wrapper with useTransition).

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Search
        </h1>
        {query && (
          <p className="mt-1 text-zinc-400">Results for &quot;{query}&quot;</p>
        )}
      </header>

      <p className="text-zinc-500">Search is coming soon.</p>
    </main>
  );
}

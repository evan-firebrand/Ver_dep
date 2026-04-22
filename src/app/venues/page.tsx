import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { VenueCard } from '@/components/VenueCard';
import { NEIGHBORHOODS } from '@/lib/events/search-params';
import { getEvents, getVenues } from '@/lib/supabase';
import type { Neighborhood, NolaEvent, Venue } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Venues',
  description: 'Music venues across New Orleans neighborhoods.',
};

const fetchVenues = cache(getVenues);
const fetchEvents = cache(getEvents);

const OTHER_LABEL = 'Other';

function groupByNeighborhood(venues: Venue[]): Map<string, Venue[]> {
  const groups = new Map<string, Venue[]>();
  for (const venue of venues) {
    const key = venue.neighborhood ?? OTHER_LABEL;
    const list = groups.get(key) ?? [];
    list.push(venue);
    groups.set(key, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

export default function VenuesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Venues
        </h1>
      </header>
      <Suspense fallback={<p className="text-zinc-400">Loading venues…</p>}>
        <VenuesList />
      </Suspense>
    </main>
  );
}

async function VenuesList() {
  await connection();

  let venues: Venue[] = [];
  let events: NolaEvent[] = [];

  try {
    [venues, events] = await Promise.all([fetchVenues(), fetchEvents()]);
  } catch {
    // Supabase unavailable — render empty state
  }

  const eventCountByVenue = new Map<string, number>();
  for (const event of events) {
    if (event.venueId) {
      eventCountByVenue.set(
        event.venueId,
        (eventCountByVenue.get(event.venueId) ?? 0) + 1,
      );
    }
  }

  if (venues.length === 0) {
    return (
      <p className="text-zinc-500">
        No venues are available right now. Check back soon.
      </p>
    );
  }

  const grouped = groupByNeighborhood(venues);
  const orderedKeys: string[] = [
    ...(NEIGHBORHOODS as readonly Neighborhood[]).filter((n) => grouped.has(n)),
    ...(grouped.has(OTHER_LABEL) ? [OTHER_LABEL] : []),
  ];

  return (
    <>
      <p className="-mt-4 mb-8 text-zinc-400">
        {venues.length} venue{venues.length === 1 ? '' : 's'} across{' '}
        {orderedKeys.length} neighborhood
        {orderedKeys.length === 1 ? '' : 's'}
      </p>
      <div className="space-y-10">
        {orderedKeys.map((key) => {
          const list = grouped.get(key) ?? [];
          return (
            <section key={key}>
              <h2 className="mb-4 text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                {key}
                <span className="ml-2 text-zinc-600">({list.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    eventCount={eventCountByVenue.get(venue.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

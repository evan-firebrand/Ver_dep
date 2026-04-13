import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { VenueCard } from '@/components/VenueCard';
import { getEvents, getVenues } from '@/lib/notion';
import type { NolaEvent, Venue } from '@/lib/notion';

export const metadata: Metadata = {
  title: 'Venues',
  description: 'Music venues across New Orleans neighborhoods.',
};

const fetchVenues = cache(getVenues);
const fetchEvents = cache(getEvents);

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
    // Notion unavailable — render empty state
  }

  // Count events per venue
  const eventCountByVenue = new Map<string, number>();
  for (const event of events) {
    for (const vid of event.venueIds) {
      eventCountByVenue.set(vid, (eventCountByVenue.get(vid) ?? 0) + 1);
    }
  }

  const sorted = [...venues].sort((a, b) => a.name.localeCompare(b.name));

  if (sorted.length === 0) {
    return (
      <p className="text-zinc-500">
        No venues are available right now. Check back soon.
      </p>
    );
  }

  return (
    <>
      <p className="-mt-4 mb-8 text-zinc-400">
        {sorted.length} venue{sorted.length === 1 ? '' : 's'}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            eventCount={eventCountByVenue.get(venue.id)}
          />
        ))}
      </div>
    </>
  );
}

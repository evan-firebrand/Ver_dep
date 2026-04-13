import type { Metadata } from 'next';
import { cache } from 'react';

import { EventCard } from '@/components/EventCard';
import { getEvents, getVenues } from '@/lib/notion';
import type { NolaEvent, Venue } from '@/lib/notion';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Live music, festivals, and events happening in New Orleans.',
};

// Memoize within this render so sibling components don't double-fetch
const fetchEvents = cache(getEvents);
const fetchVenues = cache(getVenues);

function sortByDate(events: NolaEvent[]): NolaEvent[] {
  return [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.start.localeCompare(b.date.start);
  });
}

export default async function EventsPage() {
  let events: NolaEvent[] = [];
  let venues: Venue[] = [];

  try {
    [events, venues] = await Promise.all([fetchEvents(), fetchVenues()]);
  } catch {
    // Notion unavailable — render empty state
  }

  const venueById = new Map(venues.map((v) => [v.id, v]));
  const sorted = sortByDate(events);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Events
        </h1>
        <p className="mt-1 text-zinc-400">
          {sorted.length > 0
            ? `${sorted.length} event${sorted.length === 1 ? '' : 's'}`
            : 'No events found.'}
        </p>
      </header>

      {sorted.length === 0 ? (
        <p className="text-zinc-500">
          No events are available right now. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((event) => {
            const venue = event.venueIds[0]
              ? venueById.get(event.venueIds[0])
              : undefined;
            return (
              <EventCard key={event.id} event={event} venueName={venue?.name} />
            );
          })}
        </div>
      )}
    </main>
  );
}

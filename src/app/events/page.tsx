import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { EventCard } from '@/components/EventCard';
import { getEvents, getVenues } from '@/lib/supabase';
import type { NolaEvent, Venue } from '@/lib/supabase';

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

export default function EventsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Events
        </h1>
      </header>
      <Suspense fallback={<p className="text-zinc-400">Loading events…</p>}>
        <EventsList />
      </Suspense>
    </main>
  );
}

async function EventsList() {
  await connection();

  let events: NolaEvent[] = [];
  let venues: Venue[] = [];

  try {
    [events, venues] = await Promise.all([fetchEvents(), fetchVenues()]);
  } catch {
    // Supabase unavailable — render empty state
  }

  const venueById = new Map(venues.map((v) => [v.id, v]));
  const sorted = sortByDate(events);

  if (sorted.length === 0) {
    return (
      <p className="text-zinc-500">
        No events are available right now. Check back soon.
      </p>
    );
  }

  return (
    <>
      <p className="-mt-4 mb-8 text-zinc-400">
        {sorted.length} event{sorted.length === 1 ? '' : 's'}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((event) => {
          const venue = event.venueId
            ? venueById.get(event.venueId)
            : undefined;
          return (
            <EventCard key={event.id} event={event} venueName={venue?.name} />
          );
        })}
      </div>
    </>
  );
}

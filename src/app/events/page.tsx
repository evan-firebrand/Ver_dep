import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { EventCard } from '@/components/EventCard';
import { FilterBarUrl } from '@/components/events/FilterBarUrl';
import {
  BUCKET_LABELS,
  BUCKET_ORDER,
  bucketByDate,
} from '@/lib/events/bucket-by-date';
import { applyFilters } from '@/lib/events/filters';
import {
  parseEventFilters,
  type RawSearchParams,
} from '@/lib/events/search-params';
import { getEvents, getVenues } from '@/lib/supabase';
import type { NolaEvent, Venue } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Live music, festivals, and events happening in New Orleans.',
};

const fetchEvents = cache(getEvents);
const fetchVenues = cache(getVenues);

interface PageProps {
  searchParams: Promise<RawSearchParams>;
}

export default function EventsPage({ searchParams }: PageProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Events
        </h1>
      </header>
      <div className="mb-8">
        <FilterBarUrl />
      </div>
      <Suspense fallback={<p className="text-zinc-400">Loading events…</p>}>
        <EventsList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function EventsList({ searchParams }: PageProps) {
  await connection();

  const raw = await searchParams;
  const filters = parseEventFilters(raw);

  let events: NolaEvent[] = [];
  let venues: Venue[] = [];

  try {
    [events, venues] = await Promise.all([fetchEvents(), fetchVenues()]);
  } catch {
    // Supabase unavailable — render empty state
  }

  const venueById = new Map(venues.map((v) => [v.id, v]));
  const venueMap = Object.fromEntries(venues.map((v) => [v.id, v]));
  const filtered = applyFilters(events, filters, venueMap);

  if (events.length === 0) {
    return (
      <p className="text-zinc-500">
        No events are available right now. Check back soon.
      </p>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="text-zinc-500">
        No events match the current filters. Try removing some to see more.
      </p>
    );
  }

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
  }).format(new Date());
  const buckets = bucketByDate(filtered, todayStr);

  const visibleCount = BUCKET_ORDER.reduce(
    (sum, key) => sum + buckets[key].length,
    0,
  );

  return (
    <>
      <p className="-mt-4 mb-8 text-zinc-400">
        {visibleCount} event{visibleCount === 1 ? '' : 's'}
      </p>
      <div className="space-y-10">
        {BUCKET_ORDER.map((key) => {
          const bucket = buckets[key];
          if (bucket.length === 0) return null;
          return (
            <section key={key}>
              <h2 className="mb-4 text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                {BUCKET_LABELS[key]}
                <span className="ml-2 text-zinc-600">({bucket.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bucket.map((event) => {
                  const venue = event.venueId
                    ? venueById.get(event.venueId)
                    : undefined;
                  return (
                    <EventCard key={event.id} event={event} venue={venue} />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

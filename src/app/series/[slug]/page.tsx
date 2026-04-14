import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { EventCard } from '@/components/EventCard';
import { getAllSeriesSlugs, getSeriesBySlug } from '@/lib/series';
import { getEvents, getVenues } from '@/lib/supabase';
import type { NolaEvent, Venue } from '@/lib/supabase';

const fetchEvents = cache(getEvents);
const fetchVenues = cache(getVenues);

export function generateStaticParams() {
  return getAllSeriesSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) return { title: 'Series Not Found' };

  return {
    title: series.name,
    description: series.description,
  };
}

function sortByDate(events: NolaEvent[]): NolaEvent[] {
  return [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.start.localeCompare(b.date.start);
  });
}

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <Suspense fallback={<p className="text-zinc-400">Loading events…</p>}>
        <SeriesContent params={params} />
      </Suspense>
    </main>
  );
}

async function SeriesContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  let events: NolaEvent[] = [];
  let venues: Venue[] = [];

  try {
    [events, venues] = await Promise.all([fetchEvents(), fetchVenues()]);
  } catch {
    // Supabase unavailable — render empty state
  }

  const filtered = sortByDate(
    events.filter((e) => e.series.includes(series.name)),
  );
  const venueById = new Map(venues.map((v) => [v.id, v]));

  return (
    <>
      <Link
        href="/series"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← All series
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {series.name}
        </h1>
        <p className="mt-2 text-zinc-400">{series.description}</p>
      </header>

      {filtered.length === 0 ? (
        <p className="text-zinc-500">
          No events in this series right now. Check back soon.
        </p>
      ) : (
        <>
          <p className="-mt-4 mb-8 text-zinc-400">
            {filtered.length} event{filtered.length === 1 ? '' : 's'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => {
              const venue = event.venueId
                ? venueById.get(event.venueId)
                : undefined;
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  venueName={venue?.name}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

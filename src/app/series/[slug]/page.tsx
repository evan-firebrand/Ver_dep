import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { EventCard } from '@/components/EventCard';
import { ALL_SERIES, seriesToSlug, slugToSeries } from '@/lib/series';
import { getEvents, getVenues } from '@/lib/supabase';
import type { NolaEvent, Venue } from '@/lib/supabase';

const fetchEvents = cache(getEvents);
const fetchVenues = cache(getVenues);

export function generateStaticParams() {
  return ALL_SERIES.map((series) => ({ slug: seriesToSlug(series) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = slugToSeries(slug);
  if (series) {
    return {
      title: series,
      description: `Events in the ${series} series.`,
    };
  }
  return { title: 'Series' };
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

  const series = slugToSeries(slug);
  if (!series) notFound();

  let events: NolaEvent[] = [];
  let venues: Venue[] = [];

  try {
    [events, venues] = await Promise.all([fetchEvents(), fetchVenues()]);
  } catch {
    // Supabase unavailable — render empty state
  }

  const venueById = new Map(venues.map((v) => [v.id, v]));

  const seriesEvents = events
    .filter((e) => e.series.includes(series))
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.start.localeCompare(b.date.start);
    });

  return (
    <>
      <Link
        href="/series"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← All series
      </Link>

      <header className="mb-8">
        <span className="mb-3 inline-block rounded-full bg-amber-900/40 px-3 py-0.5 text-xs text-amber-400">
          Series
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {series}
        </h1>
      </header>

      {seriesEvents.length === 0 ? (
        <p className="text-zinc-500">No events in this series yet.</p>
      ) : (
        <>
          <p className="-mt-4 mb-8 text-zinc-400">
            {seriesEvents.length} event{seriesEvents.length === 1 ? '' : 's'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seriesEvents.map((event) => {
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

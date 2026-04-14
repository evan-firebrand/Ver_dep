import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { getEvents } from '@/lib/supabase';
import type { NolaEvent } from '@/lib/supabase';
import { SERIES } from '@/lib/series';

export const metadata: Metadata = {
  title: 'Series',
  description:
    'Browse NOLA music event series — Jazz Fest weekends, Fest by Nite, and Daze Between.',
};

const fetchEvents = cache(getEvents);

export default function SeriesIndexPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Series
        </h1>
        <p className="mt-2 text-zinc-400">
          Events grouped by series — Jazz Fest weekends, late-night shows, and
          more.
        </p>
      </header>
      <Suspense fallback={<p className="text-zinc-400">Loading series…</p>}>
        <SeriesList />
      </Suspense>
    </main>
  );
}

async function SeriesList() {
  await connection();

  let events: NolaEvent[] = [];

  try {
    events = await fetchEvents();
  } catch {
    // Supabase unavailable — render with zero counts
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SERIES.map((series) => {
        const count = events.filter((e) =>
          e.series.includes(series.name),
        ).length;

        return (
          <Link
            key={series.slug}
            href={`/series/${series.slug}`}
            className="flex flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-800 p-5 transition-colors hover:border-amber-500/60 hover:bg-zinc-800/80"
          >
            <h2 className="text-lg font-semibold text-zinc-100">
              {series.name}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              {series.description}
            </p>
            <span className="mt-auto pt-2 text-xs text-zinc-500">
              {count} event{count === 1 ? '' : 's'}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

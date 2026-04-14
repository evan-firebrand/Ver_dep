import type { Metadata } from 'next';
import Link from 'next/link';

import { ALL_SERIES, SERIES_DESCRIPTIONS, SERIES_SLUGS } from '@/lib/series';
import type { EventSeries } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Series',
  description:
    'Browse events by series — Jazz Fest weekends, Fest by Nite, Daze Between, and more.',
};

const seriesColors: Record<EventSeries, string> = {
  'Jazz Fest Weekend 1': 'border-amber-600/50 hover:border-amber-500',
  'Jazz Fest Weekend 2': 'border-amber-600/50 hover:border-amber-500',
  'Fest by Nite': 'border-purple-600/50 hover:border-purple-500',
  'Daze Between': 'border-teal-600/50 hover:border-teal-500',
  'Visitor Weekend': 'border-sky-600/50 hover:border-sky-500',
};

export default function SeriesIndexPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Series
        </h1>
        <p className="mt-2 text-zinc-400">Browse events by series.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_SERIES.map((series) => (
          <Link
            key={series}
            href={`/series/${SERIES_SLUGS[series]}`}
            className={`flex flex-col gap-2 rounded-lg border bg-zinc-800 p-5 transition-colors hover:bg-zinc-800/80 ${seriesColors[series]}`}
          >
            <h2 className="text-lg font-semibold text-zinc-100">{series}</h2>
            <p className="text-sm text-zinc-400">
              {SERIES_DESCRIPTIONS[series]}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}

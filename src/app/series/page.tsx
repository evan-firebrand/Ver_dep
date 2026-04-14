import type { Metadata } from 'next';
import Link from 'next/link';

import { ALL_SERIES, seriesToSlug } from '@/lib/series';

export const metadata: Metadata = {
  title: 'Series',
  description:
    'Browse events by series — Jazz Fest Weekend, Fest by Nite, Daze Between, and more.',
};

export default function SeriesPage() {
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
            href={`/series/${seriesToSlug(series)}`}
            className="flex flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-800 p-6 transition-colors hover:border-amber-500/60 hover:bg-zinc-800/80"
          >
            <span className="self-start rounded-full bg-amber-900/40 px-3 py-0.5 text-xs text-amber-400">
              Series
            </span>
            <h2 className="text-lg font-semibold text-zinc-100">{series}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}

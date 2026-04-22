import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { ActCard } from '@/components/ActCard';
import { sortActsByNextShow } from '@/lib/acts/sort-by-next-show';
import { todayInNolaTz } from '@/lib/events/formatters';
import { getActs, getEvents } from '@/lib/supabase';
import type { Act, Genre, NolaEvent } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Acts',
  description: 'Musicians, bands, and performers featured at NOLA events.',
};

const fetchActs = cache(getActs);
const fetchEvents = cache(getEvents);

const ALL_GENRES: Genre[] = [
  'Jazz',
  'Brass',
  'Funk',
  'Blues',
  'R&B / Soul',
  'Rock',
  'Indie',
  'Zydeco / Cajun',
  'Gospel',
  'Hip-Hop / Bounce',
  'Electronic',
  'Swing',
  'Latin',
  'Reggae',
  'Burlesque',
  'Country / Americana',
];

export default function ActsPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Acts</h1>
      </header>
      <Suspense fallback={<p className="text-zinc-400">Loading acts…</p>}>
        <ActsList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ActsList({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  await connection();

  const { genre: genreParam } = await searchParams;
  const activeGenre = ALL_GENRES.includes(genreParam as Genre)
    ? (genreParam as Genre)
    : null;

  let acts: Act[] = [];
  let events: NolaEvent[] = [];

  try {
    [acts, events] = await Promise.all([fetchActs(), fetchEvents()]);
  } catch {
    // Supabase unavailable — render empty state
  }

  const eventCountByAct = new Map<string, number>();
  for (const event of events) {
    for (const aid of event.actIds) {
      eventCountByAct.set(aid, (eventCountByAct.get(aid) ?? 0) + 1);
    }
  }

  const todayStr = todayInNolaTz();
  const sorted = sortActsByNextShow(acts, events, todayStr);
  const filtered = activeGenre
    ? sorted.filter((act) => act.genres.includes(activeGenre))
    : sorted;

  if (filtered.length === 0 && !activeGenre) {
    return (
      <p className="text-zinc-500">
        No acts are available right now. Check back soon.
      </p>
    );
  }

  return (
    <>
      <p className="-mt-4 mb-8 text-zinc-400">
        {filtered.length} act{filtered.length === 1 ? '' : 's'}
        {activeGenre ? ` · ${activeGenre}` : ''}
      </p>

      {/* Genre filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/acts"
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            !activeGenre
              ? 'bg-amber-500 font-medium text-zinc-900'
              : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          }`}
        >
          All
        </Link>
        {ALL_GENRES.map((genre) => (
          <Link
            key={genre}
            href={`/acts?genre=${encodeURIComponent(genre)}`}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              activeGenre === genre
                ? 'bg-amber-500 font-medium text-zinc-900'
                : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {genre}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 p-10 text-center">
          <p className="text-zinc-500">
            No acts found for genre &quot;{activeGenre}&quot;.
          </p>
          <Link
            href="/acts"
            className="mt-3 inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            See all acts →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((act) => (
            <ActCard
              key={act.id}
              act={act}
              eventCount={eventCountByAct.get(act.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

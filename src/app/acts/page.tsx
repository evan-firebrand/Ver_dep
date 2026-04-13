import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';

import { ActCard } from '@/components/ActCard';
import { getActs } from '@/lib/notion';
import type { Act, Genre } from '@/lib/notion';

export const metadata: Metadata = {
  title: 'Acts',
  description: 'Musicians, bands, and performers featured at NOLA events.',
};

const fetchActs = cache(getActs);

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

export default async function ActsPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre: genreParam } = await searchParams;
  const activeGenre = ALL_GENRES.includes(genreParam as Genre)
    ? (genreParam as Genre)
    : null;

  let acts: Act[] = [];

  try {
    acts = await fetchActs();
  } catch {
    // Notion unavailable — render empty state
  }

  const sorted = [...acts].sort((a, b) => a.name.localeCompare(b.name));
  const filtered = activeGenre
    ? sorted.filter((act) => act.genres.includes(activeGenre))
    : sorted;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Acts</h1>
        <p className="mt-1 text-zinc-400">
          {filtered.length > 0
            ? `${filtered.length} act${filtered.length === 1 ? '' : 's'}${activeGenre ? ` · ${activeGenre}` : ''}`
            : 'No acts found.'}
        </p>
      </header>

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
        <p className="text-zinc-500">
          {activeGenre
            ? `No acts found for genre "${activeGenre}".`
            : 'No acts are available right now. Check back soon.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((act) => (
            <ActCard key={act.id} act={act} />
          ))}
        </div>
      )}
    </main>
  );
}

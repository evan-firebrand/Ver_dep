import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { cache } from 'react';

import { EventCard } from '@/components/EventCard';
import { getActs, getEvents, getVenues } from '@/lib/supabase';
import type { Act, NolaEvent, Venue } from '@/lib/supabase';
import { buildLookup } from '@/lib/supabase/resolve-relations';

const fetchActs = cache(getActs);
const fetchEvents = cache(getEvents);
const fetchVenues = cache(getVenues);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const acts = await fetchActs();
    const act = acts.find((a) => a.id === id);
    if (act) return { title: act.name };
  } catch {
    // fall through to default
  }
  return { title: 'Act' };
}

export default function ActDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense fallback={<p className="text-zinc-400">Loading act…</p>}>
        <ActContent params={params} />
      </Suspense>
    </main>
  );
}

async function ActContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();

  const { id } = await params;

  let acts: Act[] = [];
  let events: NolaEvent[] = [];
  let venues: Venue[] = [];

  try {
    [acts, events, venues] = await Promise.all([
      fetchActs(),
      fetchEvents(),
      fetchVenues(),
    ]);
  } catch {
    // Supabase unavailable
  }

  const act = acts.find((a) => a.id === id);
  if (!act) notFound();

  const venueById = buildLookup(venues);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events
    .filter(
      (e) => e.actIds.includes(id) && e.date !== null && e.date.start >= today,
    )
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.start.localeCompare(b.date.start);
    });

  return (
    <>
      <Link
        href="/acts"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← All acts
      </Link>

      <article>
        <header className="mb-8">
          {act.actType && (
            <div className="mb-3">
              <span className="rounded-full bg-zinc-700 px-3 py-0.5 text-xs font-medium text-zinc-300">
                {act.actType}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {act.name || 'Unknown Act'}
          </h1>
        </header>

        {act.genres.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
              Genres
            </h2>
            <div className="flex flex-wrap gap-2">
              {act.genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/acts?genre=${encodeURIComponent(genre)}`}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </section>
        )}

        {act.website && (
          <dl className="mb-8">
            <div>
              <dt className="mb-0.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Website
              </dt>
              <dd>
                <a
                  href={act.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300"
                >
                  {act.website.replace(/^https?:\/\//, '')}
                </a>
              </dd>
            </div>
          </dl>
        )}

        {act.notes && (
          <section className="mb-8">
            <h2 className="mb-2 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
              Notes
            </h2>
            <p className="leading-relaxed text-zinc-300">{act.notes}</p>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
            Upcoming Performances
            {upcomingEvents.length > 0 && ` (${upcomingEvents.length})`}
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-zinc-500">No upcoming performances scheduled.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingEvents.map((event) => {
                const venueName = event.venueId
                  ? venueById.get(event.venueId)?.name
                  : undefined;
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    venueName={venueName}
                  />
                );
              })}
            </div>
          )}
        </section>
      </article>
    </>
  );
}

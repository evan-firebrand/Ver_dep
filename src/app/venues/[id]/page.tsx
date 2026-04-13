import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { cache } from 'react';

import { EventCard } from '@/components/EventCard';
import { getEvents, getVenues } from '@/lib/notion';
import type { NolaEvent, Venue } from '@/lib/notion';

const fetchVenues = cache(getVenues);
const fetchEvents = cache(getEvents);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const venues = await fetchVenues();
    const venue = venues.find((v) => v.id === id);
    if (venue) {
      return { title: venue.name };
    }
  } catch {
    // fall through to default
  }
  return { title: 'Venue' };
}

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense fallback={<p className="text-zinc-400">Loading venue…</p>}>
        <VenueContent params={params} />
      </Suspense>
    </main>
  );
}

async function VenueContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let venues: Venue[] = [];
  let events: NolaEvent[] = [];

  try {
    [venues, events] = await Promise.all([fetchVenues(), fetchEvents()]);
  } catch {
    // Notion unavailable
  }

  const venue = venues.find((v) => v.id === id);
  if (!venue) notFound();

  const venueEvents = events
    .filter((e) => e.venueIds.includes(id))
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.start.localeCompare(b.date.start);
    });

  return (
    <>
      <Link
        href="/venues"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← All venues
      </Link>

      <article>
        <header className="mb-8">
          {venue.venueType && (
            <span className="mb-3 inline-block rounded-full bg-zinc-700 px-3 py-0.5 text-xs font-medium text-zinc-300">
              {venue.venueType}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {venue.name || 'Unnamed Venue'}
          </h1>
          {venue.neighborhood && (
            <p className="mt-2 text-zinc-400">{venue.neighborhood}</p>
          )}
        </header>

        <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {venue.address && (
            <div>
              <dt className="mb-0.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Address
              </dt>
              <dd className="text-zinc-200">{venue.address}</dd>
            </div>
          )}
          {venue.website && (
            <div>
              <dt className="mb-0.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Website
              </dt>
              <dd>
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300"
                >
                  {venue.website.replace(/^https?:\/\//, '')}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {venue.notes && (
          <section className="mb-8">
            <h2 className="mb-2 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
              Notes
            </h2>
            <p className="leading-relaxed text-zinc-300">{venue.notes}</p>
          </section>
        )}

        {venueEvents.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
              Events at this venue ({venueEvents.length})
            </h2>
            <div className="flex flex-col gap-3">
              {venueEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

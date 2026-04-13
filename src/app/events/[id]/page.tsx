import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { cache } from 'react';

import { ActBadge } from '@/components/ActBadge';
import { formatEventDate } from '@/lib/format-date';
import { getActs, getEvents, getVenues } from '@/lib/notion';
import type { Act, NolaEvent, Venue } from '@/lib/notion';

const fetchEvents = cache(getEvents);
const fetchVenues = cache(getVenues);
const fetchActs = cache(getActs);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const events = await fetchEvents();
    const event = events.find((e) => e.id === id);
    if (event) {
      return { title: event.name };
    }
  } catch {
    // fall through to default
  }
  return { title: 'Event' };
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense fallback={<p className="text-zinc-400">Loading event…</p>}>
        <EventContent params={params} />
      </Suspense>
    </main>
  );
}

async function EventContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let events: NolaEvent[] = [];
  let venues: Venue[] = [];
  let acts: Act[] = [];

  try {
    [events, venues, acts] = await Promise.all([
      fetchEvents(),
      fetchVenues(),
      fetchActs(),
    ]);
  } catch {
    // Notion unavailable
  }

  const event = events.find((e) => e.id === id);
  if (!event) notFound();

  const venueById = new Map(venues.map((v) => [v.id, v]));
  const actById = new Map(acts.map((a) => [a.id, a]));

  const eventVenues = event.venueIds
    .map((vid) => venueById.get(vid))
    .filter(Boolean) as Venue[];
  const eventActs = event.actIds
    .map((aid) => actById.get(aid))
    .filter(Boolean) as Act[];

  const showStatus = event.status && event.status !== 'Active';

  return (
    <>
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← All events
      </Link>

      <article>
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {event.eventType && (
              <span className="rounded-full bg-zinc-700 px-3 py-0.5 text-xs font-medium text-zinc-300">
                {event.eventType}
              </span>
            )}
            {showStatus && (
              <span className="rounded-full bg-red-900/60 px-3 py-0.5 text-xs font-medium text-red-300">
                {event.status}
              </span>
            )}
            {event.series.map((s) => (
              <span
                key={s}
                className="rounded-full bg-amber-900/40 px-3 py-0.5 text-xs text-amber-400"
              >
                {s}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {event.name || 'Untitled Event'}
          </h1>
        </header>

        <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {event.date && (
            <div>
              <dt className="mb-0.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Date
              </dt>
              <dd className="text-zinc-200">{formatEventDate(event.date)}</dd>
            </div>
          )}
          {event.time && (
            <div>
              <dt className="mb-0.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Time
              </dt>
              <dd className="text-zinc-200">{event.time}</dd>
            </div>
          )}
          {event.cost && (
            <div>
              <dt className="mb-0.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Cost
              </dt>
              <dd className="text-zinc-200">{event.cost}</dd>
            </div>
          )}
          {eventVenues.length > 0 && (
            <div>
              <dt className="mb-0.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                {eventVenues.length === 1 ? 'Venue' : 'Venues'}
              </dt>
              <dd className="flex flex-col gap-1">
                {eventVenues.map((v) => (
                  <Link
                    key={v.id}
                    href={`/venues/${v.id}`}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    {v.name}
                  </Link>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {eventActs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
              Performers
            </h2>
            <div className="flex flex-wrap gap-2">
              {eventActs.map((act) => (
                <ActBadge key={act.id} name={act.name} genres={act.genres} />
              ))}
            </div>
          </section>
        )}

        {event.notes && (
          <section className="mb-8">
            <h2 className="mb-2 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
              Notes
            </h2>
            <p className="leading-relaxed text-zinc-300">{event.notes}</p>
          </section>
        )}

        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-zinc-600 px-5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-100"
          >
            More info ↗
          </a>
        )}
      </article>
    </>
  );
}

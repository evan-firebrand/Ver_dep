import Link from 'next/link';
import { connection } from 'next/server';
import { cache, Suspense } from 'react';

import { EventCard } from '@/components/EventCard';
import { filterByDate } from '@/lib/events/filters';
import { toLocalDateString, todayInNolaTz } from '@/lib/events/formatters';
import { buildEventsHref } from '@/lib/events/search-params';
import { getEvents, getVenues } from '@/lib/supabase';
import type { NolaEvent, Venue } from '@/lib/supabase';

const fetchEvents = cache(getEvents);
const fetchVenues = cache(getVenues);

interface QuickLink {
  label: string;
  href: string;
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'Free tonight', href: '/this-week?cost=free' },
  { label: 'Festivals', href: buildEventsHref({ eventTypes: ['Festival'] }) },
  {
    label: 'Second Lines',
    href: buildEventsHref({ eventTypes: ['Second Line'] }),
  },
  {
    label: 'French Quarter',
    href: buildEventsHref({ neighborhood: 'French Quarter' }),
  },
  { label: 'Marigny', href: buildEventsHref({ neighborhood: 'Marigny' }) },
  { label: 'Brass bands', href: '/acts?genre=Brass' },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Compact hero */}
      <section className="px-6 pt-12 pb-10 text-center sm:pt-16">
        <p className="mb-3 text-xs font-semibold tracking-widest text-amber-400 uppercase">
          New Orleans
        </p>
        <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          NOLA Music Tracker
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-base text-zinc-400 sm:text-lg">
          Live music, festivals, second lines, and events happening across New
          Orleans.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/this-week"
            className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-400"
          >
            What&apos;s on this week
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-zinc-600 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-100"
          >
            Browse all events
          </Link>
        </div>
      </section>

      {/* Quick links */}
      <section className="border-t border-zinc-800 px-4 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-xs tracking-wider text-zinc-500 uppercase">
            Quick picks:
          </span>
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300 transition-colors hover:border-amber-500/60 hover:text-amber-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Today / Tomorrow / Weekend sections */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <Suspense fallback={<p className="text-zinc-400">Loading events…</p>}>
          <UpcomingSections />
        </Suspense>
      </section>
    </main>
  );
}

async function UpcomingSections() {
  await connection();

  let events: NolaEvent[] = [];
  let venues: Venue[] = [];

  try {
    [events, venues] = await Promise.all([fetchEvents(), fetchVenues()]);
  } catch {
    // Supabase unavailable — render nothing beyond the hero
  }

  const venueById = new Map(venues.map((v) => [v.id, v]));
  const todayStr = todayInNolaTz();
  const [y, m, d] = todayStr.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);
  const tomorrowDate = new Date(y, m - 1, d + 1);
  const tomorrowStr = toLocalDateString(tomorrowDate);

  const todayEvents = filterByDate(events, todayStr);
  const tomorrowEvents = filterByDate(events, tomorrowStr);

  // Starts at i=2 to skip today/tomorrow, which have their own sections above.
  const weekendEvents: NolaEvent[] = [];
  for (let i = 2; i <= 7; i++) {
    const day = new Date(todayDate);
    day.setDate(day.getDate() + i);
    const dow = day.getDay();
    if (dow === 6 || dow === 0) {
      weekendEvents.push(...filterByDate(events, toLocalDateString(day)));
    }
  }

  const sections: { title: string; events: NolaEvent[]; cta: QuickLink }[] = [
    {
      title: 'Tonight',
      events: todayEvents,
      cta: { label: 'See all tonight', href: '/this-week' },
    },
    {
      title: 'Tomorrow',
      events: tomorrowEvents,
      cta: { label: 'See all tomorrow', href: '/this-week' },
    },
    {
      title: 'This Weekend',
      events: weekendEvents,
      cta: { label: 'See all weekend', href: '/this-week' },
    },
  ];

  const hasAny = sections.some((s) => s.events.length > 0);
  if (!hasAny) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 p-10 text-center">
        <p className="text-zinc-500">
          No upcoming events listed for the next few days.
        </p>
        <Link
          href="/events"
          className="mt-3 inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
        >
          Browse all events →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => {
        if (section.events.length === 0) return null;
        const visible = section.events.slice(0, 3);
        const hasMore = section.events.length > visible.length;
        return (
          <section key={section.title}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                {section.title}
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  ({section.events.length})
                </span>
              </h2>
              <Link
                href={section.cta.href}
                className="text-sm font-medium text-amber-400 hover:text-amber-300"
              >
                {section.cta.label} →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((event) => {
                const venue = event.venueId
                  ? venueById.get(event.venueId)
                  : undefined;
                return <EventCard key={event.id} event={event} venue={venue} />;
              })}
            </div>
            {hasMore && (
              <p className="mt-3 text-right text-xs text-zinc-500">
                +{section.events.length - visible.length} more —{' '}
                <Link
                  href={section.cta.href}
                  className="text-amber-400 hover:text-amber-300"
                >
                  see all
                </Link>
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

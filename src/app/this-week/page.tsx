import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { filterThisWeek } from '@/lib/events/filters';
import { todayInNolaTz } from '@/lib/events/formatters';
import { getEvents, getVenues } from '@/lib/supabase';
import type { NolaEvent, Venue } from '@/lib/supabase';
import { ThisWeekView } from '@/components/this-week/ThisWeekView';

export const metadata: Metadata = {
  title: 'This Week in NOLA',
  description: 'Events in New Orleans for the next 7 days.',
};

export default function ThisWeekPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          This Week in NOLA
        </h1>
        <p className="mt-2 text-zinc-400">
          Events in New Orleans for the next 7 days.
        </p>
      </header>
      <Suspense fallback={<p className="text-zinc-400">Loading events…</p>}>
        <ThisWeekContent />
      </Suspense>
    </main>
  );
}

async function ThisWeekContent() {
  await connection();

  const todayStr = todayInNolaTz();

  let allEvents: NolaEvent[] = [];
  let venues: Venue[] = [];

  try {
    [allEvents, venues] = await Promise.all([getEvents(), getVenues()]);
  } catch {
    // Supabase unavailable — render empty state
  }

  const weekEvents = filterThisWeek(allEvents, todayStr);
  const venueMap = Object.fromEntries(venues.map((v) => [v.id, v]));

  return (
    <ThisWeekView events={weekEvents} venueMap={venueMap} today={todayStr} />
  );
}

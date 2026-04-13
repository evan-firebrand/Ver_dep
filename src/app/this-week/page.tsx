import { getEvents, getVenues } from '@/lib/notion';
import { filterThisWeek } from '@/lib/events/filters';
import { ThisWeekView } from '@/components/this-week/ThisWeekView';

export const metadata = {
  title: 'This Week in NOLA',
  description: 'Events in New Orleans for the next 7 days.',
};

export default async function ThisWeekPage() {
  // Determine today's date in the NOLA timezone (America/Chicago).
  // en-CA locale produces YYYY-MM-DD format, which is what our filter utilities expect.
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
  }).format(new Date());

  const [allEvents, venues] = await Promise.all([getEvents(), getVenues()]);
  const weekEvents = filterThisWeek(allEvents, todayStr);
  const venueMap = Object.fromEntries(venues.map((v) => [v.id, v]));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            This Week in NOLA
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Events in New Orleans for the next 7 days.
          </p>
        </header>

        <ThisWeekView
          events={weekEvents}
          venueMap={venueMap}
          today={todayStr}
        />
      </div>
    </div>
  );
}

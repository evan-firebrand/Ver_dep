import type { NolaEvent, Venue } from '@/lib/supabase';
import {
  formatCost,
  formatEventDate,
  formatEventTime,
} from '@/lib/events/formatters';

interface EventCardProps {
  event: NolaEvent;
  venueMap: Record<string, Venue>;
}

export function EventCard({ event, venueMap }: EventCardProps) {
  const primaryVenue = event.venueId ? (venueMap[event.venueId] ?? null) : null;
  const time = formatEventTime(event);
  const costLabel = formatCost(event.cost);
  const isCancelled = event.status === 'Cancelled';
  const isAltered = event.status === 'Postponed' || event.status === 'Sold Out';

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {event.eventType && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {event.eventType}
              </span>
            )}
            {isCancelled && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Cancelled
              </span>
            )}
            {isAltered && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {event.status}
              </span>
            )}
          </div>
          <h3
            className={`mt-1 text-base leading-snug font-semibold ${
              isCancelled
                ? 'text-zinc-400 line-through'
                : 'text-zinc-900 dark:text-zinc-50'
            }`}
          >
            {event.link ? (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {event.name}
              </a>
            ) : (
              event.name
            )}
          </h3>
        </div>
        <span className="shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {costLabel}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        {event.date && <span>{formatEventDate(event.date)}</span>}
        {time && <span>{time}</span>}
        {primaryVenue && (
          <span>
            {primaryVenue.name}
            {primaryVenue.neighborhood && (
              <span className="text-zinc-400 dark:text-zinc-500">
                {' '}
                · {primaryVenue.neighborhood}
              </span>
            )}
          </span>
        )}
      </div>
    </article>
  );
}

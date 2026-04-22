import Link from 'next/link';

import {
  formatCost,
  formatEventDate,
  formatEventTime,
} from '@/lib/events/formatters';
import { buildEventsHref } from '@/lib/events/search-params';
import type { EventStatus, EventType, NolaEvent, Venue } from '@/lib/supabase';

interface Props {
  event: NolaEvent;
  /**
   * Pass the venue when you want the card to show venue name + neighborhood.
   * On pages already scoped to a venue (e.g. /venues/[id]), pass undefined.
   */
  venue?: Venue | null;
}

const eventTypeColors: Record<EventType, string> = {
  'Live Music': 'bg-purple-900/60 text-purple-300 hover:bg-purple-900/80',
  Festival: 'bg-amber-900/60 text-amber-300 hover:bg-amber-900/80',
  'Second Line': 'bg-green-900/60 text-green-300 hover:bg-green-900/80',
  Parade: 'bg-blue-900/60 text-blue-300 hover:bg-blue-900/80',
  'Community / Neighborhood':
    'bg-teal-900/60 text-teal-300 hover:bg-teal-900/80',
};

const statusColors: Record<EventStatus, string> = {
  Active: '',
  Cancelled: 'bg-red-900/60 text-red-300',
  Postponed: 'bg-orange-900/60 text-orange-300',
  'Sold Out': 'bg-sky-900/60 text-sky-300',
};

export function EventCard({ event, venue }: Props) {
  const dateStr = event.date ? formatEventDate(event.date) : null;
  const timeStr = formatEventTime(event);
  const costStr = formatCost(event.cost);
  const isFree = costStr === 'Free';
  const showStatus = event.status && event.status !== 'Active';
  const isCancelled = event.status === 'Cancelled';

  return (
    <article className="group flex flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-800 p-4 transition-colors hover:border-amber-500/60 hover:bg-zinc-800/80">
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`text-base leading-snug font-semibold ${
            isCancelled ? 'text-zinc-400 line-through' : 'text-zinc-100'
          }`}
        >
          <Link
            href={`/events/${event.id}`}
            className="transition-colors group-hover:text-amber-300"
          >
            {event.name || 'Untitled Event'}
          </Link>
        </h3>
        {isFree ? (
          <Link
            href={buildEventsHref({ cost: 'free' })}
            className="shrink-0 text-sm font-medium text-zinc-300 transition-colors hover:text-amber-300"
          >
            {costStr}
          </Link>
        ) : (
          <span className="shrink-0 text-sm font-medium text-zinc-300">
            {costStr}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
        {dateStr && <span>{dateStr}</span>}
        {timeStr && <span>{timeStr}</span>}
        {venue && (
          <span>
            {venue.name}
            {venue.neighborhood && (
              <>
                <span className="text-zinc-500"> · </span>
                <Link
                  href={buildEventsHref({ neighborhood: venue.neighborhood })}
                  className="text-zinc-500 transition-colors hover:text-amber-300"
                >
                  {venue.neighborhood}
                </Link>
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {event.eventType && (
          <Link
            href={buildEventsHref({ eventTypes: [event.eventType] })}
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${eventTypeColors[event.eventType]}`}
          >
            {event.eventType}
          </Link>
        )}
        {showStatus && event.status && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[event.status]}`}
          >
            {event.status}
          </span>
        )}
        {event.interested && (
          <span className="text-xs text-amber-400">★ Interested</span>
        )}
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-amber-300"
            aria-label={`Open ${event.name || 'event'} website in new tab`}
          >
            More info <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

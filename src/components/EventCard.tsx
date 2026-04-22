import Link from 'next/link';

import { formatEventDate } from '@/lib/events/formatters';
import type { EventStatus, EventType, NolaEvent } from '@/lib/supabase';

interface Props {
  event: NolaEvent;
  venueName?: string;
}

const eventTypeColors: Record<EventType, string> = {
  'Live Music': 'bg-purple-900/60 text-purple-300',
  Festival: 'bg-amber-900/60 text-amber-300',
  'Second Line': 'bg-green-900/60 text-green-300',
  Parade: 'bg-blue-900/60 text-blue-300',
  'Community / Neighborhood': 'bg-teal-900/60 text-teal-300',
};

const statusColors: Record<EventStatus, string> = {
  Active: '',
  Cancelled: 'bg-red-900/60 text-red-300',
  Postponed: 'bg-orange-900/60 text-orange-300',
  'Sold Out': 'bg-sky-900/60 text-sky-300',
};

export function EventCard({ event, venueName }: Props) {
  const dateStr = event.date ? formatEventDate(event.date) : null;
  const showStatus = event.status && event.status !== 'Active';

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-800 p-4 transition-colors hover:border-amber-500/60 hover:bg-zinc-800/80"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base leading-snug font-semibold text-zinc-100">
          {event.name || 'Untitled Event'}
        </h3>
        {showStatus && event.status && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[event.status]}`}
          >
            {event.status}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
        {dateStr && <span>{dateStr}</span>}
        {venueName && (
          <>
            {dateStr && <span className="text-zinc-600">·</span>}
            <span>{venueName}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {event.eventType && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${eventTypeColors[event.eventType]}`}
          >
            {event.eventType}
          </span>
        )}
        {event.cost && (
          <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
            {event.cost}
          </span>
        )}
        {event.interested && (
          <span className="text-xs text-amber-400">★ Interested</span>
        )}
      </div>
    </Link>
  );
}

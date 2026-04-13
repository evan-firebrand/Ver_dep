import Link from 'next/link';

import type { Venue, VenueType } from '@/lib/notion';

interface Props {
  venue: Venue;
  eventCount?: number;
}

const venueTypeColors: Record<VenueType, string> = {
  'Bar / Club': 'bg-violet-900/60 text-violet-300',
  'Concert Hall': 'bg-amber-900/60 text-amber-300',
  Outdoor: 'bg-green-900/60 text-green-300',
  Museum: 'bg-blue-900/60 text-blue-300',
  'Restaurant / Lounge': 'bg-rose-900/60 text-rose-300',
  Theater: 'bg-indigo-900/60 text-indigo-300',
  'Hotel Venue': 'bg-slate-700/60 text-slate-300',
};

export function VenueCard({ venue, eventCount }: Props) {
  return (
    <Link
      href={`/venues/${venue.id}`}
      className="flex flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-800 p-4 transition-colors hover:border-amber-500/60 hover:bg-zinc-800/80"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base leading-snug font-semibold text-zinc-100">
          {venue.name || 'Unnamed Venue'}
        </h3>
        {typeof eventCount === 'number' && eventCount > 0 && (
          <span className="shrink-0 rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
            {eventCount} {eventCount === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 text-sm text-zinc-400">
        {venue.neighborhood && <span>{venue.neighborhood}</span>}
        {venue.address && (
          <span className="truncate text-xs text-zinc-500">
            {venue.address}
          </span>
        )}
      </div>

      {venue.venueType && (
        <div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${venueTypeColors[venue.venueType]}`}
          >
            {venue.venueType}
          </span>
        </div>
      )}
    </Link>
  );
}

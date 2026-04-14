'use client';

import { useState } from 'react';

import { applyFilters, DEFAULT_FILTERS } from '@/lib/events/filters';
import type { EventFilters } from '@/lib/events/filters';
import { toLocalDateString } from '@/lib/events/formatters';
import type { NolaEvent, Venue } from '@/lib/notion/types';

import { EventCard } from './EventCard';
import { FilterBar } from './FilterBar';

interface ThisWeekViewProps {
  events: NolaEvent[];
  venueMap: Record<string, Venue>;
  /** YYYY-MM-DD string representing today in NOLA timezone. */
  today: string;
}

export function ThisWeekView({ events, venueMap, today }: ThisWeekViewProps) {
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);

  // Parse today string to a local Date for the FilterBar day labels.
  const [year, month, day] = today.split('-').map(Number);
  const todayDate = new Date(year, month - 1, day);

  const filtered = applyFilters(events, filters, venueMap);
  const count = filtered.length;

  return (
    <div className="space-y-6">
      <FilterBar filters={filters} today={todayDate} onChange={setFilters} />

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {count === 0
          ? 'No events match your filters.'
          : `${count} event${count === 1 ? '' : 's'}`}
      </p>

      {count === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 p-10 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            No events found for the selected filters.
          </p>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-3 text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} venueMap={venueMap} />
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-400 dark:text-zinc-600">
        Showing events for the week of {toLocalDateString(todayDate)}.
      </p>
    </div>
  );
}

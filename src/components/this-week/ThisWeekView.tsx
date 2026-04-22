'use client';

import { useState } from 'react';

import { applyFilters, DEFAULT_FILTERS } from '@/lib/events/filters';
import type { EventFilters } from '@/lib/events/filters';
import { parseLocalDate, toLocalDateString } from '@/lib/events/formatters';
import type { NolaEvent, Venue } from '@/lib/supabase';

import { EventCard } from '@/components/EventCard';

import { FilterBar } from './FilterBar';

interface ThisWeekViewProps {
  events: NolaEvent[];
  venueMap: Record<string, Venue>;
  /** YYYY-MM-DD string representing today in NOLA timezone. */
  today: string;
}

export function ThisWeekView({ events, venueMap, today }: ThisWeekViewProps) {
  // Default to today rather than the full week so users see a focused list first;
  // "All Days" in the FilterBar opens the full 7-day view.
  const initialFilters: EventFilters = { ...DEFAULT_FILTERS, date: today };
  const [filters, setFilters] = useState<EventFilters>(initialFilters);

  const todayDate = parseLocalDate(today);

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
            onClick={() => setFilters(initialFilters)}
            className="mt-3 text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const venue = event.venueId ? venueMap[event.venueId] : undefined;
            return <EventCard key={event.id} event={event} venue={venue} />;
          })}
        </div>
      )}

      <p className="text-xs text-zinc-400 dark:text-zinc-600">
        Showing events for the week of {toLocalDateString(todayDate)}.
      </p>
    </div>
  );
}

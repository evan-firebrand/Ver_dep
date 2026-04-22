'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import type { CostFilter, EventFilters } from '@/lib/events/filters';
import {
  buildEventsHref,
  EVENT_TYPES,
  NEIGHBORHOODS,
  parseEventFilters,
} from '@/lib/events/search-params';
import type { EventType, Neighborhood } from '@/lib/supabase';

const COST_OPTIONS: { value: CostFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const PILL_BASE =
  'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors';
const PILL_ACTIVE = 'bg-amber-500 text-zinc-900';
const PILL_INACTIVE =
  'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100';

function hasAnyFilter(filters: EventFilters): boolean {
  return (
    filters.cost !== 'all' ||
    filters.neighborhood !== null ||
    filters.eventTypes.length > 0 ||
    filters.date !== null
  );
}

export function FilterBarUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLSearchParams → our RawSearchParams shape.
  const raw = Object.fromEntries(searchParams.entries());
  const filters = parseEventFilters(raw);

  const push = useCallback(
    (next: EventFilters) => {
      router.push(buildEventsHref(next));
    },
    [router],
  );

  const setCost = (cost: CostFilter) => push({ ...filters, cost });

  const setNeighborhood = (neighborhood: Neighborhood | null) =>
    push({ ...filters, neighborhood });

  const toggleEventType = (type: EventType) => {
    const current = filters.eventTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    push({ ...filters, eventTypes: next });
  };

  const clearAll = () =>
    router.push(
      buildEventsHref({
        cost: 'all',
        neighborhood: null,
        eventTypes: [],
        date: null,
      }),
    );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">Filter by cost</legend>
          {COST_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCost(value)}
              aria-pressed={filters.cost === value}
              className={`${PILL_BASE} ${filters.cost === value ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {label}
            </button>
          ))}
        </fieldset>

        <div className="flex items-center gap-2">
          <label
            htmlFor="events-neighborhood-filter"
            className="text-sm text-zinc-400"
          >
            Neighborhood
          </label>
          <select
            id="events-neighborhood-filter"
            value={filters.neighborhood ?? ''}
            onChange={(e) =>
              setNeighborhood((e.target.value as Neighborhood) || null)
            }
            className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200"
          >
            <option value="">All</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {hasAnyFilter(filters) && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto text-sm font-medium text-zinc-400 hover:text-amber-300"
          >
            Clear filters
          </button>
        )}
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm text-zinc-400">Event type</legend>
        <div className="flex flex-wrap gap-1.5">
          {EVENT_TYPES.map((type) => {
            const isActive = filters.eventTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleEventType(type)}
                aria-pressed={isActive}
                className={`${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_INACTIVE}`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

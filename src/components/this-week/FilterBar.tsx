'use client';

import type { EventType, Neighborhood } from '@/lib/supabase';
import type { CostFilter, EventFilters } from '@/lib/events/filters';
import {
  formatDayLabel,
  getThisWeekDays,
  toLocalDateString,
} from '@/lib/events/formatters';

const EVENT_TYPES: EventType[] = [
  'Live Music',
  'Festival',
  'Second Line',
  'Parade',
  'Community / Neighborhood',
];

const NEIGHBORHOODS: Neighborhood[] = [
  'French Quarter',
  'Marigny',
  'Bywater',
  'Treme',
  'Uptown',
  'CBD / Warehouse',
  'Mid-City',
  'Gentilly',
  'Garden District',
  'Frenchmen Street',
];

const COST_OPTIONS: { value: CostFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const PILL_BASE =
  'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors';
const PILL_ACTIVE = 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900';
const PILL_INACTIVE =
  'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700';

interface FilterBarProps {
  filters: EventFilters;
  today: Date;
  onChange: (filters: EventFilters) => void;
}

export function FilterBar({ filters, today, onChange }: FilterBarProps) {
  const weekDays = getThisWeekDays(today);

  function setDate(date: string | null) {
    onChange({ ...filters, date });
  }

  function setCost(cost: CostFilter) {
    onChange({ ...filters, cost });
  }

  function setNeighborhood(neighborhood: Neighborhood | null) {
    onChange({ ...filters, neighborhood });
  }

  function toggleEventType(type: EventType) {
    const current = filters.eventTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ ...filters, eventTypes: next });
  }

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setDate(null)}
          className={`${PILL_BASE} ${filters.date === null ? PILL_ACTIVE : PILL_INACTIVE}`}
        >
          All Days
        </button>
        {weekDays.map((day) => {
          const dateStr = toLocalDateString(day);
          const isActive = filters.date === dateStr;
          return (
            <button
              key={dateStr}
              onClick={() => setDate(dateStr)}
              className={`${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {formatDayLabel(day, today)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Cost toggle */}
        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">Filter by cost</legend>
          {COST_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCost(value)}
              aria-pressed={filters.cost === value}
              className={`${PILL_BASE} ${filters.cost === value ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {label}
            </button>
          ))}
        </fieldset>

        {/* Neighborhood selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="neighborhood-filter"
            className="text-sm text-zinc-500 dark:text-zinc-400"
          >
            Neighborhood
          </label>
          <select
            id="neighborhood-filter"
            value={filters.neighborhood ?? ''}
            onChange={(e) =>
              setNeighborhood((e.target.value as Neighborhood) || null)
            }
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="">All</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Event type pills */}
      <fieldset>
        <legend className="mb-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Event type
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {EVENT_TYPES.map((type) => {
            const isActive = filters.eventTypes.includes(type);
            return (
              <button
                key={type}
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

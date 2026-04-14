import type { EventType, Neighborhood, NolaEvent, Venue } from '@/lib/supabase';

export type CostFilter = 'all' | 'free' | 'paid';

export interface EventFilters {
  /** ISO date string (YYYY-MM-DD) for a specific day; null = show all days. */
  date: string | null;
  cost: CostFilter;
  neighborhood: Neighborhood | null;
  /** Empty array means all event types. */
  eventTypes: EventType[];
}

export const DEFAULT_FILTERS: EventFilters = {
  date: null,
  cost: 'all',
  neighborhood: null,
  eventTypes: [],
};

function toDateStr(isoString: string): string {
  return isoString.slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Returns events whose date range overlaps with [startStr, endStr] inclusive
 * (YYYY-MM-DD comparisons). Events with no date are excluded.
 */
export function filterByDateRange(
  events: NolaEvent[],
  startStr: string,
  endStr: string,
): NolaEvent[] {
  return events.filter((event) => {
    if (!event.date) return false;
    const eventStart = toDateStr(event.date.start);
    const eventEnd = event.date.end ? toDateStr(event.date.end) : eventStart;
    return eventStart <= endStr && eventEnd >= startStr;
  });
}

/**
 * Returns events relevant to the 7-day window starting at todayStr (YYYY-MM-DD).
 * Multi-day events that overlap the window are included.
 */
export function filterThisWeek(
  events: NolaEvent[],
  todayStr: string,
): NolaEvent[] {
  return filterByDateRange(events, todayStr, addDays(todayStr, 6));
}

/**
 * Returns events that occur on the given date (YYYY-MM-DD).
 * Handles multi-day events whose range spans the date.
 * Null returns all events unchanged.
 */
export function filterByDate(
  events: NolaEvent[],
  date: string | null,
): NolaEvent[] {
  if (!date) return events;
  return events.filter((event) => {
    if (!event.date) return false;
    const eventStart = toDateStr(event.date.start);
    const eventEnd = event.date.end ? toDateStr(event.date.end) : eventStart;
    return date >= eventStart && date <= eventEnd;
  });
}

/** Returns true when the event has no cost or the cost string indicates free admission. */
export function isFreeEvent(event: NolaEvent): boolean {
  if (!event.cost || event.cost.trim() === '') return true;
  const lower = event.cost.trim().toLowerCase();
  return lower.startsWith('free') || lower === '$0';
}

/**
 * Filters events by cost type.
 * - 'all': returns all events
 * - 'free': events with no cost or explicitly free admission
 * - 'paid': events with a non-free cost
 */
export function filterByCost(
  events: NolaEvent[],
  cost: CostFilter,
): NolaEvent[] {
  if (cost === 'all') return events;
  if (cost === 'free') return events.filter(isFreeEvent);
  return events.filter((e) => !isFreeEvent(e));
}

/**
 * Filters events to those with at least one venue in the given neighborhood.
 * Null returns all events unchanged.
 */
export function filterByNeighborhood(
  events: NolaEvent[],
  neighborhood: Neighborhood | null,
  venueMap: Record<string, Venue>,
): NolaEvent[] {
  if (!neighborhood) return events;
  return events.filter(
    (event) =>
      event.venueId !== null &&
      venueMap[event.venueId]?.neighborhood === neighborhood,
  );
}

/**
 * Filters events to those matching at least one of the given event types.
 * Empty array returns all events unchanged.
 */
export function filterByEventType(
  events: NolaEvent[],
  types: EventType[],
): NolaEvent[] {
  if (types.length === 0) return events;
  return events.filter(
    (event) => event.eventType !== null && types.includes(event.eventType),
  );
}

/** Applies all EventFilters at once. */
export function applyFilters(
  events: NolaEvent[],
  filters: EventFilters,
  venueMap: Record<string, Venue>,
): NolaEvent[] {
  return filterByEventType(
    filterByNeighborhood(
      filterByCost(filterByDate(events, filters.date), filters.cost),
      filters.neighborhood,
      venueMap,
    ),
    filters.eventTypes,
  );
}

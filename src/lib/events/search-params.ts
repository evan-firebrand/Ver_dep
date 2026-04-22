import { DEFAULT_FILTERS } from './filters';
import type { CostFilter, EventFilters } from './filters';
import type { EventType, Neighborhood } from '@/lib/supabase';

/**
 * Runtime copies of the string-literal unions. Keep in sync with
 * src/lib/supabase/types.ts; adding a value there also requires
 * adding it here (and to the card color maps).
 */
export const EVENT_TYPES: readonly EventType[] = [
  'Live Music',
  'Festival',
  'Second Line',
  'Parade',
  'Community / Neighborhood',
];

export const NEIGHBORHOODS: readonly Neighborhood[] = [
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

const COST_VALUES: readonly CostFilter[] = ['all', 'free', 'paid'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Raw searchParams object as produced by Next.js — each value may be a string,
 * an array of strings (for repeated keys), or undefined. Our adapter accepts
 * the first string only; multi-value filters are serialized as CSV within one
 * value (see serializeEventFilters).
 */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Parses searchParams into a validated EventFilters object. Unknown or
 * malformed values are silently dropped in favor of the defaults — callers
 * never need to handle validation errors.
 */
export function parseEventFilters(raw: RawSearchParams): EventFilters {
  const costRaw = firstString(raw.cost);
  const cost: CostFilter =
    costRaw && (COST_VALUES as readonly string[]).includes(costRaw)
      ? (costRaw as CostFilter)
      : DEFAULT_FILTERS.cost;

  const neighborhoodRaw = firstString(raw.neighborhood);
  const neighborhood: Neighborhood | null =
    neighborhoodRaw &&
    (NEIGHBORHOODS as readonly string[]).includes(neighborhoodRaw)
      ? (neighborhoodRaw as Neighborhood)
      : null;

  const typeRaw = firstString(raw.type);
  const eventTypes: EventType[] = typeRaw
    ? typeRaw
        .split(',')
        .map((t) => t.trim())
        .filter((t): t is EventType =>
          (EVENT_TYPES as readonly string[]).includes(t),
        )
    : [];

  const dateRaw = firstString(raw.date);
  const date: string | null = dateRaw && DATE_RE.test(dateRaw) ? dateRaw : null;

  return { cost, neighborhood, eventTypes, date };
}

/**
 * Serializes EventFilters back to a searchParams-style object. Defaults are
 * omitted so the URL stays clean (e.g. ?cost=all is dropped).
 */
export function serializeEventFilters(
  filters: Partial<EventFilters>,
): Record<string, string> {
  const out: Record<string, string> = {};

  if (filters.cost && filters.cost !== 'all') {
    out.cost = filters.cost;
  }
  if (filters.neighborhood) {
    out.neighborhood = filters.neighborhood;
  }
  if (filters.eventTypes && filters.eventTypes.length > 0) {
    out.type = filters.eventTypes.join(',');
  }
  if (filters.date) {
    out.date = filters.date;
  }

  return out;
}

/**
 * Builds a /events href with the given filters applied as searchParams.
 * Returns "/events" when all filters are default.
 */
export function buildEventsHref(filters: Partial<EventFilters>): string {
  const params = serializeEventFilters(filters);
  const qs = new URLSearchParams(params).toString();
  return qs ? `/events?${qs}` : '/events';
}

import type { EventSeries } from '@/lib/supabase';

/** Maps each EventSeries value to its URL slug. */
export const SERIES_SLUGS: Record<EventSeries, string> = {
  'Jazz Fest Weekend 1': 'jazz-fest-weekend-1',
  'Jazz Fest Weekend 2': 'jazz-fest-weekend-2',
  'Fest by Nite': 'fest-by-nite',
  'Daze Between': 'daze-between',
  'Visitor Weekend': 'visitor-weekend',
};

/** Reverse mapping: URL slug → EventSeries value. */
const SLUG_TO_SERIES: Readonly<Record<string, EventSeries>> =
  Object.fromEntries(
    (Object.entries(SERIES_SLUGS) as [EventSeries, string][]).map(
      ([series, slug]) => [slug, series],
    ),
  );

/** Returns the URL slug for a given series. */
export function seriesSlug(series: EventSeries): string {
  return SERIES_SLUGS[series];
}

/** Returns the EventSeries for a slug, or null if unrecognised. */
export function slugToSeries(slug: string): EventSeries | null {
  return SLUG_TO_SERIES[slug] ?? null;
}

/** All series in display order. */
export const ALL_SERIES: EventSeries[] = [
  'Jazz Fest Weekend 1',
  'Jazz Fest Weekend 2',
  'Fest by Nite',
  'Daze Between',
  'Visitor Weekend',
];

export const SERIES_DESCRIPTIONS: Record<EventSeries, string> = {
  'Jazz Fest Weekend 1':
    'First weekend of the New Orleans Jazz & Heritage Festival.',
  'Jazz Fest Weekend 2':
    'Second weekend of the New Orleans Jazz & Heritage Festival.',
  'Fest by Nite': 'Nighttime shows and parties surrounding Jazz Fest.',
  'Daze Between': 'Events between the two Jazz Fest weekends.',
  'Visitor Weekend': 'Special events welcoming visitors to New Orleans.',
};

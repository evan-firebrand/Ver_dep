import type { EventSeries } from './supabase';

/** All known series values, in display order. */
export const ALL_SERIES: EventSeries[] = [
  'Jazz Fest Weekend 1',
  'Jazz Fest Weekend 2',
  'Fest by Nite',
  'Daze Between',
  'Visitor Weekend',
];

/** Maps URL slugs to EventSeries display names. */
const SLUG_TO_SERIES: Record<string, EventSeries> = {
  'jazz-fest-weekend-1': 'Jazz Fest Weekend 1',
  'jazz-fest-weekend-2': 'Jazz Fest Weekend 2',
  'fest-by-nite': 'Fest by Nite',
  'daze-between': 'Daze Between',
  'visitor-weekend': 'Visitor Weekend',
};

/** Maps EventSeries display names to URL slugs. */
const SERIES_TO_SLUG: Record<EventSeries, string> = {
  'Jazz Fest Weekend 1': 'jazz-fest-weekend-1',
  'Jazz Fest Weekend 2': 'jazz-fest-weekend-2',
  'Fest by Nite': 'fest-by-nite',
  'Daze Between': 'daze-between',
  'Visitor Weekend': 'visitor-weekend',
};

/** Returns the EventSeries for a given URL slug, or null if unrecognized. */
export function slugToSeries(slug: string): EventSeries | null {
  return SLUG_TO_SERIES[slug] ?? null;
}

/** Returns the URL slug for a given EventSeries. */
export function seriesToSlug(series: EventSeries): string {
  return SERIES_TO_SLUG[series];
}

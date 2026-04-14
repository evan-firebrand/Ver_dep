import type { EventSeries } from '@/lib/supabase';

export interface SeriesInfo {
  slug: string;
  name: EventSeries;
  description: string;
}

/**
 * The four featured event series. Slug is the URL-safe key used in
 * /series/[slug] routes. Order here is display order on the index page.
 */
export const SERIES: SeriesInfo[] = [
  {
    slug: 'jazz-fest-weekend-1',
    name: 'Jazz Fest Weekend 1',
    description:
      'First weekend of the New Orleans Jazz & Heritage Festival and related events.',
  },
  {
    slug: 'jazz-fest-weekend-2',
    name: 'Jazz Fest Weekend 2',
    description:
      'Second weekend of the New Orleans Jazz & Heritage Festival and related events.',
  },
  {
    slug: 'fest-by-nite',
    name: 'Fest by Nite',
    description: 'Late-night shows and after-parties during Jazz Fest season.',
  },
  {
    slug: 'daze-between',
    name: 'Daze Between',
    description: 'Mid-week events between Jazz Fest weekends.',
  },
];

/** Look up a series by its URL slug. Returns undefined for unknown slugs. */
export function getSeriesBySlug(slug: string): SeriesInfo | undefined {
  return SERIES.find((s) => s.slug === slug);
}

/** All valid series slugs (useful for generateStaticParams). */
export function getAllSeriesSlugs(): string[] {
  return SERIES.map((s) => s.slug);
}

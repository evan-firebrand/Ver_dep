import { describe, expect, it } from 'vitest';

import { ALL_SERIES, SERIES_SLUGS, seriesSlug, slugToSeries } from './series';

describe('SERIES_SLUGS', () => {
  it('maps every EventSeries to a URL-safe slug', () => {
    for (const slug of Object.values(SERIES_SLUGS)) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('covers all four primary series', () => {
    expect(SERIES_SLUGS['Jazz Fest Weekend 1']).toBe('jazz-fest-weekend-1');
    expect(SERIES_SLUGS['Jazz Fest Weekend 2']).toBe('jazz-fest-weekend-2');
    expect(SERIES_SLUGS['Fest by Nite']).toBe('fest-by-nite');
    expect(SERIES_SLUGS['Daze Between']).toBe('daze-between');
  });
});

describe('seriesSlug', () => {
  it('returns the correct slug for each series', () => {
    expect(seriesSlug('Jazz Fest Weekend 1')).toBe('jazz-fest-weekend-1');
    expect(seriesSlug('Jazz Fest Weekend 2')).toBe('jazz-fest-weekend-2');
    expect(seriesSlug('Fest by Nite')).toBe('fest-by-nite');
    expect(seriesSlug('Daze Between')).toBe('daze-between');
    expect(seriesSlug('Visitor Weekend')).toBe('visitor-weekend');
  });
});

describe('slugToSeries', () => {
  it('round-trips every series through slug and back', () => {
    for (const series of ALL_SERIES) {
      const slug = seriesSlug(series);
      expect(slugToSeries(slug)).toBe(series);
    }
  });

  it('returns null for an unknown slug', () => {
    expect(slugToSeries('unknown-slug')).toBeNull();
    expect(slugToSeries('')).toBeNull();
  });
});

describe('ALL_SERIES', () => {
  it('includes the four primary series in order', () => {
    expect(ALL_SERIES[0]).toBe('Jazz Fest Weekend 1');
    expect(ALL_SERIES[1]).toBe('Jazz Fest Weekend 2');
    expect(ALL_SERIES[2]).toBe('Fest by Nite');
    expect(ALL_SERIES[3]).toBe('Daze Between');
  });

  it('has no duplicate entries', () => {
    expect(new Set(ALL_SERIES).size).toBe(ALL_SERIES.length);
  });
});

import { describe, expect, it } from 'vitest';

import { ALL_SERIES, seriesToSlug, slugToSeries } from './series';

describe('slugToSeries', () => {
  it('converts each known slug to its series name', () => {
    expect(slugToSeries('jazz-fest-weekend-1')).toBe('Jazz Fest Weekend 1');
    expect(slugToSeries('jazz-fest-weekend-2')).toBe('Jazz Fest Weekend 2');
    expect(slugToSeries('fest-by-nite')).toBe('Fest by Nite');
    expect(slugToSeries('daze-between')).toBe('Daze Between');
    expect(slugToSeries('visitor-weekend')).toBe('Visitor Weekend');
  });

  it('returns null for an unrecognized slug', () => {
    expect(slugToSeries('unknown-series')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(slugToSeries('')).toBeNull();
  });
});

describe('seriesToSlug', () => {
  it('converts each series name to its slug', () => {
    expect(seriesToSlug('Jazz Fest Weekend 1')).toBe('jazz-fest-weekend-1');
    expect(seriesToSlug('Jazz Fest Weekend 2')).toBe('jazz-fest-weekend-2');
    expect(seriesToSlug('Fest by Nite')).toBe('fest-by-nite');
    expect(seriesToSlug('Daze Between')).toBe('daze-between');
    expect(seriesToSlug('Visitor Weekend')).toBe('visitor-weekend');
  });
});

describe('ALL_SERIES', () => {
  it('contains all 5 known series', () => {
    expect(ALL_SERIES).toHaveLength(5);
  });

  it('slug round-trips correctly for every series', () => {
    for (const series of ALL_SERIES) {
      expect(slugToSeries(seriesToSlug(series))).toBe(series);
    }
  });
});

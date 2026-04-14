import { describe, expect, test } from 'vitest';

import { getAllSeriesSlugs, getSeriesBySlug, SERIES } from './series';

describe('SERIES', () => {
  test('contains four series entries', () => {
    expect(SERIES).toHaveLength(4);
  });

  test('every entry has a slug, name, and description', () => {
    for (const s of SERIES) {
      expect(s.slug).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.description).toBeTruthy();
    }
  });

  test('slugs are URL-safe (lowercase, hyphens, no spaces)', () => {
    for (const s of SERIES) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  test('slugs are unique', () => {
    const slugs = SERIES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('getSeriesBySlug', () => {
  test('returns the correct series for a valid slug', () => {
    const result = getSeriesBySlug('jazz-fest-weekend-1');
    expect(result).toBeDefined();
    expect(result!.name).toBe('Jazz Fest Weekend 1');
  });

  test('returns undefined for an unknown slug', () => {
    expect(getSeriesBySlug('nonexistent')).toBeUndefined();
  });

  test('finds every series by its slug', () => {
    for (const s of SERIES) {
      expect(getSeriesBySlug(s.slug)).toBe(s);
    }
  });
});

describe('getAllSeriesSlugs', () => {
  test('returns an array of all slugs', () => {
    const slugs = getAllSeriesSlugs();
    expect(slugs).toEqual(SERIES.map((s) => s.slug));
  });

  test('returns plain strings', () => {
    for (const slug of getAllSeriesSlugs()) {
      expect(typeof slug).toBe('string');
    }
  });
});

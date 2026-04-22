import { describe, expect, it } from 'vitest';

import { DEFAULT_FILTERS } from './filters';
import {
  buildEventsHref,
  parseEventFilters,
  serializeEventFilters,
} from './search-params';

describe('parseEventFilters', () => {
  it('returns defaults for empty searchParams', () => {
    expect(parseEventFilters({})).toEqual(DEFAULT_FILTERS);
  });

  it('parses a valid cost value', () => {
    expect(parseEventFilters({ cost: 'free' }).cost).toBe('free');
    expect(parseEventFilters({ cost: 'paid' }).cost).toBe('paid');
    expect(parseEventFilters({ cost: 'all' }).cost).toBe('all');
  });

  it('drops invalid cost values back to the default', () => {
    expect(parseEventFilters({ cost: 'cheap' }).cost).toBe('all');
  });

  it('parses a valid neighborhood', () => {
    expect(parseEventFilters({ neighborhood: 'Marigny' }).neighborhood).toBe(
      'Marigny',
    );
  });

  it('drops unknown neighborhoods', () => {
    expect(parseEventFilters({ neighborhood: 'Atlantis' }).neighborhood).toBe(
      null,
    );
  });

  it('parses a CSV list of event types', () => {
    expect(parseEventFilters({ type: 'Festival,Brass' }).eventTypes).toEqual([
      'Festival',
    ]); // Brass is not an EventType (it's a Genre)
  });

  it('parses multiple valid event types', () => {
    expect(
      parseEventFilters({ type: 'Festival,Second Line,Parade' }).eventTypes,
    ).toEqual(['Festival', 'Second Line', 'Parade']);
  });

  it('trims whitespace in CSV list entries', () => {
    expect(
      parseEventFilters({ type: 'Festival , Parade ' }).eventTypes,
    ).toEqual(['Festival', 'Parade']);
  });

  it('returns an empty eventTypes array when the param is missing', () => {
    expect(parseEventFilters({}).eventTypes).toEqual([]);
  });

  it('accepts a well-formed date string', () => {
    expect(parseEventFilters({ date: '2026-04-22' }).date).toBe('2026-04-22');
  });

  it('rejects malformed date strings', () => {
    expect(parseEventFilters({ date: '2026/04/22' }).date).toBe(null);
    expect(parseEventFilters({ date: 'yesterday' }).date).toBe(null);
    expect(parseEventFilters({ date: '26-04-22' }).date).toBe(null);
  });

  it('handles array-valued params by taking the first entry', () => {
    expect(parseEventFilters({ cost: ['free', 'paid'] }).cost).toBe('free');
  });

  it('parses a combined searchParams object', () => {
    const result = parseEventFilters({
      cost: 'free',
      neighborhood: 'Marigny',
      type: 'Festival,Parade',
      date: '2026-05-01',
    });
    expect(result).toEqual({
      cost: 'free',
      neighborhood: 'Marigny',
      eventTypes: ['Festival', 'Parade'],
      date: '2026-05-01',
    });
  });
});

describe('serializeEventFilters', () => {
  it('omits default cost value', () => {
    expect(serializeEventFilters({ cost: 'all' })).toEqual({});
  });

  it('includes non-default cost', () => {
    expect(serializeEventFilters({ cost: 'free' })).toEqual({ cost: 'free' });
  });

  it('omits null neighborhood', () => {
    expect(serializeEventFilters({ neighborhood: null })).toEqual({});
  });

  it('serializes eventTypes as CSV', () => {
    expect(
      serializeEventFilters({ eventTypes: ['Festival', 'Parade'] }),
    ).toEqual({ type: 'Festival,Parade' });
  });

  it('omits empty eventTypes', () => {
    expect(serializeEventFilters({ eventTypes: [] })).toEqual({});
  });

  it('round-trips through parseEventFilters', () => {
    const source = {
      cost: 'paid' as const,
      neighborhood: 'Uptown' as const,
      eventTypes: ['Live Music' as const, 'Festival' as const],
      date: '2026-04-22',
    };
    expect(parseEventFilters(serializeEventFilters(source))).toEqual(source);
  });
});

describe('buildEventsHref', () => {
  it('returns /events when no filters are set', () => {
    expect(buildEventsHref({})).toBe('/events');
  });

  it('appends a single filter', () => {
    expect(buildEventsHref({ cost: 'free' })).toBe('/events?cost=free');
  });

  it('encodes special characters in neighborhood', () => {
    expect(buildEventsHref({ neighborhood: 'CBD / Warehouse' })).toBe(
      '/events?neighborhood=CBD+%2F+Warehouse',
    );
  });

  it('appends multiple filters in stable order', () => {
    const href = buildEventsHref({
      cost: 'free',
      neighborhood: 'Marigny',
      eventTypes: ['Festival'],
    });
    // URLSearchParams preserves insertion order from our object
    expect(href).toContain('cost=free');
    expect(href).toContain('neighborhood=Marigny');
    expect(href).toContain('type=Festival');
    expect(href.startsWith('/events?')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import type { EventFilters } from './filters';
import {
  applyFilters,
  DEFAULT_FILTERS,
  filterByCost,
  filterByDate,
  filterByDateRange,
  filterByEventType,
  filterByNeighborhood,
  filterThisWeek,
  isFreeEvent,
} from './filters';
import type { NolaEvent, Venue } from '@/lib/notion/types';

// ─── Test fixtures ────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<NolaEvent> = {}): NolaEvent {
  return {
    id: 'evt-1',
    url: 'https://notion.so/evt-1',
    createdTime: '2026-04-13T00:00:00.000Z',
    name: 'Test Event',
    eventType: null,
    date: { start: '2026-04-14', end: null, isDatetime: false },
    time: null,
    cost: null,
    venueIds: [],
    link: null,
    notes: null,
    interested: false,
    series: [],
    status: 'Active',
    entryMethod: null,
    actIds: [],
    sourceIds: [],
    ...overrides,
  };
}

function makeVenue(
  id: string,
  neighborhood: Venue['neighborhood'] = null,
): Venue {
  return {
    id,
    url: `https://notion.so/${id}`,
    createdTime: '2026-04-13T00:00:00.000Z',
    name: `Venue ${id}`,
    venueType: null,
    neighborhood,
    address: null,
    website: null,
    notes: null,
  };
}

// ─── filterByDateRange ────────────────────────────────────────────────────────

describe('filterByDateRange', () => {
  it('includes events whose start date falls within the range', () => {
    const events = [
      makeEvent({
        id: 'e1',
        date: { start: '2026-04-14', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'e2',
        date: { start: '2026-04-16', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'e3',
        date: { start: '2026-04-20', end: null, isDatetime: false },
      }),
    ];
    const result = filterByDateRange(events, '2026-04-14', '2026-04-18');
    expect(result.map((e) => e.id)).toEqual(['e1', 'e2']);
  });

  it('includes multi-day events that overlap with the range', () => {
    const event = makeEvent({
      date: { start: '2026-04-10', end: '2026-04-15', isDatetime: false },
    });
    const result = filterByDateRange([event], '2026-04-14', '2026-04-20');
    expect(result).toHaveLength(1);
  });

  it('excludes events with no date', () => {
    const event = makeEvent({ date: null });
    expect(filterByDateRange([event], '2026-04-01', '2026-04-30')).toHaveLength(
      0,
    );
  });

  it('is inclusive on both boundaries', () => {
    const events = [
      makeEvent({
        id: 'start',
        date: { start: '2026-04-14', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'end',
        date: { start: '2026-04-20', end: null, isDatetime: false },
      }),
    ];
    const result = filterByDateRange(events, '2026-04-14', '2026-04-20');
    expect(result.map((e) => e.id)).toEqual(['start', 'end']);
  });
});

// ─── filterThisWeek ───────────────────────────────────────────────────────────

describe('filterThisWeek', () => {
  it('returns events within the 7-day window starting from today', () => {
    const events = [
      makeEvent({
        id: 'before',
        date: { start: '2026-04-12', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'today',
        date: { start: '2026-04-13', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'mid',
        date: { start: '2026-04-17', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'last',
        date: { start: '2026-04-19', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'after',
        date: { start: '2026-04-20', end: null, isDatetime: false },
      }),
    ];
    const result = filterThisWeek(events, '2026-04-13');
    expect(result.map((e) => e.id)).toEqual(['today', 'mid', 'last']);
  });

  it('includes multi-day events overlapping the window', () => {
    const event = makeEvent({
      id: 'festival',
      date: { start: '2026-04-10', end: '2026-04-15', isDatetime: false },
    });
    expect(filterThisWeek([event], '2026-04-13')).toHaveLength(1);
  });

  it('handles month boundaries correctly', () => {
    const events = [
      makeEvent({
        id: 'apr',
        date: { start: '2026-04-29', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'may',
        date: { start: '2026-05-01', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'after',
        date: { start: '2026-05-05', end: null, isDatetime: false },
      }),
    ];
    const result = filterThisWeek(events, '2026-04-28');
    // Window: 2026-04-28 to 2026-05-04
    expect(result.map((e) => e.id)).toEqual(['apr', 'may']);
  });
});

// ─── filterByDate ─────────────────────────────────────────────────────────────

describe('filterByDate', () => {
  it('returns all events unchanged when date is null', () => {
    const events = [makeEvent({ id: 'e1' }), makeEvent({ id: 'e2' })];
    expect(filterByDate(events, null)).toHaveLength(2);
  });

  it('filters to events on the given date', () => {
    const events = [
      makeEvent({
        id: 'match',
        date: { start: '2026-04-14', end: null, isDatetime: false },
      }),
      makeEvent({
        id: 'other',
        date: { start: '2026-04-15', end: null, isDatetime: false },
      }),
    ];
    const result = filterByDate(events, '2026-04-14');
    expect(result.map((e) => e.id)).toEqual(['match']);
  });

  it('includes multi-day events that span the given date', () => {
    const event = makeEvent({
      date: { start: '2026-04-13', end: '2026-04-17', isDatetime: false },
    });
    expect(filterByDate([event], '2026-04-15')).toHaveLength(1);
    expect(filterByDate([event], '2026-04-18')).toHaveLength(0);
  });

  it('excludes events with no date', () => {
    const event = makeEvent({ date: null });
    expect(filterByDate([event], '2026-04-14')).toHaveLength(0);
  });
});

// ─── isFreeEvent ─────────────────────────────────────────────────────────────

describe('isFreeEvent', () => {
  it('returns true when cost is null', () => {
    expect(isFreeEvent(makeEvent({ cost: null }))).toBe(true);
  });

  it('returns true when cost is empty string', () => {
    expect(isFreeEvent(makeEvent({ cost: '' }))).toBe(true);
  });

  it('returns true when cost is whitespace only', () => {
    expect(isFreeEvent(makeEvent({ cost: '   ' }))).toBe(true);
  });

  it('returns true for "Free"', () => {
    expect(isFreeEvent(makeEvent({ cost: 'Free' }))).toBe(true);
  });

  it('returns true for "free admission"', () => {
    expect(isFreeEvent(makeEvent({ cost: 'free admission' }))).toBe(true);
  });

  it('returns true for "$0"', () => {
    expect(isFreeEvent(makeEvent({ cost: '$0' }))).toBe(true);
  });

  it('returns false for a dollar amount', () => {
    expect(isFreeEvent(makeEvent({ cost: '$10' }))).toBe(false);
  });

  it('returns false for "Suggested $5"', () => {
    expect(isFreeEvent(makeEvent({ cost: 'Suggested $5' }))).toBe(false);
  });
});

// ─── filterByCost ─────────────────────────────────────────────────────────────

describe('filterByCost', () => {
  const events = [
    makeEvent({ id: 'free-null', cost: null }),
    makeEvent({ id: 'free-text', cost: 'Free' }),
    makeEvent({ id: 'paid', cost: '$15' }),
    makeEvent({ id: 'suggested', cost: 'Suggested $5' }),
  ];

  it("returns all events for 'all'", () => {
    expect(filterByCost(events, 'all')).toHaveLength(4);
  });

  it("returns only free events for 'free'", () => {
    const result = filterByCost(events, 'free');
    expect(result.map((e) => e.id)).toEqual(['free-null', 'free-text']);
  });

  it("returns only paid events for 'paid'", () => {
    const result = filterByCost(events, 'paid');
    expect(result.map((e) => e.id)).toEqual(['paid', 'suggested']);
  });
});

// ─── filterByNeighborhood ─────────────────────────────────────────────────────

describe('filterByNeighborhood', () => {
  const frenchQuarterVenue = makeVenue('v-fq', 'French Quarter');
  const marijnyVenue = makeVenue('v-mar', 'Marigny');
  const venueMap: Record<string, Venue> = {
    'v-fq': frenchQuarterVenue,
    'v-mar': marijnyVenue,
  };

  it('returns all events when neighborhood is null', () => {
    const events = [
      makeEvent({ venueIds: ['v-fq'] }),
      makeEvent({ venueIds: ['v-mar'] }),
    ];
    expect(filterByNeighborhood(events, null, venueMap)).toHaveLength(2);
  });

  it('filters events to those with a venue in the given neighborhood', () => {
    const events = [
      makeEvent({ id: 'fq', venueIds: ['v-fq'] }),
      makeEvent({ id: 'mar', venueIds: ['v-mar'] }),
    ];
    const result = filterByNeighborhood(events, 'French Quarter', venueMap);
    expect(result.map((e) => e.id)).toEqual(['fq']);
  });

  it('includes events where at least one venue matches', () => {
    const event = makeEvent({ venueIds: ['v-fq', 'v-mar'] });
    expect(filterByNeighborhood([event], 'Marigny', venueMap)).toHaveLength(1);
  });

  it('excludes events with no venues', () => {
    const event = makeEvent({ venueIds: [] });
    expect(
      filterByNeighborhood([event], 'French Quarter', venueMap),
    ).toHaveLength(0);
  });

  it('excludes events with venues not in the map', () => {
    const event = makeEvent({ venueIds: ['v-unknown'] });
    expect(
      filterByNeighborhood([event], 'French Quarter', venueMap),
    ).toHaveLength(0);
  });
});

// ─── filterByEventType ────────────────────────────────────────────────────────

describe('filterByEventType', () => {
  const events = [
    makeEvent({ id: 'music', eventType: 'Live Music' }),
    makeEvent({ id: 'festival', eventType: 'Festival' }),
    makeEvent({ id: 'parade', eventType: 'Parade' }),
    makeEvent({ id: 'null-type', eventType: null }),
  ];

  it('returns all events when types array is empty', () => {
    expect(filterByEventType(events, [])).toHaveLength(4);
  });

  it('filters to matching event types', () => {
    const result = filterByEventType(events, ['Live Music', 'Festival']);
    expect(result.map((e) => e.id)).toEqual(['music', 'festival']);
  });

  it('excludes events with null eventType even when all types are requested', () => {
    const result = filterByEventType(events, [
      'Live Music',
      'Festival',
      'Parade',
    ]);
    expect(result.find((e) => e.id === 'null-type')).toBeUndefined();
  });
});

// ─── applyFilters ─────────────────────────────────────────────────────────────

describe('applyFilters', () => {
  const fqVenue = makeVenue('v-fq', 'French Quarter');
  const venueMap = { 'v-fq': fqVenue };

  it('applies all filters in combination', () => {
    const events = [
      makeEvent({
        id: 'match',
        date: { start: '2026-04-14', end: null, isDatetime: false },
        cost: null,
        eventType: 'Live Music',
        venueIds: ['v-fq'],
      }),
      makeEvent({
        id: 'wrong-date',
        date: { start: '2026-04-15', end: null, isDatetime: false },
        cost: null,
        eventType: 'Live Music',
        venueIds: ['v-fq'],
      }),
      makeEvent({
        id: 'paid',
        date: { start: '2026-04-14', end: null, isDatetime: false },
        cost: '$20',
        eventType: 'Live Music',
        venueIds: ['v-fq'],
      }),
    ];
    const filters: EventFilters = {
      ...DEFAULT_FILTERS,
      date: '2026-04-14',
      cost: 'free',
      eventTypes: ['Live Music'],
      neighborhood: 'French Quarter',
    };
    const result = applyFilters(events, filters, venueMap);
    expect(result.map((e) => e.id)).toEqual(['match']);
  });

  it('returns all events for DEFAULT_FILTERS', () => {
    const events = [makeEvent({ id: 'e1' }), makeEvent({ id: 'e2' })];
    expect(applyFilters(events, DEFAULT_FILTERS, {})).toHaveLength(2);
  });
});

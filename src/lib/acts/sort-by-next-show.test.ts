import { describe, expect, it } from 'vitest';

import type { Act, NolaEvent } from '@/lib/supabase';

import { sortActsByNextShow } from './sort-by-next-show';

function act(id: string, name: string): Act {
  return {
    id,
    name,
    actType: null,
    genres: [],
    website: null,
    notes: null,
  };
}

function event(
  id: string,
  start: string,
  actIds: string[],
  end: string | null = null,
): NolaEvent {
  return {
    id,
    name: `Event ${id}`,
    eventType: null,
    date: { start, end, isDatetime: false },
    time: null,
    cost: null,
    venueId: null,
    link: null,
    notes: null,
    interested: false,
    series: [],
    status: 'Active',
    entryMethod: null,
    actIds,
  };
}

describe('sortActsByNextShow', () => {
  const today = '2026-04-22';

  it('returns an empty array when no acts are provided', () => {
    expect(sortActsByNextShow([], [], today)).toEqual([]);
  });

  it('sorts acts with upcoming shows by next-show date ascending', () => {
    const acts = [act('a', 'Alpha'), act('b', 'Bravo'), act('c', 'Charlie')];
    const events = [
      event('e1', '2026-05-01', ['a']),
      event('e2', '2026-04-25', ['b']),
      event('e3', '2026-04-30', ['c']),
    ];
    const sorted = sortActsByNextShow(acts, events, today);
    expect(sorted.map((a) => a.id)).toEqual(['b', 'c', 'a']);
  });

  it('places acts with no upcoming shows at the end alphabetically', () => {
    const acts = [act('z', 'Zeta'), act('y', 'Yankee'), act('a', 'Alpha')];
    const events = [event('e1', '2026-05-01', ['a'])];
    const sorted = sortActsByNextShow(acts, events, today);
    expect(sorted.map((a) => a.id)).toEqual(['a', 'y', 'z']);
  });

  it('breaks ties between same-day acts alphabetically by name', () => {
    const acts = [act('b', 'Bravo'), act('a', 'Alpha')];
    const events = [event('e1', '2026-04-25', ['a', 'b'])];
    const sorted = sortActsByNextShow(acts, events, today);
    expect(sorted.map((a) => a.id)).toEqual(['a', 'b']);
  });

  it('ignores past events', () => {
    const acts = [act('a', 'Alpha'), act('b', 'Bravo')];
    const events = [
      event('past', '2026-04-10', ['a']),
      event('future', '2026-04-30', ['b']),
    ];
    const sorted = sortActsByNextShow(acts, events, today);
    expect(sorted.map((a) => a.id)).toEqual(['b', 'a']);
  });

  it('treats a multi-day event spanning today as happening today', () => {
    const acts = [act('a', 'Alpha'), act('b', 'Bravo')];
    const events = [
      event('multi', '2026-04-20', ['a'], '2026-04-25'), // spans today
      event('later', '2026-04-24', ['b']),
    ];
    const sorted = sortActsByNextShow(acts, events, today);
    // Alpha's anchor is today (2026-04-22), Bravo's is 2026-04-24
    expect(sorted.map((a) => a.id)).toEqual(['a', 'b']);
  });

  it('picks the earliest upcoming show when an act has several', () => {
    const acts = [act('a', 'Alpha'), act('b', 'Bravo')];
    const events = [
      event('later', '2026-06-01', ['a']),
      event('soon', '2026-04-24', ['a']),
      event('middle', '2026-05-01', ['b']),
    ];
    const sorted = sortActsByNextShow(acts, events, today);
    expect(sorted.map((a) => a.id)).toEqual(['a', 'b']);
  });
});

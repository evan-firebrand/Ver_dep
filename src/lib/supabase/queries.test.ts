import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getActs, getEvents, getVenues } from './queries';

// ─── Mock setup ───────────────────────────────────────────────────────────────

const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('./client', () => ({
  getSupabaseClient: () => ({ from: mockFrom }),
}));

// cacheLife and cacheTag are Next.js server-only APIs; stub them in tests so
// the 'use cache' directive in queries.ts doesn't throw in the jsdom environment.
vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── getEvents ────────────────────────────────────────────────────────────────

describe('getEvents', () => {
  it('fetches events and maps to NolaEvent[]', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          name: 'Jazz Fest',
          event_type: 'Live Music',
          date_start: '2026-04-26',
          date_end: null,
          time_info: '7pm',
          venue_id: 5,
          cost: '$20',
          link: null,
          notes: null,
          interested: true,
          status: 'Active',
          series: ['Fest by Nite'],
          entry_method: null,
          event_acts: [{ act_id: 3 }],
        },
      ],
      error: null,
    });

    const events = await getEvents();

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('1');
    expect(events[0].name).toBe('Jazz Fest');
    expect(events[0].eventType).toBe('Live Music');
    expect(events[0].date).toEqual({
      start: '2026-04-26',
      end: null,
      isDatetime: false,
    });
    expect(events[0].time).toBe('7pm');
    expect(events[0].venueId).toBe('5');
    expect(events[0].interested).toBe(true);
    expect(events[0].series).toEqual(['Fest by Nite']);
    expect(events[0].actIds).toEqual(['3']);
  });

  it('sets venueId to null when venue_id is null', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: 2,
          name: 'No Venue Event',
          event_type: null,
          date_start: null,
          date_end: null,
          time_info: null,
          venue_id: null,
          cost: null,
          link: null,
          notes: null,
          interested: false,
          status: null,
          series: null,
          entry_method: null,
          event_acts: [],
        },
      ],
      error: null,
    });

    const events = await getEvents();

    expect(events[0].venueId).toBeNull();
    expect(events[0].date).toBeNull();
    expect(events[0].actIds).toEqual([]);
    expect(events[0].series).toEqual([]);
    expect(events[0].interested).toBe(false);
  });

  it('returns an empty array when there are no events', async () => {
    mockSelect.mockResolvedValueOnce({ data: [], error: null });

    const events = await getEvents();

    expect(events).toEqual([]);
  });

  it('throws when Supabase returns an error', async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: new Error('DB connection error'),
    });

    await expect(getEvents()).rejects.toThrow('DB connection error');
  });

  it('queries the events table with event_acts join', async () => {
    mockSelect.mockResolvedValueOnce({ data: [], error: null });

    await getEvents();

    expect(mockFrom).toHaveBeenCalledWith('events');
    expect(mockSelect).toHaveBeenCalledWith('*, event_acts(act_id)');
  });
});

// ─── getVenues ────────────────────────────────────────────────────────────────

describe('getVenues', () => {
  it('fetches venues and maps to Venue[]', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: 10,
          name: 'Tipitinas',
          venue_type: 'Concert Hall',
          neighborhood: 'Uptown',
          address: '501 Napoleon Ave',
          website: 'https://tipitinas.com',
          notes: 'Historic venue',
        },
      ],
      error: null,
    });

    const venues = await getVenues();

    expect(venues).toHaveLength(1);
    expect(venues[0].id).toBe('10');
    expect(venues[0].name).toBe('Tipitinas');
    expect(venues[0].venueType).toBe('Concert Hall');
    expect(venues[0].neighborhood).toBe('Uptown');
    expect(venues[0].address).toBe('501 Napoleon Ave');
    expect(venues[0].website).toBe('https://tipitinas.com');
  });

  it('handles null optional fields', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: 11,
          name: 'Unknown Venue',
          venue_type: null,
          neighborhood: null,
          address: null,
          website: null,
          notes: null,
        },
      ],
      error: null,
    });

    const venues = await getVenues();

    expect(venues[0].venueType).toBeNull();
    expect(venues[0].neighborhood).toBeNull();
    expect(venues[0].address).toBeNull();
  });

  it('throws when Supabase returns an error', async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: new Error('Query failed'),
    });

    await expect(getVenues()).rejects.toThrow('Query failed');
  });
});

// ─── getActs ──────────────────────────────────────────────────────────────────

describe('getActs', () => {
  it('fetches acts and maps to Act[]', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: 7,
          name: 'Rebirth Brass Band',
          act_type: 'Brass Band',
          genres: ['Brass', 'Funk'],
          website: 'https://rebirthbrassband.com',
          notes: 'Tuesday night residency',
        },
      ],
      error: null,
    });

    const acts = await getActs();

    expect(acts).toHaveLength(1);
    expect(acts[0].id).toBe('7');
    expect(acts[0].name).toBe('Rebirth Brass Band');
    expect(acts[0].actType).toBe('Brass Band');
    expect(acts[0].genres).toEqual(['Brass', 'Funk']);
    expect(acts[0].website).toBe('https://rebirthbrassband.com');
  });

  it('handles null genres gracefully', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          id: 8,
          name: 'Mystery Act',
          act_type: null,
          genres: null,
          website: null,
          notes: null,
        },
      ],
      error: null,
    });

    const acts = await getActs();

    expect(acts[0].actType).toBeNull();
    expect(acts[0].genres).toEqual([]);
  });

  it('throws when Supabase returns an error', async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: new Error('Acts query failed'),
    });

    await expect(getActs()).rejects.toThrow('Acts query failed');
  });
});

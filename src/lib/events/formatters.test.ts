import { describe, expect, it } from 'vitest';

import {
  addDays,
  formatCost,
  formatDayLabel,
  formatEventDate,
  formatEventTime,
  getThisWeekDays,
  todayInNolaTz,
  toLocalDateString,
} from './formatters';
import type { NolaEvent } from '@/lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<NolaEvent> = {}): NolaEvent {
  return {
    id: 'evt-1',
    name: 'Test Event',
    eventType: null,
    date: { start: '2026-04-14', end: null, isDatetime: false },
    time: null,
    cost: null,
    venueId: null,
    link: null,
    notes: null,
    interested: false,
    series: [],
    status: 'Active',
    entryMethod: null,
    actIds: [],
    ...overrides,
  };
}

// ─── formatEventDate ──────────────────────────────────────────────────────────

describe('formatEventDate', () => {
  it('includes the month and day for a date-only event', () => {
    const result = formatEventDate({
      start: '2026-04-14',
      end: null,
      isDatetime: false,
    });
    expect(result).toContain('Apr');
    expect(result).toContain('14');
  });

  it('includes the correct day for a different date', () => {
    const result = formatEventDate({
      start: '2026-07-04',
      end: null,
      isDatetime: false,
    });
    expect(result).toContain('Jul');
    expect(result).toContain('4');
  });

  it('formats datetime events and includes the date portion', () => {
    // 2026-04-14T20:00:00-05:00 is Apr 14 in NOLA timezone
    const result = formatEventDate({
      start: '2026-04-14T20:00:00-05:00',
      end: null,
      isDatetime: true,
    });
    expect(result).toContain('Apr');
    expect(result).toContain('14');
  });
});

// ─── formatEventTime ──────────────────────────────────────────────────────────

describe('formatEventTime', () => {
  it('returns null when there is no date and no time field', () => {
    const event = makeEvent({ date: null, time: null });
    expect(formatEventTime(event)).toBeNull();
  });

  it('returns the time field for date-only events', () => {
    const event = makeEvent({
      date: { start: '2026-04-14', end: null, isDatetime: false },
      time: '8:00 PM',
    });
    expect(formatEventTime(event)).toBe('8:00 PM');
  });

  it('returns null for date-only events with no time field', () => {
    const event = makeEvent({
      date: { start: '2026-04-14', end: null, isDatetime: false },
      time: null,
    });
    expect(formatEventTime(event)).toBeNull();
  });

  it('formats time from datetime start field', () => {
    const event = makeEvent({
      date: { start: '2026-04-14T20:00:00-05:00', end: null, isDatetime: true },
      time: null,
    });
    const result = formatEventTime(event);
    // Should contain a time like "8:00 PM"
    expect(result).toMatch(/\d+:\d{2}\s?(AM|PM)/i);
  });
});

// ─── formatCost ───────────────────────────────────────────────────────────────

describe('formatCost', () => {
  it('returns "Free" for null', () => {
    expect(formatCost(null)).toBe('Free');
  });

  it('returns "Free" for empty string', () => {
    expect(formatCost('')).toBe('Free');
  });

  it('returns "Free" for whitespace-only string', () => {
    expect(formatCost('   ')).toBe('Free');
  });

  it('returns the cost string trimmed', () => {
    expect(formatCost('  $20  ')).toBe('$20');
  });

  it('returns the cost string as-is for a normal cost', () => {
    expect(formatCost('$10 cover')).toBe('$10 cover');
  });

  it('returns "Free" as-is when the string says free (passthrough)', () => {
    expect(formatCost('Free')).toBe('Free');
  });
});

// ─── toLocalDateString ────────────────────────────────────────────────────────

describe('toLocalDateString', () => {
  it('formats a date as YYYY-MM-DD using local time fields', () => {
    // Use the Date(y, m, d) constructor to get a deterministic local date
    const date = new Date(2026, 3, 14); // April 14, 2026
    expect(toLocalDateString(date)).toBe('2026-04-14');
  });

  it('pads month and day with leading zeros', () => {
    const date = new Date(2026, 0, 5); // January 5, 2026
    expect(toLocalDateString(date)).toBe('2026-01-05');
  });
});

// ─── getThisWeekDays ──────────────────────────────────────────────────────────

describe('getThisWeekDays', () => {
  it('returns exactly 7 dates', () => {
    const days = getThisWeekDays(new Date(2026, 3, 13));
    expect(days).toHaveLength(7);
  });

  it('starts on the reference date', () => {
    const ref = new Date(2026, 3, 13); // April 13
    const days = getThisWeekDays(ref);
    expect(toLocalDateString(days[0])).toBe('2026-04-13');
  });

  it('ends 6 days after the reference date', () => {
    const ref = new Date(2026, 3, 13);
    const days = getThisWeekDays(ref);
    expect(toLocalDateString(days[6])).toBe('2026-04-19');
  });

  it('handles month roll-over correctly', () => {
    const ref = new Date(2026, 3, 28); // April 28
    const days = getThisWeekDays(ref);
    expect(toLocalDateString(days[6])).toBe('2026-05-04');
  });
});

// ─── addDays ──────────────────────────────────────────────────────────────────

describe('addDays', () => {
  it('adds a positive number of days', () => {
    expect(addDays('2026-04-14', 3)).toBe('2026-04-17');
  });

  it('handles month rollover', () => {
    expect(addDays('2026-04-30', 1)).toBe('2026-05-01');
  });

  it('handles year rollover', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('supports negative offsets', () => {
    expect(addDays('2026-04-01', -1)).toBe('2026-03-31');
  });
});

// ─── todayInNolaTz ────────────────────────────────────────────────────────────

describe('todayInNolaTz', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayInNolaTz()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('reflects the Chicago date even when the instant is UTC midnight', () => {
    // 2026-04-22T00:00:00Z is 2026-04-21 19:00 in America/Chicago (CDT).
    expect(todayInNolaTz(new Date('2026-04-22T00:00:00Z'))).toBe('2026-04-21');
  });
});

// ─── formatDayLabel ───────────────────────────────────────────────────────────

describe('formatDayLabel', () => {
  const today = new Date(2026, 3, 13); // April 13, 2026

  it('returns "Today" for the reference date', () => {
    expect(formatDayLabel(new Date(2026, 3, 13), today)).toBe('Today');
  });

  it('returns "Tomorrow" for the next day', () => {
    expect(formatDayLabel(new Date(2026, 3, 14), today)).toBe('Tomorrow');
  });

  it('returns a date string for days further out', () => {
    const result = formatDayLabel(new Date(2026, 3, 16), today);
    // Should not be "Today" or "Tomorrow", should contain date info
    expect(result).not.toBe('Today');
    expect(result).not.toBe('Tomorrow');
    expect(result).toContain('Apr');
  });
});

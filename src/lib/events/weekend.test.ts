import { describe, expect, it } from 'vitest';

import { isWeekend, weekendDaysInRange } from './weekend';

describe('isWeekend', () => {
  it('returns true for Sunday (0)', () => {
    expect(isWeekend(0)).toBe(true);
  });

  it('returns true for Saturday (6)', () => {
    expect(isWeekend(6)).toBe(true);
  });

  it('returns false for Monday through Friday (1–5)', () => {
    expect(isWeekend(1)).toBe(false);
    expect(isWeekend(2)).toBe(false);
    expect(isWeekend(3)).toBe(false);
    expect(isWeekend(4)).toBe(false);
    expect(isWeekend(5)).toBe(false);
  });
});

describe('weekendDaysInRange', () => {
  // Returns YYYY-MM-DD for assertion readability
  function keys(dates: Date[]): string[] {
    return dates.map(
      (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  }

  it('returns Sat + Sun for a Wed start with daysAhead 7 skipping first 2 (home-page case)', () => {
    // 2026-04-22 is a Wednesday
    const wed = new Date(2026, 3, 22);
    const result = weekendDaysInRange(wed, {
      daysAhead: 7,
      skipFromStart: 2,
    });
    expect(keys(result)).toEqual(['2026-04-25', '2026-04-26']);
  });

  it('returns only the next Saturday when starting on Saturday with skipFromStart 2', () => {
    // 2026-04-25 is a Saturday; skipping 2 days starts from Monday; next weekend is 2026-05-02 (Sat)
    const sat = new Date(2026, 3, 25);
    const result = weekendDaysInRange(sat, {
      daysAhead: 7,
      skipFromStart: 2,
    });
    expect(keys(result)).toEqual(['2026-05-02']);
  });

  it('includes Sunday-today when no skip is applied', () => {
    // 2026-04-26 is a Sunday. The window spans day 0..7 inclusive, so it
    // covers this Sunday, next Saturday, and next Sunday.
    const sun = new Date(2026, 3, 26);
    const result = weekendDaysInRange(sun, { daysAhead: 7 });
    expect(keys(result)).toEqual(['2026-04-26', '2026-05-02', '2026-05-03']);
  });

  it('returns an empty array when the window contains no weekend days', () => {
    // 2026-04-20 is a Monday; Mon + 0..4 = Mon–Fri, no weekend
    const mon = new Date(2026, 3, 20);
    const result = weekendDaysInRange(mon, { daysAhead: 4 });
    expect(result).toEqual([]);
  });

  it('handles a year boundary correctly', () => {
    // 2026-12-30 is a Wednesday; home-page window (skip 2, ahead 7) should catch
    // 2027-01-02 (Sat) and 2027-01-03 (Sun)
    const yearEndWed = new Date(2026, 11, 30);
    const result = weekendDaysInRange(yearEndWed, {
      daysAhead: 7,
      skipFromStart: 2,
    });
    expect(keys(result)).toEqual(['2027-01-02', '2027-01-03']);
  });

  it('defaults skipFromStart to 0 when omitted', () => {
    // Friday start with daysAhead 2 should include Sat and Sun (no skip)
    const fri = new Date(2026, 3, 24);
    const result = weekendDaysInRange(fri, { daysAhead: 2 });
    expect(keys(result)).toEqual(['2026-04-25', '2026-04-26']);
  });
});

import { describe, expect, it } from 'vitest';

import type { NolaEvent } from '@/lib/supabase';

import { bucketByDate } from './bucket-by-date';

function ev(
  id: string,
  start: string | null,
  end: string | null = null,
): NolaEvent {
  return {
    id,
    name: id,
    eventType: null,
    date: start ? { start, end, isDatetime: false } : null,
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
  };
}

describe('bucketByDate', () => {
  // Use a Wednesday as "today" so every bucket has a clean placement.
  const today = '2026-04-22'; // Wed

  it('drops past events', () => {
    const buckets = bucketByDate([ev('p', '2026-04-20')], today);
    expect(buckets.today).toHaveLength(0);
    expect(buckets.later).toHaveLength(0);
    expect(buckets.undated).toHaveLength(0);
  });

  it('places today in the today bucket', () => {
    const buckets = bucketByDate([ev('t', '2026-04-22')], today);
    expect(buckets.today.map((e) => e.id)).toEqual(['t']);
  });

  it('places tomorrow in the tomorrow bucket', () => {
    const buckets = bucketByDate([ev('m', '2026-04-23')], today);
    expect(buckets.tomorrow.map((e) => e.id)).toEqual(['m']);
  });

  it('places Saturday and Sunday of this week in this weekend', () => {
    const buckets = bucketByDate(
      [ev('sat', '2026-04-25'), ev('sun', '2026-04-26')],
      today,
    );
    expect(buckets.thisWeekend.map((e) => e.id)).toEqual(['sat', 'sun']);
  });

  it('places non-weekend days before Sunday in later this week', () => {
    const buckets = bucketByDate(
      [ev('thu', '2026-04-23'), ev('fri', '2026-04-24')],
      today,
    );
    // Thursday is tomorrow; Friday is laterThisWeek
    expect(buckets.tomorrow.map((e) => e.id)).toEqual(['thu']);
    expect(buckets.laterThisWeek.map((e) => e.id)).toEqual(['fri']);
  });

  it('places events in next Mon–Sun in next week', () => {
    const buckets = bucketByDate(
      [ev('mon', '2026-04-27'), ev('nextSun', '2026-05-03')],
      today,
    );
    expect(buckets.nextWeek.map((e) => e.id)).toEqual(['mon', 'nextSun']);
  });

  it('places events beyond next Sunday in later', () => {
    const buckets = bucketByDate([ev('far', '2026-05-10')], today);
    expect(buckets.later.map((e) => e.id)).toEqual(['far']);
  });

  it('places undated events in the undated bucket', () => {
    const buckets = bucketByDate([ev('no-date', null)], today);
    expect(buckets.undated.map((e) => e.id)).toEqual(['no-date']);
  });

  it('sorts events within a bucket by start date ascending', () => {
    const buckets = bucketByDate(
      [ev('late', '2026-05-10'), ev('early', '2026-05-04')],
      today,
    );
    expect(buckets.later.map((e) => e.id)).toEqual(['early', 'late']);
  });

  it('treats an ongoing multi-day event as Today when it spans today', () => {
    const buckets = bucketByDate(
      [ev('fest', '2026-04-20', '2026-04-26')],
      today,
    );
    expect(buckets.today.map((e) => e.id)).toEqual(['fest']);
  });

  describe('edge cases', () => {
    it('when today is Friday, Saturday goes to Tomorrow (not This Weekend)', () => {
      const friday = '2026-04-24';
      const buckets = bucketByDate(
        [ev('sat', '2026-04-25'), ev('sun', '2026-04-26')],
        friday,
      );
      expect(buckets.tomorrow.map((e) => e.id)).toEqual(['sat']);
      expect(buckets.thisWeekend.map((e) => e.id)).toEqual(['sun']);
    });

    it('when today is Saturday, both weekend days are covered by Today/Tomorrow', () => {
      const saturday = '2026-04-25';
      const buckets = bucketByDate(
        [ev('sat', '2026-04-25'), ev('sun', '2026-04-26')],
        saturday,
      );
      expect(buckets.today.map((e) => e.id)).toEqual(['sat']);
      expect(buckets.tomorrow.map((e) => e.id)).toEqual(['sun']);
      expect(buckets.thisWeekend).toHaveLength(0);
    });

    it('when today is Sunday, tomorrow is next Monday and this week has no remainder', () => {
      const sunday = '2026-04-26';
      const buckets = bucketByDate(
        [ev('mon', '2026-04-27'), ev('wed', '2026-04-29')],
        sunday,
      );
      expect(buckets.tomorrow.map((e) => e.id)).toEqual(['mon']);
      // Mid-week after Sunday goes to nextWeek per the "next Mon–Sun" rule
      expect(buckets.nextWeek.map((e) => e.id)).toEqual(['wed']);
      expect(buckets.laterThisWeek).toHaveLength(0);
    });

    it('handles a month boundary anchor correctly', () => {
      const today2 = '2026-04-28'; // Tue
      const buckets = bucketByDate(
        [ev('crossover', '2026-05-01')], // Fri, same week
        today2,
      );
      expect(buckets.laterThisWeek.map((e) => e.id)).toEqual(['crossover']);
    });

    it('handles year boundary', () => {
      const today2 = '2026-12-30'; // Wed
      const buckets = bucketByDate(
        [ev('nye', '2027-01-01'), ev('nyd', '2027-01-02')],
        today2,
      );
      expect(buckets.tomorrow).toHaveLength(0); // tomorrow is 12-31
      // 2027-01-01 is Fri → laterThisWeek; 2027-01-02 is Sat → thisWeekend
      expect(buckets.laterThisWeek.map((e) => e.id)).toEqual(['nye']);
      expect(buckets.thisWeekend.map((e) => e.id)).toEqual(['nyd']);
    });
  });
});

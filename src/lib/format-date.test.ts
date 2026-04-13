import { describe, expect, it } from 'vitest';
import type { EventDate } from '@/lib/notion';
import { formatEventDate } from './format-date';

function makeDate(
  start: string,
  isDatetime: boolean,
  end: string | null = null,
): EventDate {
  return { start, end, isDatetime };
}

describe('formatEventDate', () => {
  describe('date-only events', () => {
    it('includes the month abbreviation', () => {
      const result = formatEventDate(makeDate('2026-04-25', false));
      expect(result).toContain('Apr');
    });

    it('includes the day number', () => {
      const result = formatEventDate(makeDate('2026-04-25', false));
      expect(result).toContain('25');
    });

    it('includes the weekday abbreviation', () => {
      // 2026-04-25 is a Saturday
      const result = formatEventDate(makeDate('2026-04-25', false));
      expect(result).toContain('Sat');
    });

    it('does not shift the day due to UTC offset', () => {
      // Dates near midnight UTC that would shift in US timezones
      const result = formatEventDate(makeDate('2026-06-01', false));
      expect(result).toContain('Jun');
      expect(result).toContain('1');
    });
  });

  describe('datetime events', () => {
    it('includes month and day', () => {
      const result = formatEventDate(makeDate('2026-04-25T20:00:00', true));
      expect(result).toContain('Apr');
      expect(result).toContain('25');
    });

    it('includes time information', () => {
      const result = formatEventDate(makeDate('2026-04-25T20:00:00', true));
      // Should include a time component (either "8:00 PM" or "20:00")
      expect(result).toMatch(/\d+:\d{2}/);
    });
  });
});

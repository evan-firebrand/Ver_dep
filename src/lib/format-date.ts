import type { EventDate } from '@/lib/notion';

/**
 * Formats an EventDate for display. For date-only events, parses the date
 * components directly to avoid UTC-to-local offset shifting the day.
 */
export function formatEventDate(date: EventDate): string {
  if (!date.isDatetime) {
    const parts = date.start.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  const d = new Date(date.start);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

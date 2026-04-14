import type { EventDate, NolaEvent } from '@/lib/supabase';

const NOLA_TZ = 'America/Chicago';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: NOLA_TZ,
});

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: NOLA_TZ,
});

/**
 * Formats an EventDate's start date as a short human-readable string, e.g. "Mon, Apr 14".
 * Date-only values are anchored at noon UTC so the correct date is preserved when
 * Intl.DateTimeFormat converts to America/Chicago (which is UTC-5 or UTC-6).
 */
export function formatEventDate(eventDate: EventDate): string {
  let date: Date;
  if (eventDate.isDatetime) {
    date = new Date(eventDate.start);
  } else {
    const [year, month, day] = eventDate.start.split('-').map(Number);
    // Noon UTC keeps the date stable across any host timezone and America/Chicago.
    date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }
  return DATE_FORMATTER.format(date);
}

/**
 * Extracts a display time string from an event.
 * When the date includes a time component, formats it in NOLA timezone.
 * Falls back to the free-text time field.
 */
export function formatEventTime(event: NolaEvent): string | null {
  if (event.date?.isDatetime) {
    return TIME_FORMATTER.format(new Date(event.date.start));
  }
  return event.time ?? null;
}

/**
 * Formats a cost string for display. Null or blank → "Free".
 */
export function formatCost(cost: string | null): string {
  if (!cost || cost.trim() === '') return 'Free';
  return cost.trim();
}

/**
 * Returns 7 Date objects (midnight local time) starting from referenceDate (default: today).
 */
export function getThisWeekDays(referenceDate?: Date): Date[] {
  const start = referenceDate ? new Date(referenceDate) : new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/**
 * Converts a Date to a YYYY-MM-DD string using local time fields.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a human-readable label for a day: "Today", "Tomorrow", or a short date string.
 */
export function formatDayLabel(date: Date, today: Date): string {
  const dateStr = toLocalDateString(date);
  const todayStr = toLocalDateString(today);

  if (dateStr === todayStr) return 'Today';

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === toLocalDateString(tomorrow)) return 'Tomorrow';

  return DATE_FORMATTER.format(date);
}

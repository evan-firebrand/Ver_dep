import type { NolaEvent } from '@/lib/supabase';

export type BucketKey =
  | 'today'
  | 'tomorrow'
  | 'thisWeekend'
  | 'laterThisWeek'
  | 'nextWeek'
  | 'later'
  | 'undated';

export interface EventBuckets {
  today: NolaEvent[];
  tomorrow: NolaEvent[];
  thisWeekend: NolaEvent[];
  laterThisWeek: NolaEvent[];
  nextWeek: NolaEvent[];
  later: NolaEvent[];
  undated: NolaEvent[];
}

export const BUCKET_ORDER: BucketKey[] = [
  'today',
  'tomorrow',
  'thisWeekend',
  'laterThisWeek',
  'nextWeek',
  'later',
  'undated',
];

export const BUCKET_LABELS: Record<BucketKey, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  thisWeekend: 'This Weekend',
  laterThisWeek: 'Later This Week',
  nextWeek: 'Next Week',
  later: 'Later',
  undated: 'Date TBD',
};

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/**
 * Returns the anchor date (YYYY-MM-DD) we should bucket this event by, or
 * null when the event should be dropped (past) or moved to the undated
 * bucket.
 *
 * For multi-day events overlapping today, the anchor is today (so the
 * event surfaces in "Today" rather than getting buried under its start).
 */
function anchorDateFor(event: NolaEvent, today: string): string | null {
  if (!event.date) return null; // → 'undated'
  const start = event.date.start.slice(0, 10);
  const end = (event.date.end ?? event.date.start).slice(0, 10);
  if (end < today) return null; // past → drop
  if (start < today) return today; // spans today
  return start;
}

function bucketForAnchor(anchor: string, today: string): BucketKey {
  if (anchor === today) return 'today';
  const tomorrow = addDays(today, 1);
  if (anchor === tomorrow) return 'tomorrow';

  const dow = dayOfWeek(today);
  const daysToSunday = (7 - dow) % 7; // 0 when today is Sunday
  const thisSunday = addDays(today, daysToSunday);
  const nextSunday = addDays(thisSunday, 7);

  if (anchor <= thisSunday) {
    const anchorDow = dayOfWeek(anchor);
    if (anchorDow === 6 || anchorDow === 0) return 'thisWeekend';
    return 'laterThisWeek';
  }

  if (anchor <= nextSunday) return 'nextWeek';
  return 'later';
}

function sortByStart(events: NolaEvent[]): NolaEvent[] {
  return [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.start.localeCompare(b.date.start);
  });
}

/**
 * Groups events into date-relative buckets (Today, Tomorrow, This Weekend,
 * Later This Week, Next Week, Later, Date TBD). Past events are dropped.
 * Within each bucket, events are sorted by start date ascending.
 */
export function bucketByDate(events: NolaEvent[], today: string): EventBuckets {
  const buckets: EventBuckets = {
    today: [],
    tomorrow: [],
    thisWeekend: [],
    laterThisWeek: [],
    nextWeek: [],
    later: [],
    undated: [],
  };

  for (const event of events) {
    const anchor = anchorDateFor(event, today);
    if (anchor === null) {
      if (!event.date) buckets.undated.push(event);
      continue;
    }
    const key = bucketForAnchor(anchor, today);
    buckets[key].push(event);
  }

  for (const key of BUCKET_ORDER) {
    buckets[key] = sortByStart(buckets[key]);
  }

  return buckets;
}

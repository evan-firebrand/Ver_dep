import type { Act, NolaEvent } from '@/lib/supabase';

/**
 * Finds the next upcoming event date (YYYY-MM-DD) for each act that has one.
 * "Upcoming" = event.date.start on or after today; multi-day events still
 * count by their start. Events without a date are ignored.
 */
function nextShowByAct(
  events: NolaEvent[],
  today: string,
): Map<string, string> {
  const nextByAct = new Map<string, string>();
  for (const event of events) {
    if (!event.date) continue;
    const start = event.date.start.slice(0, 10);
    const end = (event.date.end ?? event.date.start).slice(0, 10);
    if (end < today) continue; // event already over
    const anchor = start >= today ? start : today;
    for (const actId of event.actIds) {
      const existing = nextByAct.get(actId);
      if (!existing || anchor < existing) {
        nextByAct.set(actId, anchor);
      }
    }
  }
  return nextByAct;
}

/**
 * Sorts acts so those playing soonest appear first. Acts with no upcoming
 * shows fall to the end, sorted alphabetically among themselves.
 */
export function sortActsByNextShow(
  acts: Act[],
  events: NolaEvent[],
  today: string,
): Act[] {
  const nextByAct = nextShowByAct(events, today);

  return [...acts].sort((a, b) => {
    const nextA = nextByAct.get(a.id);
    const nextB = nextByAct.get(b.id);
    if (nextA && nextB) {
      if (nextA !== nextB) return nextA.localeCompare(nextB);
      return a.name.localeCompare(b.name);
    }
    if (nextA) return -1;
    if (nextB) return 1;
    return a.name.localeCompare(b.name);
  });
}

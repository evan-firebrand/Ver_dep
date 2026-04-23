/**
 * Returns true when the day-of-week index (0–6, Sunday-first, matching
 * Date.prototype.getDay()) falls on Saturday or Sunday.
 */
export function isWeekend(dayOfWeek: number): boolean {
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Returns the subset of days in a forward-looking window from `start`
 * that fall on a weekend. `skipFromStart` lets callers exclude the first
 * N days — useful when today/tomorrow are rendered separately and the
 * weekend section should only include the rest.
 */
export function weekendDaysInRange(
  start: Date,
  options: { daysAhead: number; skipFromStart?: number },
): Date[] {
  const skip = options.skipFromStart ?? 0;
  const days: Date[] = [];
  for (let i = skip; i <= options.daysAhead; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (isWeekend(d.getDay())) days.push(d);
  }
  return days;
}

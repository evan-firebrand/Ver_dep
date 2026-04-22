import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { NolaEvent, Venue } from '@/lib/supabase';

import { ThisWeekView } from './ThisWeekView';

function makeEvent(id: string, startDate: string): NolaEvent {
  return {
    id,
    name: `Event ${id}`,
    eventType: 'Live Music',
    date: { start: startDate, end: null, isDatetime: false },
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

const venueMap: Record<string, Venue> = {};

describe('ThisWeekView', () => {
  const today = '2026-04-22';
  const events = [
    makeEvent('a', '2026-04-22'), // today
    makeEvent('b', '2026-04-23'), // tomorrow
    makeEvent('c', '2026-04-25'), // later in week
  ];

  it('defaults to showing only today’s events, not the full week', () => {
    render(<ThisWeekView events={events} venueMap={venueMap} today={today} />);
    expect(screen.getByText('Event a')).toBeDefined();
    expect(screen.queryByText('Event b')).toBeNull();
    expect(screen.queryByText('Event c')).toBeNull();
  });

  it('shows all week events when the user selects All Days', () => {
    render(<ThisWeekView events={events} venueMap={venueMap} today={today} />);
    fireEvent.click(screen.getByRole('button', { name: 'All Days' }));
    expect(screen.getByText('Event a')).toBeDefined();
    expect(screen.getByText('Event b')).toBeDefined();
    expect(screen.getByText('Event c')).toBeDefined();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { NolaEvent } from '@/lib/supabase';

import { EventCard } from './EventCard';

function makeEvent(overrides: Partial<NolaEvent> = {}): NolaEvent {
  return {
    id: 'evt-1',
    name: 'Jazz Showcase',
    eventType: 'Live Music',
    date: { start: '2026-04-25', end: null, isDatetime: false },
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

describe('EventCard', () => {
  it('renders the event name', () => {
    render(<EventCard event={makeEvent()} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Jazz Showcase',
    );
  });

  it('links to the event detail page', () => {
    render(<EventCard event={makeEvent({ id: 'abc-123' })} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/events/abc-123',
    );
  });

  it('renders the formatted date when present', () => {
    render(<EventCard event={makeEvent()} />);
    // formatEventDate for 2026-04-25 should include Apr and 25
    const text = screen.getByRole('link').textContent ?? '';
    expect(text).toContain('Apr');
    expect(text).toContain('25');
  });

  it('renders the venue name when provided', () => {
    render(<EventCard event={makeEvent()} venueName="Tipitina's" />);
    expect(screen.getByText("Tipitina's")).toBeDefined();
  });

  it('renders the event type badge', () => {
    render(<EventCard event={makeEvent({ eventType: 'Festival' })} />);
    expect(screen.getByText('Festival')).toBeDefined();
  });

  it('shows a status badge for non-Active statuses', () => {
    render(<EventCard event={makeEvent({ status: 'Cancelled' })} />);
    expect(screen.getByText('Cancelled')).toBeDefined();
  });

  it('does not show a status badge for Active events', () => {
    render(<EventCard event={makeEvent({ status: 'Active' })} />);
    expect(screen.queryByText('Active')).toBeNull();
  });

  it('shows cost when present', () => {
    render(<EventCard event={makeEvent({ cost: '$15' })} />);
    expect(screen.getByText('$15')).toBeDefined();
  });

  it('shows the interested indicator when interested is true', () => {
    render(<EventCard event={makeEvent({ interested: true })} />);
    expect(screen.getByText(/Interested/i)).toBeDefined();
  });

  it('falls back to "Untitled Event" when name is empty', () => {
    render(<EventCard event={makeEvent({ name: '' })} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Untitled Event',
    );
  });

  it('renders without crashing when all optional fields are null', () => {
    const minimal = makeEvent({
      eventType: null,
      date: null,
      cost: null,
      status: null,
    });
    render(<EventCard event={minimal} />);
    expect(screen.getByRole('heading', { level: 3 })).toBeDefined();
  });
});

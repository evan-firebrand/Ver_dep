import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { NolaEvent, Venue } from '@/lib/supabase';

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

function makeVenue(overrides: Partial<Venue> = {}): Venue {
  return {
    id: 'v-1',
    name: "Tipitina's",
    venueType: 'Bar / Club',
    neighborhood: 'Uptown',
    address: null,
    website: null,
    notes: null,
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
    const text = screen.getByRole('link').textContent ?? '';
    expect(text).toContain('Apr');
    expect(text).toContain('25');
  });

  it('renders a time when the event is a datetime', () => {
    render(
      <EventCard
        event={makeEvent({
          date: {
            start: '2026-04-25T20:00:00-05:00',
            end: null,
            isDatetime: true,
          },
        })}
      />,
    );
    // Time should appear as "8:00 PM" in NOLA TZ
    expect(screen.getByText(/8:00\s?PM/i)).toBeDefined();
  });

  it('falls back to event.time when date is not a datetime', () => {
    render(<EventCard event={makeEvent({ time: '9 PM doors' })} />);
    expect(screen.getByText('9 PM doors')).toBeDefined();
  });

  it('renders venue name and neighborhood when venue is provided', () => {
    render(<EventCard event={makeEvent()} venue={makeVenue()} />);
    expect(screen.getByText(/Tipitina's/)).toBeDefined();
    expect(screen.getByText(/Uptown/)).toBeDefined();
  });

  it('renders venue name without neighborhood when neighborhood is null', () => {
    render(
      <EventCard
        event={makeEvent()}
        venue={makeVenue({ neighborhood: null })}
      />,
    );
    expect(screen.getByText(/Tipitina's/)).toBeDefined();
    expect(screen.queryByText(/Uptown/)).toBeNull();
  });

  it('hides the venue line when no venue is passed', () => {
    render(<EventCard event={makeEvent()} />);
    expect(screen.queryByText(/Tipitina's/)).toBeNull();
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

  it('renders "Free" when cost is null', () => {
    render(<EventCard event={makeEvent({ cost: null })} />);
    expect(screen.getByText('Free')).toBeDefined();
  });

  it('renders the cost string when present', () => {
    render(<EventCard event={makeEvent({ cost: '$15' })} />);
    expect(screen.getByText('$15')).toBeDefined();
  });

  it('shows the interested indicator when interested is true', () => {
    render(<EventCard event={makeEvent({ interested: true })} />);
    expect(screen.getByText(/Interested/i)).toBeDefined();
  });

  it('strikes through the title when the event is Cancelled', () => {
    render(<EventCard event={makeEvent({ status: 'Cancelled' })} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.className).toContain('line-through');
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

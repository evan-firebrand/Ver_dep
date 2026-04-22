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

  it('links the title to the event detail page', () => {
    render(<EventCard event={makeEvent({ id: 'abc-123' })} />);
    const titleLink = screen.getByRole('link', { name: 'Jazz Showcase' });
    expect(titleLink.getAttribute('href')).toBe('/events/abc-123');
  });

  it('does not wrap the whole card in a link', () => {
    // Minimal event: just title link + event-type badge link (2 total).
    // If the card were whole-wrapped, we'd also get the outer link.
    render(
      <EventCard event={makeEvent({ cost: '$15', eventType: 'Live Music' })} />,
    );
    const links = screen.getAllByRole('link');
    // Title + event-type badge = 2 links
    expect(links).toHaveLength(2);
    expect(links.some((l) => l.getAttribute('href') === '/events/evt-1')).toBe(
      true,
    );
  });

  it('renders the formatted date when present', () => {
    render(<EventCard event={makeEvent()} />);
    expect(screen.getByText(/Apr/)).toBeDefined();
    expect(screen.getByText(/25/)).toBeDefined();
  });

  it('renders a "More info" external link when event.link is set', () => {
    render(
      <EventCard
        event={makeEvent({ link: 'https://example.com/show', id: 'x' })}
      />,
    );
    const external = screen.getByRole('link', { name: /open .* website/i });
    expect(external.getAttribute('href')).toBe('https://example.com/show');
    expect(external.getAttribute('target')).toBe('_blank');
    expect(external.getAttribute('rel')).toContain('noopener');
  });

  it('does not render an external link when event.link is null', () => {
    // Date-only event, no cost, no type → just the title link.
    render(
      <EventCard
        event={makeEvent({ link: null, eventType: null, cost: '$15' })}
      />,
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('renders the event type badge as a filter link to /events?type=...', () => {
    render(<EventCard event={makeEvent({ eventType: 'Festival' })} />);
    const badge = screen.getByRole('link', { name: 'Festival' });
    expect(badge.getAttribute('href')).toBe('/events?type=Festival');
  });

  it('renders the venue neighborhood as a filter link to /events?neighborhood=...', () => {
    render(<EventCard event={makeEvent()} venue={makeVenue()} />);
    const link = screen.getByRole('link', { name: 'Uptown' });
    expect(link.getAttribute('href')).toBe('/events?neighborhood=Uptown');
  });

  it('renders "Free" as a filter link to /events?cost=free', () => {
    render(<EventCard event={makeEvent({ cost: null })} />);
    const link = screen.getByRole('link', { name: 'Free' });
    expect(link.getAttribute('href')).toBe('/events?cost=free');
  });

  it('renders non-Free cost as a plain span (not a link)', () => {
    render(<EventCard event={makeEvent({ cost: '$15' })} />);
    // There's no link whose accessible name is "$15"
    expect(screen.queryByRole('link', { name: '$15' })).toBeNull();
    expect(screen.getByText('$15')).toBeDefined();
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

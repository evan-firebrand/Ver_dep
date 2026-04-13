import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Venue } from '@/lib/notion';

import { VenueCard } from './VenueCard';

function makeVenue(overrides: Partial<Venue> = {}): Venue {
  return {
    id: 'venue-1',
    url: 'https://notion.so/venue-1',
    createdTime: '2026-04-01T00:00:00Z',
    name: "Tipitina's",
    venueType: 'Bar / Club',
    neighborhood: 'Uptown',
    address: '501 Napoleon Ave, New Orleans, LA 70115',
    website: null,
    notes: null,
    ...overrides,
  };
}

describe('VenueCard', () => {
  it('renders the venue name', () => {
    render(<VenueCard venue={makeVenue()} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      "Tipitina's",
    );
  });

  it('links to the venue detail page', () => {
    render(<VenueCard venue={makeVenue({ id: 'xyz-999' })} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/venues/xyz-999',
    );
  });

  it('renders the neighborhood when present', () => {
    render(<VenueCard venue={makeVenue({ neighborhood: 'Marigny' })} />);
    expect(screen.getByText('Marigny')).toBeDefined();
  });

  it('renders the venue type badge', () => {
    render(<VenueCard venue={makeVenue({ venueType: 'Concert Hall' })} />);
    expect(screen.getByText('Concert Hall')).toBeDefined();
  });

  it('renders the address when present', () => {
    render(<VenueCard venue={makeVenue()} />);
    expect(
      screen.getByText('501 Napoleon Ave, New Orleans, LA 70115'),
    ).toBeDefined();
  });

  it('shows the event count badge when eventCount > 0', () => {
    render(<VenueCard venue={makeVenue()} eventCount={5} />);
    expect(screen.getByText('5 events')).toBeDefined();
  });

  it('uses singular "event" when eventCount is 1', () => {
    render(<VenueCard venue={makeVenue()} eventCount={1} />);
    expect(screen.getByText('1 event')).toBeDefined();
  });

  it('does not show event count badge when eventCount is 0', () => {
    render(<VenueCard venue={makeVenue()} eventCount={0} />);
    expect(screen.queryByText(/event/)).toBeNull();
  });

  it('does not show event count badge when eventCount is omitted', () => {
    render(<VenueCard venue={makeVenue()} />);
    expect(screen.queryByText(/\d+ event/)).toBeNull();
  });

  it('falls back to "Unnamed Venue" when name is empty', () => {
    render(<VenueCard venue={makeVenue({ name: '' })} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Unnamed Venue',
    );
  });

  it('renders without crashing when all optional fields are null', () => {
    const minimal = makeVenue({
      venueType: null,
      neighborhood: null,
      address: null,
      website: null,
      notes: null,
    });
    render(<VenueCard venue={minimal} />);
    expect(screen.getByRole('heading', { level: 3 })).toBeDefined();
  });
});

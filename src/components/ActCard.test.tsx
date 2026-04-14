import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Act } from '@/lib/supabase';

import { ActCard } from './ActCard';

function makeAct(overrides: Partial<Act> = {}): Act {
  return {
    id: 'act-1',
    name: 'Rebirth Brass Band',
    actType: 'Brass Band',
    genres: ['Jazz', 'Brass', 'Funk'],
    notes: null,
    website: null,
    ...overrides,
  };
}

describe('ActCard', () => {
  it('renders the act name', () => {
    render(<ActCard act={makeAct()} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Rebirth Brass Band',
    );
  });

  it('links to the act detail page', () => {
    render(<ActCard act={makeAct({ id: 'xyz-123' })} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/acts/xyz-123');
  });

  it('renders the act type badge when present', () => {
    render(<ActCard act={makeAct()} />);
    expect(screen.getByText('Brass Band')).toBeDefined();
  });

  it('does not render an act type badge when actType is null', () => {
    render(<ActCard act={makeAct({ actType: null })} />);
    expect(screen.queryByText('Brass Band')).toBeNull();
  });

  it('renders all genres', () => {
    render(<ActCard act={makeAct({ genres: ['Jazz', 'Funk'] })} />);
    expect(screen.getByText('Jazz')).toBeDefined();
    expect(screen.getByText('Funk')).toBeDefined();
  });

  it('renders no genre pills when genres is empty', () => {
    render(<ActCard act={makeAct({ genres: [] })} />);
    expect(screen.queryByText('Jazz')).toBeNull();
  });

  it('shows the event count badge when eventCount > 0', () => {
    render(<ActCard act={makeAct()} eventCount={3} />);
    expect(screen.getByText('3 events')).toBeDefined();
  });

  it('uses singular "event" when eventCount is 1', () => {
    render(<ActCard act={makeAct()} eventCount={1} />);
    expect(screen.getByText('1 event')).toBeDefined();
  });

  it('does not show event count badge when eventCount is 0', () => {
    render(<ActCard act={makeAct()} eventCount={0} />);
    expect(screen.queryByText(/\d+ event/)).toBeNull();
  });

  it('does not show event count badge when eventCount is omitted', () => {
    render(<ActCard act={makeAct()} />);
    expect(screen.queryByText(/\d+ event/)).toBeNull();
  });

  it('falls back to "Unknown Act" when name is empty', () => {
    render(<ActCard act={makeAct({ name: '' })} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Unknown Act',
    );
  });

  it('renders without crashing when all optional fields are null', () => {
    render(
      <ActCard
        act={makeAct({ actType: null, genres: [], notes: null, website: null })}
      />,
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeDefined();
  });
});

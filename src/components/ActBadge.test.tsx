import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ActBadge } from './ActBadge';

describe('ActBadge', () => {
  it('renders the act name', () => {
    render(<ActBadge name="Rebirth Brass Band" />);
    expect(screen.getByText('Rebirth Brass Band')).toBeDefined();
  });

  it('renders the first genre when provided', () => {
    render(<ActBadge name="Trombone Shorty" genres={['Jazz', 'Funk']} />);
    expect(screen.getByText('Jazz')).toBeDefined();
  });

  it('shows only the first genre even when multiple are provided', () => {
    render(
      <ActBadge
        name="Trombone Shorty"
        genres={['Jazz', 'Funk', 'R&B / Soul']}
      />,
    );
    expect(screen.getByText('Jazz')).toBeDefined();
    expect(screen.queryByText('Funk')).toBeNull();
  });

  it('renders without a genre when genres is empty', () => {
    render(<ActBadge name="Bounce DJ" genres={[]} />);
    expect(screen.getByText('Bounce DJ')).toBeDefined();
    expect(screen.queryByText('·')).toBeNull();
  });

  it('renders without a genre when genres is omitted', () => {
    render(<ActBadge name="Solo Artist" />);
    expect(screen.getByText('Solo Artist')).toBeDefined();
  });
});

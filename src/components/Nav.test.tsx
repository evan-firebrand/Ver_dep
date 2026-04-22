import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Nav } from './Nav';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from 'next/navigation';

describe('Nav', () => {
  it('renders a link to This Week', () => {
    vi.mocked(usePathname).mockReturnValue('/');
    render(<Nav />);
    const link = screen.getByRole('link', { name: 'This Week' });
    expect(link.getAttribute('href')).toBe('/this-week');
  });

  it('renders links to Events, Acts, and Venues', () => {
    vi.mocked(usePathname).mockReturnValue('/');
    render(<Nav />);
    expect(
      screen.getByRole('link', { name: 'Events' }).getAttribute('href'),
    ).toBe('/events');
    expect(
      screen.getByRole('link', { name: 'Acts' }).getAttribute('href'),
    ).toBe('/acts');
    expect(
      screen.getByRole('link', { name: 'Venues' }).getAttribute('href'),
    ).toBe('/venues');
  });

  it('marks the current route with aria-current="page"', () => {
    vi.mocked(usePathname).mockReturnValue('/events');
    render(<Nav />);
    expect(
      screen.getByRole('link', { name: 'Events' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen.getByRole('link', { name: 'Acts' }).getAttribute('aria-current'),
    ).toBeNull();
  });

  it('treats /events/123 as under /events for active-route matching', () => {
    vi.mocked(usePathname).mockReturnValue('/events/abc-123');
    render(<Nav />);
    expect(
      screen.getByRole('link', { name: 'Events' }).getAttribute('aria-current'),
    ).toBe('page');
  });

  it('does not mark the home logo as active on /events', () => {
    vi.mocked(usePathname).mockReturnValue('/events');
    render(<Nav />);
    const logo = screen.getByRole('link', { name: 'NOLA Music Tracker' });
    expect(logo.getAttribute('aria-current')).toBeNull();
  });
});

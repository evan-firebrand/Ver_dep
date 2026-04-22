import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from 'next/navigation';

import { NavLinks } from './NavLinks';

describe('NavLinks', () => {
  it('renders links to This Week, Events, Acts, and Venues', () => {
    vi.mocked(usePathname).mockReturnValue('/');
    render(<NavLinks />);
    expect(
      screen.getByRole('link', { name: 'This Week' }).getAttribute('href'),
    ).toBe('/this-week');
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
    render(<NavLinks />);
    expect(
      screen.getByRole('link', { name: 'Events' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen.getByRole('link', { name: 'Acts' }).getAttribute('aria-current'),
    ).toBeNull();
  });

  it('treats /events/123 as under /events for active-route matching', () => {
    vi.mocked(usePathname).mockReturnValue('/events/abc-123');
    render(<NavLinks />);
    expect(
      screen.getByRole('link', { name: 'Events' }).getAttribute('aria-current'),
    ).toBe('page');
  });
});

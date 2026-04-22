import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import Home from './page';

/**
 * The home page's upcoming-events list is an async Server Component inside
 * Suspense and cannot be unit-tested here (see CLAUDE.md testing rule #6).
 * These tests cover the synchronous shell only: hero, CTAs, quick links.
 */

test('renders the site name in the heading', () => {
  render(<Home />);
  expect(
    screen.getByRole('heading', { level: 1, name: /NOLA Music Tracker/i }),
  ).toBeDefined();
});

test("primary CTA links to /this-week (what's on this week)", () => {
  render(<Home />);
  const link = screen.getByRole('link', { name: /what's on this week/i });
  expect(link.getAttribute('href')).toBe('/this-week');
});

test('secondary CTA links to /events (browse all events)', () => {
  render(<Home />);
  const link = screen.getByRole('link', { name: /browse all events/i });
  expect(link.getAttribute('href')).toBe('/events');
});

test('renders quick-pick links with filtered /events URLs', () => {
  render(<Home />);
  const festivals = screen.getByRole('link', { name: /festivals/i });
  expect(festivals.getAttribute('href')).toBe('/events?type=Festival');

  const marigny = screen.getByRole('link', { name: /marigny/i });
  expect(marigny.getAttribute('href')).toBe('/events?neighborhood=Marigny');

  const secondLines = screen.getByRole('link', { name: /second lines/i });
  expect(secondLines.getAttribute('href')).toBe('/events?type=Second+Line');
});

test('quick-pick "Free tonight" links to /this-week with the free filter', () => {
  render(<Home />);
  const free = screen.getByRole('link', { name: /free tonight/i });
  expect(free.getAttribute('href')).toBe('/this-week?cost=free');
});

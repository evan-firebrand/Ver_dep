import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import Home from './page';

test('renders the site name in the heading', () => {
  render(<Home />);
  expect(
    screen.getByRole('heading', { level: 1, name: /NOLA Music Tracker/i }),
  ).toBeDefined();
});

test('renders Browse Events link pointing to /events', () => {
  render(<Home />);
  const link = screen.getByRole('link', { name: /Browse Events/i });
  expect(link.getAttribute('href')).toBe('/events');
});

test('renders Browse Venues link pointing to /venues', () => {
  render(<Home />);
  const link = screen.getByRole('link', { name: /Browse Venues/i });
  expect(link.getAttribute('href')).toBe('/venues');
});

test('lists the event types we track', () => {
  render(<Home />);
  expect(screen.getByText('Live Music')).toBeDefined();
  expect(screen.getByText('Festivals')).toBeDefined();
  expect(screen.getByText('Second Lines')).toBeDefined();
});

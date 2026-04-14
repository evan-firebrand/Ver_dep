import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import SeriesIndexPage from './page';

test('renders the Series heading', () => {
  render(<SeriesIndexPage />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Series' }),
  ).toBeDefined();
});

test('renders a link for Jazz Fest Weekend 1', () => {
  render(<SeriesIndexPage />);
  const link = screen.getByRole('link', { name: /Jazz Fest Weekend 1/i });
  expect(link.getAttribute('href')).toBe('/series/jazz-fest-weekend-1');
});

test('renders a link for Jazz Fest Weekend 2', () => {
  render(<SeriesIndexPage />);
  const link = screen.getByRole('link', { name: /Jazz Fest Weekend 2/i });
  expect(link.getAttribute('href')).toBe('/series/jazz-fest-weekend-2');
});

test('renders a link for Fest by Nite', () => {
  render(<SeriesIndexPage />);
  const link = screen.getByRole('link', { name: /Fest by Nite/i });
  expect(link.getAttribute('href')).toBe('/series/fest-by-nite');
});

test('renders a link for Daze Between', () => {
  render(<SeriesIndexPage />);
  const link = screen.getByRole('link', { name: /Daze Between/i });
  expect(link.getAttribute('href')).toBe('/series/daze-between');
});

test('renders description text for each series', () => {
  render(<SeriesIndexPage />);
  expect(
    screen.getByText(
      /First weekend of the New Orleans Jazz & Heritage Festival/i,
    ),
  ).toBeDefined();
  expect(screen.getByText(/Nighttime shows and parties/i)).toBeDefined();
  expect(
    screen.getByText(/Events between the two Jazz Fest weekends/i),
  ).toBeDefined();
});

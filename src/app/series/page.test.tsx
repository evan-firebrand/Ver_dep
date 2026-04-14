import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import SeriesPage from './page';

test('renders the page heading', () => {
  render(<SeriesPage />);
  expect(
    screen.getByRole('heading', { level: 1, name: /Series/i }),
  ).toBeDefined();
});

test('renders a link for each of the 5 series', () => {
  render(<SeriesPage />);
  const links = screen.getAllByRole('link');
  // Each series card is a link
  expect(links.length).toBe(5);
});

test('renders Jazz Fest Weekend 1 with correct href', () => {
  render(<SeriesPage />);
  const link = screen.getByRole('link', { name: /Jazz Fest Weekend 1/i });
  expect(link.getAttribute('href')).toBe('/series/jazz-fest-weekend-1');
});

test('renders Jazz Fest Weekend 2 with correct href', () => {
  render(<SeriesPage />);
  const link = screen.getByRole('link', { name: /Jazz Fest Weekend 2/i });
  expect(link.getAttribute('href')).toBe('/series/jazz-fest-weekend-2');
});

test('renders Fest by Nite with correct href', () => {
  render(<SeriesPage />);
  const link = screen.getByRole('link', { name: /Fest by Nite/i });
  expect(link.getAttribute('href')).toBe('/series/fest-by-nite');
});

test('renders Daze Between with correct href', () => {
  render(<SeriesPage />);
  const link = screen.getByRole('link', { name: /Daze Between/i });
  expect(link.getAttribute('href')).toBe('/series/daze-between');
});

test('renders Visitor Weekend with correct href', () => {
  render(<SeriesPage />);
  const link = screen.getByRole('link', { name: /Visitor Weekend/i });
  expect(link.getAttribute('href')).toBe('/series/visitor-weekend');
});

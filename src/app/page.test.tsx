import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

test('Home page renders heading', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    /edit the page\.tsx file/i,
  );
});

test('Home page renders navigation links', () => {
  render(<Home />);
  const links = screen.getAllByRole('link');
  const hrefs = links.map((link) => link.getAttribute('href'));
  expect(hrefs.some((h) => h?.includes('vercel.com/new'))).toBe(true);
  expect(hrefs.some((h) => h?.includes('nextjs.org/docs'))).toBe(true);
});

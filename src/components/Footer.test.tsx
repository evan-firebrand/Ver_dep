import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

describe('Footer', () => {
  it('renders a site description', () => {
    render(<Footer />);
    expect(
      screen.getByText(/live music, festivals, second lines/i),
    ).toBeDefined();
  });

  it('renders a data-freshness note', () => {
    render(<Footer />);
    expect(screen.getByText(/refreshed hourly/i)).toBeDefined();
  });

  it('renders a "Submit an event" link opening in a new tab', () => {
    render(<Footer />);
    const submit = screen.getByRole('link', { name: /submit an event/i });
    expect(submit.getAttribute('href')).toContain('github.com');
    expect(submit.getAttribute('target')).toBe('_blank');
    expect(submit.getAttribute('rel')).toContain('noopener');
  });

  it('renders a "Source" link to the repo', () => {
    render(<Footer />);
    const source = screen.getByRole('link', { name: /source/i });
    expect(source.getAttribute('href')).toContain('github.com');
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.fn();
let mockSearch = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

import { FilterBarUrl } from './FilterBarUrl';

function setSearch(search: string) {
  mockSearch = search;
}

beforeEach(() => {
  push.mockClear();
  setSearch('');
});

describe('FilterBarUrl', () => {
  it('pushes /events?cost=free when the Free pill is clicked', () => {
    render(<FilterBarUrl />);
    fireEvent.click(screen.getByRole('button', { name: 'Free' }));
    expect(push).toHaveBeenCalledWith('/events?cost=free');
  });

  it('pushes /events (no params) when "All" cost is clicked from free', () => {
    setSearch('cost=free');
    render(<FilterBarUrl />);
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(push).toHaveBeenCalledWith('/events');
  });

  it('toggles an event type on', () => {
    render(<FilterBarUrl />);
    fireEvent.click(screen.getByRole('button', { name: 'Festival' }));
    expect(push).toHaveBeenCalledWith('/events?type=Festival');
  });

  it('adds a second event type without removing the first', () => {
    setSearch('type=Festival');
    render(<FilterBarUrl />);
    fireEvent.click(screen.getByRole('button', { name: 'Parade' }));
    expect(push).toHaveBeenCalledWith('/events?type=Festival%2CParade');
  });

  it('shows "Clear filters" when any filter is active', () => {
    setSearch('cost=paid');
    render(<FilterBarUrl />);
    expect(
      screen.getByRole('button', { name: /clear filters/i }),
    ).toBeDefined();
  });

  it('does not show "Clear filters" when no filters are active', () => {
    render(<FilterBarUrl />);
    expect(screen.queryByRole('button', { name: /clear filters/i })).toBeNull();
  });

  it('clears all filters when Clear filters is clicked', () => {
    setSearch('cost=paid&neighborhood=Marigny&type=Festival');
    render(<FilterBarUrl />);
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(push).toHaveBeenCalledWith('/events');
  });

  it('marks the active cost pill with aria-pressed="true"', () => {
    setSearch('cost=free');
    render(<FilterBarUrl />);
    expect(
      screen.getByRole('button', { name: 'Free' }).getAttribute('aria-pressed'),
    ).toBe('true');
  });
});

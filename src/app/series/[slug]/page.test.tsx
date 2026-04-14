import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import SeriesDetailPage from './page';

// The outer SeriesDetailPage is a sync component that wraps the async
// SeriesContent in <Suspense>. In Vitest the async inner component suspends,
// so only the fallback is visible. This confirms the shell renders without
// error and the loading state is shown.
test('renders the loading fallback while content streams in', () => {
  render(
    <SeriesDetailPage
      params={Promise.resolve({ slug: 'jazz-fest-weekend-1' })}
    />,
  );
  expect(screen.getByText(/Loading events/i)).toBeDefined();
});

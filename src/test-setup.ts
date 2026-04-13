import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// RTL's auto-cleanup checks for `afterEach` as a global, which Vitest does not
// expose by default (globals: false). Register cleanup explicitly so each test
// starts with a fresh DOM.
afterEach(cleanup);

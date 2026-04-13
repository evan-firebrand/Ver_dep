import type { PageObjectResponse } from '@notionhq/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DATABASE_IDS } from './constants';
import {
  getActs,
  getEvents,
  getOrganizations,
  getResources,
  getVenues,
} from './queries';

// ─── Mock setup ───────────────────────────────────────────────────────────────

const mockDataSourcesQuery = vi.fn();

vi.mock('./client', () => ({
  getNotionClient: () => ({
    dataSources: { query: mockDataSourcesQuery },
  }),
}));

// cacheLife and cacheTag are Next.js server-only APIs; stub them in tests so
// the 'use cache' directive in queries.ts doesn't throw in the jsdom environment.
vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

/** Build a minimal PageObjectResponse with a title property. */
function makeMinimalPage(id: string, title: string): PageObjectResponse {
  return {
    object: 'page',
    id,
    created_time: '2026-04-13T00:00:00.000Z',
    last_edited_time: '2026-04-13T00:00:00.000Z',
    in_trash: false,
    archived: false,
    is_archived: false,
    is_locked: false,
    url: `https://notion.so/${id}`,
    public_url: null,
    parent: { type: 'database_id', database_id: 'db-id' },
    icon: null,
    cover: null,
    created_by: { object: 'user', id: 'user-1' },
    last_edited_by: { object: 'user', id: 'user-1' },
    properties: {
      EventName: {
        id: 'title',
        type: 'title',
        title: [{ plain_text: title }],
      } as PageObjectResponse['properties'][string],
      Name: {
        id: 'title',
        type: 'title',
        title: [{ plain_text: title }],
      } as PageObjectResponse['properties'][string],
    },
  } as unknown as PageObjectResponse;
}

function makeQueryResponse(
  pages: PageObjectResponse[],
  opts: { hasMore?: boolean; nextCursor?: string } = {},
) {
  return {
    object: 'list',
    results: pages,
    has_more: opts.hasMore ?? false,
    next_cursor: opts.nextCursor ?? null,
    type: 'page_or_database',
    page_or_database: {},
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── getEvents ────────────────────────────────────────────────────────────────

describe('getEvents', () => {
  it('queries the Events database and maps results', async () => {
    const page = makeMinimalPage('evt-1', 'Jazz Fest');
    mockDataSourcesQuery.mockResolvedValueOnce(makeQueryResponse([page]));

    const events = await getEvents();

    expect(mockDataSourcesQuery).toHaveBeenCalledOnce();
    expect(mockDataSourcesQuery).toHaveBeenCalledWith({
      data_source_id: DATABASE_IDS.EVENTS,
      start_cursor: undefined,
    });
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('evt-1');
    expect(events[0].name).toBe('Jazz Fest');
  });

  it('follows pagination cursors and collects all pages', async () => {
    const page1 = makeMinimalPage('evt-1', 'Event 1');
    const page2 = makeMinimalPage('evt-2', 'Event 2');

    mockDataSourcesQuery
      .mockResolvedValueOnce(
        makeQueryResponse([page1], { hasMore: true, nextCursor: 'cursor-abc' }),
      )
      .mockResolvedValueOnce(makeQueryResponse([page2]));

    const events = await getEvents();

    expect(mockDataSourcesQuery).toHaveBeenCalledTimes(2);
    expect(mockDataSourcesQuery).toHaveBeenNthCalledWith(2, {
      data_source_id: DATABASE_IDS.EVENTS,
      start_cursor: 'cursor-abc',
    });
    expect(events).toHaveLength(2);
    expect(events[1].name).toBe('Event 2');
  });

  it('returns an empty array when the database has no records', async () => {
    mockDataSourcesQuery.mockResolvedValueOnce(makeQueryResponse([]));

    const events = await getEvents();

    expect(events).toEqual([]);
  });

  it('skips partial page responses (non-full pages)', async () => {
    const partialPage = { object: 'page', id: 'partial-1' };
    const fullPage = makeMinimalPage('full-1', 'Full Page');

    mockDataSourcesQuery.mockResolvedValueOnce(
      makeQueryResponse([partialPage as PageObjectResponse, fullPage]),
    );

    const events = await getEvents();

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('full-1');
  });

  it('propagates errors from the Notion API', async () => {
    mockDataSourcesQuery.mockRejectedValueOnce(new Error('Notion API error'));

    await expect(getEvents()).rejects.toThrow('Notion API error');
  });
});

// ─── getVenues ────────────────────────────────────────────────────────────────

describe('getVenues', () => {
  it('queries the Venues database', async () => {
    const page = makeMinimalPage('venue-1', 'Tipitinas');
    mockDataSourcesQuery.mockResolvedValueOnce(makeQueryResponse([page]));

    const venues = await getVenues();

    expect(mockDataSourcesQuery).toHaveBeenCalledWith({
      data_source_id: DATABASE_IDS.VENUES,
      start_cursor: undefined,
    });
    expect(venues[0].id).toBe('venue-1');
  });
});

// ─── getActs ──────────────────────────────────────────────────────────────────

describe('getActs', () => {
  it('queries the Acts database', async () => {
    const page = makeMinimalPage('act-1', 'Rebirth Brass Band');
    mockDataSourcesQuery.mockResolvedValueOnce(makeQueryResponse([page]));

    const acts = await getActs();

    expect(mockDataSourcesQuery).toHaveBeenCalledWith({
      data_source_id: DATABASE_IDS.ACTS,
      start_cursor: undefined,
    });
    expect(acts[0].id).toBe('act-1');
  });
});

// ─── getOrganizations ─────────────────────────────────────────────────────────

describe('getOrganizations', () => {
  it('queries the Organizations database', async () => {
    const page = makeMinimalPage('org-1', 'Jazz Fest');
    mockDataSourcesQuery.mockResolvedValueOnce(makeQueryResponse([page]));

    const orgs = await getOrganizations();

    expect(mockDataSourcesQuery).toHaveBeenCalledWith({
      data_source_id: DATABASE_IDS.ORGANIZATIONS,
      start_cursor: undefined,
    });
    expect(orgs[0].id).toBe('org-1');
  });
});

// ─── getResources ─────────────────────────────────────────────────────────────

describe('getResources', () => {
  it('queries the Resources database', async () => {
    const page = makeMinimalPage('res-1', 'WWOZ');
    mockDataSourcesQuery.mockResolvedValueOnce(makeQueryResponse([page]));

    const resources = await getResources();

    expect(mockDataSourcesQuery).toHaveBeenCalledWith({
      data_source_id: DATABASE_IDS.RESOURCES,
      start_cursor: undefined,
    });
    expect(resources[0].id).toBe('res-1');
  });
});

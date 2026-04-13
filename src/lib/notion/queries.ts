import { isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client';

import { getNotionClient } from './client';
import { DATABASE_IDS } from './constants';
import {
  mapAct,
  mapEvent,
  mapOrganization,
  mapResource,
  mapVenue,
} from './mappers';
import type { Act, NolaEvent, Organization, Resource, Venue } from './types';

/**
 * Fetches all pages from a Notion data source, following pagination cursors
 * until every record is collected.
 *
 * Note: this SDK version uses `dataSources.query({ data_source_id })` rather
 * than the older `databases.query({ database_id })` API.
 */
async function collectAll<T>(
  dataSourceId: string,
  mapper: (page: PageObjectResponse) => T,
): Promise<T[]> {
  const notion = getNotionClient();
  const results: T[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: startCursor,
    });

    for (const page of response.results) {
      if (isFullPage(page)) {
        results.push(mapper(page));
      }
    }

    startCursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (startCursor !== undefined);

  return results;
}

/** Returns all events from the Events database. */
export async function getEvents(): Promise<NolaEvent[]> {
  return collectAll(DATABASE_IDS.EVENTS, mapEvent);
}

/** Returns all venues from the Venues database. */
export async function getVenues(): Promise<Venue[]> {
  return collectAll(DATABASE_IDS.VENUES, mapVenue);
}

/** Returns all acts from the Acts database. */
export async function getActs(): Promise<Act[]> {
  return collectAll(DATABASE_IDS.ACTS, mapAct);
}

/**
 * Returns all organizations from the Organizations database.
 * Note: this database is suspended as of 2026-04-10 and records are not
 * actively maintained.
 */
export async function getOrganizations(): Promise<Organization[]> {
  return collectAll(DATABASE_IDS.ORGANIZATIONS, mapOrganization);
}

/** Returns all resources from the Resources database. */
export async function getResources(): Promise<Resource[]> {
  return collectAll(DATABASE_IDS.RESOURCES, mapResource);
}

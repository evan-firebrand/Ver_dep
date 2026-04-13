import type { PageObjectResponse } from '@notionhq/client';

import {
  extractCheckbox,
  extractDate,
  extractMultiSelect,
  extractRelationIds,
  extractRichText,
  extractSelect,
  extractTitle,
  extractUrl,
} from './property-utils';
import type {
  Act,
  ActType,
  CheckFrequency,
  EntryMethod,
  EventSeries,
  EventStatus,
  EventType,
  Genre,
  Neighborhood,
  NolaEvent,
  Organization,
  OrganizationType,
  Resource,
  ResourceCoverage,
  Venue,
  VenueType,
} from './types';

export function mapEvent(page: PageObjectResponse): NolaEvent {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    createdTime: page.created_time,
    name: extractTitle(p['EventName']),
    eventType: extractSelect(p['Event Type']) as EventType | null,
    date: extractDate(p['Date']),
    time: extractRichText(p['Time']),
    cost: extractRichText(p['Cost']),
    venueIds: extractRelationIds(p['Venue']),
    link: extractUrl(p['Link']),
    notes: extractRichText(p['Notes']),
    interested: extractCheckbox(p['Interested?']),
    series: extractMultiSelect(p['Series']) as EventSeries[],
    status: extractSelect(p['Status']) as EventStatus | null,
    entryMethod: extractSelect(p['Entry Method']) as EntryMethod | null,
    actIds: extractRelationIds(p['Acts']),
    sourceIds: extractRelationIds(p['Source']),
  };
}

export function mapVenue(page: PageObjectResponse): Venue {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    createdTime: page.created_time,
    name: extractTitle(p['Name']),
    venueType: extractSelect(p['Venue Type']) as VenueType | null,
    neighborhood: extractSelect(p['Neighborhood']) as Neighborhood | null,
    address: extractRichText(p['Address']),
    website: extractUrl(p['Website']),
    notes: extractRichText(p['Notes']),
  };
}

export function mapAct(page: PageObjectResponse): Act {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    createdTime: page.created_time,
    name: extractTitle(p['Name']),
    actType: extractSelect(p['Act Type']) as ActType | null,
    genres: extractMultiSelect(p['Genre']) as Genre[],
    notes: extractRichText(p['Notes']),
    website: extractUrl(p['Website']),
  };
}

export function mapOrganization(page: PageObjectResponse): Organization {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    createdTime: page.created_time,
    name: extractTitle(p['Name']),
    type: extractSelect(p['Type']) as OrganizationType | null,
    website: extractUrl(p['Website']),
    notes: extractRichText(p['Notes']),
  };
}

export function mapResource(page: PageObjectResponse): Resource {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    createdTime: page.created_time,
    name: extractTitle(p['Name']),
    resourceUrl: extractUrl(p['URL']),
    checkFrequency: extractSelect(
      p['Check Frequency'],
    ) as CheckFrequency | null,
    coverage: extractMultiSelect(p['Coverage']) as ResourceCoverage[],
    notes: extractRichText(p['Notes']),
  };
}

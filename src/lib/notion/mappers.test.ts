import type { PageObjectResponse } from '@notionhq/client';
import { describe, expect, it } from 'vitest';

import {
  mapAct,
  mapEvent,
  mapOrganization,
  mapResource,
  mapVenue,
} from './mappers';

// ─── Mock property builders ───────────────────────────────────────────────────

type Props = PageObjectResponse['properties'];

/** Cast a plain object to the Notion property union type for testing. */
function prop(value: unknown): Props[string] {
  return value as Props[string];
}

const titleProp = (text: string) =>
  prop({ id: 'title', type: 'title', title: [{ plain_text: text }] });

const richTextProp = (text: string) =>
  prop({ id: 'rt', type: 'rich_text', rich_text: [{ plain_text: text }] });

const selectProp = (name: string) =>
  prop({
    id: 'sel',
    type: 'select',
    select: { id: 'opt-1', name, color: 'blue' },
  });

const multiSelectProp = (names: string[]) =>
  prop({
    id: 'msel',
    type: 'multi_select',
    multi_select: names.map((n, i) => ({
      id: `opt-${i}`,
      name: n,
      color: 'blue',
    })),
  });

const dateProp = (start: string, end: string | null = null) =>
  prop({ id: 'dt', type: 'date', date: { start, end, time_zone: null } });

const checkboxProp = (checked: boolean) =>
  prop({ id: 'chk', type: 'checkbox', checkbox: checked });

const urlProp = (url: string | null) => prop({ id: 'url', type: 'url', url });

const relationProp = (ids: string[]) =>
  prop({
    id: 'rel',
    type: 'relation',
    relation: ids.map((id) => ({ id })),
    has_more: false,
  });

/** Build a minimal mock PageObjectResponse for mapper tests. */
function makePage(properties: Props = {}): PageObjectResponse {
  return {
    object: 'page',
    id: 'page-id-1',
    created_time: '2026-04-13T00:00:00.000Z',
    last_edited_time: '2026-04-13T00:00:00.000Z',
    in_trash: false,
    archived: false,
    is_archived: false,
    is_locked: false,
    url: 'https://notion.so/page-id-1',
    public_url: null,
    parent: { type: 'database_id', database_id: 'db-id' },
    icon: null,
    cover: null,
    created_by: { object: 'user', id: 'user-1' },
    last_edited_by: { object: 'user', id: 'user-1' },
    properties,
  } as unknown as PageObjectResponse;
}

// ─── mapEvent ─────────────────────────────────────────────────────────────────

describe('mapEvent', () => {
  it('maps all fields from a full event page', () => {
    const page = makePage({
      EventName: titleProp('The Funk Sessions — Snug Harbor'),
      'Event Type': selectProp('Live Music'),
      Date: dateProp('2026-04-25'),
      Time: richTextProp('Doors 9pm / Show 10pm'),
      Cost: richTextProp('$20'),
      Venue: relationProp(['venue-id-1']),
      Link: urlProp('https://ticketmaster.com/event'),
      Notes: richTextProp('Great show'),
      'Interested?': checkboxProp(true),
      Series: multiSelectProp(['Daze Between']),
      Status: selectProp('Active'),
      'Entry Method': selectProp('Claude Agent'),
      Acts: relationProp(['act-id-1', 'act-id-2']),
      Source: relationProp(['source-id-1']),
    });

    const event = mapEvent(page);

    expect(event.id).toBe('page-id-1');
    expect(event.name).toBe('The Funk Sessions — Snug Harbor');
    expect(event.eventType).toBe('Live Music');
    expect(event.date).toEqual({
      start: '2026-04-25',
      end: null,
      isDatetime: false,
    });
    expect(event.time).toBe('Doors 9pm / Show 10pm');
    expect(event.cost).toBe('$20');
    expect(event.venueIds).toEqual(['venue-id-1']);
    expect(event.link).toBe('https://ticketmaster.com/event');
    expect(event.notes).toBe('Great show');
    expect(event.interested).toBe(true);
    expect(event.series).toEqual(['Daze Between']);
    expect(event.status).toBe('Active');
    expect(event.entryMethod).toBe('Claude Agent');
    expect(event.actIds).toEqual(['act-id-1', 'act-id-2']);
    expect(event.sourceIds).toEqual(['source-id-1']);
  });

  it('handles absent optional fields safely', () => {
    const event = mapEvent(makePage({ EventName: titleProp('Minimal Event') }));

    expect(event.eventType).toBeNull();
    expect(event.date).toBeNull();
    expect(event.time).toBeNull();
    expect(event.cost).toBeNull();
    expect(event.venueIds).toEqual([]);
    expect(event.interested).toBe(false);
    expect(event.series).toEqual([]);
    expect(event.actIds).toEqual([]);
    expect(event.sourceIds).toEqual([]);
  });
});

// ─── mapVenue ─────────────────────────────────────────────────────────────────

describe('mapVenue', () => {
  it('maps all venue fields', () => {
    const venue = mapVenue(
      makePage({
        Name: titleProp('Tipitinas'),
        'Venue Type': selectProp('Concert Hall'),
        Neighborhood: selectProp('Uptown'),
        Address: richTextProp('501 Napoleon Ave'),
        Website: urlProp('https://tipitinas.com'),
        Notes: richTextProp('Historic venue'),
      }),
    );

    expect(venue.name).toBe('Tipitinas');
    expect(venue.venueType).toBe('Concert Hall');
    expect(venue.neighborhood).toBe('Uptown');
    expect(venue.address).toBe('501 Napoleon Ave');
    expect(venue.website).toBe('https://tipitinas.com');
    expect(venue.notes).toBe('Historic venue');
  });

  it('handles absent optional fields', () => {
    const venue = mapVenue(makePage({ Name: titleProp('Unknown Venue') }));

    expect(venue.venueType).toBeNull();
    expect(venue.neighborhood).toBeNull();
    expect(venue.website).toBeNull();
  });
});

// ─── mapAct ───────────────────────────────────────────────────────────────────

describe('mapAct', () => {
  it('maps all act fields', () => {
    const act = mapAct(
      makePage({
        Name: titleProp('Rebirth Brass Band'),
        'Act Type': selectProp('Brass Band'),
        Genre: multiSelectProp(['Brass', 'Funk']),
        Notes: richTextProp('Tuesday night residency at Maple Leaf'),
        Website: urlProp('https://rebirthbrassband.com'),
      }),
    );

    expect(act.name).toBe('Rebirth Brass Band');
    expect(act.actType).toBe('Brass Band');
    expect(act.genres).toEqual(['Brass', 'Funk']);
    expect(act.notes).toBe('Tuesday night residency at Maple Leaf');
    expect(act.website).toBe('https://rebirthbrassband.com');
  });

  it('handles absent optional fields', () => {
    const act = mapAct(makePage({ Name: titleProp('Unknown Act') }));

    expect(act.actType).toBeNull();
    expect(act.genres).toEqual([]);
    expect(act.notes).toBeNull();
  });
});

// ─── mapOrganization ──────────────────────────────────────────────────────────

describe('mapOrganization', () => {
  it('maps all organization fields', () => {
    const org = mapOrganization(
      makePage({
        Name: titleProp('Jazz Fest'),
        Type: selectProp('Festival Organizer'),
        Website: urlProp('https://jazzfest.com'),
        Notes: richTextProp('Runs late April / early May'),
      }),
    );

    expect(org.name).toBe('Jazz Fest');
    expect(org.type).toBe('Festival Organizer');
    expect(org.website).toBe('https://jazzfest.com');
    expect(org.notes).toBe('Runs late April / early May');
  });

  it('handles absent optional fields', () => {
    const org = mapOrganization(makePage({ Name: titleProp('Unknown Org') }));

    expect(org.type).toBeNull();
    expect(org.website).toBeNull();
  });
});

// ─── mapResource ──────────────────────────────────────────────────────────────

describe('mapResource', () => {
  it('maps all resource fields', () => {
    const resource = mapResource(
      makePage({
        Name: titleProp('WWOZ Livewire'),
        URL: urlProp('https://wwoz.org/calendar/livewire-music'),
        'Check Frequency': selectProp('Daily'),
        Coverage: multiSelectProp(['Weekly Live Music', 'Festivals']),
        Notes: richTextProp('Best source for live music'),
      }),
    );

    expect(resource.name).toBe('WWOZ Livewire');
    expect(resource.resourceUrl).toBe(
      'https://wwoz.org/calendar/livewire-music',
    );
    expect(resource.checkFrequency).toBe('Daily');
    expect(resource.coverage).toEqual(['Weekly Live Music', 'Festivals']);
    expect(resource.notes).toBe('Best source for live music');
  });

  it('handles absent optional fields', () => {
    const resource = mapResource(
      makePage({ Name: titleProp('Unknown Resource') }),
    );

    expect(resource.resourceUrl).toBeNull();
    expect(resource.checkFrequency).toBeNull();
    expect(resource.coverage).toEqual([]);
  });
});

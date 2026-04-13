import type { PageObjectResponse } from '@notionhq/client';
import { describe, expect, it } from 'vitest';

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

// ─── extractTitle ─────────────────────────────────────────────────────────────

describe('extractTitle', () => {
  it('extracts plain text', () => {
    expect(extractTitle(titleProp('My Event'))).toBe('My Event');
  });

  it('joins multiple segments', () => {
    const multi = prop({
      id: 'title',
      type: 'title',
      title: [{ plain_text: 'Hello ' }, { plain_text: 'World' }],
    });
    expect(extractTitle(multi)).toBe('Hello World');
  });

  it('returns empty string for empty array', () => {
    expect(extractTitle(prop({ id: 'title', type: 'title', title: [] }))).toBe(
      '',
    );
  });

  it('returns empty string for wrong type', () => {
    expect(extractTitle(checkboxProp(true))).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(extractTitle(undefined)).toBe('');
  });
});

// ─── extractRichText ──────────────────────────────────────────────────────────

describe('extractRichText', () => {
  it('extracts plain text', () => {
    expect(extractRichText(richTextProp('hello'))).toBe('hello');
  });

  it('returns null for empty rich_text array', () => {
    expect(
      extractRichText(prop({ id: 'rt', type: 'rich_text', rich_text: [] })),
    ).toBeNull();
  });

  it('returns null for wrong type', () => {
    expect(extractRichText(checkboxProp(true))).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(extractRichText(undefined)).toBeNull();
  });
});

// ─── extractSelect ────────────────────────────────────────────────────────────

describe('extractSelect', () => {
  it('extracts the option name', () => {
    expect(extractSelect(selectProp('Live Music'))).toBe('Live Music');
  });

  it('returns null when select is null', () => {
    expect(
      extractSelect(prop({ id: 'sel', type: 'select', select: null })),
    ).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(extractSelect(undefined)).toBeNull();
  });
});

// ─── extractMultiSelect ───────────────────────────────────────────────────────

describe('extractMultiSelect', () => {
  it('extracts all option names', () => {
    expect(extractMultiSelect(multiSelectProp(['Jazz', 'Funk']))).toEqual([
      'Jazz',
      'Funk',
    ]);
  });

  it('returns empty array when no options selected', () => {
    expect(extractMultiSelect(multiSelectProp([]))).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(extractMultiSelect(undefined)).toEqual([]);
  });
});

// ─── extractDate ──────────────────────────────────────────────────────────────

describe('extractDate', () => {
  it('extracts a plain date without time component', () => {
    expect(extractDate(dateProp('2026-04-25'))).toEqual({
      start: '2026-04-25',
      end: null,
      isDatetime: false,
    });
  });

  it('detects a datetime via the T separator', () => {
    expect(extractDate(dateProp('2026-04-25T20:00:00.000Z'))).toEqual({
      start: '2026-04-25T20:00:00.000Z',
      end: null,
      isDatetime: true,
    });
  });

  it('captures end date when present', () => {
    expect(extractDate(dateProp('2026-04-25', '2026-04-27'))?.end).toBe(
      '2026-04-27',
    );
  });

  it('returns null when date value is null', () => {
    expect(
      extractDate(prop({ id: 'dt', type: 'date', date: null })),
    ).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(extractDate(undefined)).toBeNull();
  });
});

// ─── extractCheckbox ──────────────────────────────────────────────────────────

describe('extractCheckbox', () => {
  it('returns true when checked', () => {
    expect(extractCheckbox(checkboxProp(true))).toBe(true);
  });

  it('returns false when unchecked', () => {
    expect(extractCheckbox(checkboxProp(false))).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(extractCheckbox(undefined)).toBe(false);
  });
});

// ─── extractUrl ───────────────────────────────────────────────────────────────

describe('extractUrl', () => {
  it('extracts a URL string', () => {
    expect(extractUrl(urlProp('https://example.com'))).toBe(
      'https://example.com',
    );
  });

  it('returns null when url is null', () => {
    expect(extractUrl(urlProp(null))).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(extractUrl(undefined)).toBeNull();
  });
});

// ─── extractRelationIds ───────────────────────────────────────────────────────

describe('extractRelationIds', () => {
  it('extracts an array of relation IDs', () => {
    expect(extractRelationIds(relationProp(['id-1', 'id-2']))).toEqual([
      'id-1',
      'id-2',
    ]);
  });

  it('returns empty array when no relations', () => {
    expect(extractRelationIds(relationProp([]))).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(extractRelationIds(undefined)).toEqual([]);
  });
});

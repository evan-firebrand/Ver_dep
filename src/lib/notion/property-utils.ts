/**
 * Helpers for extracting typed values from Notion page property objects.
 *
 * Each function accepts a single property value from PageObjectResponse.properties
 * and returns a clean TypeScript value. Unknown or missing properties return safe
 * defaults (empty string, null, false, empty array) rather than throwing.
 */
import type { PageObjectResponse } from '@notionhq/client';

type PropValue = PageObjectResponse['properties'][string];

/** Extract the plain-text string from a title property. Returns '' when absent. */
export function extractTitle(prop: PropValue | undefined): string {
  if (!prop || prop.type !== 'title') return '';
  return prop.title.map((t) => t.plain_text).join('');
}

/** Extract plain text from a rich_text property. Returns null when empty or absent. */
export function extractRichText(prop: PropValue | undefined): string | null {
  if (!prop || prop.type !== 'rich_text') return null;
  const text = prop.rich_text.map((t) => t.plain_text).join('');
  return text.length > 0 ? text : null;
}

/** Extract the selected option name from a select property. */
export function extractSelect(prop: PropValue | undefined): string | null {
  if (!prop || prop.type !== 'select') return null;
  return prop.select?.name ?? null;
}

/** Extract all selected option names from a multi_select property. */
export function extractMultiSelect(prop: PropValue | undefined): string[] {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select.map((s) => s.name);
}

export interface ExtractedDate {
  start: string;
  end: string | null;
  isDatetime: boolean;
}

/** Extract start/end/isDatetime from a date property. */
export function extractDate(prop: PropValue | undefined): ExtractedDate | null {
  if (!prop || prop.type !== 'date' || !prop.date) return null;
  return {
    start: prop.date.start,
    end: prop.date.end ?? null,
    isDatetime: prop.date.start.includes('T'),
  };
}

/** Extract a boolean from a checkbox property. Returns false when absent. */
export function extractCheckbox(prop: PropValue | undefined): boolean {
  if (!prop || prop.type !== 'checkbox') return false;
  return prop.checkbox;
}

/** Extract a URL string from a url property. */
export function extractUrl(prop: PropValue | undefined): string | null {
  if (!prop || prop.type !== 'url') return null;
  return prop.url;
}

/** Extract an array of related page IDs from a relation property. */
export function extractRelationIds(prop: PropValue | undefined): string[] {
  if (!prop || prop.type !== 'relation') return [];
  return prop.relation.map((r) => r.id);
}

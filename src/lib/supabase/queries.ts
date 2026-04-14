import { cacheLife, cacheTag } from 'next/cache';

import { getSupabaseClient } from './client';
import type {
  Act,
  ActType,
  EntryMethod,
  EventSeries,
  EventStatus,
  EventType,
  Genre,
  Neighborhood,
  NolaEvent,
  Venue,
  VenueType,
} from './types';

/** Returns all events from the events table, with act IDs from event_acts. */
export async function getEvents(): Promise<NolaEvent[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('supabase-events');

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, event_acts(act_id)');

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: row.name as string,
    eventType: (row.event_type as EventType | null) ?? null,
    date: row.date_start
      ? {
          start: row.date_start as string,
          end: (row.date_end as string | null) ?? null,
          isDatetime: false,
        }
      : null,
    time: (row.time_info as string | null) ?? null,
    cost: (row.cost as string | null) ?? null,
    venueId: row.venue_id !== null ? String(row.venue_id) : null,
    link: (row.link as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    interested: (row.interested as boolean | null) ?? false,
    series: ((row.series as string[] | null) ?? []) as EventSeries[],
    status: (row.status as EventStatus | null) ?? null,
    entryMethod: (row.entry_method as EntryMethod | null) ?? null,
    actIds: ((row.event_acts as { act_id: number }[] | null) ?? []).map((ea) =>
      String(ea.act_id),
    ),
  }));
}

/** Returns all venues from the venues table. */
export async function getVenues(): Promise<Venue[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('supabase-venues');

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('venues').select('*');

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: row.name as string,
    venueType: (row.venue_type as VenueType | null) ?? null,
    neighborhood: (row.neighborhood as Neighborhood | null) ?? null,
    address: (row.address as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  }));
}

/** Returns all acts from the acts table. */
export async function getActs(): Promise<Act[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('supabase-acts');

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('acts').select('*');

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: row.name as string,
    actType: (row.act_type as ActType | null) ?? null,
    genres: ((row.genres as string[] | null) ?? []) as Genre[],
    notes: (row.notes as string | null) ?? null,
    website: (row.website as string | null) ?? null,
  }));
}

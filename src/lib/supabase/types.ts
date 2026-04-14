// ─── Events ──────────────────────────────────────────────────────────────────

export type EventType =
  | 'Live Music'
  | 'Festival'
  | 'Second Line'
  | 'Parade'
  | 'Community / Neighborhood';

export type EventSeries =
  | 'Fest by Nite'
  | 'Daze Between'
  | 'Jazz Fest Weekend 1'
  | 'Jazz Fest Weekend 2'
  | 'Visitor Weekend';

export type EventStatus = 'Active' | 'Cancelled' | 'Postponed' | 'Sold Out';

export type EntryMethod = 'Claude Agent' | 'Scheduled Task' | 'Manual';

export interface EventDate {
  start: string;
  end: string | null;
  /** true when the date includes a time component (ISO 8601 datetime) */
  isDatetime: boolean;
}

export interface NolaEvent {
  id: string;
  name: string;
  eventType: EventType | null;
  date: EventDate | null;
  time: string | null;
  cost: string | null;
  /** Single venue foreign key (stringified integer). */
  venueId: string | null;
  link: string | null;
  notes: string | null;
  interested: boolean;
  series: EventSeries[];
  status: EventStatus | null;
  entryMethod: EntryMethod | null;
  /** Act IDs from the event_acts junction table (stringified integers). */
  actIds: string[];
}

// ─── Venues ──────────────────────────────────────────────────────────────────

export type VenueType =
  | 'Bar / Club'
  | 'Concert Hall'
  | 'Outdoor'
  | 'Museum'
  | 'Restaurant / Lounge'
  | 'Theater'
  | 'Hotel Venue';

export type Neighborhood =
  | 'French Quarter'
  | 'Marigny'
  | 'Bywater'
  | 'Treme'
  | 'Uptown'
  | 'CBD / Warehouse'
  | 'Mid-City'
  | 'Gentilly'
  | 'Garden District'
  | 'Frenchmen Street';

export interface Venue {
  id: string;
  name: string;
  venueType: VenueType | null;
  neighborhood: Neighborhood | null;
  address: string | null;
  website: string | null;
  notes: string | null;
}

// ─── Acts ─────────────────────────────────────────────────────────────────────

export type ActType =
  | 'Band'
  | 'Solo Artist'
  | 'Brass Band'
  | 'DJ'
  | 'Drag Performer'
  | 'Orchestra / Ensemble'
  | 'Choir / Gospel'
  | 'Duo / Trio';

export type Genre =
  | 'Jazz'
  | 'Brass'
  | 'Funk'
  | 'Blues'
  | 'R&B / Soul'
  | 'Rock'
  | 'Indie'
  | 'Zydeco / Cajun'
  | 'Gospel'
  | 'Hip-Hop / Bounce'
  | 'Electronic'
  | 'Swing'
  | 'Latin'
  | 'Reggae'
  | 'Burlesque'
  | 'Country / Americana';

export interface Act {
  id: string;
  name: string;
  actType: ActType | null;
  genres: Genre[];
  notes: string | null;
  website: string | null;
}

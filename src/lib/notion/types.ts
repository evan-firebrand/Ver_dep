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
  url: string;
  createdTime: string;
  name: string;
  eventType: EventType | null;
  date: EventDate | null;
  time: string | null;
  cost: string | null;
  venueIds: string[];
  link: string | null;
  notes: string | null;
  interested: boolean;
  series: EventSeries[];
  status: EventStatus | null;
  entryMethod: EntryMethod | null;
  actIds: string[];
  sourceIds: string[];
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
  url: string;
  createdTime: string;
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
  url: string;
  createdTime: string;
  name: string;
  actType: ActType | null;
  genres: Genre[];
  notes: string | null;
  website: string | null;
}

// ─── Organizations (suspended 2026-04-10) ────────────────────────────────────

export type OrganizationType =
  | 'SA&PC (Social Aid & Pleasure Club)'
  | 'Mardi Gras Krewe'
  | 'Festival Organizer'
  | 'Promoter / Presenter'
  | 'Mardi Gras Indian Tribe'
  | 'Radio / Media'
  | 'Community Org';

export interface Organization {
  id: string;
  url: string;
  createdTime: string;
  name: string;
  type: OrganizationType | null;
  website: string | null;
  notes: string | null;
}

// ─── Resources ───────────────────────────────────────────────────────────────

export type CheckFrequency =
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Seasonally'
  | 'As Needed';

export type ResourceCoverage =
  | 'Festivals'
  | 'Weekly Live Music'
  | 'Concerts & Touring'
  | 'Second Lines'
  | 'Community Events'
  | 'Mardi Gras / Parades';

export interface Resource {
  id: string;
  url: string;
  createdTime: string;
  name: string;
  resourceUrl: string | null;
  checkFrequency: CheckFrequency | null;
  coverage: ResourceCoverage[];
  notes: string | null;
}

#!/usr/bin/env node
/**
 * Parses Notion CSV exports and generates a single SQL file
 * (schema + data) for Supabase.
 *
 * Usage:
 *   node scripts/generate-seed-sql.mjs
 *
 * Expects CSV files at:
 *   data/csv/venues.csv
 *   data/csv/acts.csv
 *   data/csv/events.csv
 *
 * Outputs:
 *   data/seed.sql   — paste this into the Supabase SQL Editor
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ---------------------------------------------------------------------------
// CSV parser (handles quoted fields with commas and newlines)
// ---------------------------------------------------------------------------
function parseCSV(text) {
  // Remove BOM
  text = text.replace(/^\uFEFF/, '');
  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const rows = [];
  let i = 0;

  while (i < text.length) {
    const row = [];
    while (i < text.length) {
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = '';
        while (i < text.length) {
          if (text[i] === '"') {
            if (text[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++; // skip closing quote
              break;
            }
          } else {
            field += text[i];
            i++;
          }
        }
        row.push(field);
      } else {
        // Unquoted field
        let field = '';
        while (i < text.length && text[i] !== ',' && text[i] !== '\n') {
          field += text[i];
          i++;
        }
        row.push(field);
      }

      if (i < text.length && text[i] === ',') {
        i++; // skip comma
      } else {
        break;
      }
    }

    if (i < text.length && text[i] === '\n') {
      i++; // skip newline
    }

    if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
      rows.push(row);
    }
  }

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (row[idx] || '').trim();
    });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// SQL escape
// ---------------------------------------------------------------------------
function esc(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

function escBool(val) {
  if (!val) return 'false';
  return val.toLowerCase() === 'yes' ? 'true' : 'false';
}

function escArray(items) {
  if (!items || items.length === 0) return 'NULL';
  const escaped = items.map((s) => '"' + s.replace(/"/g, '\\"') + '"');
  return "'{" + escaped.join(',') + "}'";
}

// ---------------------------------------------------------------------------
// Parse human date ("March 8, 2026") to ISO ("2026-03-08")
// ---------------------------------------------------------------------------
function parseDate(dateStr) {
  if (!dateStr) return null;
  // Handle range: "April 24, 2026 → April 27, 2026"
  const parts = dateStr.split('→').map((s) => s.trim());
  const results = parts.map((part) => {
    const d = new Date(part);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  });
  return { start: results[0], end: results.length > 1 ? results[1] : null };
}

// ---------------------------------------------------------------------------
// Extract venue name from event data
// ---------------------------------------------------------------------------
function extractVenueName(event) {
  // 1. Check Venue column — may have Notion URLs like "Name (https://...)"
  if (event['Venue'] && event['Venue'].trim()) {
    let v = event['Venue'].trim();
    // Strip Notion URL: "Tipitina's (https://www.notion.so/...)" → "Tipitina's"
    v = v.replace(/\s*\(https:\/\/www\.notion\.so\/[^)]+\)/g, '').trim();
    if (v) return v;
  }

  // 2. Check EventName pattern "Act — Venue" (em dash) or "Act — Venue (URL)"
  const emDash = event['EventName']?.split('—');
  if (emDash && emDash.length === 2) {
    let venuePart = emDash[1].trim();
    // Strip Notion URL if present
    venuePart = venuePart
      .replace(/\s*\(https:\/\/www\.notion\.so\/[^)]+\)/g, '')
      .trim();
    if (venuePart && venuePart.length < 60 && !venuePart.includes('.')) {
      return venuePart;
    }
  }

  // 3. Check Notes for "Venue: X." or "Venue: X,"
  const notesMatch = event['Notes']?.match(/Venue:\s*([^.,\n]+)/i);
  if (notesMatch) {
    return notesMatch[1].trim();
  }

  return null;
}

// ---------------------------------------------------------------------------
// Normalize venue name for fuzzy matching
// ---------------------------------------------------------------------------
function normalizeVenueName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^the\s+/i, '')
    .replace(/[''`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Parse multi-select string ("Jazz, Funk, Blues") to array
// ---------------------------------------------------------------------------
function parseMultiSelect(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const venuesRaw = parseCSV(
  readFileSync(join(root, 'data/csv/venues.csv'), 'utf8'),
);
const actsRaw = parseCSV(
  readFileSync(join(root, 'data/csv/acts.csv'), 'utf8'),
);
const eventsRaw = parseCSV(
  readFileSync(join(root, 'data/csv/events.csv'), 'utf8'),
);

// Filter duplicates
const events = eventsRaw.filter(
  (e) => !e.EventName?.includes('DUPLICATE') && !e.EventName?.includes('🗑️'),
);

console.log(
  `Parsed: ${venuesRaw.length} venues, ${actsRaw.length} acts, ${events.length} events (${eventsRaw.length - events.length} duplicates skipped)`,
);

// Build venue name → index lookup (exact + normalized)
const venueNameMap = new Map();
venuesRaw.forEach((v, i) => {
  const idx = i + 1; // 1-indexed for SQL serial IDs
  venueNameMap.set(v.Name?.toLowerCase(), idx);
  venueNameMap.set(normalizeVenueName(v.Name), idx);
});

// Match events to venues
let matched = 0;
let unmatched = 0;
const unmatchedVenues = new Set();

events.forEach((e) => {
  const venueName = extractVenueName(e);
  e._venueName = venueName;
  if (venueName) {
    const idx =
      venueNameMap.get(venueName.toLowerCase()) ||
      venueNameMap.get(normalizeVenueName(venueName));
    if (idx) {
      e._venueIdx = idx;
      matched++;
    } else {
      unmatched++;
      unmatchedVenues.add(venueName);
    }
  }
});

console.log(
  `Venue matching: ${matched} matched, ${unmatched} unmatched, ${events.length - matched - unmatched} no venue`,
);
if (unmatchedVenues.size > 0) {
  console.log(`Unmatched venue names:`, [...unmatchedVenues].join(', '));
}

// ---------------------------------------------------------------------------
// Generate SQL
// ---------------------------------------------------------------------------
let sql = `-- NOLA Music Tracker seed data
-- Generated from Notion CSV exports
-- Paste this into the Supabase SQL Editor

-- Drop existing tables (if re-seeding)
DROP TABLE IF EXISTS event_acts CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS acts CASCADE;
DROP TABLE IF EXISTS venues CASCADE;

-- Schema
CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  neighborhood TEXT,
  venue_type TEXT,
  website TEXT,
  notes TEXT
);

CREATE TABLE acts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  act_type TEXT,
  genres TEXT[],
  website TEXT,
  notes TEXT
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  event_type TEXT,
  date_start DATE,
  date_end DATE,
  time_info TEXT,
  cost TEXT,
  venue_id INTEGER REFERENCES venues(id),
  notes TEXT,
  link TEXT,
  interested BOOLEAN DEFAULT false,
  status TEXT,
  series TEXT[],
  entry_method TEXT
);

CREATE TABLE event_acts (
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  act_id INTEGER REFERENCES acts(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, act_id)
);

-- Enable Row Level Security (Supabase convention)
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_acts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public read acts" ON acts FOR SELECT USING (true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read event_acts" ON event_acts FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_events_date ON events(date_start);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_type ON events(event_type);

-- ==========================================================================
-- DATA
-- ==========================================================================

`;

// Venues
sql += '-- Venues\n';
venuesRaw.forEach((v) => {
  sql += `INSERT INTO venues (name, address, neighborhood, venue_type, website, notes) VALUES (${esc(v.Name)}, ${esc(v.Address)}, ${esc(v.Neighborhood)}, ${esc(v['Venue Type'])}, ${esc(v.Website)}, ${esc(v.Notes)});\n`;
});

sql += '\n-- Acts\n';
actsRaw.forEach((a) => {
  const genres = parseMultiSelect(a.Genre);
  sql += `INSERT INTO acts (name, act_type, genres, website, notes) VALUES (${esc(a.Name)}, ${esc(a['Act Type'])}, ${escArray(genres)}, ${esc(a.Website)}, ${esc(a.Notes)});\n`;
});

sql += '\n-- Events\n';
events.forEach((e) => {
  const date = parseDate(e.Date);
  const series = parseMultiSelect(e.Series);
  const venueId = e._venueIdx ? String(e._venueIdx) : 'NULL';

  sql += `INSERT INTO events (name, event_type, date_start, date_end, time_info, cost, venue_id, notes, link, interested, status, series, entry_method) VALUES (${esc(e.EventName)}, ${esc(e['Event Type'])}, ${date?.start ? esc(date.start) : 'NULL'}, ${date?.end ? esc(date.end) : 'NULL'}, ${esc(e.Time)}, ${esc(e.Cost)}, ${venueId}, ${esc(e.Notes)}, ${esc(e.Link)}, ${escBool(e['Interested?'])}, ${esc(e.Status)}, ${escArray(series)}, ${esc(e['Entry Method'])});\n`;
});

sql += `
-- Summary
-- Venues: ${venuesRaw.length}
-- Acts: ${actsRaw.length}
-- Events: ${events.length}
-- Venue matches: ${matched}/${events.length}
`;

// Write output
mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data/seed.sql'), sql, 'utf8');
console.log(`\nWrote data/seed.sql (${(sql.length / 1024).toFixed(1)} KB)`);
console.log('Paste this into the Supabase SQL Editor to create tables and load data.');

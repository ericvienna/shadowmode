-- SHADOWMODE.US — Supabase Schema
-- Run this in Supabase Studio > SQL Editor

-- States table
CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  regulatory_difficulty TEXT CHECK (regulatory_difficulty IN ('friendly', 'mixed', 'restrictive')),
  avg_permit_days INTEGER,
  bottleneck_stage TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state_id TEXT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'unknown', 'n/a')),
  date TEXT,
  value TEXT,
  notes TEXT,
  source TEXT,
  confidence TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, type)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS milestones_city_id_idx ON milestones(city_id);
CREATE INDEX IF NOT EXISTS cities_state_id_idx ON cities(state_id);

-- Enable Row Level Security
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no auth required for reads)
CREATE POLICY "Public read states" ON states FOR SELECT USING (true);
CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read milestones" ON milestones FOR SELECT USING (true);

-- Allow service role full access (used by API routes with service key)
CREATE POLICY "Service role all states" ON states FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all cities" ON cities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all milestones" ON milestones FOR ALL USING (auth.role() = 'service_role');

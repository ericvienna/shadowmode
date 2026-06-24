-- SHADOWMODE X Intelligence v2 — Supabase Schema
-- Run in Supabase Studio > SQL Editor when ready for persistence

CREATE TABLE IF NOT EXISTS x_tweets_archive (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  display_name TEXT,
  text TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  is_reply BOOLEAN DEFAULT FALSE,
  reply_to_handle TEXT,
  has_media BOOLEAN DEFAULT FALSE,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  views INTEGER,
  cities TEXT[] DEFAULT '{}',
  signal_types TEXT[] DEFAULT '{}',
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  credibility_score INTEGER DEFAULT 50,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS x_promise_ledger (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  url TEXT NOT NULL,
  promised_at TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ,
  deadline_label TEXT,
  status TEXT NOT NULL CHECK (status IN ('kept', 'missed', 'in_progress', 'pending')),
  days_overdue INTEGER,
  related_cities TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS x_signals (
  id BIGSERIAL PRIMARY KEY,
  signal_type TEXT NOT NULL,
  city_id TEXT,
  payload JSONB NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL,
  source_tweet_id TEXT REFERENCES x_tweets_archive(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS x_tsla_correlations (
  id TEXT PRIMARY KEY,
  event_label TEXT NOT NULL,
  tweet_handle TEXT NOT NULL,
  tweet_at TIMESTAMPTZ NOT NULL,
  tsla_next_session_pct NUMERIC(6,2),
  tsla_next_day_pct NUMERIC(6,2),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS x_tweets_created_idx ON x_tweets_archive(created_at DESC);
CREATE INDEX IF NOT EXISTS x_tweets_handle_idx ON x_tweets_archive(handle);
CREATE INDEX IF NOT EXISTS x_signals_type_idx ON x_signals(signal_type);
CREATE INDEX IF NOT EXISTS x_signals_city_idx ON x_signals(city_id);

ALTER TABLE x_tweets_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE x_promise_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE x_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE x_tsla_correlations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read x_tweets" ON x_tweets_archive FOR SELECT USING (true);
CREATE POLICY "Public read x_promises" ON x_promise_ledger FOR SELECT USING (true);
CREATE POLICY "Public read x_signals" ON x_signals FOR SELECT USING (true);
CREATE POLICY "Public read x_correlations" ON x_tsla_correlations FOR SELECT USING (true);

CREATE POLICY "Service role all x_tweets" ON x_tweets_archive FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all x_promises" ON x_promise_ledger FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all x_signals" ON x_signals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all x_correlations" ON x_tsla_correlations FOR ALL USING (auth.role() = 'service_role');
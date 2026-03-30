-- ============================================================
-- Schema + RLS for NUMAtours Affiliate Dashboard
-- Run this on the NEW Supabase project: raaiurdbvlfchubqpshd
-- ============================================================

-- 1. admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own admin status"
  ON admins FOR SELECT
  USING (user_id = auth.uid());

-- 2. affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  affiliate_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website_url TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_profile" ON affiliates
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "admin_read_all_profiles" ON affiliates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_affiliates" ON affiliates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 3. affiliate_commissions
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  commission_percentage NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_commission" ON affiliate_commissions
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_commissions" ON affiliate_commissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_commissions" ON affiliate_commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 4. affiliate_campaigns
CREATE TABLE IF NOT EXISTS affiliate_campaigns (
  id SERIAL PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  campaign_slug TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  activity_id TEXT,
  campaign_type TEXT DEFAULT 'link',
  widget_config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE affiliate_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_campaigns" ON affiliate_campaigns
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_campaigns" ON affiliate_campaigns
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_campaigns" ON affiliate_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 5. affiliate_daily_traffic
CREATE TABLE IF NOT EXISTS affiliate_daily_traffic (
  id SERIAL PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  campaign TEXT NOT NULL,
  date DATE NOT NULL,
  sessions INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0
);

ALTER TABLE affiliate_daily_traffic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_traffic" ON affiliate_daily_traffic
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_traffic" ON affiliate_daily_traffic
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 6. affiliate_daily_events
CREATE TABLE IF NOT EXISTS affiliate_daily_events (
  id SERIAL PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  campaign TEXT NOT NULL,
  date DATE NOT NULL,
  event_name TEXT NOT NULL,
  event_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0
);

ALTER TABLE affiliate_daily_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_events" ON affiliate_daily_events
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_events" ON affiliate_daily_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 7. affiliate_traffic_demographics
CREATE TABLE IF NOT EXISTS affiliate_traffic_demographics (
  id SERIAL PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  date DATE NOT NULL,
  dimension_type TEXT NOT NULL,
  dimension_value TEXT NOT NULL,
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0
);

ALTER TABLE affiliate_traffic_demographics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_demographics" ON affiliate_traffic_demographics
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_demographics" ON affiliate_traffic_demographics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- ============================================================
-- NOTE: activity_bookings stays on the OLD Supabase project
-- (ydnvqephejbcvlfzjzej). No changes needed there.
-- ============================================================

-- Don't forget: insert your user_id into the admins table!
-- INSERT INTO admins (user_id) VALUES ('your-user-uuid-here');
-- ============================================================

-- ============================================================
-- RLS Policies for NUMAtours Affiliate Dashboard
-- Run this in the Supabase SQL Editor
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

-- 3. affiliate_daily_traffic
ALTER TABLE affiliate_daily_traffic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_traffic" ON affiliate_daily_traffic
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_traffic" ON affiliate_daily_traffic
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 4. affiliate_daily_events
ALTER TABLE affiliate_daily_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_events" ON affiliate_daily_events
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_events" ON affiliate_daily_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 5. affiliate_traffic_demographics
ALTER TABLE affiliate_traffic_demographics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_demographics" ON affiliate_traffic_demographics
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_demographics" ON affiliate_traffic_demographics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 6. activity_bookings
ALTER TABLE activity_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_read_own_bookings" ON activity_bookings
  FOR SELECT USING (
    affiliate_id = (SELECT affiliate_id FROM affiliates WHERE id = auth.uid())
  );

CREATE POLICY "admin_read_all_bookings" ON activity_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 7. affiliate_campaigns
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

-- 8. affiliate_commissions
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

-- ============================================================
-- Don't forget: insert your user_id into the admins table!
-- INSERT INTO admins (user_id) VALUES ('your-user-uuid-here');
-- ============================================================

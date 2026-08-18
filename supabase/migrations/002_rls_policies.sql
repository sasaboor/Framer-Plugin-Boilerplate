-- Supabase Row Level Security (RLS) Policies
-- Migration 002: Security Policies

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow users to read their own data
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (id = auth.uid()::uuid OR license_key = current_setting('app.license_key', TRUE));

-- Allow users to update their own data
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (id = auth.uid()::uuid OR license_key = current_setting('app.license_key', TRUE));

-- Service role can do anything (for Edge Functions)
CREATE POLICY "Service role has full access to users"
  ON users
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================

-- Allow users to read their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE id = auth.uid()::uuid OR license_key = current_setting('app.license_key', TRUE)
    )
  );

-- Service role can do anything
CREATE POLICY "Service role has full access to subscriptions"
  ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- USER SESSIONS TABLE POLICIES
-- ============================================

-- Allow users to read/insert their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE id = auth.uid()::uuid OR license_key = current_setting('app.license_key', TRUE)
    )
  );

CREATE POLICY "Users can insert own sessions"
  ON user_sessions
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users
      WHERE id = auth.uid()::uuid OR license_key = current_setting('app.license_key', TRUE)
    )
  );

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE id = auth.uid()::uuid OR license_key = current_setting('app.license_key', TRUE)
    )
  );

-- Service role can do anything
CREATE POLICY "Service role has full access to sessions"
  ON user_sessions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- USAGE TRACKING TABLE POLICIES
-- ============================================

-- Allow users to read/update their own usage
CREATE POLICY "Users can view own usage"
  ON usage_tracking
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE id = auth.uid()::uuid OR license_key = current_setting('app.license_key', TRUE)
    )
  );

CREATE POLICY "Users can update own usage"
  ON usage_tracking
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE id = auth.uid()::uuid OR license_key = current_setting('app.license_key', TRUE)
    )
  );

-- Service role can do anything
CREATE POLICY "Service role has full access to usage"
  ON usage_tracking
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Users can view own profile" ON users IS
  'Users can view their profile by matching license_key via app settings';

COMMENT ON POLICY "Service role has full access to users" ON users IS
  'Service role (Edge Functions) needs full access for webhook processing and license validation';

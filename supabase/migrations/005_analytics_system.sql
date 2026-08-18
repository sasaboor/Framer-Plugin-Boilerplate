-- Migration: Supabase Analytics System
-- Simple, effective analytics tracking without third-party dependencies

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
-- Stores all analytics events from the plugin

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created ON analytics_events(event_name, created_at DESC);

-- Comment
COMMENT ON TABLE analytics_events IS 'Stores all analytics events from the Framer plugin';
COMMENT ON COLUMN analytics_events.user_id IS 'Reference to user (NULL for anonymous events)';
COMMENT ON COLUMN analytics_events.event_name IS 'Event identifier (e.g., license_activated, screen_viewed)';
COMMENT ON COLUMN analytics_events.properties IS 'Event metadata as JSON';

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Daily Active Users (DAU)
CREATE OR REPLACE VIEW daily_active_users AS
SELECT
  date_trunc('day', created_at) AS date,
  COUNT(DISTINCT user_id) AS user_count
FROM analytics_events
WHERE event_name = 'plugin_opened'
  AND user_id IS NOT NULL
GROUP BY date_trunc('day', created_at)
ORDER BY date DESC;

COMMENT ON VIEW daily_active_users IS 'Daily count of unique users who opened the plugin';

-- Weekly Active Users (WAU)
CREATE OR REPLACE VIEW weekly_active_users AS
SELECT
  date_trunc('week', created_at) AS week,
  COUNT(DISTINCT user_id) AS user_count
FROM analytics_events
WHERE event_name = 'plugin_opened'
  AND user_id IS NOT NULL
GROUP BY date_trunc('week', created_at)
ORDER BY week DESC;

COMMENT ON VIEW weekly_active_users IS 'Weekly count of unique active users';

-- Most Viewed Screens
CREATE OR REPLACE VIEW popular_screens AS
SELECT
  properties->>'screen_name' AS screen_name,
  COUNT(*) AS view_count,
  COUNT(DISTINCT user_id) AS unique_viewers
FROM analytics_events
WHERE event_name = 'screen_viewed'
  AND properties->>'screen_name' IS NOT NULL
GROUP BY properties->>'screen_name'
ORDER BY view_count DESC;

COMMENT ON VIEW popular_screens IS 'Most frequently viewed screens in the plugin';

-- Error Summary
CREATE OR REPLACE VIEW error_summary AS
SELECT
  properties->>'error_type' AS error_type,
  COUNT(*) AS error_count,
  COUNT(DISTINCT user_id) AS affected_users,
  MAX(created_at) AS last_occurrence
FROM analytics_events
WHERE event_name = 'error'
GROUP BY properties->>'error_type'
ORDER BY error_count DESC;

COMMENT ON VIEW error_summary IS 'Summary of errors by type';

-- License Conversion Funnel
CREATE OR REPLACE VIEW license_conversion_funnel AS
WITH funnel_data AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event_name = 'login_screen_viewed' THEN user_id END) AS viewed_login,
    COUNT(DISTINCT CASE WHEN event_name = 'login_attempt' THEN user_id END) AS attempted_login,
    COUNT(DISTINCT CASE WHEN event_name = 'license_activated' THEN user_id END) AS activated_license
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  viewed_login,
  attempted_login,
  activated_license,
  ROUND((attempted_login::DECIMAL / NULLIF(viewed_login, 0)) * 100, 2) AS attempt_rate,
  ROUND((activated_license::DECIMAL / NULLIF(attempted_login, 0)) * 100, 2) AS activation_rate,
  ROUND((activated_license::DECIMAL / NULLIF(viewed_login, 0)) * 100, 2) AS overall_conversion
FROM funnel_data;

COMMENT ON VIEW license_conversion_funnel IS 'License activation funnel metrics (last 30 days)';

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Get user activity summary
CREATE OR REPLACE FUNCTION get_user_analytics(user_uuid UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  last_seen TIMESTAMPTZ,
  most_viewed_screen TEXT,
  total_events BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    COUNT(DISTINCT CASE WHEN event_name = 'plugin_opened' THEN created_at END) AS total_sessions,
    MAX(created_at) AS last_seen,
    (
      SELECT properties->>'screen_name'
      FROM analytics_events
      WHERE user_id = user_uuid
        AND event_name = 'screen_viewed'
        AND properties->>'screen_name' IS NOT NULL
      GROUP BY properties->>'screen_name'
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) AS most_viewed_screen,
    COUNT(*) AS total_events
  FROM analytics_events
  WHERE user_id = user_uuid;
$$;

COMMENT ON FUNCTION get_user_analytics(UUID) IS 'Get analytics summary for a specific user';

-- Get event counts by day
CREATE OR REPLACE FUNCTION get_event_counts_by_day(
  event_name_filter TEXT,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  event_count BIGINT,
  unique_users BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    DATE(created_at) AS date,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_id) AS unique_users
  FROM analytics_events
  WHERE event_name = event_name_filter
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
$$;

COMMENT ON FUNCTION get_event_counts_by_day(TEXT, INTEGER) IS 'Get daily counts for a specific event type';

-- Clean up old events (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE NOTICE 'Deleted % old analytics events (older than % days)', deleted_count, days_to_keep;

  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_old_analytics_events(INTEGER) IS 'Delete analytics events older than specified days (default 90)';

-- ============================================
-- SCHEDULE CLEANUP (Optional - runs monthly)
-- ============================================
-- Automatically clean up events older than 90 days
-- Uncomment if you want automatic cleanup

-- SELECT cron.schedule(
--   'cleanup-old-analytics',
--   '0 2 1 * *',  -- Run at 2am on the 1st of each month
--   $$SELECT cleanup_old_analytics_events(90);$$
-- );

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on analytics_events table

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY "Service role has full access to analytics_events"
  ON analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anonymous users cannot access analytics (analytics are write-only via Edge Functions)
-- No public policies - all access via Edge Functions only

-- ============================================
-- GRANTS
-- ============================================

-- Grant access to authenticated users (via Edge Functions only)
GRANT SELECT ON analytics_events TO authenticated;
GRANT SELECT ON daily_active_users TO authenticated;
GRANT SELECT ON weekly_active_users TO authenticated;
GRANT SELECT ON popular_screens TO authenticated;
GRANT SELECT ON error_summary TO authenticated;
GRANT SELECT ON license_conversion_funnel TO authenticated;

-- Service role needs full access
GRANT ALL ON analytics_events TO service_role;

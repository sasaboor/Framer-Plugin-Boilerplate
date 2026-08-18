-- Migration: Automatic Subscription Expiration
-- Automatically expires subscriptions when their expiry date passes
-- Runs every hour via Supabase cron

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to automatically expire subscriptions
CREATE OR REPLACE FUNCTION auto_expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
  downgraded_count INTEGER;
BEGIN
  -- Step 1: Mark subscriptions as expired if expires_at has passed
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- Step 2: Downgrade users with expired subscriptions to free tier
  UPDATE users
  SET tier = 'free'
  WHERE id IN (
    SELECT DISTINCT user_id
    FROM subscriptions
    WHERE status = 'expired'
  )
  AND tier = 'premium';  -- Only downgrade if currently premium

  GET DIAGNOSTICS downgraded_count = ROW_COUNT;

  -- Log the results
  RAISE NOTICE 'Auto-expire: Expired % subscriptions, downgraded % users', expired_count, downgraded_count;
END;
$$;

-- Comment for documentation
COMMENT ON FUNCTION auto_expire_subscriptions() IS 'Automatically expires subscriptions when expires_at passes and downgrades users to free tier. Runs hourly via cron.';

-- Schedule the function to run every hour
-- Note: This uses Supabase's pg_cron integration
-- Format: 'minute hour day month weekday'
-- '0 * * * *' = Run at minute 0 of every hour
SELECT cron.schedule(
  'auto-expire-subscriptions',
  '0 * * * *',  -- Every hour on the hour
  $$SELECT auto_expire_subscriptions();$$
);

-- Add index for faster expiration queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry
  ON subscriptions(status, expires_at)
  WHERE status = 'active' AND expires_at IS NOT NULL;

-- Manual function to check which subscriptions will be expired (for testing)
CREATE OR REPLACE FUNCTION preview_expiring_subscriptions()
RETURNS TABLE (
  user_id UUID,
  license_key TEXT,
  subscription_id UUID,
  expires_at TIMESTAMPTZ,
  days_until_expiry NUMERIC
)
LANGUAGE SQL
AS $$
  SELECT
    u.id AS user_id,
    u.license_key,
    s.id AS subscription_id,
    s.expires_at,
    EXTRACT(EPOCH FROM (s.expires_at - NOW())) / 86400 AS days_until_expiry
  FROM subscriptions s
  JOIN users u ON u.id = s.user_id
  WHERE s.status = 'active'
    AND s.expires_at IS NOT NULL
  ORDER BY s.expires_at ASC;
$$;

COMMENT ON FUNCTION preview_expiring_subscriptions() IS 'Preview which subscriptions will expire soon. Useful for testing and monitoring.';

-- Function to manually trigger expiration (for testing)
CREATE OR REPLACE FUNCTION manual_expire_subscription(subscription_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_user_id UUID;
BEGIN
  -- Mark subscription as expired
  UPDATE subscriptions
  SET status = 'expired'
  WHERE id = subscription_id_param
  RETURNING user_id INTO affected_user_id;

  -- Downgrade user
  IF affected_user_id IS NOT NULL THEN
    UPDATE users
    SET tier = 'free'
    WHERE id = affected_user_id;

    RAISE NOTICE 'Manually expired subscription % and downgraded user %', subscription_id_param, affected_user_id;
  ELSE
    RAISE NOTICE 'Subscription % not found', subscription_id_param;
  END IF;
END;
$$;

COMMENT ON FUNCTION manual_expire_subscription(UUID) IS 'Manually expire a specific subscription for testing purposes.';

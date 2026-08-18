-- Migration: Add Concurrent License Tracking
-- Prevents multiple users from using the same license simultaneously
-- Sessions expire after 3 weeks of inactivity

-- Add session tracking columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_session_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS active_session_device TEXT,
  ADD COLUMN IF NOT EXISTS active_session_browser TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.active_session_started_at IS 'When the current active session started. NULL means no active session. Sessions expire after 3 weeks of inactivity.';
COMMENT ON COLUMN users.active_session_device IS 'Device info of active session (optional, for logging)';
COMMENT ON COLUMN users.active_session_browser IS 'Browser info of active session (optional, for logging)';

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_users_active_session
  ON users(license_key, active_session_started_at)
  WHERE active_session_started_at IS NOT NULL;

-- Helper function: Check if session is expired (> 3 weeks old)
CREATE OR REPLACE FUNCTION is_session_expired(session_start TIMESTAMPTZ)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- 3 weeks = 21 days
  RETURN session_start IS NULL OR session_start < (NOW() - INTERVAL '21 days');
END;
$$;

-- Helper function: Clear expired session
CREATE OR REPLACE FUNCTION clear_expired_session(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET
    active_session_started_at = NULL,
    active_session_device = NULL,
    active_session_browser = NULL
  WHERE id = user_id_param
    AND is_session_expired(active_session_started_at);
END;
$$;

-- Automatic cleanup: Trigger to auto-clear expired sessions on any user read
-- This keeps the database clean without needing a cron job
CREATE OR REPLACE FUNCTION auto_clear_expired_sessions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_session_expired(NEW.active_session_started_at) THEN
    NEW.active_session_started_at := NULL;
    NEW.active_session_device := NULL;
    NEW.active_session_browser := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_clear_expired_sessions
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_clear_expired_sessions();

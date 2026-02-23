-- Migration: Session Management Enhancement
-- Description: Add activity tracking and session management features
-- Date: 2026-02-14

-- Create sessions table (if not exists - connect-pg-simple creates this automatically)
-- But we'll ensure it exists with proper indexes
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions ("expire");

-- Add activity tracking columns to sessions
-- Note: connect-pg-simple stores everything in sess JSON, but we want indexed columns
ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create index on user_id for efficient queries
CREATE INDEX IF NOT EXISTS "IDX_session_user_id" ON sessions (user_id);
CREATE INDEX IF NOT EXISTS "IDX_session_last_activity" ON sessions (last_activity);

-- Add session tracking to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_session_id VARCHAR,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);

-- Function to clean expired sessions (runs via cron)
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expire < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to invalidate old sessions when new login occurs (one session per user)
CREATE OR REPLACE FUNCTION invalidate_old_user_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all other sessions for this user except the current one
  DELETE FROM sessions 
  WHERE user_id = NEW.user_id 
  AND sid != NEW.sid;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically invalidate old sessions on new login
DROP TRIGGER IF EXISTS trigger_invalidate_old_sessions ON sessions;
CREATE TRIGGER trigger_invalidate_old_sessions
  AFTER INSERT OR UPDATE OF user_id ON sessions
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION invalidate_old_user_sessions();

-- Create session_history table for audit purposes
CREATE TABLE IF NOT EXISTS session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL,
  login_at TIMESTAMP NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  logout_reason VARCHAR(50), -- 'manual', 'timeout', 'forced', 'new_login'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IDX_session_history_user_id" ON session_history (user_id);
CREATE INDEX IF NOT EXISTS "IDX_session_history_login_at" ON session_history (login_at);

COMMENT ON TABLE sessions IS 'Active user sessions managed by express-session';
COMMENT ON TABLE session_history IS 'Historical record of all user login/logout events';
COMMENT ON COLUMN sessions.last_activity IS 'Last activity timestamp for auto-logout detection';
COMMENT ON COLUMN session_history.logout_reason IS 'Reason for session termination';

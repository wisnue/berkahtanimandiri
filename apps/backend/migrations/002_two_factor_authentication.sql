-- =====================================================
-- MIGRATION: TWO-FACTOR AUTHENTICATION (2FA)
-- Created: 2026-02-14
-- Purpose: Add 2FA backup codes and password security
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: two_factor_backup_codes
-- Purpose: Store backup codes for 2FA recovery
-- =====================================================

CREATE TABLE IF NOT EXISTS two_factor_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for backup codes
CREATE INDEX IF NOT EXISTS idx_backup_codes_user ON two_factor_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_codes_code ON two_factor_backup_codes(code) WHERE used = FALSE;

COMMENT ON TABLE two_factor_backup_codes IS 'Backup codes untuk recovery 2FA jika user kehilangan akses authenticator';
COMMENT ON COLUMN two_factor_backup_codes.code IS 'Kode backup 8-10 karakter (di-hash)';
COMMENT ON COLUMN two_factor_backup_codes.used IS 'Apakah kode sudah digunakan (one-time use)';

-- =====================================================
-- 2. CREATE TABLE: password_history
-- Purpose: Store password history to prevent reuse
-- =====================================================

CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for password history
CREATE INDEX IF NOT EXISTS idx_password_history_user ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created ON password_history(created_at DESC);

COMMENT ON TABLE password_history IS 'Riwayat password untuk mencegah penggunaan ulang password lama';
COMMENT ON COLUMN password_history.password_hash IS 'Hash password (bcrypt) - disimpan untuk cek duplikasi';

-- =====================================================
-- 3. ALTER TABLE: users
-- Purpose: Add password policy related fields
-- =====================================================

-- Add password change tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days');

-- Add backup codes JSON field (alternative storage)
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes JSONB;

COMMENT ON COLUMN users.password_changed_at IS 'Timestamp terakhir kali password diubah';
COMMENT ON COLUMN users.force_password_change IS 'Flag untuk memaksa user ganti password saat login';
COMMENT ON COLUMN users.password_expires_at IS 'Tanggal expiry password (default 90 hari)';
COMMENT ON COLUMN users.backup_codes IS 'JSON array backup codes (alternative to separate table)';

-- =====================================================
-- 4. CREATE TABLE: login_attempts
-- Purpose: Track failed login attempts for security
-- =====================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  failure_reason VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for login attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);

COMMENT ON TABLE login_attempts IS 'Log semua login attempts untuk security monitoring';
COMMENT ON COLUMN login_attempts.success IS 'TRUE jika login berhasil, FALSE jika gagal';
COMMENT ON COLUMN login_attempts.failure_reason IS 'Alasan kegagalan: wrong_password, account_locked, 2fa_failed, etc';

-- =====================================================
-- 5. CREATE FUNCTION: Cleanup old login attempts
-- Purpose: Auto-delete login attempts older than 90 days
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_login_attempts IS 'Hapus login attempts lebih dari 90 hari (jalankan via cron)';

-- =====================================================
-- 6. INITIAL DATA: Populate password_changed_at
-- Purpose: Set initial password_changed_at for existing users
-- =====================================================

UPDATE users 
SET password_changed_at = created_at,
    password_expires_at = created_at + INTERVAL '90 days'
WHERE password_changed_at IS NULL;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

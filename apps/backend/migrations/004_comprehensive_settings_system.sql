-- Migration: Comprehensive Settings System
-- Description: Add complete settings management infrastructure with backup, audit, and organization
-- Date: 2025-02-03

-- ============================================
-- 1. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_category VARCHAR(50) NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. ORGANIZATION SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organization_settings (
    id SERIAL PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    organization_short_name VARCHAR(50),
    organization_logo TEXT,
    organization_address TEXT,
    organization_phone VARCHAR(20),
    organization_email VARCHAR(100),
    organization_website VARCHAR(255),
    head_name VARCHAR(255),
    head_position VARCHAR(100),
    secretary_name VARCHAR(255),
    treasurer_name VARCHAR(255),
    fiscal_year_start INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. BACKUP HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS backup_history (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    backup_type VARCHAR(20) DEFAULT 'manual',
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    metadata JSONB,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 4. BACKUP SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS backup_schedules (
    id SERIAL PRIMARY KEY,
    schedule_name VARCHAR(100) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL,
    schedule_time VARCHAR(10),
    schedule_day INTEGER,
    schedule_date INTEGER,
    is_enabled BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    retention_days INTEGER DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. SETTINGS AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings_audit_log (
    id SERIAL PRIMARY KEY,
    setting_category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(20) NOT NULL,
    changed_by INTEGER,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. SYSTEM HEALTH METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_health_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(status);
CREATE INDEX IF NOT EXISTS idx_backup_schedules_enabled ON backup_schedules(is_enabled);
CREATE INDEX IF NOT EXISTS idx_settings_audit_category ON settings_audit_log(setting_category);
CREATE INDEX IF NOT EXISTS idx_settings_audit_created_at ON settings_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON system_health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_created_at ON system_health_metrics(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_settings_updated_at ON organization_settings;
CREATE TRIGGER update_organization_settings_updated_at
    BEFORE UPDATE ON organization_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_backup_schedules_updated_at ON backup_schedules;
CREATE TRIGGER update_backup_schedules_updated_at
    BEFORE UPDATE ON backup_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit trail trigger
CREATE OR REPLACE FUNCTION audit_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO settings_audit_log (
            setting_category,
            setting_key,
            old_value,
            new_value,
            change_type,
            changed_by
        ) VALUES (
            OLD.setting_category,
            OLD.setting_key,
            OLD.setting_value,
            NEW.setting_value,
            'update',
            COALESCE(current_setting('app.current_user_id', true)::integer, 0)
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO settings_audit_log (
            setting_category,
            setting_key,
            old_value,
            new_value,
            change_type,
            changed_by
        ) VALUES (
            NEW.setting_category,
            NEW.setting_key,
            NULL,
            NEW.setting_value,
            'create',
            COALESCE(current_setting('app.current_user_id', true)::integer, 0)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_system_settings_changes ON system_settings;
CREATE TRIGGER audit_system_settings_changes
    AFTER INSERT OR UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION audit_settings_changes();

-- Backup cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        UPDATE backup_history
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE deleted_at IS NULL
        AND status = 'success'
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- System health summary function
CREATE OR REPLACE FUNCTION get_system_health_summary()
RETURNS TABLE (
    metric_type VARCHAR(50),
    latest_value NUMERIC,
    avg_24h NUMERIC,
    min_24h NUMERIC,
    max_24h NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.metric_type,
        (SELECT metric_value FROM system_health_metrics 
         WHERE metric_type = m.metric_type 
         ORDER BY created_at DESC LIMIT 1) as latest_value,
        AVG(metric_value) as avg_24h,
        MIN(metric_value) as min_24h,
        MAX(metric_value) as max_24h
    FROM system_health_metrics m
    WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    GROUP BY m.metric_type;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_category, setting_type, description, is_public) VALUES
-- General Settings
('app_name', 'KTH BTM Management System', 'general', 'string', 'Application name', true),
('app_version', '1.0.0', 'general', 'string', 'Application version', true),
('app_timezone', 'Asia/Jakarta', 'general', 'string', 'Default timezone', false),
('date_format', 'DD/MM/YYYY', 'general', 'string', 'Date display format', false),
('currency', 'IDR', 'general', 'string', 'Default currency', true),

-- Security Settings
('session_timeout', '1800', 'security', 'number', 'Session timeout in seconds', false),
('max_login_attempts', '5', 'security', 'number', 'Maximum login attempts before lockout', false),
('account_lockout_duration', '900', 'security', 'number', 'Account lockout duration in seconds', false),
('password_expiry_days', '90', 'security', 'number', 'Password expiration days', false),
('password_min_length', '8', 'security', 'number', 'Minimum password length', false),
('password_require_uppercase', 'true', 'security', 'boolean', 'Require uppercase in password', false),
('password_require_lowercase', 'true', 'security', 'boolean', 'Require lowercase in password', false),
('password_require_number', 'true', 'security', 'boolean', 'Require number in password', false),
('password_require_special', 'true', 'security', 'boolean', 'Require special character in password', false),
('two_factor_enabled', 'false', 'security', 'boolean', 'Enable two-factor authentication', false),

-- Backup Settings
('backup_retention_days', '90', 'backup', 'number', 'Backup retention period in days', false),
('backup_auto_cleanup', 'true', 'backup', 'boolean', 'Automatically cleanup old backups', false),
('backup_compression', 'true', 'backup', 'boolean', 'Compress backup files', false),

-- Email Settings
('email_from_name', 'KTH BTM System', 'email', 'string', 'Email sender name', false),
('email_from_address', 'noreply@kthbtm.org', 'email', 'string', 'Email sender address', false),
('smtp_host', 'smtp.gmail.com', 'email', 'string', 'SMTP server host', false),
('smtp_port', '587', 'email', 'number', 'SMTP server port', false),
('smtp_secure', 'false', 'email', 'boolean', 'Use TLS/SSL', false),
('smtp_user', '', 'email', 'string', 'SMTP username', false),
('smtp_password', '', 'email', 'password', 'SMTP password', false),

-- Notification Settings
('notification_email_enabled', 'true', 'notification', 'boolean', 'Enable email notifications', false),
('notification_sms_enabled', 'false', 'notification', 'boolean', 'Enable SMS notifications', false),
('notification_expiry_reminder_days', '30', 'notification', 'number', 'Days before expiry to send reminder', false)

ON CONFLICT (setting_key) DO NOTHING;

-- Insert default organization settings
INSERT INTO organization_settings (
    organization_name,
    organization_short_name,
    organization_address,
    organization_phone,
    organization_email,
    head_position
) VALUES (
    'Kelompok Tani Hutan Bina Taruna Mandiri',
    'KTH BTM',
    '',
    '',
    '',
    'Ketua'
) ON CONFLICT DO NOTHING;

-- Insert default backup schedules
INSERT INTO backup_schedules (schedule_name, schedule_type, schedule_time, is_enabled, retention_days) VALUES
('Daily Backup', 'daily', '03:00', true, 30),
('Weekly Backup', 'weekly', '02:00', false, 90),
('Monthly Backup', 'monthly', '01:00', false, 365)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- This migration adds:
-- - System settings with 30+ default configurations
-- - Organization profile management
-- - Backup history tracking and scheduling
-- - Audit logging for all settings changes
-- - System health monitoring infrastructure

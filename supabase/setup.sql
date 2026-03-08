-- =====================================================
-- KTH BERKAH TANI MANDIRI - SUPABASE SETUP SQL
-- Jalankan seluruh file ini di Supabase SQL Editor
-- Urutan: 1 kali jalankan saja, sudah include semua tabel
-- =====================================================

-- =====================================================
-- PART 1: TABEL UTAMA (Base Schema)
-- =====================================================

CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar(255) PRIMARY KEY NOT NULL,
  "sess" text NOT NULL,
  "expire" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nik" varchar(16) NOT NULL,
  "email" varchar(255),
  "username" varchar(100) NOT NULL,
  "password" varchar(255) NOT NULL,
  "full_name" varchar(255) NOT NULL,
  "role" varchar(50) DEFAULT 'anggota' NOT NULL,
  "phone" varchar(20),
  "is_active" boolean DEFAULT true NOT NULL,
  "two_factor_enabled" boolean DEFAULT false NOT NULL,
  "two_factor_secret" varchar(255),
  "last_login" timestamp,
  "login_attempts" varchar(10) DEFAULT '0',
  "locked_until" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "users_nik_unique" UNIQUE("nik"),
  CONSTRAINT "users_email_unique" UNIQUE("email"),
  CONSTRAINT "users_username_unique" UNIQUE("username")
);

CREATE TABLE IF NOT EXISTS "anggota" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "nomor_anggota" varchar(50) NOT NULL,
  "nik" varchar(16) NOT NULL,
  "nama_lengkap" varchar(255) NOT NULL,
  "tempat_lahir" varchar(100),
  "tanggal_lahir" timestamp,
  "jenis_kelamin" varchar(20),
  "alamat_lengkap" text NOT NULL,
  "rt" varchar(5),
  "rw" varchar(5),
  "desa" varchar(100),
  "kecamatan" varchar(100),
  "kabupaten" varchar(100),
  "provinsi" varchar(100),
  "kode_pos" varchar(10),
  "nomor_telepon" varchar(20),
  "email" varchar(255),
  "pendidikan" varchar(50),
  "pekerjaan" varchar(100),
  "status_anggota" varchar(20) DEFAULT 'aktif' NOT NULL,
  "tanggal_bergabung" timestamp DEFAULT now() NOT NULL,
  "tanggal_keluar" timestamp,
  "luas_lahan_garapan" numeric(10, 4),
  "foto_ktp" varchar(500),
  "foto_profile" varchar(500),
  "qr_code" text,
  "keterangan" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "anggota_nomor_anggota_unique" UNIQUE("nomor_anggota"),
  CONSTRAINT "anggota_nik_unique" UNIQUE("nik")
);

CREATE TABLE IF NOT EXISTS "lahan_khdpk" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kode_lahan" varchar(50) NOT NULL,
  "anggota_id" uuid NOT NULL,
  "nomor_petak" varchar(50) NOT NULL,
  "luas_lahan" numeric(10, 4) NOT NULL,
  "satuan_luas" varchar(10) DEFAULT 'Ha' NOT NULL,
  "jenis_tanaman" varchar(255),
  "lokasi_lahan" text,
  "koordinat_lat" varchar(50),
  "koordinat_long" varchar(50),
  "status_legalitas" varchar(50) DEFAULT 'proses' NOT NULL,
  "nomor_sk_khdpk" varchar(100),
  "tanggal_sk" timestamp,
  "masa_berlaku_sk" timestamp,
  "tahun_mulai_kelola" integer NOT NULL,
  "kondisi_lahan" varchar(50),
  "file_peta_lahan" varchar(500),
  "file_sk_khdpk" varchar(500),
  "keterangan" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "lahan_khdpk_kode_lahan_unique" UNIQUE("kode_lahan")
);

CREATE TABLE IF NOT EXISTS "pnbp" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nomor_transaksi" varchar(100) NOT NULL,
  "anggota_id" uuid NOT NULL,
  "lahan_id" uuid,
  "tahun_pnbp" integer NOT NULL,
  "periode_bulan" integer,
  "luas_lahan_dihitung" numeric(10, 4) NOT NULL,
  "tarif_per_ha" numeric(15, 2) NOT NULL,
  "jumlah_pnbp" numeric(15, 2) NOT NULL,
  "status_bayar" varchar(20) DEFAULT 'belum' NOT NULL,
  "tanggal_jatuh_tempo" timestamp,
  "tanggal_bayar" timestamp,
  "metode_bayar" varchar(50),
  "nomor_referensi" varchar(100),
  "bukti_setor" varchar(500),
  "keterangan" text,
  "created_by" uuid,
  "verified_by" uuid,
  "verified_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "pnbp_nomor_transaksi_unique" UNIQUE("nomor_transaksi")
);

CREATE TABLE IF NOT EXISTS "keuangan" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nomor_transaksi" varchar(100) NOT NULL,
  "tanggal_transaksi" timestamp DEFAULT now() NOT NULL,
  "jenis_transaksi" varchar(20) NOT NULL,
  "kategori" varchar(100) NOT NULL,
  "sub_kategori" varchar(100),
  "jumlah" numeric(15, 2) NOT NULL,
  "sumber_dana" varchar(100),
  "tujuan_penggunaan" varchar(255),
  "keterangan" text,
  "bukti_transaksi" varchar(500),
  "dibuat_oleh" uuid NOT NULL,
  "diverifikasi_oleh" uuid,
  "status_verifikasi" varchar(20) DEFAULT 'pending' NOT NULL,
  "tanggal_verifikasi" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "keuangan_nomor_transaksi_unique" UNIQUE("nomor_transaksi")
);

CREATE TABLE IF NOT EXISTS "aset" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kode_aset" varchar(50) NOT NULL,
  "nama_aset" varchar(255) NOT NULL,
  "kategori_aset" varchar(100) NOT NULL,
  "jenis_aset" varchar(100),
  "merk_tipe" varchar(255),
  "nomor_seri" varchar(100),
  "tahun_perolehan" integer NOT NULL,
  "tanggal_perolehan" timestamp,
  "sumber_perolehan" varchar(100),
  "nilai_perolehan" numeric(15, 2) NOT NULL,
  "nilai_sekarang" numeric(15, 2),
  "kondisi_aset" varchar(50) DEFAULT 'baik' NOT NULL,
  "lokasi_aset" varchar(255),
  "penanggung_jawab" varchar(255),
  "masa_manfaat" integer,
  "keterangan" text,
  "foto_aset" varchar(500),
  "bukti_perolehan" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "aset_kode_aset_unique" UNIQUE("kode_aset")
);

CREATE TABLE IF NOT EXISTS "kegiatan" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kode_kegiatan" varchar(50) NOT NULL,
  "nama_kegiatan" varchar(255) NOT NULL,
  "jenis_kegiatan" varchar(100) NOT NULL,
  "tanggal_mulai" timestamp NOT NULL,
  "tanggal_selesai" timestamp,
  "lokasi_kegiatan" text,
  "lahan_id" uuid,
  "penanggung_jawab" uuid,
  "jumlah_peserta" varchar(10),
  "target_produksi" numeric(10, 2),
  "realisasi_produksi" numeric(10, 2),
  "satuan_produksi" varchar(50),
  "biaya_kegiatan" numeric(15, 2),
  "sumber_dana" varchar(100),
  "status_kegiatan" varchar(50) DEFAULT 'rencana' NOT NULL,
  "hasil_kegiatan" text,
  "kendala" text,
  "keterangan" text,
  "dokumentasi_foto" varchar(500),
  "laporan_kegiatan" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "kegiatan_kode_kegiatan_unique" UNIQUE("kode_kegiatan")
);

CREATE TABLE IF NOT EXISTS "dokumen" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kode_dokumen" varchar(50) NOT NULL,
  "judul_dokumen" varchar(255) NOT NULL,
  "jenis_dokumen" varchar(100) NOT NULL,
  "kategori_dokumen" varchar(100),
  "nomor_dokumen" varchar(100),
  "tanggal_dokumen" timestamp,
  "tanggal_berlaku" timestamp,
  "tanggal_kadaluarsa" timestamp,
  "penerbit_dokumen" varchar(255),
  "deskripsi" text,
  "file_path" varchar(500) NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_size" varchar(50),
  "file_type" varchar(50),
  "versi" integer DEFAULT 1 NOT NULL,
  "status_dokumen" varchar(50) DEFAULT 'aktif' NOT NULL,
  "uploaded_by" uuid NOT NULL,
  "keterangan" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "dokumen_kode_dokumen_unique" UNIQUE("kode_dokumen")
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "action" varchar(100) NOT NULL,
  "module" varchar(100) NOT NULL,
  "description" text,
  "ip_address" varchar(50),
  "user_agent" varchar(500),
  "request_method" varchar(10),
  "request_url" varchar(500),
  "status_code" varchar(10),
  "error_message" text,
  "metadata" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(100) NOT NULL,
  "value" text NOT NULL,
  "type" varchar(50) DEFAULT 'string' NOT NULL,
  "category" varchar(100),
  "label" varchar(255),
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "settings_key_unique" UNIQUE("key")
);

-- Foreign Keys
ALTER TABLE "anggota" ADD CONSTRAINT "anggota_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "lahan_khdpk" ADD CONSTRAINT "lahan_khdpk_anggota_id_fk"
  FOREIGN KEY ("anggota_id") REFERENCES "anggota"("id") ON DELETE CASCADE;

ALTER TABLE "pnbp" ADD CONSTRAINT "pnbp_anggota_id_fk"
  FOREIGN KEY ("anggota_id") REFERENCES "anggota"("id") ON DELETE CASCADE;

ALTER TABLE "pnbp" ADD CONSTRAINT "pnbp_lahan_id_fk"
  FOREIGN KEY ("lahan_id") REFERENCES "lahan_khdpk"("id") ON DELETE SET NULL;

ALTER TABLE "keuangan" ADD CONSTRAINT "keuangan_dibuat_oleh_fk"
  FOREIGN KEY ("dibuat_oleh") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_lahan_id_fk"
  FOREIGN KEY ("lahan_id") REFERENCES "lahan_khdpk"("id") ON DELETE SET NULL;

ALTER TABLE "dokumen" ADD CONSTRAINT "dokumen_uploaded_by_fk"
  FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;

-- =====================================================
-- PART 2: AUDIT & DOKUMEN ORGANISASI (Migration 001)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'VERIFY', 'APPROVE', 'REJECT')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  description TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_table_record ON audit_trail(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at DESC);

CREATE TABLE IF NOT EXISTS dokumen_organisasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_dokumen VARCHAR(50) NOT NULL CHECK (jenis_dokumen IN (
    'sk_pembentukan','ad_art','sk_pengurus','sk_khdpk','sk_perhutanan_sosial',
    'rekomendasi_dinas','nib','npwp_organisasi','sertifikat_lahan','mou_kerjasama','lainnya'
  )),
  judul_dokumen VARCHAR(255) NOT NULL,
  nomor_dokumen VARCHAR(100),
  tanggal_dokumen DATE,
  tanggal_berlaku DATE,
  tanggal_kadaluarsa DATE,
  penerbit_dokumen VARCHAR(255),
  status_dokumen VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status_dokumen IN (
    'aktif','kadaluarsa','diganti','ditolak','pending_verifikasi'
  )),
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(50),
  file_type VARCHAR(50),
  versi INTEGER NOT NULL DEFAULT 1,
  dokumen_sebelumnya UUID REFERENCES dokumen_organisasi(id),
  deskripsi TEXT,
  periode_kepengurusan VARCHAR(50),
  keterangan TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Add columns to anggota
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS jabatan_kth VARCHAR(50) NOT NULL DEFAULT 'anggota'
  CHECK (jabatan_kth IN ('ketua', 'wakil_ketua', 'sekretaris', 'bendahara', 'pengawas', 'ketua_kelompok', 'anggota'));
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS nomor_sk_keanggotaan VARCHAR(100);
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS tanggal_sk_keanggotaan TIMESTAMP;
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS file_sk_keanggotaan VARCHAR(500);
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS periode_kepengurusan VARCHAR(50);
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS alasan_keluar TEXT;
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS nomor_kk VARCHAR(16);
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS foto_kk VARCHAR(500);

ALTER TABLE anggota DROP CONSTRAINT IF EXISTS anggota_status_anggota_check;
ALTER TABLE anggota ADD CONSTRAINT anggota_status_anggota_check
  CHECK (status_anggota IN ('aktif', 'nonaktif', 'keluar', 'meninggal', 'cuti'));

-- =====================================================
-- PART 3: TWO-FACTOR AUTH (Migration 002)
-- =====================================================

CREATE TABLE IF NOT EXISTS two_factor_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  failure_reason VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days');
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes JSONB;

-- =====================================================
-- PART 4: SESSION MANAGEMENT (Migration 003)
-- =====================================================

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions ("expire");

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE INDEX IF NOT EXISTS "IDX_session_user_id" ON sessions (user_id);
CREATE INDEX IF NOT EXISTS "IDX_session_last_activity" ON sessions (last_activity);

ALTER TABLE users ADD COLUMN IF NOT EXISTS current_session_id VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);

CREATE TABLE IF NOT EXISTS session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL,
  login_at TIMESTAMP NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  logout_reason VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PART 5: SETTINGS SYSTEM (Migration 004)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_category VARCHAR(50) NOT NULL,
  setting_type VARCHAR(20) DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

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
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS system_health_metrics (
  id SERIAL PRIMARY KEY,
  metric_type VARCHAR(50) NOT NULL,
  metric_value NUMERIC,
  metric_unit VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_schedules_enabled ON backup_schedules(is_enabled);
CREATE INDEX IF NOT EXISTS idx_settings_audit_created_at ON settings_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON system_health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_created_at ON system_health_metrics(created_at DESC);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_settings_updated_at ON organization_settings;
CREATE TRIGGER update_organization_settings_updated_at
    BEFORE UPDATE ON organization_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default organization settings row
INSERT INTO organization_settings (organization_name, organization_short_name)
VALUES ('Kelompok Tani Hutan Berkah Tani Mandiri', 'KTH BTM')
ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_category, setting_type, description, is_public) VALUES
  ('app_name', 'KTH BTM Management System', 'general', 'string', 'Application name', true),
  ('app_version', '1.0.0', 'general', 'string', 'Application version', true),
  ('app_timezone', 'Asia/Jakarta', 'general', 'string', 'Default timezone', false),
  ('date_format', 'DD/MM/YYYY', 'general', 'string', 'Date display format', false),
  ('currency', 'IDR', 'general', 'string', 'Default currency', true),
  ('session_timeout', '1800', 'security', 'number', 'Session timeout in seconds (30 min)', false),
  ('max_login_attempts', '5', 'security', 'number', 'Maximum login attempts before lockout', false),
  ('account_lockout_duration', '900', 'security', 'number', 'Account lockout duration in seconds (15 min)', false),
  ('password_expiry_days', '90', 'security', 'number', 'Password expiration days', false),
  ('password_min_length', '8', 'security', 'number', 'Minimum password length', false),
  ('password_require_uppercase', 'true', 'security', 'boolean', 'Require uppercase in password', false),
  ('password_require_lowercase', 'true', 'security', 'boolean', 'Require lowercase in password', false),
  ('password_require_number', 'true', 'security', 'boolean', 'Require number in password', false),
  ('password_require_special', 'true', 'security', 'boolean', 'Require special character in password', false),
  ('two_factor_enabled', 'false', 'security', 'boolean', 'Enable two-factor authentication', false),
  ('backup_retention_days', '90', 'backup', 'number', 'Backup retention period in days', false),
  ('backup_auto_cleanup', 'true', 'backup', 'boolean', 'Automatically cleanup old backups', false),
  ('backup_compression', 'true', 'backup', 'boolean', 'Compress backup files', false),
  ('email_from_name', 'KTH BTM System', 'email', 'string', 'Email sender name', false),
  ('email_from_address', 'noreply@kthbtm.org', 'email', 'string', 'Email sender address', false),
  ('notification_email_enabled', 'true', 'notification', 'boolean', 'Enable email notifications', false),
  ('notification_expiry_reminder_days', '30', 'notification', 'number', 'Days before expiry to send reminder', false)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- PART 6: DEFAULT ADMIN USER
-- Password: Admin@2024 (hashed with bcrypt)
-- GANTI PASSWORD SETELAH LOGIN PERTAMA!
-- =====================================================

INSERT INTO users (nik, username, email, password, full_name, role, is_active)
VALUES (
  '0000000000000001',
  'admin',
  'admin@kthbtm.id',
  '$2b$10$43NJtsUgv4kkjFEw.J9DYuMPxEHC30.m3G/Q93IZMb2ea1PrmQGAy', -- password: Admin@2024 (GANTI SETELAH LOGIN PERTAMA!)
  'Administrator KTH BTM',
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- VERIFIKASI: Jalankan query ini untuk cek setup berhasil
-- =====================================================
SELECT
  'users' AS tabel, COUNT(*) AS jumlah FROM users
UNION ALL SELECT 'anggota', COUNT(*) FROM anggota
UNION ALL SELECT 'settings', COUNT(*) FROM system_settings
UNION ALL SELECT 'organization', COUNT(*) FROM organization_settings;

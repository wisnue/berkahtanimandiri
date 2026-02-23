-- =====================================================
-- MIGRATION: AUDIT READINESS ENHANCEMENT
-- Created: 2026-02-12
-- Purpose: Add audit trail, dokumen organisasi, enhance anggota
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: audit_trail
-- Purpose: Track ALL data changes for audit compliance
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who & When
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- What & Where
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'VERIFY', 'APPROVE', 'REJECT')),
  
  -- Changes Detail (CRITICAL for audit)
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  -- Context
  description TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  metadata JSONB
);

-- Indexes for audit_trail (performance optimization)
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_record ON audit_trail(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON audit_trail(action);

COMMENT ON TABLE audit_trail IS 'Audit trail untuk track semua perubahan data (compliance BPKP/Inspektorat)';
COMMENT ON COLUMN audit_trail.old_values IS 'Data sebelum perubahan (JSON format)';
COMMENT ON COLUMN audit_trail.new_values IS 'Data setelah perubahan (JSON format)';
COMMENT ON COLUMN audit_trail.changed_fields IS 'Array field yang berubah';

-- =====================================================
-- 2. CREATE TABLE: dokumen_organisasi
-- Purpose: Store legal documents (SK Pembentukan, AD/ART, etc)
-- =====================================================

CREATE TABLE IF NOT EXISTS dokumen_organisasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Jenis Dokumen
  jenis_dokumen VARCHAR(50) NOT NULL CHECK (jenis_dokumen IN (
    'sk_pembentukan',
    'ad_art',
    'sk_pengurus',
    'sk_khdpk',
    'sk_perhutanan_sosial',
    'rekomendasi_dinas',
    'nib',
    'npwp_organisasi',
    'sertifikat_lahan',
    'mou_kerjasama',
    'lainnya'
  )),
  
  -- Detail Dokumen
  judul_dokumen VARCHAR(255) NOT NULL,
  nomor_dokumen VARCHAR(100),
  tanggal_dokumen DATE,
  tanggal_berlaku DATE,
  tanggal_kadaluarsa DATE,
  penerbit_dokumen VARCHAR(255),
  
  -- Status
  status_dokumen VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status_dokumen IN (
    'aktif',
    'kadaluarsa',
    'diganti',
    'ditolak',
    'pending_verifikasi'
  )),
  
  -- File Management
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(50),
  file_type VARCHAR(50),
  
  -- Versioning
  versi INTEGER NOT NULL DEFAULT 1,
  dokumen_sebelumnya UUID REFERENCES dokumen_organisasi(id),
  
  -- Additional Info
  deskripsi TEXT,
  periode_kepengurusan VARCHAR(50),
  keterangan TEXT,
  
  -- Audit
  uploaded_by UUID NOT NULL REFERENCES users(id),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for dokumen_organisasi
CREATE INDEX IF NOT EXISTS idx_dokumen_org_jenis ON dokumen_organisasi(jenis_dokumen);
CREATE INDEX IF NOT EXISTS idx_dokumen_org_status ON dokumen_organisasi(status_dokumen);
CREATE INDEX IF NOT EXISTS idx_dokumen_org_kadaluarsa ON dokumen_organisasi(tanggal_kadaluarsa) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dokumen_org_deleted ON dokumen_organisasi(deleted_at);

COMMENT ON TABLE dokumen_organisasi IS 'Dokumen legal organisasi KTH (SK, AD/ART, KHDPK, dll)';

-- =====================================================
-- 3. ALTER TABLE: anggota
-- Purpose: Add jabatan struktural & SK keanggotaan
-- =====================================================

-- Add new columns to anggota
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS jabatan_kth VARCHAR(50) NOT NULL DEFAULT 'anggota'
  CHECK (jabatan_kth IN ('ketua', 'wakil_ketua', 'sekretaris', 'bendahara', 'pengawas', 'ketua_kelompok', 'anggota'));

ALTER TABLE anggota ADD COLUMN IF NOT EXISTS nomor_sk_keanggotaan VARCHAR(100);
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS tanggal_sk_keanggotaan TIMESTAMP;
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS file_sk_keanggotaan VARCHAR(500);
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS periode_kepengurusan VARCHAR(50);
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS alasan_keluar TEXT;

-- Add KK (Kartu Keluarga) fields
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS nomor_kk VARCHAR(16);
ALTER TABLE anggota ADD COLUMN IF NOT EXISTS foto_kk VARCHAR(500);

-- Update status_anggota constraint (expand options)
ALTER TABLE anggota DROP CONSTRAINT IF EXISTS anggota_status_anggota_check;
ALTER TABLE anggota ADD CONSTRAINT anggota_status_anggota_check 
  CHECK (status_anggota IN ('aktif', 'nonaktif', 'keluar', 'meninggal', 'cuti'));

-- Indexes for anggota new fields
CREATE INDEX IF NOT EXISTS idx_anggota_jabatan ON anggota(jabatan_kth) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_anggota_status ON anggota(status_anggota) WHERE deleted_at IS NULL;

COMMENT ON COLUMN anggota.jabatan_kth IS 'Jabatan struktural di KTH (ketua, sekretaris, bendahara, dll)';
COMMENT ON COLUMN anggota.nomor_sk_keanggotaan IS 'Nomor SK Keanggotaan dari KTH';
COMMENT ON COLUMN anggota.periode_kepengurusan IS 'Periode kepengurusan (contoh: 2024-2029)';
COMMENT ON COLUMN anggota.alasan_keluar IS 'Alasan keluar/nonaktif (wajib diisi jika status bukan aktif)';

-- =====================================================
-- 4. CREATE VIEW: v_anggota_pnbp_summary
-- Purpose: Summary PNBP per anggota (untuk dashboard & laporan)
-- =====================================================

CREATE OR REPLACE VIEW v_anggota_pnbp_summary AS
SELECT 
  a.id AS anggota_id,
  a.nomor_anggota,
  a.nama_lengkap,
  a.nik,
  a.status_anggota,
  a.jabatan_kth,
  
  -- Lahan Summary
  COUNT(DISTINCT l.id) AS jumlah_lahan,
  COALESCE(SUM(l.luas_lahan), 0) AS total_luas_lahan,
  
  -- PNBP Summary
  COUNT(p.id) AS jumlah_kewajiban_pnbp,
  COALESCE(SUM(p.jumlah_pnbp), 0) AS total_kewajiban_pnbp,
  COALESCE(SUM(CASE WHEN p.status_bayar = 'lunas' THEN p.jumlah_pnbp ELSE 0 END), 0) AS total_dibayar_pnbp,
  COALESCE(SUM(CASE WHEN p.status_bayar != 'lunas' THEN p.jumlah_pnbp ELSE 0 END), 0) AS sisa_kewajiban_pnbp,
  
  -- Status Pembayaran
  CASE 
    WHEN COUNT(p.id) = 0 THEN 'Tidak Ada Kewajiban'
    WHEN SUM(CASE WHEN p.status_bayar != 'lunas' THEN 1 ELSE 0 END) = 0 THEN 'Lunas Semua'
    WHEN SUM(CASE WHEN p.status_bayar = 'lunas' THEN 1 ELSE 0 END) > 0 THEN 'Sebagian Lunas'
    ELSE 'Belum Bayar'
  END AS status_pnbp_keseluruhan,
  
  -- Detail Status
  COUNT(CASE WHEN p.status_bayar = 'belum' THEN 1 END) AS jumlah_belum_bayar,
  COUNT(CASE WHEN p.status_bayar = 'sebagian' THEN 1 END) AS jumlah_sebagian_bayar,
  COUNT(CASE WHEN p.status_bayar = 'lunas' THEN 1 END) AS jumlah_lunas,
  
  -- Tunggakan (overdue)
  COUNT(CASE WHEN p.status_bayar != 'lunas' AND p.tanggal_jatuh_tempo < NOW() THEN 1 END) AS jumlah_tunggakan,
  COALESCE(SUM(CASE WHEN p.status_bayar != 'lunas' AND p.tanggal_jatuh_tempo < NOW() THEN p.jumlah_pnbp ELSE 0 END), 0) AS total_tunggakan
  
FROM anggota a
LEFT JOIN lahan_khdpk l ON a.id = l.anggota_id AND l.deleted_at IS NULL
LEFT JOIN pnbp p ON a.id = p.anggota_id AND p.deleted_at IS NULL
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.nomor_anggota, a.nama_lengkap, a.nik, a.status_anggota, a.jabatan_kth;

COMMENT ON VIEW v_anggota_pnbp_summary IS 'Summary PNBP per anggota - untuk dashboard dan laporan audit';

-- =====================================================
-- 5. CREATE VIEW: v_dokumen_organisasi_aktif
-- Purpose: Quick access to active organizational documents
-- =====================================================

CREATE OR REPLACE VIEW v_dokumen_organisasi_aktif AS
SELECT 
  id,
  jenis_dokumen,
  judul_dokumen,
  nomor_dokumen,
  tanggal_dokumen,
  tanggal_berlaku,
  tanggal_kadaluarsa,
  penerbit_dokumen,
  status_dokumen,
  file_path,
  periode_kepengurusan,
  versi,
  created_at,
  
  -- Check if document is expired
  CASE 
    WHEN tanggal_kadaluarsa IS NULL THEN FALSE
    WHEN tanggal_kadaluarsa < CURRENT_DATE THEN TRUE
    ELSE FALSE
  END AS is_expired,
  
  -- Days until expiry (if applicable)
  CASE 
    WHEN tanggal_kadaluarsa IS NULL THEN NULL
    ELSE (tanggal_kadaluarsa - CURRENT_DATE)
  END AS days_until_expiry
  
FROM dokumen_organisasi
WHERE deleted_at IS NULL
  AND status_dokumen = 'aktif'
ORDER BY jenis_dokumen, versi DESC;

COMMENT ON VIEW v_dokumen_organisasi_aktif IS 'Dokumen organisasi yang aktif dengan status kadaluarsa';

-- =====================================================
-- 6. CREATE FUNCTION: Auto-update timestamp
-- Purpose: Automatically update updated_at on record changes
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to dokumen_organisasi
DROP TRIGGER IF EXISTS update_dokumen_organisasi_updated_at ON dokumen_organisasi;
CREATE TRIGGER update_dokumen_organisasi_updated_at
  BEFORE UPDATE ON dokumen_organisasi
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. SAMPLE DATA: Insert default admin roles
-- Purpose: Ensure admin can access new features
-- =====================================================

-- No sample data needed, will be managed through UI

-- =====================================================
-- 8. VERIFICATION QUERIES
-- Purpose: Verify migration success
-- =====================================================

-- Verify audit_trail table
SELECT 'audit_trail' AS table_name, COUNT(*) AS column_count 
FROM information_schema.columns 
WHERE table_name = 'audit_trail';

-- Verify dokumen_organisasi table
SELECT 'dokumen_organisasi' AS table_name, COUNT(*) AS column_count 
FROM information_schema.columns 
WHERE table_name = 'dokumen_organisasi';

-- Verify anggota new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'anggota' 
  AND column_name IN ('jabatan_kth', 'nomor_sk_keanggotaan', 'alasan_keluar', 'nomor_kk')
ORDER BY column_name;

-- Verify view created
SELECT 'v_anggota_pnbp_summary' AS view_name, COUNT(*) 
FROM v_anggota_pnbp_summary;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Final verification
SELECT 
  'audit_trail' AS feature,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_trail') 
    THEN '✅ Created' ELSE '❌ Failed' END AS status
UNION ALL
SELECT 
  'dokumen_organisasi',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dokumen_organisasi') 
    THEN '✅ Created' ELSE '❌ Failed' END
UNION ALL
SELECT 
  'anggota.jabatan_kth',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'anggota' AND column_name = 'jabatan_kth') 
    THEN '✅ Added' ELSE '❌ Failed' END
UNION ALL
SELECT 
  'v_anggota_pnbp_summary',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_anggota_pnbp_summary') 
    THEN '✅ Created' ELSE '❌ Failed' END;

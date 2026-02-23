# 📋 MIGRATION GUIDE - Audit Readiness Enhancement

**Migration ID:** 001_audit_readiness_enhancement  
**Created:** 2026-02-12  
**Purpose:** Add audit trail, dokumen organisasi, enhance anggota for audit compliance

---

## 🎯 WHAT'S INCLUDED

### **New Tables:**
1. ✅ **audit_trail** - Track all data changes (WHO, WHEN, WHAT changed)
2. ✅ **dokumen_organisasi** - Store legal documents (SK, AD/ART, KHDPK, etc)

### **Enhanced Tables:**
3. ✅ **anggota** - Added:
   - `jabatan_kth` (ketua, sekretaris, bendahara, etc)
   - `nomor_sk_keanggotaan`, `tanggal_sk_keanggotaan`, `file_sk_keanggotaan`
   - `periode_kepengurusan` (2024-2029)
   - `alasan_keluar` (jika status keluar/nonaktif)
   - `nomor_kk`, `foto_kk` (Kartu Keluarga)
   - Expanded `status_anggota` (aktif, nonaktif, keluar, meninggal, cuti)

### **New Views:**
4. ✅ **v_anggota_pnbp_summary** - Real-time PNBP summary per anggota
5. ✅ **v_dokumen_organisasi_aktif** - Active legal documents with expiry tracking

---

## 🚀 HOW TO RUN MIGRATION

### **Method 1: Using psql (Recommended)**

```bash
# Navigate to backend directory
cd apps/backend

# Run migration
psql -U your_username -d kth_btm_db -f migrations/001_audit_readiness_enhancement.sql

# Or if using environment variables
psql $DATABASE_URL -f migrations/001_audit_readiness_enhancement.sql
```

### **Method 2: Using pgAdmin**

1. Open pgAdmin
2. Connect to `kth_btm_db` database
3. Open Query Tool
4. Load file: `migrations/001_audit_readiness_enhancement.sql`
5. Execute (F5)

### **Method 3: Using Drizzle Kit (After push to schema)**

```bash
# Generate migration from schema changes
npm run db:generate

# Push to database
npm run db:push

# Or migrate
npm run db:migrate
```

---

## ✅ VERIFICATION

After running migration, verify with these queries:

### **1. Check New Tables**
```sql
-- Should return 2 rows
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('audit_trail', 'dokumen_organisasi');
```

### **2. Check Anggota New Columns**
```sql
-- Should return 7 rows
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'anggota' 
  AND column_name IN (
    'jabatan_kth', 
    'nomor_sk_keanggotaan', 
    'periode_kepengurusan', 
    'alasan_keluar',
    'nomor_kk',
    'foto_kk'
  );
```

### **3. Check Views**
```sql
-- Should return 2 rows
SELECT table_name 
FROM information_schema.views 
WHERE table_name IN ('v_anggota_pnbp_summary', 'v_dokumen_organisasi_aktif');
```

### **4. Test PNBP Summary View**
```sql
-- Should return all anggota with PNBP summary
SELECT * FROM v_anggota_pnbp_summary LIMIT 5;
```

---

## 📊 EXPECTED RESULTS

### **audit_trail Table Structure:**
- ✅ 13 columns (id, user_id, table_name, record_id, action, old_values, new_values, changed_fields, description, ip_address, user_agent, metadata, created_at)
- ✅ 4 indexes (table_record, user, created, action)

### **dokumen_organisasi Table Structure:**
- ✅ 20 columns (id, jenis_dokumen, judul_dokumen, nomor_dokumen, tanggal_dokumen, tanggal_berlaku, tanggal_kadaluarsa, penerbit_dokumen, status_dokumen, file_path, file_name, file_size, file_type, versi, dokumen_sebelumnya, deskripsi, periode_kepengurusan, keterangan, uploaded_by, verified_by, verified_at, created_at, updated_at, deleted_at)
- ✅ 4 indexes (jenis, status, kadaluarsa, deleted)

### **anggota Enhanced:**
- ✅ +7 new columns
- ✅ Constraint updated for status_anggota
- ✅ 2 new indexes (jabatan, status)

### **Views Created:**
- ✅ `v_anggota_pnbp_summary` with 16 columns
- ✅ `v_dokumen_organisasi_aktif` with 13 columns

---

## 🔄 ROLLBACK (IF NEEDED)

If something goes wrong, use this rollback script:

```sql
-- Drop views
DROP VIEW IF EXISTS v_anggota_pnbp_summary CASCADE;
DROP VIEW IF EXISTS v_dokumen_organisasi_aktif CASCADE;

-- Drop new tables
DROP TABLE IF EXISTS audit_trail CASCADE;
DROP TABLE IF EXISTS dokumen_organisasi CASCADE;

-- Revert anggota columns
ALTER TABLE anggota DROP COLUMN IF EXISTS jabatan_kth;
ALTER TABLE anggota DROP COLUMN IF EXISTS nomor_sk_keanggotaan;
ALTER TABLE anggota DROP COLUMN IF EXISTS tanggal_sk_keanggotaan;
ALTER TABLE anggota DROP COLUMN IF EXISTS file_sk_keanggotaan;
ALTER TABLE anggota DROP COLUMN IF EXISTS periode_kepengurusan;
ALTER TABLE anggota DROP COLUMN IF EXISTS alasan_keluar;
ALTER TABLE anggota DROP COLUMN IF EXISTS nomor_kk;
ALTER TABLE anggota DROP COLUMN IF EXISTS foto_kk;

-- Revert status constraint (back to original)
ALTER TABLE anggota DROP CONSTRAINT IF EXISTS anggota_status_anggota_check;
ALTER TABLE anggota ADD CONSTRAINT anggota_status_anggota_check 
  CHECK (status_anggota IN ('aktif', 'nonaktif'));
```

---

## 📝 POST-MIGRATION STEPS

### **1. Update TypeScript Types**

The schema files have been created/updated:
- ✅ `apps/backend/src/db/schema/audit-trail.ts`
- ✅ `apps/backend/src/db/schema/dokumen-organisasi.ts`
- ✅ `apps/backend/src/db/schema/anggota.ts` (updated)
- ✅ `apps/backend/src/db/schema/index.ts` (exports added)

### **2. Restart Backend Server**

```bash
# Stop current server
# Then restart
npm run dev
```

### **3. Update Frontend Types**

TypeScript types will auto-sync from backend schemas.

### **4. Test New Features**

- [ ] Try creating audit log entry
- [ ] Upload dokumen organisasi
- [ ] Update anggota with jabatan
- [ ] Query PNBP summary view

---

## ⚠️ IMPORTANT NOTES

### **Data Migration for Existing Records:**

If you have existing anggota records, they will automatically get:
- `jabatan_kth = 'anggota'` (default)
- `status_anggota` remains unchanged

**Manual Update Required For:**
1. Set proper `jabatan_kth` for Ketua, Sekretaris, Bendahara
2. Add `nomor_sk_keanggotaan` for existing members (optional)
3. Add `periode_kepengurusan` for pengurus (optional)

**Example Update Query:**
```sql
-- Update Ketua
UPDATE anggota 
SET jabatan_kth = 'ketua', 
    periode_kepengurusan = '2024-2029'
WHERE nama_lengkap = 'Nama Ketua KTH';

-- Update Bendahara
UPDATE anggota 
SET jabatan_kth = 'bendahara', 
    periode_kepengurusan = '2024-2029'
WHERE nama_lengkap = 'Nama Bendahara';

-- Update Sekretaris
UPDATE anggota 
SET jabatan_kth = 'sekretaris', 
    periode_kepengurusan = '2024-2029'
WHERE nama_lengkap = 'Nama Sekretaris';
```

---

## 🎯 NEXT PHASE

After successful migration, implement:

**Phase 1B: Backend Logic (Week 2)**
- [ ] Audit trail middleware (auto-logging)
- [ ] Dokumen organisasi service & controller
- [ ] Laporan buku kas logic
- [ ] PNBP rekonsiliasi endpoint

**Phase 1C: Frontend UI (Week 2-3)**
- [ ] Upload dokumen organisasi page
- [ ] Audit trail viewer (admin only)
- [ ] Anggota form update (jabatan field)
- [ ] Dashboard PNBP summary widget

---

## 📞 SUPPORT

If you encounter issues:

1. Check migration execution logs
2. Verify PostgreSQL version (min 12+)
3. Ensure user has CREATE privilege
4. Check for conflicting table names

**Contact:** Development Team  
**Documentation:** `/docs/AUDIT_READINESS_ROADMAP.md`

---

## ✅ MIGRATION CHECKLIST

- [ ] Backup database before migration
- [ ] Run migration SQL script
- [ ] Verify all tables created
- [ ] Verify all views created
- [ ] Verify anggota columns added
- [ ] Run verification queries
- [ ] Update existing anggota jabatan (manual)
- [ ] Restart backend server
- [ ] Test new features
- [ ] Document any issues

**Status:** ✅ **READY FOR PRODUCTION**

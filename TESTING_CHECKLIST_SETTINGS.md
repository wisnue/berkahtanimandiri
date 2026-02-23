# Testing Checklist - Settings & Audit Trail Pages

**Tanggal:** 3 Februari 2026  
**Tester:** Admin  
**Versi:** v1.0 (Post Routes Fix)

## 🔧 PERUBAHAN UTAMA YANG SUDAH DILAKUKAN

### Backend Routes - FIXED ✅
Berikut adalah API endpoints yang **BARU DITAMBAHKAN** ke `settings.routes.ts`:

```diff
+ router.get('/backup/statistics', getBackupStatistics);
+ router.delete('/backup/:id', deleteBackup);
+ router.post('/backup/cleanup', runBackupCleanup);
+ router.get('/organization', getOrganizationSettings);
+ router.put('/organization', updateOrganizationSettings);
+ router.get('/audit-log', getSettingsAuditLog);
```

**KRITIS**: Endpoint-endpoint ini sebelumnya **TIDAK TERDAFTAR** di routes, sehingga menyebabkan semua fungsi terkait **GAGAL** di frontend!

### Download Backup Route - FIXED ✅
```diff
- router.get('/backup/:filename/download', downloadBackup);
+ router.get('/backup/:id/download', downloadBackup);
```
Parameter diubah dari `:filename` ke `:id` agar sesuai dengan frontend call.

---

## 📋 TESTING CHECKLIST

### A. TAB SYSTEM SETTINGS

**Frontend Path:** `/dashboard/settings` → Tab "System"

#### Test Case 1: Load System Settings
- [ ] Buka tab System
- [ ] **Expected:** Settings muncul dalam kategori (General, Security, Notification, etc)
- [ ] **Expected:** Semua nilai settings terisi (app_name, session_timeout, dll)
- [ ] **Actual:** _____________________________

**API Called:** `GET /api/settings/system`

#### Test Case 2: Edit System Settings
- [ ] Ubah nilai `app_name` dari "KTH BTM" ke "KTH BTM Test"
- [ ] Ubah `session_timeout` dari 30 ke 45 menit
- [ ] Centang/uncentang checkbox password policy
- [ ] **Expected:** Input fields bisa diubah
- [ ] **Actual:** _____________________________

#### Test Case 3: Save System Settings
- [ ] Klik tombol "Simpan Pengaturan" (kanan atas)
- [ ] **Expected:** Toast hijau muncul: "Pengaturan sistem berhasil disimpan"
- [ ] **Expected:** Page reload settings baru
- [ ] **Expected:** Network tab browser show: `PUT /api/settings/system` → 200 OK
- [ ] **Actual:** _____________________________

#### Test Case 4: Persist System Settings
- [ ] Refresh halaman (F5)
- [ ] **Expected:** Nilai yang baru disimpan masih ada
- [ ] **Expected:** `app_name` masih "KTH BTM Test"
- [ ] **Actual:** _____________________________

---

### B. TAB ORGANIZATION SETTINGS

**Frontend Path:** `/dashboard/settings` → Tab "Organization"

#### Test Case 5: Load Organization Settings
- [ ] Buka tab Organization
- [ ] **Expected:** Form terisi dengan data organisasi (nama, kontak, kepengurusan)
- [ ] **Expected:** Network tab: `GET /api/settings/organization` → 200 OK
- [ ] **Actual:** _____________________________

#### Test Case 6: Edit Organization Info
- [ ] Ubah "Nama Organisasi"
- [ ] Ubah "No. Telepon"
- [ ] Ubah "Email"
- [ ] Ubah "Website"
- [ ] **Expected:** Semua field bisa di-edit
- [ ] **Actual:** _____________________________

#### Test Case 7: Edit Kepengurusan
- [ ] Ubah "Ketua"
- [ ] Ubah "Sekretaris"
- [ ] Ubah "Bendahara"
- [ ] **Expected:** Semua field bisa di-edit
- [ ] **Actual:** _____________________________

#### Test Case 8: Save Organization Settings ⚠️ **CRITICAL TEST**
- [ ] Scroll ke bawah
- [ ] Klik tombol **"Simpan Informasi"** (biru, besar, dengan icon Save)
- [ ] **Expected:** Toast hijau: "Pengaturan organisasi berhasil disimpan"
- [ ] **Expected:** Network tab: `PUT /api/settings/organization` → 200 OK
- [ ] **Expected:** Data reload dan menampilkan nilai baru
- [ ] **Actual:** _____________________________

**CATATAN:** Tombol ini sudah diperbesar dan ditambahkan border separator untuk visibility!

---

### C. TAB BACKUP & RECOVERY

**Frontend Path:** `/dashboard/settings` → Tab "Backup"

#### Test Case 9: Display Backup Statistics
- [ ] Buka tab Backup
- [ ] **Expected:** Card "Backup Statistics" muncul dengan 4 metric:
  - Total Backups
  - Successful
  - Failed
  - Total Size
- [ ] **Expected:** Network tab: `GET /api/settings/backup/statistics` → 200 OK
- [ ] **Actual:** _____________________________

#### Test Case 10: Display Backup History
- [ ] Lihat tabel "Backup History"
- [ ] **Expected:** Tabel menampilkan daftar backup (max 20 entries)
- [ ] **Expected:** Kolom: ID, Filename, Size, Status, Created At, Actions
- [ ] **Expected:** Network tab: `GET /api/settings/backup/history?limit=20` → 200 OK
- [ ] **Actual:** _____________________________

#### Test Case 11: Create Manual Backup
- [ ] Klik tombol **"Backup Sekarang"** (biru, kiri atas)
- [ ] **Expected:** Toast: "Backup database berhasil dibuat!"
- [ ] **Expected:** Network tab: `POST /api/settings/backup` → 200 OK
- [ ] **Expected:** Tabel refresh dan menampilkan backup baru
- [ ] **Expected:** Statistics update (Total Backups +1)
- [ ] **Actual:** _____________________________

#### Test Case 12: Download Backup File
- [ ] Pilih salah satu backup dari history
- [ ] Klik icon **download** (DownloadCloud icon)
- [ ] **Expected:** File .sql terdownload ke komputer
- [ ] **Expected:** Network tab: `GET /api/settings/backup/:id/download` → 200 OK
- [ ] **Expected:** Toast: "Backup berhasil diunduh"
- [ ] **Actual:** _____________________________

**Check File:** 
- [ ] Buka folder Downloads
- [ ] Verify file .sql ada dengan nama benar
- [ ] **Actual:** _____________________________

#### Test Case 13: Delete Backup
- [ ] Pilih backup yang ingin dihapus
- [ ] Klik icon **trash** (Trash2 icon merah)
- [ ] **Expected:** Confirm dialog muncul: "Yakin ingin menghapus backup ini?"
- [ ] Klik OK
- [ ] **Expected:** Toast: "Backup berhasil dihapus"
- [ ] **Expected:** Network tab: `DELETE /api/settings/backup/:id` → 200 OK
- [ ] **Expected:** Backup hilang dari tabel
- [ ] **Expected:** Statistics update (Total Backups -1)
- [ ] **Actual:** _____________________________

#### Test Case 14: Run Backup Cleanup
- [ ] Klik tombol **"Jalankan Cleanup"**
- [ ] **Expected:** Confirm dialog: "Jalankan cleanup untuk menghapus backup lama?"
- [ ] Klik OK
- [ ] **Expected:** Toast: "Cleanup selesai: X backup lama dihapus"
- [ ] **Expected:** Network tab: `POST /api/settings/backup/cleanup` → 200 OK
- [ ] **Expected:** Statistics dan history table refresh
- [ ] **Actual:** _____________________________

---

### D. TAB ROLES & PERMISSIONS

**Frontend Path:** `/dashboard/settings` → Tab "Roles"

#### Test Case 15: Display Roles
- [ ] Buka tab Roles
- [ ] **Expected:** 5 role cards ditampilkan:
  - Admin
  - Sekretaris
  - Bendahara
  - Ketua
  - Anggota
- [ ] **Expected:** Setiap card menampilkan:
  - Role name
  - Member count
  - Permissions list
- [ ] **Actual:** _____________________________

**CATATAN:** Tab ini saat ini **READ-ONLY** (tidak ada CRUD operations). Jika ingin edit roles, perlu implementasi tambahan.

---

### E. TAB AUDIT LOG

**Frontend Path:** `/dashboard/settings` → Tab "Audit Log"

#### Test Case 16: Load Audit Logs
- [ ] Buka tab "Audit Log"
- [ ] **Expected:** Tabel menampilkan log aktivitas settings
- [ ] **Expected:** Kolom: Timestamp, User, Setting, Old Value, New Value, Change Type
- [ ] **Expected:** Network tab: `GET /api/settings/audit-log?limit=20&offset=0` → 200 OK
- [ ] **Actual:** _____________________________

#### Test Case 17: Audit Log Pagination
- [ ] Klik tombol "Previous" (disabled jika di page 1)
- [ ] Klik tombol "Next"
- [ ] **Expected:** Tabel menampilkan logs page berikutnya
- [ ] **Expected:** Network tab: `GET /api/settings/audit-log?limit=20&offset=20` → 200 OK
- [ ] **Expected:** Page indicator update (e.g., "Page 2")
- [ ] **Actual:** _____________________________

#### Test Case 18: Audit Log Detail
- [ ] Cari log entry dengan change type "update"
- [ ] Lihat kolom "Old Value" dan "New Value"
- [ ] **Expected:** Menampilkan perubahan yang dilakukan
- [ ] **Actual:** _____________________________

---

### F. TAB COMPLIANCE CHECKLIST ⭐ NEW

**Frontend Path:** `/dashboard/settings` → Tab "Compliance"

#### Test Case 19: Display Compliance Score
- [ ] Buka tab "Compliance"
- [ ] **Expected:** Card "Compliance Score" muncul
- [ ] **Expected:** Progress bar menampilkan persentase (e.g., 87%)
- [ ] **Expected:** Score badge warna hijau/kuning/merah sesuai nilai
- [ ] **Actual:** _____________________________

#### Test Case 20: Checklist Categories
- [ ] **Expected:** 5 kategori checklist ditampilkan:
  1. Audit Trail & Logging
  2. Backup & Recovery
  3. Keamanan & Autentikasi
  4. Data Governance
  5. Pelaporan & Transparansi
- [ ] **Expected:** Setiap kategori menampilkan items dengan status ✅ atau ⚠️
- [ ] **Actual:** _____________________________

#### Test Case 21: Recommendations Section
- [ ] Scroll ke "Recommendations"
- [ ] **Expected:** 4+ rekomendasi improvement ditampilkan
- [ ] **Expected:** Setiap item dengan bullet point dan deskripsi
- [ ] **Actual:** _____________________________

#### Test Case 22: Quick Actions - Backup Now
- [ ] Klik tombol **"Backup Now"** di Quick Actions
- [ ] **Expected:** Tab otomatis switch ke "Backup"
- [ ] **Actual:** _____________________________

#### Test Case 23: Quick Actions - View Audit Log
- [ ] Klik tombol **"View Audit Log"** di Quick Actions
- [ ] **Expected:** Tab otomatis switch ke "Audit Log"
- [ ] **Actual:** _____________________________

#### Test Case 24: Quick Actions - Export Report
- [ ] Klik tombol **"Export Report"** di Quick Actions
- [ ] **Expected:** Toast muncul: "Feature coming soon!"
- [ ] **Actual:** _____________________________

---

## 🔍 AUDIT TRAIL PAGE (Separate Page)

**Frontend Path:** `/dashboard/audit-trail`

### Test Case 25: Load Audit Trail Entries
- [ ] Navigate ke menu "Sistem" → "Audit Trail"
- [ ] **Expected:** Tabel menampilkan log aktivitas SEMUA modul (bukan hanya settings)
- [ ] **Expected:** Network tab: `GET /api/audit-trail?page=1&limit=20` → 200 OK
- [ ] **Actual:** _____________________________

### Test Case 26: Filter by Table
- [ ] Pilih dropdown "Tabel"
- [ ] Pilih "Anggota"
- [ ] **Expected:** Tabel hanya menampilkan log terkait tabel anggota
- [ ] **Expected:** Network tab: `GET /api/audit-trail?tableName=anggota&page=1&limit=20`
- [ ] **Actual:** _____________________________

### Test Case 27: Filter by Action
- [ ] Pilih dropdown "Aksi"
- [ ] Pilih "CREATE"
- [ ] **Expected:** Tabel hanya menampilkan log CREATE actions
- [ ] **Actual:** _____________________________

### Test Case 28: Filter by Date Range
- [ ] Pilih "Tanggal Mulai": 2026-01-01
- [ ] Pilih "Tanggal Akhir": 2026-02-03
- [ ] **Expected:** Tabel menampilkan log dalam range tersebut
- [ ] **Actual:** _____________________________

### Test Case 29: Search Audit Trail
- [ ] Ketik keyword di search box (e.g., nama user atau deskripsi)
- [ ] **Expected:** Tabel filter sesuai search query
- [ ] **Actual:** _____________________________

### Test Case 30: Filter by IP Address
- [ ] Masukkan IP address di filter (e.g., 192.168.1.1)
- [ ] **Expected:** Tabel menampilkan log dari IP tersebut
- [ ] **Actual:** _____________________________

### Test Case 31: View Entry Detail
- [ ] Klik icon **Eye** di kolom Actions
- [ ] **Expected:** Modal detail muncul menampilkan:
  - Full description
  - Changed fields (before/after values)
  - Metadata (IP, user agent, timestamp)
- [ ] **Actual:** _____________________________

### Test Case 32: Export Audit Trail to CSV
- [ ] Klik tombol **"Export CSV"** (kanan atas)
- [ ] **Expected:** File CSV terdownload
- [ ] **Expected:** Network tab: `GET /api/audit-trail/export?...params`
- [ ] **Check File:** Buka CSV, verify data lengkap
- [ ] **Actual:** _____________________________

### Test Case 33: Pagination Audit Trail
- [ ] Klik "Next Page"
- [ ] **Expected:** Tabel load page 2
- [ ] Klik "Previous Page"
- [ ] **Expected:** Kembali ke page 1
- [ ] **Actual:** _____________________________

---

## 🐛 KNOWN ISSUES VERIFICATION

### Bug 1: Modal Z-Index (FIXED)
- [ ] Buka sidebar
- [ ] Klik profile → "Ubah Password"
- [ ] **Expected:** Modal muncul DI ATAS sidebar (z-index 9999)
- [ ] **Expected:** Modal TIDAK tertutup sidebar
- [ ] **Actual:** _____________________________

### Bug 2: Settings Loading Forever (FIXED in previous commit)
- [ ] HARD REFRESH page (Ctrl+Shift+R)
- [ ] Navigate ke Settings
- [ ] **Expected:** Settings load dalam <2 detik
- [ ] **Expected:** TIDAK ada infinite loading spinner
- [ ] **Actual:** _____________________________

### Bug 3: Help Center Empty Cards (NO BUG - FALSE ALARM)
- [ ] Navigate ke Help Center
- [ ] **Expected:** Cards menampilkan:
  - Icons
  - Titles
  - Descriptions
  - Article counts
- [ ] **Actual:** _____________________________

### Bug 4: Button Simpan Tidak Terlihat (FIXED)
- [ ] Tab Organization → scroll ke bawah
- [ ] **Expected:** Tombol "Simpan Informasi" terlihat JELAS:
  - Size: px-6 py-3 (lebih besar)
  - Border separator di atas button
  - Hover effect: shadow-lg
- [ ] **Actual:** _____________________________

---

## 📊 TESTING SUMMARY

**Total Test Cases:** 33

**Passed:** ___ / 33  
**Failed:** ___ / 33  
**Blocked:** ___ / 33

### Critical Failures (Must Fix Immediately):
1. _____________________________
2. _____________________________
3. _____________________________

### Medium Priority Issues:
1. _____________________________
2. _____________________________

### Low Priority / Enhancement:
1. _____________________________
2. _____________________________

---

## 🔧 HOW TO TEST

### 1. Start Backend & Frontend
```powershell
# Backend (port 5001) - already running
cd apps/backend
npm run dev

# Frontend (port 5174)
cd apps/frontend
npm run dev
```

### 2. Login as Admin
- Username: `admin`
- Password: (your admin password)

### 3. Open Browser Developer Tools
- Press **F12**
- Go to **Network** tab
- Filter: `Fetch/XHR`
- Monitor all API calls

### 4. Check Each Tab Systematically
Follow checklist above, mark ✅ or ❌ for each test case.

### 5. Report Issues
For each failed test, note:
- **Test Case Number**
- **Expected Behavior**
- **Actual Behavior**
- **Console Errors** (if any)
- **Network Response** (status code, error message)

---

## 📝 NOTES FOR DEVELOPER

### Backend Routes yang Sudah Diperbaiki:
```typescript
// BEFORE (routes tidak lengkap)
router.get('/backup/history', getBackupHistory);
router.get('/backup/:filename/download', downloadBackup);

// AFTER (sudah lengkap)
router.get('/backup/history', getBackupHistory);
router.get('/backup/statistics', getBackupStatistics);      // ✅ NEW
router.get('/backup/:id/download', downloadBackup);        // ✅ FIXED param
router.delete('/backup/:id', deleteBackup);                // ✅ NEW
router.post('/backup/cleanup', runBackupCleanup);          // ✅ NEW
router.get('/organization', getOrganizationSettings);      // ✅ NEW
router.put('/organization', updateOrganizationSettings);   // ✅ NEW
router.get('/audit-log', getSettingsAuditLog);            // ✅ NEW
```

### Controller Functions (Already Exist):
Semua controller functions sudah ada di `settings.controller.ts`:
- ✅ `getOrganizationSettings`
- ✅ `updateOrganizationSettings`
- ✅ `getBackupStatistics`
- ✅ `deleteBackup`
- ✅ `runBackupCleanup`
- ✅ `getSettingsAuditLog`

**Masalahnya:** Routes tidak registered, sehingga Frontend calls FAILED!

### Restart Backend Required:
Backend sudah direstart dengan routes baru:
- Process ID: 12284
- Port: 5001
- Status: ✅ Running

---

**Last Updated:** 3 Feb 2026, 15:45  
**Tester:** _____________________  
**Sign Off:** _____________________

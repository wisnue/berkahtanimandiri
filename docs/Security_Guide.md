# 🔐 Panduan Keamanan & Backup

## Sistem Informasi KTH Berkah Tani Mandiri

---

## 🔒 KEAMANAN SISTEM

### 1. Password Policy

**Persyaratan Password:**
- Minimal 8 karakter
- Kombinasi huruf besar & kecil
- Minimal 1 angka
- Minimal 1 karakter spesial (!@#$%^&*)

**Best Practices:**
- Ganti password setiap 3 bulan
- Jangan gunakan password yang sama dengan sistem lain
- Jangan simpan password di browser publik
- Gunakan password manager (opsional)

---

### 2. Two-Factor Authentication (2FA)

**Cara Mengaktifkan 2FA:**
1. Login ke sistem
2. Klik **Pengaturan** → **Keamanan**
3. Klik **Aktifkan 2FA**
4. Scan QR Code dengan Google Authenticator
5. Masukkan kode verifikasi
6. Simpan backup codes

**Login dengan 2FA:**
1. Masukkan username & password
2. Buka Google Authenticator
3. Masukkan kode 6 digit
4. Klik **Verifikasi**

---

### 3. Session Management

- Session timeout: **24 jam** tidak aktif
- Auto logout setelah idle **30 menit**
- Max login attempts: **5 kali**
- Account lockout: **15 menit** setelah 5 kali gagal login

---

### 4. Audit Trail

Semua aktivitas tercatat:
- Login/logout
- CRUD operations
- File uploads
- Export laporan
- Perubahan settings

**Cara Melihat Audit Log:**
1. Login sebagai Ketua/Admin
2. Menu **Pengaturan** → **Activity Logs**
3. Filter berdasarkan user/tanggal/aksi
4. Export jika diperlukan

---

## 💾 BACKUP & RESTORE

### 1. Automatic Backup

**Jadwal Backup Otomatis:**
- **Harian**: Setiap pukul 02:00 WIB
- **Mingguan**: Setiap Minggu pukul 03:00 WIB
- **Bulanan**: Setiap tanggal 1 pukul 04:00 WIB

**Lokasi Backup:**
```
D:\KTH-BTM\backups\
├── daily\
├── weekly\
└── monthly\
```

**Retention Policy:**
- Daily: 7 hari
- Weekly: 4 minggu
- Monthly: 12 bulan

---

### 2. Manual Backup

**Backup Database:**

```bash
# Masuk ke folder PostgreSQL bin
cd "C:\Program Files\PostgreSQL\16\bin"

# Backup database
pg_dump -U postgres -h localhost kth_btm > D:\backup_kth_btm_YYYYMMDD.sql

# Backup dengan kompresi
pg_dump -U postgres -h localhost kth_btm | gzip > D:\backup_kth_btm_YYYYMMDD.sql.gz
```

**Backup Files (Uploads):**
```bash
# Copy folder uploads
xcopy "C:\KTH-BTM\uploads" "D:\backup_uploads_YYYYMMDD" /E /I /H /Y
```

---

### 3. Restore Database

**Dari Backup SQL:**
```bash
# Masuk ke PostgreSQL bin
cd "C:\Program Files\PostgreSQL\16\bin"

# Restore database
psql -U postgres -h localhost kth_btm < D:\backup_kth_btm_YYYYMMDD.sql
```

**Dari Backup Compressed:**
```bash
# Extract dan restore
gunzip -c D:\backup_kth_btm_YYYYMMDD.sql.gz | psql -U postgres -h localhost kth_btm
```

---

### 4. Disaster Recovery Plan

**Skenario 1: Database Corrupt**
1. Stop aplikasi backend
2. Restore dari backup terakhir
3. Verifikasi integritas data
4. Start aplikasi
5. Test semua fungsi

**Skenario 2: Server Crash**
1. Install PostgreSQL di server baru
2. Restore database dari backup
3. Copy folder uploads
4. Install aplikasi
5. Update .env dengan kredensial baru
6. Test koneksi
7. Deploy aplikasi

**Skenario 3: Data Hilang/Terhapus**
1. Cek audit logs untuk identifikasi
2. Restore dari backup sebelum insiden
3. Recovery data yang hilang
4. Merge dengan data terbaru (jika perlu)

---

## 🛡️ SECURITY CHECKLIST

### Mingguan:
- [ ] Review audit logs
- [ ] Check failed login attempts
- [ ] Verify backup success
- [ ] Update password yang expired

### Bulanan:
- [ ] Review user access rights
- [ ] Update sistem (jika ada update)
- [ ] Test restore backup
- [ ] Security scan

### Tahunan:
- [ ] Full security audit
- [ ] Penetration testing (optional)
- [ ] Update security policy
- [ ] Training keamanan untuk user

---

## 🚨 INCIDENT RESPONSE

### Jika Terjadi Security Breach:

1. **Immediate Actions:**
   - Block akses yang mencurigakan
   - Ganti semua password
   - Nonaktifkan akun yang terkompromis
   - Backup data terbaru

2. **Investigation:**
   - Review audit logs
   - Identifikasi scope breach
   - Dokumentasikan insiden

3. **Recovery:**
   - Restore dari backup terakhir yang aman
   - Patch vulnerability
   - Monitor sistem intensif

4. **Post-Incident:**
   - Buat laporan insiden
   - Update security policy
   - Training untuk user

---

## 📊 MONITORING

### Metrics yang Dipantau:
- Server uptime
- Database performance
- Disk space
- Failed login attempts
- Error rates
- Response time

### Alerting:
- Email jika disk space < 20%
- Email jika ada failed login > 10 kali/jam
- Email jika backup gagal
- Email jika server down

---

## 📞 EMERGENCY CONTACTS

| Role | Name | Phone | Email |
|------|------|-------|-------|
| System Admin | - | +62 xxx | admin@kthbtm.id |
| Database Admin | - | +62 xxx | db@kthbtm.id |
| Ketua KTH | - | +62 xxx | ketua@kthbtm.id |

---

**Versi Dokumen**: 1.0  
**Terakhir Diperbarui**: 22 Desember 2025

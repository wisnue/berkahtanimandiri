# 👥 DAFTAR USER & HAK AKSES SISTEM KTH BTM

## 📊 SEMUA USER DALAM SISTEM

| No | Role | Email | Username | Password | Full Name | Status |
|----|------|-------|----------|----------|-----------|--------|
| 1 | **admin** | admin@kthbtm.com | admin | Password123! | Administrator | ✅ Active |
| 2 | **ketua** | ketua@kthbtm.com | ketua | Password123! | Ketua KTH BTM | ✅ Active |
| 3 | **sekretaris** | sekretaris@kthbtm.com | sekretaris | Password123! | Sekretaris KTH BTM | ✅ Active |
| 4 | **bendahara** | bendahara@kthbtm.com | bendahara | Password123! | Bendahara KTH BTM | ✅ Active |
| 5 | **anggota** | anggota@kthbtm.com | anggota | Password123! | Anggota KTH BTM | ✅ Active |
| 6 | ketua | test@kthbtm.com | testuser | Password123! | Test User | ✅ Active |

⚠️ **PENTING:** Ganti password setelah login pertama kali!

---

## 🔐 HAK AKSES BERDASARKAN ROLE

### **1. ADMIN (Administrator)**
**Full Access** - Akses ke semua fitur termasuk pengaturan sistem

#### Menu Sidebar:
- ✅ Dashboard → Beranda
- ✅ Master Data → Anggota
- ✅ Master Data → Lahan KHDPK
- ✅ Keuangan & PNBP → PNBP
- ✅ Keuangan & PNBP → Keuangan
- ✅ Keuangan & PNBP → Buku Kas
- ✅ Keuangan & PNBP → Rekonsiliasi PNBP
- ✅ Aset & Kegiatan → Aset
- ✅ Aset & Kegiatan → Kegiatan
- ✅ Dokumen → Dokumen
- ✅ Dokumen → Dokumen Organisasi
- ✅ **SISTEM → Pengaturan** 🔒 (Admin Only)
- ✅ **SISTEM → Audit Trail** 🔒 (Admin Only)

#### Akses API:
- ✅ **CREATE**: Anggota, Lahan, PNBP, Keuangan, Aset, Kegiatan, Dokumen
- ✅ **READ**: Semua data
- ✅ **UPDATE**: Semua data
- ✅ **DELETE**: Anggota, semua data lainnya
- ✅ **Settings**: Full access (backup, restore, system settings, organization)
- ✅ **Audit Trail**: Full access

---

### **2. KETUA**
**Management Level** - Akses luas untuk manajemen organisasi

#### Menu Sidebar:
- ✅ Dashboard → Beranda
- ✅ Master Data → Anggota
- ✅ Master Data → Lahan KHDPK
- ✅ Keuangan & PNBP → PNBP
- ✅ Keuangan & PNBP → Keuangan
- ✅ Keuangan & PNBP → Buku Kas
- ✅ Keuangan & PNBP → Rekonsiliasi PNBP
- ✅ Aset & Kegiatan → Aset
- ✅ Aset & Kegiatan → Kegiatan
- ✅ Dokumen → Dokumen
- ✅ Dokumen → Dokumen Organisasi
- ❌ SISTEM (Not accessible)

#### Akses API:
- ✅ **CREATE**: Anggota, Lahan, PNBP, Keuangan, Aset, Kegiatan, Dokumen
- ✅ **READ**: Semua data kecuali audit trail dan settings
- ✅ **UPDATE**: Anggota, Lahan, PNBP, Keuangan, Aset, Kegiatan, Dokumen
- ✅ **DELETE**: Lahan, PNBP, Keuangan, Aset, Kegiatan, Dokumen
- ❌ **Settings**: No access
- ❌ **Audit Trail**: No access

---

### **3. SEKRETARIS**
**Administrative Level** - Fokus pada dokumentasi dan administrasi

#### Menu Sidebar:
- ✅ Dashboard → Beranda
- ✅ Master Data → Anggota (Read only)
- ✅ Master Data → Lahan KHDPK
- ✅ Keuangan & PNBP → PNBP (Read only)
- ✅ Keuangan & PNBP → Keuangan (Read only)
- ✅ Keuangan & PNBP → Buku Kas (Read only)
- ✅ Keuangan & PNBP → Rekonsiliasi PNBP (Read only)
- ✅ Aset & Kegiatan → Aset
- ✅ Aset & Kegiatan → Kegiatan
- ✅ Dokumen → Dokumen
- ✅ Dokumen → Dokumen Organisasi
- ❌ SISTEM (Not accessible)

#### Akses API:
- ✅ **CREATE**: Lahan, Aset, Kegiatan, Dokumen
- ✅ **READ**: Semua data kecuali audit trail dan settings
- ✅ **UPDATE**: Lahan, Aset, Kegiatan, Dokumen
- ✅ **DELETE**: Aset, Kegiatan, Dokumen
- ❌ **Settings**: No access
- ❌ **Audit Trail**: No access
- ❌ **Anggota**: Cannot create/update/delete
- ❌ **PNBP/Keuangan**: Cannot create/update/delete

---

### **4. BENDAHARA**
**Financial Level** - Fokus pada keuangan dan PNBP

#### Menu Sidebar:
- ✅ Dashboard → Beranda
- ✅ Master Data → Anggota (Read only)
- ✅ Master Data → Lahan KHDPK (Read only)
- ✅ Keuangan & PNBP → PNBP
- ✅ Keuangan & PNBP → Keuangan
- ✅ Keuangan & PNBP → Buku Kas
- ✅ Keuangan & PNBP → Rekonsiliasi PNBP
- ✅ Aset & Kegiatan → Aset (Read only)
- ✅ Aset & Kegiatan → Kegiatan (Read only)
- ✅ Dokumen → Dokumen (Read only)
- ✅ Dokumen → Dokumen Organisasi (Read only)
- ❌ SISTEM (Not accessible)

#### Akses API:
- ✅ **CREATE**: PNBP, Keuangan, Buku Kas
- ✅ **READ**: Semua data kecuali audit trail dan settings
- ✅ **UPDATE**: PNBP, Keuangan, Buku Kas
- ✅ **DELETE**: PNBP, Keuangan
- ❌ **Settings**: No access
- ❌ **Audit Trail**: No access
- ❌ **Anggota/Lahan/Aset/Kegiatan/Dokumen**: Cannot create/update/delete

---

### **5. ANGGOTA**
**Member Level** - Read-only access untuk sebagian besar data

#### Menu Sidebar:
- ✅ Dashboard → Beranda
- ✅ Master Data → Anggota (Read only)
- ✅ Master Data → Lahan KHDPK (Read only)
- ✅ Keuangan & PNBP → PNBP (Read only)
- ✅ Keuangan & PNBP → Keuangan (Read only)
- ✅ Keuangan & PNBP → Buku Kas (Read only)
- ✅ Keuangan & PNBP → Rekonsiliasi PNBP (Read only)
- ✅ Aset & Kegiatan → Aset (Read only)
- ✅ Aset & Kegiatan → Kegiatan (Read only)
- ✅ Dokumen → Dokumen (Read only)
- ✅ Dokumen → Dokumen Organisasi (Read only)
- ❌ SISTEM (Not accessible)

#### Akses API:
- ❌ **CREATE**: No create access
- ✅ **READ**: Dashboard, Anggota, Lahan, PNBP, Keuangan, Aset, Kegiatan, Dokumen
- ❌ **UPDATE**: No update access
- ❌ **DELETE**: No delete access
- ❌ **Settings**: No access
- ❌ **Audit Trail**: No access

---

## 🔑 INFORMASI LOGIN

### Login dengan User Admin (Untuk Akses Menu Pengaturan):
```
Email: admin@kthbtm.com
Password: Password123!
```

### Login dengan User Ketua:
```
Email: ketua@kthbtm.com
Password: Password123!
```

### Login dengan User Sekretaris:
```
Email: sekretaris@kthbtm.com
Password: Password123!
```

### Login dengan User Bendahara:
```
Email: bendahara@kthbtm.com
Password: Password123!
```

### Login dengan User Anggota:
```
Email: anggota@kthbtm.com
Password: Password123!
```

---

## 📋 MATRIX HAK AKSES

| Fitur | Admin | Ketua | Sekretaris | Bendahara | Anggota |
|-------|-------|-------|------------|-----------|---------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Anggota - Create** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Anggota - Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Anggota - Update** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Anggota - Delete** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Lahan - Create** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Lahan - Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lahan - Update** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Lahan - Delete** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **PNBP - Create** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **PNBP - Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **PNBP - Update** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **PNBP - Delete** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Keuangan - Create** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Keuangan - Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Keuangan - Update** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Keuangan - Delete** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Buku Kas** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Rekonsiliasi PNBP** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Aset - All** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Kegiatan - All** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Dokumen - All** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Dokumen Organisasi** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **⚙️ Pengaturan** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **🔒 Audit Trail** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## ⚡ CARA AKSES MENU PENGATURAN

### Langkah 1: Logout dari User Saat Ini
1. Klik avatar/nama user di header
2. Klik tombol **"Keluar"**

### Langkah 2: Login dengan User Admin
1. Login dengan:
   - Email: `admin@kthbtm.com`
   - Password: `Password123!`

### Langkah 3: Akses Menu Pengaturan
1. Buka sidebar (menu kiri)
2. Cari group **"SISTEM"** (paling bawah)
3. Klik **"Pengaturan"**
4. Menu Pengaturan akan terbuka dengan 5 tab:
   - 📊 Pengaturan Sistem
   - 🏢 Info Organisasi
   - 💾 Backup Database
   - 👥 User Roles
   - 📋 Audit Log

---

## 🔄 MASALAH YANG SUDAH DIPERBAIKI

### ❌ **Masalah Sebelumnya:**
User dengan email `admin@kthbtm.com` memiliki role **"ketua"** di database, sehingga menu Pengaturan tidak muncul karena sidebar mengecek `role === 'admin'`.

### ✅ **Solusi:**
1. Role user `admin@kthbtm.com` diupdate dari `ketua` menjadi `admin`
2. Dibuat user baru untuk setiap role (ketua, sekretaris, bendahara, anggota)
3. Sekarang menu **SISTEM** akan muncul di sidebar untuk user dengan role `admin`

---

## 📝 CATATAN PENTING

⚠️ **User harus LOGOUT dan LOGIN ULANG** setelah role diupdate agar session menggunakan role yang baru!

🔑 **Default password semua user:** `Password123!`

🔐 **Keamanan:** Segera ganti password setelah login pertama kali!

📊 **Total User:** 6 users (1 admin, 2 ketua, 1 sekretaris, 1 bendahara, 1 anggota)

---

**Terakhir diupdate:** 14 Februari 2026

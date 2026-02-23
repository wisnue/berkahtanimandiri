# 📊 Database ERD - KTH BTM

## Entity Relationship Diagram

---

## 📋 Daftar Tabel

### 1. **users**
Menyimpan data pengguna sistem

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| nik | VARCHAR(16) | UNIQUE, NOT NULL | NIK pengguna |
| email | VARCHAR(255) | UNIQUE | Email |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Username login |
| password | VARCHAR(255) | NOT NULL | Password (hashed) |
| full_name | VARCHAR(255) | NOT NULL | Nama lengkap |
| role | VARCHAR(50) | NOT NULL | Role: ketua, sekretaris, bendahara, anggota |
| phone | VARCHAR(20) | | Nomor telepon |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Status aktif |
| two_factor_enabled | BOOLEAN | NOT NULL, DEFAULT false | 2FA enabled |
| two_factor_secret | VARCHAR(255) | | Secret 2FA |
| last_login | TIMESTAMP | | Login terakhir |
| login_attempts | VARCHAR(10) | DEFAULT '0' | Percobaan login |
| locked_until | TIMESTAMP | | Lock sampai |
| created_at | TIMESTAMP | NOT NULL | Tanggal dibuat |
| updated_at | TIMESTAMP | NOT NULL | Tanggal update |
| deleted_at | TIMESTAMP | | Soft delete |

---

### 2. **anggota**
Data anggota KTH

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → users.id | Relasi ke user |
| nomor_anggota | VARCHAR(50) | UNIQUE, NOT NULL | Nomor anggota |
| nik | VARCHAR(16) | UNIQUE, NOT NULL | NIK |
| nama_lengkap | VARCHAR(255) | NOT NULL | Nama lengkap |
| tempat_lahir | VARCHAR(100) | | Tempat lahir |
| tanggal_lahir | TIMESTAMP | | Tanggal lahir |
| jenis_kelamin | VARCHAR(20) | | Jenis kelamin |
| alamat_lengkap | TEXT | NOT NULL | Alamat lengkap |
| rt | VARCHAR(5) | | RT |
| rw | VARCHAR(5) | | RW |
| desa | VARCHAR(100) | | Desa |
| kecamatan | VARCHAR(100) | | Kecamatan |
| kabupaten | VARCHAR(100) | | Kabupaten |
| provinsi | VARCHAR(100) | | Provinsi |
| kode_pos | VARCHAR(10) | | Kode pos |
| nomor_telepon | VARCHAR(20) | | Nomor telepon |
| email | VARCHAR(255) | | Email |
| pendidikan | VARCHAR(50) | | Pendidikan |
| pekerjaan | VARCHAR(100) | | Pekerjaan |
| status_anggota | VARCHAR(20) | NOT NULL, DEFAULT 'aktif' | Status: aktif, nonaktif, cuti |
| tanggal_bergabung | TIMESTAMP | NOT NULL | Tanggal bergabung |
| tanggal_keluar | TIMESTAMP | | Tanggal keluar |
| luas_lahan_garapan | DECIMAL(10,4) | | Total luas lahan |
| foto_ktp | VARCHAR(500) | | Path foto KTP |
| foto_profile | VARCHAR(500) | | Path foto profile |
| qr_code | TEXT | | QR Code anggota |
| keterangan | TEXT | | Keterangan |

---

### 3. **lahan_khdpk**
Data lahan KHDPK

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| kode_lahan | VARCHAR(50) | UNIQUE, NOT NULL | Kode lahan |
| anggota_id | UUID | FK → anggota.id, NOT NULL | Pemilik lahan |
| nomor_petak | VARCHAR(50) | NOT NULL | Nomor petak |
| luas_lahan | DECIMAL(10,4) | NOT NULL | Luas (Ha) |
| satuan_luas | VARCHAR(10) | DEFAULT 'Ha' | Satuan |
| jenis_tanaman | VARCHAR(255) | | Jenis tanaman |
| lokasi_lahan | TEXT | | Lokasi detail |
| koordinat_lat | VARCHAR(50) | | Latitude |
| koordinat_long | VARCHAR(50) | | Longitude |
| status_legalitas | VARCHAR(50) | DEFAULT 'proses' | Status: proses, terbit, perpanjangan, habis |
| nomor_sk_khdpk | VARCHAR(100) | | Nomor SK |
| tanggal_sk | TIMESTAMP | | Tanggal SK |
| masa_berlaku_sk | TIMESTAMP | | Masa berlaku SK |
| tahun_mulai_kelola | INTEGER | NOT NULL | Tahun mulai |
| kondisi_lahan | VARCHAR(50) | | Kondisi lahan |
| file_peta_lahan | VARCHAR(500) | | File peta |
| file_sk_khdpk | VARCHAR(500) | | File SK |
| keterangan | TEXT | | Keterangan |

---

### 4. **pnbp**
Data PNBP (Penerimaan Negara Bukan Pajak)

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| nomor_transaksi | VARCHAR(100) | UNIQUE, NOT NULL | Nomor transaksi |
| anggota_id | UUID | FK → anggota.id, NOT NULL | Pembayar |
| lahan_id | UUID | FK → lahan_khdpk.id | Lahan terkait |
| tahun_pnbp | INTEGER | NOT NULL | Tahun PNBP |
| periode_bulan | INTEGER | | Periode bulan |
| luas_lahan_dihitung | DECIMAL(10,4) | NOT NULL | Luas dihitung |
| tarif_per_ha | DECIMAL(15,2) | NOT NULL | Tarif per Ha |
| jumlah_pnbp | DECIMAL(15,2) | NOT NULL | Total PNBP |
| status_bayar | VARCHAR(20) | DEFAULT 'belum' | Status: belum, lunas, sebagian, terlambat |
| tanggal_jatuh_tempo | TIMESTAMP | | Jatuh tempo |
| tanggal_bayar | TIMESTAMP | | Tanggal bayar |
| metode_bayar | VARCHAR(50) | | Metode bayar |
| nomor_referensi | VARCHAR(100) | | Nomor referensi |
| bukti_setor | VARCHAR(500) | | File bukti |
| keterangan | TEXT | | Keterangan |
| created_by | UUID | FK → anggota.id | Dibuat oleh |
| verified_by | UUID | FK → anggota.id | Diverifikasi oleh |
| verified_at | TIMESTAMP | | Tanggal verifikasi |

---

### 5. **keuangan**
Transaksi keuangan KTH

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| nomor_transaksi | VARCHAR(100) | UNIQUE, NOT NULL | Nomor transaksi |
| tanggal_transaksi | TIMESTAMP | NOT NULL | Tanggal |
| jenis_transaksi | VARCHAR(20) | NOT NULL | Jenis: masuk, keluar |
| kategori | VARCHAR(100) | NOT NULL | Kategori |
| sub_kategori | VARCHAR(100) | | Sub kategori |
| jumlah | DECIMAL(15,2) | NOT NULL | Jumlah |
| sumber_dana | VARCHAR(100) | | Sumber dana |
| tujuan_penggunaan | VARCHAR(255) | | Tujuan |
| keterangan | TEXT | | Keterangan |
| bukti_transaksi | VARCHAR(500) | | File bukti |
| dibuat_oleh | UUID | FK → users.id, NOT NULL | Dibuat oleh |
| diverifikasi_oleh | UUID | FK → users.id | Verifikator |
| status_verifikasi | VARCHAR(20) | DEFAULT 'pending' | Status: pending, approved, rejected |
| tanggal_verifikasi | TIMESTAMP | | Tanggal verifikasi |

---

### 6. **aset**
Aset KTH

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| kode_aset | VARCHAR(50) | UNIQUE, NOT NULL | Kode aset |
| nama_aset | VARCHAR(255) | NOT NULL | Nama aset |
| kategori_aset | VARCHAR(100) | NOT NULL | Kategori |
| jenis_aset | VARCHAR(100) | | Jenis |
| merk_tipe | VARCHAR(255) | | Merk/Tipe |
| nomor_seri | VARCHAR(100) | | Nomor seri |
| tahun_perolehan | INTEGER | NOT NULL | Tahun perolehan |
| tanggal_perolehan | TIMESTAMP | | Tanggal perolehan |
| sumber_perolehan | VARCHAR(100) | | Sumber |
| nilai_perolehan | DECIMAL(15,2) | NOT NULL | Nilai perolehan |
| nilai_sekarang | DECIMAL(15,2) | | Nilai sekarang |
| kondisi_aset | VARCHAR(50) | DEFAULT 'baik' | Kondisi: baik, rusak_ringan, rusak_berat, tidak_layak |
| lokasi_aset | VARCHAR(255) | | Lokasi |
| penanggung_jawab | VARCHAR(255) | | Penanggung jawab |
| masa_manfaat | INTEGER | | Masa manfaat (tahun) |
| keterangan | TEXT | | Keterangan |
| foto_aset | VARCHAR(500) | | Foto aset |
| bukti_perolehan | VARCHAR(500) | | File bukti |

---

### 7. **kegiatan**
Kegiatan KTH

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| kode_kegiatan | VARCHAR(50) | UNIQUE, NOT NULL | Kode kegiatan |
| nama_kegiatan | VARCHAR(255) | NOT NULL | Nama kegiatan |
| jenis_kegiatan | VARCHAR(100) | NOT NULL | Jenis |
| tanggal_mulai | TIMESTAMP | NOT NULL | Tanggal mulai |
| tanggal_selesai | TIMESTAMP | | Tanggal selesai |
| lokasi_kegiatan | TEXT | | Lokasi |
| lahan_id | UUID | FK → lahan_khdpk.id | Lahan terkait |
| penanggung_jawab | UUID | FK → anggota.id | PJ |
| jumlah_peserta | VARCHAR(10) | | Jumlah peserta |
| target_produksi | DECIMAL(10,2) | | Target |
| realisasi_produksi | DECIMAL(10,2) | | Realisasi |
| satuan_produksi | VARCHAR(50) | | Satuan |
| biaya_kegiatan | DECIMAL(15,2) | | Biaya |
| sumber_dana | VARCHAR(100) | | Sumber dana |
| status_kegiatan | VARCHAR(50) | DEFAULT 'rencana' | Status: rencana, berjalan, selesai, batal |
| hasil_kegiatan | TEXT | | Hasil |
| kendala | TEXT | | Kendala |
| keterangan | TEXT | | Keterangan |
| dokumentasi_foto | VARCHAR(500) | | Foto |
| laporan_kegiatan | VARCHAR(500) | | Laporan |

---

### 8. **dokumen**
Dokumen & Arsip

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| kode_dokumen | VARCHAR(50) | UNIQUE, NOT NULL | Kode dokumen |
| judul_dokumen | VARCHAR(255) | NOT NULL | Judul |
| jenis_dokumen | VARCHAR(100) | NOT NULL | Jenis |
| kategori_dokumen | VARCHAR(100) | | Kategori |
| nomor_dokumen | VARCHAR(100) | | Nomor |
| tanggal_dokumen | TIMESTAMP | | Tanggal |
| tanggal_berlaku | TIMESTAMP | | Berlaku |
| tanggal_kadaluarsa | TIMESTAMP | | Kadaluarsa |
| penerbit_dokumen | VARCHAR(255) | | Penerbit |
| deskripsi | TEXT | | Deskripsi |
| file_path | VARCHAR(500) | NOT NULL | Path file |
| file_name | VARCHAR(255) | NOT NULL | Nama file |
| file_size | VARCHAR(50) | | Ukuran file |
| file_type | VARCHAR(50) | | Tipe file |
| versi | INTEGER | DEFAULT 1 | Versi |
| status_dokumen | VARCHAR(50) | DEFAULT 'aktif' | Status: aktif, arsip, kadaluarsa |
| uploaded_by | UUID | FK → users.id, NOT NULL | Uploader |
| keterangan | TEXT | | Keterangan |

---

### 9. **activity_logs**
Log aktivitas sistem

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → users.id | User |
| action | VARCHAR(100) | NOT NULL | Aksi |
| module | VARCHAR(100) | NOT NULL | Modul |
| description | TEXT | | Deskripsi |
| ip_address | VARCHAR(50) | | IP Address |
| user_agent | VARCHAR(500) | | User agent |
| request_method | VARCHAR(10) | | HTTP method |
| request_url | VARCHAR(500) | | URL |
| status_code | VARCHAR(10) | | Status code |
| error_message | TEXT | | Error message |
| metadata | TEXT | | Metadata (JSON) |
| created_at | TIMESTAMP | NOT NULL | Waktu |

---

### 10. **settings**
Pengaturan sistem

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PK | Primary key |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Key |
| value | TEXT | NOT NULL | Value |
| type | VARCHAR(50) | DEFAULT 'string' | Type: string, number, boolean, json |
| category | VARCHAR(100) | | Kategori |
| label | VARCHAR(255) | | Label |
| description | TEXT | | Deskripsi |
| created_at | TIMESTAMP | NOT NULL | Dibuat |
| updated_at | TIMESTAMP | NOT NULL | Update |

---

## 🔗 Relasi Antar Tabel

### One-to-Many
- `users` → `anggota` (user_id)
- `anggota` → `lahan_khdpk` (anggota_id)
- `anggota` → `pnbp` (anggota_id)
- `lahan_khdpk` → `pnbp` (lahan_id)
- `users` → `keuangan` (dibuat_oleh, diverifikasi_oleh)
- `users` → `dokumen` (uploaded_by)
- `users` → `activity_logs` (user_id)

---

## 📊 Indexes

Untuk performa optimal, buat index pada:

- `anggota.nik`
- `anggota.nomor_anggota`
- `anggota.status_anggota`
- `lahan_khdpk.kode_lahan`
- `lahan_khdpk.anggota_id`
- `pnbp.anggota_id`
- `pnbp.tahun_pnbp`
- `pnbp.status_bayar`
- `keuangan.tanggal_transaksi`
- `keuangan.jenis_transaksi`
- `activity_logs.user_id`
- `activity_logs.created_at`

---

**Database Version**: 1.0.0  
**Last Updated**: 2025-12-22

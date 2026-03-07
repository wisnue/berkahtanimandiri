import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/app/AuthContext';
import {
  HelpCircle,
  Book,
  Users,
  MapPin,
  Receipt,
  Package,
  FileText,
  Settings,
  Database,
  Search,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  icon: any;
  description: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export default function HelpCenterPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const helpTopics: HelpTopic[] = [
    {
      id: 'getting-started',
      title: 'Memulai',
      icon: Book,
      description: 'Panduan dasar untuk memulai menggunakan sistem',
      articles: [
        {
          id: 'login',
          title: 'Cara Login ke Sistem',
          content: `
**Langkah-langkah Login:**

1. Buka halaman login di browser Anda
2. Masukkan email yang telah terdaftar
3. Masukkan password Anda
4. Klik tombol "Masuk"

**Catatan Keamanan:**
- Jangan bagikan password kepada siapapun
- Gunakan password yang kuat (minimal 8 karakter, kombinasi huruf, angka, dan simbol)
- Logout setelah selesai menggunakan sistem

**Password Default:**
Jika Anda user baru yang dibuat oleh admin, password default adalah: **Password123!**
Segera ubah password setelah login pertama kali.

**Lupa Password?**
Hubungi administrator untuk reset password Anda.
          `,
          tags: ['login', 'akses', 'keamanan'],
        },
        {
          id: 'navigation',
          title: 'Navigasi Dashboard',
          content: `
**Menu Sidebar:**

Dashboard terbagi menjadi beberapa grup menu:

1. **DASHBOARD** - Halaman utama dengan ringkasan data
2. **MASTER DATA** - Data anggota dan lahan
3. **KEUANGAN & PNBP** - Pengelolaan keuangan organisasi
4. **ASET & KEGIATAN** - Manajemen aset dan kegiatan
5. **DOKUMEN** - Penyimpanan dokumen organisasi
6. **SISTEM** - Pengaturan dan audit trail (khusus Admin)

**Tips Navigasi:**
- Klik pada grup menu untuk expand/collapse sub-menu
- Menu yang sedang aktif ditandai dengan highlight hijau
- Gunakan search bar di header untuk pencarian cepat
- Sidebar dapat di-collapse dengan tombol di pojok kanan atas
          `,
          tags: ['navigasi', 'menu', 'dashboard'],
        },
        {
          id: 'profile',
          title: 'Mengatur Profil',
          content: `
**Cara Mengubah Profil:**

1. Klik avatar/nama Anda di pojok kanan atas
2. Pilih "Profil Saya"
3. Edit informasi yang ingin diubah
4. Klik "Simpan Perubahan"

**Informasi yang Dapat Diubah:**
- Nama lengkap
- Nomor telepon
- Email (akan mengirim verifikasi)
- Foto profil

**Ubah Password:**
1. Klik avatar → "Ubah Password"
2. Masukkan password lama
3. Masukkan password baru (min 8 karakter)
4. Konfirmasi password baru
5. Klik "Ubah Password"
          `,
          tags: ['profil', 'akun', 'password'],
        },
      ],
    },
    {
      id: 'anggota',
      title: 'Data Anggota',
      icon: Users,
      description: 'Manajemen data anggota KTH',
      articles: [
        {
          id: 'add-anggota',
          title: 'Menambah Anggota Baru',
          content: `
**Langkah-langkah:**

1. Buka menu **Master Data → Anggota**
2. Klik tombol **"+ Tambah Anggota"** (hijau, pojok kanan atas)
3. Isi form data anggota:
   - **Data Pribadi**: NIK, nama, tempat/tanggal lahir, jenis kelamin
   - **Kontak**: Alamat, telepon, email
   - **Status**: Status keanggotaan, tanggal bergabung
   - **Foto**: Upload foto anggota (opsional)
4. Klik **"Simpan"**

**Catatan Penting:**
- NIK harus unik dan 16 digit
- Nama harus diisi lengkap
- Tanggal bergabung tidak boleh di masa depan
- Format foto: JPG, PNG maksimal 2MB

**Status Keanggotaan:**
- **Aktif**: Anggota masih aktif di organisasi
- **Tidak Aktif**: Anggota sudah keluar/resign
- **Calon**: Anggota dalam masa percobaan
          `,
          tags: ['anggota', 'tambah', 'registrasi'],
        },
        {
          id: 'edit-anggota',
          title: 'Mengubah Data Anggota',
          content: `
**Cara Edit Data:**

1. Buka halaman **Anggota**
2. Cari anggota yang ingin diedit (gunakan search/filter)
3. Klik nama anggota untuk buka detail
4. Klik tombol **"Edit"** (ikon pensil)
5. Ubah data yang diperlukan
6. Klik **"Simpan Perubahan"**

**Hak Akses:**
- Admin, Ketua, Sekretaris: Dapat mengedit semua data
- Bendahara, Anggota: Hanya dapat melihat data

**Riwayat Perubahan:**
Semua perubahan data tercatat di Audit Trail dengan informasi:
- Siapa yang mengubah
- Kapan diubah
- Data lama dan data baru
          `,
          tags: ['anggota', 'edit', 'ubah'],
        },
        {
          id: 'status-anggota',
          title: 'Mengubah Status Anggota',
          content: `
**Cara Nonaktifkan Anggota:**

1. Buka detail anggota
2. Klik **"Edit"**
3. Ubah **Status** menjadi "Tidak Aktif"
4. Isi **Keterangan** (alasan)
5. Simpan

**Efek Perubahan Status:**
- Anggota tidak aktif tetap ada di database
- Data historis tetap tersimpan
- Dapat diaktifkan kembali kapan saja
- Laporan dapat di-filter berdasarkan status

**Catatan:**
Jangan hapus data anggota. Gunakan status "Tidak Aktif" untuk menjaga integritas data historis.
          `,
          tags: ['anggota', 'status', 'nonaktif'],
        },
      ],
    },
    {
      id: 'lahan',
      title: 'Lahan KHDPK',
      icon: MapPin,
      description: 'Pengelolaan data lahan kawasan hutan',
      articles: [
        {
          id: 'add-lahan',
          title: 'Menambah Data Lahan',
          content: `
**Langkah-langkah:**

1. Menu **Master Data → Lahan KHDPK**
2. Klik **"+ Tambah Lahan"**
3. Isi informasi lahan:
   - **Identitas**: Nomor SK, nama pemegang
   - **Lokasi**: Desa, kecamatan, koordinat
   - **Luas**: Luas lahan (hektar)
   - **Periode**: Tanggal dikeluarkan, masa berlaku
   - **Status**: Aktif/Tidak Aktif
4. Upload dokumen SK (PDF/JPG)
5. Klik **"Simpan"**

**Informasi Penting:**
- Koordinat dapat diisi dengan format: lat,long
- Luas dalam satuan hektar (ha)
- Masa berlaku SK biasanya 5-25 tahun
- Dokumen SK wajib diupload

**Validasi:**
Sistem akan mengecek:
- Nomor SK tidak duplikat
- Luas lahan > 0
- Tanggal berlaku valid
          `,
          tags: ['lahan', 'tambah', 'KHDPK'],
        },
      ],
    },
    {
      id: 'pnbp',
      title: 'PNBP & Keuangan',
      icon: Receipt,
      description: 'Pencatatan PNBP dan keuangan organisasi',
      articles: [
        {
          id: 'pnbp-entry',
          title: 'Mencatat PNBP',
          content: `
**Penerimaan Negara Bukan Pajak (PNBP)**

**Langkah Pencatatan:**

1. Menu **Keuangan & PNBP → PNBP**
2. Klik **"+ Tambah PNBP"**
3. Isi data:
   - **Tahun** & **Periode**: Pilih tahun dan bulan
   - **Jenis PNBP**: Pilih jenis (Hasil Hutan, Iuran, dll)
   - **Nominal**: Masukkan jumlah (Rupiah)
   - **Keterangan**: Detail transaksi
   - **Bukti**: Upload bukti pembayaran
4. Klik **"Simpan"**

**Status PNBP:**
- **Pending**: Belum diverifikasi
- **Verified**: Sudah diverifikasi
- **Rejected**: Ditolak

**Proses Verifikasi:**
1. Bendahara/Ketua review data
2. Klik **"Verifikasi"** jika sesuai
3. Atau **"Tolak"** dengan alasan

**Laporan PNBP:**
- Filter per tahun/periode
- Export ke Excel/PDF
- Rekap per jenis PNBP
          `,
          tags: ['pnbp', 'keuangan', 'pencatatan'],
        },
        {
          id: 'keuangan',
          title: 'Transaksi Keuangan',
          content: `
**Mencatat Transaksi Keuangan:**

**Tipe Transaksi:**
1. **Pemasukan**: Uang masuk (iuran, bantuan, dll)
2. **Pengeluaran**: Uang keluar (operasional, belanja)

**Cara Input:**
1. Menu **Keuangan & PNBP → Keuangan**
2. Klik **"+ Tambah Transaksi"**
3. Pilih **Tipe** (Pemasukan/Pengeluaran)
4. Isi detail transaksi
5. Upload bukti (struk, nota, kwitansi)
6. Simpan

**Kategori Transaksi:**
- Operasional
- Belanja Barang
- Gaji/Honor
- Iuran Anggota
- Bantuan/Hibah
- Lain-lain

**Buku Kas:**
Otomatis terupdate setiap ada transaksi baru.
Cek di menu **Buku Kas** untuk melihat mutasi.
          `,
          tags: ['keuangan', 'transaksi', 'pencatatan'],
        },
        {
          id: 'rekonsiliasi',
          title: 'Rekonsiliasi PNBP',
          content: `
**Rekonsiliasi Data PNBP dengan Keuangan**

**Tujuan:**
Memastikan data PNBP sesuai dengan pencatatan keuangan.

**Cara Melakukan Rekonsiliasi:**
1. Menu **Keuangan & PNBP → Rekonsiliasi PNBP**
2. Pilih **Tahun**
3. Sistem akan menampilkan perbandingan:
   - Total PNBP vs Total Keuangan
   - Selisih jumlah dan nominal
   - Persentase penyimpangan
4. Review selisih yang ada
5. Perbaiki data yang tidak sesuai

**Indikator:**
- 🟢 Hijau: Sesuai (selisih 0%)
- 🟡 Kuning: Selisih kecil (< 5%)
- 🔴 Merah: Selisih besar (>= 5%)

**Best Practice:**
- Lakukan rekonsiliasi setiap akhir bulan
- Dokumentasikan selisih yang wajar
- Koordinasi dengan bendahara
          `,
          tags: ['rekonsiliasi', 'pnbp', 'keuangan'],
        },
      ],
    },
    {
      id: 'aset',
      title: 'Aset & Kegiatan',
      icon: Package,
      description: 'Manajemen aset dan kegiatan organisasi',
      articles: [
        {
          id: 'aset-management',
          title: 'Mengelola Aset',
          content: `
**Pencatatan Aset Organisasi**

**Langkah-langkah:**
1. Menu **Aset & Kegiatan → Aset**
2. Klik **"+ Tambah Aset"**
3. Isi informasi:
   - **Nama Aset**: Deskripsi singkat
   - **Kategori**: Tanah, Bangunan, Kendaraan, Alat, dll
   - **Kondisi**: Baik, Rusak Ringan, Rusak Berat
   - **Nilai**: Harga perolehan
   - **Tanggal Perolehan**
   - **Foto**: Upload foto aset
4. Simpan

**Kategori Aset:**
- Tanah & Bangunan
- Kendaraan
- Peralatan & Mesin
- Inventaris Kantor
- Lainnya

**Status Kondisi:**
- **Baik**: Berfungsi normal
- **Rusak Ringan**: Perlu perbaikan kecil
- **Rusak Berat**: Perlu perbaikan besar
- **Tidak Berfungsi**: Sudah tidak bisa dipakai

**Pemeliharaan:**
Catat semua kegiatan pemeliharaan/perbaikan di kolom keterangan.
          `,
          tags: ['aset', 'inventaris', 'barang'],
        },
        {
          id: 'kegiatan',
          title: 'Mencatat Kegiatan',
          content: `
**Manajemen Kegiatan Organisasi**

**Tambah Kegiatan Baru:**
1. Menu **Aset & Kegiatan → Kegiatan**
2. Klik **"+ Tambah Kegiatan"**
3. Isi form:
   - **Nama Kegiatan**
   - **Jenis**: Pelatihan, Rapat, Kerja Bakti, dll
   - **Tanggal**: Tanggal pelaksanaan
   - **Lokasi**: Tempat kegiatan
   - **Peserta**: Jumlah peserta
   - **Anggaran**: Biaya kegiatan
   - **Deskripsi**: Detail kegiatan
   - **Foto**: Upload dokumentasi
4. Simpan

**Jenis Kegiatan:**
- Rapat Anggota
- Pelatihan
- Kerja Bakti
- Monitoring
- Sosialisasi
- Lainnya

**Status Kegiatan:**
- **Direncanakan**: Belum terlaksana
- **Sedang Berlangsung**: Sedang dilaksanakan  
- **Selesai**: Sudah selesai
- **Dibatalkan**: Tidak jadi dilaksanakan

**Laporan:**
Export daftar kegiatan ke Excel/PDF untuk pelaporan.
          `,
          tags: ['kegiatan', 'acara', 'event'],
        },
      ],
    },
    {
      id: 'dokumen',
      title: 'Manajemen Dokumen',
      icon: FileText,
      description: 'Penyimpanan dan pengelolaan dokumen',
      articles: [
        {
          id: 'upload-dokumen',
          title: 'Upload Dokumen',
          content: `
**Cara Upload Dokumen:**

**Dokumen Umum:**
1. Menu **Dokumen → Dokumen**
2. Klik **"+ Upload Dokumen"**
3. Pilih file (PDF, Word, Excel, Gambar)
4. Isi metadata:
   - Judul dokumen
   - Kategori
   - Keterangan
5. Klik **"Upload"**

**Dokumen Organisasi:**
1. Menu **Dokumen → Dokumen Organisasi**
2. Klik **"+ Upload"**
3. Pilih jenis dokumen:
   - SK Pembentukan
   - AD/ART
   - SK Pengurus
   - Rencana Kerja
   - Laporan
   - Lainnya
4. Isi form lengkap:
   - Judul & Nomor Dokumen
   - Tanggal Dokumen
   - Masa Berlaku
   - Penerbit
5. Upload file
6. Simpan

**Limit Upload:**
- Ukuran maksimal: 10 MB per file
- Format: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG

**Status Dokumen:**
- **Aktif**: Masih berlaku
- **Kadaluarsa**: Sudah lewat masa berlaku
- **Diarsipkan**: Sudah tidak digunakan
          `,
          tags: ['dokumen', 'upload', 'file'],
        },
        {
          id: 'cari-dokumen',
          title: 'Mencari Dokumen',
          content: `
**Cara Mencari Dokumen:**

**Metode Pencarian:**

1. **Search Bar**: 
   - Ketik kata kunci di kotak pencarian
   - Enter atau klik tombol cari
   - Hasil akan muncul secara real-time

2. **Filter:**
   - Filter berdasarkan jenis dokumen
   - Filter berdasarkan status (Aktif/Kadaluarsa)
   - Filter berdasarkan tanggal

3. **Sorting:**
   - Urutkan berdasarkan tanggal upload
   - Urutkan berdasarkan nama
   - Urutkan berdasarkan ukuran file

**Download Dokumen:**
- Klik nama file untuk preview
- Klik tombol download untuk unduh
- Klik ikon mata untuk lihat detail

**Hak Akses:**
- Semua role dapat melihat dan download
- Hanya Admin, Ketua, Sekretaris yang dapat upload
          `,
          tags: ['dokumen', 'cari', 'download'],
        },
      ],
    },
    {
      id: 'settings',
      title: 'Pengaturan Sistem',
      icon: Settings,
      description: 'Konfigurasi dan pengaturan sistem (Admin)',
      articles: [
        {
          id: 'system-settings',
          title: 'Pengaturan Sistem',
          content: `
**Pengaturan Sistem (Khusus Admin)**

**Akses:**
Menu **Sistem → Pengaturan** → Tab **Pengaturan Sistem**

**Kategori Pengaturan:**

**1. Pengaturan Umum:**
- Nama Aplikasi
- Versi Aplikasi (read-only)

**2. Keamanan & Autentikasi:**
- Session Timeout (detik)
- Max Login Attempts
- Password Expiry (hari)
- Password Policy:
  - Wajib huruf besar
  - Wajib huruf kecil
  - Wajib angka
  - Wajib karakter spesial

**3. Notifikasi:**
- Email Notifications (on/off)

**Simpan Perubahan:**
Klik tombol **"Simpan Pengaturan"** setelah mengubah nilai.

**Audit Trail:**
Semua perubahan tercatat di tab **Audit Log**.
          `,
          tags: ['pengaturan', 'sistem', 'admin'],
        },
        {
          id: 'org-settings',
          title: 'Info Organisasi',
          content: `
**Pengaturan Informasi Organisasi**

**Akses:**
Menu **Sistem → Pengaturan** → Tab **Info Organisasi**

**Data yang Dapat Diisi:**

**Informasi Dasar:**
- Nama Organisasi Lengkap
- Nama Singkat
- Alamat Lengkap
- Nomor Telepon
- Email Organisasi
- Website

**Struktur Kepengurusan:**
- Nama Ketua
- Jabatan Ketua
- Nama Sekretaris
- Nama Bendahara

**Cara Update:**
1. Edit field yang diperlukan
2. Klik **"Simpan Informasi"**
3. Data akan tersimpan dan muncul di laporan

**Penggunaan:**
Info ini akan muncul di:
- Header laporan
- Kop surat
- Footer dokumen
          `,
          tags: ['organisasi', 'profil', 'info'],
        },
        {
          id: 'backup',
          title: 'Backup Database',
          content: `
**Manajemen Backup Database**

**Akses:**
Menu **Sistem → Pengaturan** → Tab **Backup Database**

**Fitur Backup:**

**1. Backup Manual:**
- Klik **"Backup Sekarang"**
- Sistem akan membuat backup database
- File tersimpan di server
- Dapat di-download

**2. Statistik Backup:**
- Total Backups: Jumlah total backup
- Berhasil: Backup sukses
- Gagal: Backup error
- Total Ukuran: Total space yang digunakan

**3. Riwayat Backup:**
- Tabel daftar semua backup
- Info: Filename, Tanggal, Ukuran, Type, Status
- Aksi: Download, Hapus

**4. Cleanup:**
- Klik **"Jalankan Cleanup"**
- Hapus backup lama (> retention period)
- Hemat space server

**Jadwal Otomatis:**
Backup otomatis berjalan setiap hari pukul 03:00
Retention: 90 hari (backup > 90 hari otomatis dihapus)

**Best Practice:**
- Backup manual sebelum update besar
- Download backup penting
- Review backup gagal
          `,
          tags: ['backup', 'database', 'restore'],
        },
        {
          id: 'audit-trail',
          title: 'Audit Trail',
          content: `
**Audit Trail - Tracking Aktivitas Sistem**

**Akses:**
Menu **Sistem → Audit Trail**

**Informasi yang Dicatat:**
- **Tindakan**: CREATE, UPDATE, DELETE, VERIFY
- **Tabel**: Tabel database yang diubah
- **User**: Siapa yang melakukan
- **Waktu**: Kapan dilakukan
- **IP Address**: Dari mana akses
- **Detail**: Perubahan data (before & after)

**Filter & Pencarian:**
- Filter berdasarkan tindakan
- Filter berdasarkan tabel
- Filter berdasarkan user
- Filter berdasarkan rentang tanggal
- Search berdasarkan kata kunci

**Export:**
Klik **"Export CSV"** untuk download semua log.

**Gunakan Audit Trail untuk:**
- Investigasi perubahan data
- Compliance audit
- Security monitoring
- Troubleshooting

**Retention:**
Log disimpan permanent (tidak dihapus otomatis).
          `,
          tags: ['audit', 'log', 'tracking'],
        },
      ],
    },
    {
      id: 'reports',
      title: 'Laporan',
      icon: Database,
      description: 'Generate dan export laporan',
      articles: [
        {
          id: 'generate-report',
          title: 'Membuat Laporan',
          content: `
**Cara Generate Laporan:**

**Jenis Laporan:**
1. **Laporan Anggota**: Daftar anggota per status
2. **Laporan Lahan**: Data lahan KHDPK
3. **Laporan Keuangan**: Mutasi keuangan per periode
4. **Laporan PNBP**: Rekapitulasi PNBP
5. **Laporan Aset**: Inventaris aset
6. **Laporan Kegiatan**: Daftar kegiatan

**Langkah-langkah:**
1. Buka halaman yang relevan
2. Set filter (periode, status, dll)
3. Klik tombol **Export**
4. Pilih format (Excel/PDF)
5. File akan terdownload

**Format Export:**
- **Excel (.xlsx)**: Untuk analisis data lebih lanjut
- **PDF**: Untuk cetak/lampiran formal

**Tips:**
- Filter dulu sebelum export untuk data yang relevan
- Excel dapat diedit, PDF tidak
- PDF otomatis include header organisasi
          `,
          tags: ['laporan', 'report', 'export'],
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertCircle,
      description: 'Solusi masalah umum',
      articles: [
        {
          id: 'common-issues',
          title: 'Masalah Umum & Solusi',
          content: `
**Masalah Login:**

**❌ "Email atau password salah"**
- Pastikan email dan password benar
- Cek Caps Lock tidak aktif
- Hubungi admin untuk reset password

**❌ "Akun Anda terkunci"**
- Login gagal > 5 kali akan mengunci akun
- Tunggu 15 menit atau hubungi admin

**Masalah Upload:**

**❌ "File terlalu besar"**
- Maksimal 10 MB per file
- Compress file atau split menjadi beberapa bagian

**❌ "Format file tidak didukung"**
- Gunakan format: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG

**Masalah Kinerja:**

**❌ "Aplikasi lambat"**
- Clear browser cache
- Tutup tab browser lain
- Cek koneksi internet
- Gunakan browser modern (Chrome/Firefox/Edge)

**❌ "Session timeout"**
- Otomatis logout setelah 30 menit tidak aktif
- Login kembali
- Simpan pekerjaan secara berkala

**Masalah Data:**

**❌ "Data tidak muncul"**
- Refresh halaman (F5)
- Clear cache dan reload
- Cek filter yang aktif
- Hubungi admin jika persisten

**❌ "Tombol tidak berfungsi"**
- Tunggu loading selesai
- Refresh halaman
- Cek hak akses Anda
          `,
          tags: ['troubleshooting', 'error', 'masalah'],
        },
        {
          id: 'browser-support',
          title: 'Browser yang Didukung',
          content: `
**Browser yang Direkomendasikan:**

✅ **Google Chrome** (versi terbaru)
✅ **Mozilla Firefox** (versi terbaru)
✅ **Microsoft Edge** (versi terbaru)
✅ **Safari** (versi terbaru, untuk Mac)

❌ **Tidak Didukung:**
- Internet Explorer (semua versi)
- Browser jadul/outdated

**Rekomendasi:**
- Selalu update browser ke versi terbaru
- Aktifkan JavaScript
- Disable ad-blocker untuk domain ini
- Hapus cache secara rutin

**Minimum Requirements:**
- Resolution: 1366x768 atau lebih
- RAM: 4 GB
- Internet: Stabil minimal 1 Mbps
          `,
          tags: ['browser', 'support', 'compatibility'],
        },
      ],
    },
  ];

  const filteredTopics = searchQuery
    ? helpTopics
        .map(topic => ({
          ...topic,
          articles: topic.articles.filter(
            article =>
              article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          ),
        }))
        .filter(topic => topic.articles.length > 0)
    : helpTopics;

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@kthbtm.org',
      action: 'mailto:support@kthbtm.org',
    },
    {
      icon: Phone,
      title: 'Telepon',
      value: '+62 812-3456-7890',
      action: 'tel:+6281234567890',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+62 812-3456-7890',
      action: 'https://wa.me/6281234567890',
    },
  ];

  return (
    <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-emerald-600" />
            Pusat Bantuan
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Panduan lengkap penggunaan sistem manajemen KTH BTM
          </p>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari topik bantuan... (contoh: cara login, upload dokumen, backup)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </Card>

        {selectedArticle ? (
          /* Article Detail View */
          <div className="space-y-4">
            <button
              onClick={() => setSelectedArticle(null)}
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-medium"
            >
              ← Kembali ke Daftar Topik
            </button>

            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h2>
                <div className="flex gap-2 flex-wrap">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose max-w-none">
                {selectedArticle.content.split('\n').map((paragraph, idx) => {
                  if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                    return (
                      <h3 key={idx} className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }
                  if (paragraph.trim().startsWith('- ')) {
                    return (
                      <li key={idx} className="ml-6 text-gray-700">
                        {paragraph.substring(2)}
                      </li>
                    );
                  }
                  if (paragraph.trim().startsWith('✅') || paragraph.trim().startsWith('❌')) {
                    return (
                      <p key={idx} className="text-gray-700 my-2 flex items-start gap-2">
                        <span className="text-xl">{paragraph.trim().substring(0, 2)}</span>
                        <span>{paragraph.trim().substring(2)}</span>
                      </p>
                    );
                  }
                  if (paragraph.trim()) {
                    return (
                      <p key={idx} className="text-gray-700 my-3 leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Apakah artikel ini membantu?{' '}
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Ya
                  </button>{' '}
                  /{' '}
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Tidak
                  </button>
                </p>
              </div>
            </Card>
          </div>
        ) : (
          /* Topics Grid View */
          <>
            {!searchQuery && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {helpTopics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <Card
                      key={topic.id}
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 rounded-lg">
                          <Icon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{topic.title}</h3>
                          <p className="text-sm text-gray-600">{topic.description}</p>
                          <p className="text-xs text-emerald-600 mt-2">
                            {topic.articles.length} artikel
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Articles List */}
            <div className="space-y-4">
              {filteredTopics.map((topic) => {
                const Icon = topic.icon;
                const isExpanded = selectedTopic === topic.id || searchQuery;
                
                return (
                  <Card key={topic.id} className="overflow-hidden">
                    <div
                      className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedTopic(isExpanded ? null : topic.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                        <span className="text-xs text-gray-500">
                          ({topic.articles.length})
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>

                    {isExpanded && (
                      <div className="p-4 space-y-2 border-t border-gray-200">
                        {topic.articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="w-full text-left p-3 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-emerald-600">
                                {article.title}
                              </h4>
                              <div className="flex gap-2 mt-1">
                                {article.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs text-gray-500"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}

              {filteredTopics.length === 0 && searchQuery && (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tidak ada hasil
                  </h3>
                  <p className="text-gray-600">
                    Coba kata kunci lain atau hubungi support untuk bantuan lebih lanjut.
                  </p>
                </Card>
              )}
            </div>

            {/* Contact Support */}
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Butuh Bantuan Lebih Lanjut?
                </h3>
                <p className="text-gray-600">
                  Tim support kami siap membantu Anda
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <a
                      key={method.title}
                      href={method.action}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{method.title}</p>
                        <p className="text-xs text-gray-600">{method.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Tips Cepat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Simpan Pekerjaan Berkala</p>
                    <p className="text-xs text-gray-600">
                      Sistem akan auto-logout setelah 30 menit tidak aktif
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Gunakan Browser Terbaru</p>
                    <p className="text-xs text-gray-600">
                      Chrome, Firefox, atau Edge untuk performa terbaik
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Backup Data Penting</p>
                    <p className="text-xs text-gray-600">
                      Export laporan penting secara berkala
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ganti Password</p>
                    <p className="text-xs text-gray-600">
                      Ubah password default saat pertama kali login
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}

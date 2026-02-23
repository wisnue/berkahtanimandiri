# Panduan Deploy: Vercel + Supabase (Tanpa Render)

> Panduan ini menggunakan **2 Vercel Project** (frontend + backend) dan **Supabase** sebagai database.
> Semua layanan memiliki free tier yang cukup untuk kebutuhan produksi kecil-menengah.

---

## Arsitektur

```
[ Browser ]
     │
     ├──► Vercel Project 1 (Frontend)     ← apps/frontend (React + Vite)
     │         VITE_API_URL ─────────────────────────────────────────┐
     │                                                                 │
     └──► Vercel Project 2 (Backend API) ◄────────────────────────────┘
               apps/backend (Express → Serverless)
                    │
                    └──► Supabase (PostgreSQL)
```

---

## Prasyarat

- Akun [GitHub](https://github.com) — repository sudah di-push
- Akun [Vercel](https://vercel.com) — gratis
- Akun [Supabase](https://supabase.com) — gratis

---

## Langkah 0 — Push ke GitHub

Pastikan seluruh kode sudah di-push ke repository GitHub.

```bash
git add .
git commit -m "setup: vercel + supabase deployment"
git push origin main
```

---

## Langkah 1 — Setup Database di Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Isi nama project, password database, pilih region terdekat (Singapore / Southeast Asia)
3. Tunggu project selesai dibuat (~1-2 menit)
4. Buka **SQL Editor** → klik **New query**
5. Copy seluruh isi file `supabase/setup.sql` → paste → klik **Run**
6. Verifikasi: buka **Table Editor** → pastikan tabel `users`, `anggota`, `sessions`, `settings_groups` dll sudah ada

### Ambil Connection String

Buka **Settings → Database → Connection string**:

- **Mode: Session** (port `5432`) — untuk koneksi langsung
- **Mode: Transaction** (port `6543`) — untuk serverless (WAJIB digunakan di Vercel)

Salin connection string format **Transaction** karena Vercel berjalan serverless:

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> ⚠️ **Penting**: Gunakan port `6543` (Transaction Pooler) bukan `5432` untuk Vercel serverless.
> Koneksi `5432` pada serverless akan menyebabkan connection leak / timeout.

---

## Langkah 2 — Deploy Backend ke Vercel

### 2a. Import Project

1. Buka [vercel.com/new](https://vercel.com/new)
2. Klik **Import Git Repository** → pilih repository kamu
3. Di halaman konfigurasi:
   - **Root Directory**: `apps/backend`
   - **Framework Preset**: `Other`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: (kosongkan)
   - **Install Command**: (kosongkan)

### 2b. Environment Variables

Tambahkan semua variabel berikut di tab **Environment Variables**:

| Variable | Nilai | Keterangan |
|---|---|---|
| `NODE_ENV` | `production` | |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:6543/postgres` | Transaction pooler URL |
| `DB_HOST` | `aws-0-[region].pooler.supabase.com` | Host dari Supabase |
| `DB_PORT` | `6543` | Transaction pooler port |
| `DB_NAME` | `postgres` | |
| `DB_USER` | `postgres.[project-ref]` | |
| `DB_PASSWORD` | `[password-kamu]` | |
| `SESSION_SECRET` | *(string acak ≥ 32 karakter)* | Generate: `openssl rand -hex 32` |
| `CORS_ORIGIN` | `https://[nama-frontend].vercel.app` | URL frontend Vercel (isi setelah deploy frontend) |
| `JWT_SECRET` | *(string acak ≥ 32 karakter)* | |
| `UPLOAD_DIR` | `/tmp/uploads` | Vercel hanya bisa tulis ke /tmp |
| `LOG_LEVEL` | `info` | |

> Untuk `SESSION_SECRET` dan `JWT_SECRET`, gunakan password generator atau jalankan:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2c. Deploy

Klik **Deploy** → tunggu proses build selesai.

Setelah selesai, URL backend akan berformat:
```
https://[nama-project]-[hash].vercel.app
```

Catat URL ini untuk konfigurasi frontend.

---

## Langkah 3 — Deploy Frontend ke Vercel

### 3a. Import Project (kedua)

1. Kembali ke [vercel.com/new](https://vercel.com/new)
2. Import repository yang **sama**
3. Di halaman konfigurasi:
   - **Root Directory**: `apps/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build` (otomatis terdeteksi)
   - **Output Directory**: `dist` (otomatis)

### 3b. Environment Variables

| Variable | Nilai |
|---|---|
| `VITE_API_URL` | `https://[url-backend-vercel-kamu]` |

> Ganti `[url-backend-vercel-kamu]` dengan URL dari Langkah 2c.

### 3c. Deploy

Klik **Deploy** → tunggu selesai.

URL frontend akan berformat:
```
https://[nama-frontend].vercel.app
```

---

## Langkah 4 — Update CORS Backend

Setelah frontend berhasil di-deploy:

1. Buka Vercel Dashboard → **Project Backend** → **Settings → Environment Variables**
2. Edit variabel `CORS_ORIGIN`:
   ```
   https://[nama-frontend].vercel.app
   ```
3. Klik **Save** → klik **Redeploy** (atau push commit baru)

---

## Langkah 5 — Verifikasi

Buka URL frontend → coba login dengan:
- **Username**: `admin`
- **Password**: `Admin@2024`

> Segera ganti password setelah login pertama!

Jika berhasil login dan data muncul, deployment sukses. ✅

---

## Keterbatasan Vercel Serverless

| Aspek | Detail |
|---|---|
| **Timeout request** | 10 detik (free), 60 detik (Pro). Request panjang (export besar, backup) berisiko timeout |
| **Cold start** | Pertama kali dipanggil setelah idle, ada delay ~1-3 detik |
| **Scheduler / Cron** | Fitur jadwal otomatis (backup berkala, dll) **tidak berjalan** di serverless |
| **File upload** | File hanya tersimpan di `/tmp` — **dihapus setiap request selesai**. Untuk file persisten, gunakan Supabase Storage atau Cloudinary |
| **WebSocket** | Tidak didukung di Vercel serverless |
| **Memori** | 1024 MB per fungsi (free tier) |

---

## Troubleshooting

### Login gagal / CORS error
- Pastikan `CORS_ORIGIN` di backend **sama persis** dengan URL frontend (tanpa trailing slash)
- Pastikan `NODE_ENV=production` di-set di env vars backend

### Database connection error
- Pastikan menggunakan port `6543` (Transaction Pooler), **bukan** `5432`
- Cek `DATABASE_URL` tidak ada spasi atau karakter aneh

### 502 / Function Error
- Buka Vercel Dashboard → **Functions** → cek log error
- Kemungkinan build gagal → cek tab **Build Logs**

### File upload hilang
- Expected behavior. File di `/tmp` tidak persisten di Vercel.
- Untuk solusi permanen: integrasikan [Supabase Storage](https://supabase.com/docs/guides/storage)

---

## Perbandingan Opsi Deploy

| Fitur | Vercel Backend (Serverless) | Render.com (Always-on) |
|---|---|---|
| Setup | Mudah, 1 platform | Perlu akun Render terpisah |
| Harga free tier | Cukup untuk API ringan | 750 jam/bulan (cukup untuk 1 service) |
| Cold start | Ada (~1-3 detik) | Tidak ada (always-on) |
| Scheduler / Cron | ❌ Tidak berjalan | ✅ Berjalan normal |
| File upload persisten | ❌ /tmp saja | ✅ Disk persisten |
| Timeout | 10 detik (free) | Tidak ada batas khusus |
| WebSocket | ❌ | ✅ |
| Cocok untuk | API REST stateless, low traffic | Aplikasi penuh dengan fitur lengkap |

> Untuk aplikasi KTH BTM yang memiliki fitur backup dan scheduler, **Render.com lebih direkomendasikan**.
> Lihat [README.md](../README.md) untuk panduan deploy dengan Render.

---

## File Konfigurasi yang Dibuat

| File | Fungsi |
|---|---|
| `apps/backend/api/index.ts` | Entry point Vercel serverless |
| `apps/backend/vercel.json` | Konfigurasi Vercel untuk backend |
| `vercel.json` (root) | Konfigurasi Vercel untuk frontend |
| `supabase/setup.sql` | SQL lengkap untuk inisialisasi database |
| `apps/backend/.env.production.example` | Template environment variables |

# Tutorial Deploy: Vercel + Supabase

## Gambaran Arsitektur

```
Browser
  |
  |--► Vercel Project 1 (Frontend React/Vite)
  |         VITE_API_URL ──────────────────────────────┐
  |                                                      │
  └──► Vercel Project 2 (Backend Express/Serverless) ◄──┘
                │
                └──► Supabase (PostgreSQL)
```

---

## Persiapan — Buat 3 Akun Gratis

| Layanan | URL | Fungsi |
|---|---|---|
| GitHub | https://github.com | Menyimpan kode |
| Supabase | https://supabase.com | Database PostgreSQL |
| Vercel | https://vercel.com | Frontend + Backend hosting |

---

## Langkah 0 — Push Kode ke GitHub

Jika belum punya repository GitHub:

1. Buka github.com → klik **New** (tombol hijau)
2. Beri nama `berkahtanimandiri` → klik **Create repository**
3. Di terminal VS Code, jalankan perintah ini satu per satu:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/NAMA_KAMU/berkahtanimandiri.git
git push -u origin main
```

> Ganti `NAMA_KAMU` dengan username GitHub kamu.

---

## Langkah 1 — Setup Database di Supabase

1. Login ke **supabase.com** → klik **New project**
2. Isi form:
   - **Name**: `berkahtanimandiri`
   - **Database Password**: buat password kuat (simpan!)
   - **Region**: `Southeast Asia (Singapore)`
3. Klik **Create new project** → tunggu ~3–5 menit hingga status **healthy**
4. Klik **SQL Editor** di sidebar kiri
5. Klik **New query** → salin seluruh isi `supabase/setup.sql` → paste → klik **RUN**
6. Verifikasi: klik **Table Editor** → pastikan tabel `users`, `sessions`, dsb sudah ada

### Ambil Connection String

1. Klik **Settings** (gear icon) → **Database**
2. Scroll ke **Connection string** → pilih tab **Transaction** ← WAJIB ini!
3. Salin stringnya:

```
postgresql://postgres.[ref]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

> Port **6543** wajib digunakan di serverless (Vercel). Port 5432 akan timeout.

---

## Langkah 2 — Deploy Backend ke Vercel

### 2a. Import Project

1. Buka [vercel.com/new](https://vercel.com/new)
2. Klik **Import Git Repository** → pilih repository `berkahtanimandiri`
3. Konfigurasi:
   - **Root Directory**: klik Edit → ketik `apps/backend` → Continue
   - **Framework Preset**: `Other`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: *(kosongkan)*

### 2b. Environment Variables

| Variable | Nilai |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(connection string dari Langkah 1)* |
| `DB_HOST` | `aws-1-ap-southeast-1.pooler.supabase.com` |
| `DB_PORT` | `6543` |
| `DB_NAME` | `postgres` |
| `DB_USER` | `postgres.[project-ref]` |
| `DB_PASSWORD` | *(password Supabase)* |
| `SESSION_SECRET` | *(string acak ≥ 32 karakter — generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)* |
| `CORS_ORIGIN` | `https://berkahtanimandiri.vercel.app` *(update setelah Langkah 3)* |
| `BCRYPT_ROUNDS` | `10` |
| `MAX_LOGIN_ATTEMPTS` | `5` |
| `LOCKOUT_DURATION` | `900000` |
| `MAX_FILE_SIZE` | `10485760` |
| `UPLOAD_DIR` | `/tmp/uploads` |
| `PNBP_TARIF_PER_HA` | `15000` |
| `TAHUN_PNBP` | `2026` |
| `OTP_ISSUER` | `KTH-BTM` |
| `OTP_WINDOW` | `1` |

### 2c. Deploy

Klik **Deploy** → tunggu ~3–5 menit.

Setelah selesai, **salin URL backend** (contoh: `https://berkahtanimandiri-api.vercel.app`).

---

## Langkah 3 — Deploy Frontend ke Vercel

### 3a. Import Project (kedua, repo sama)

1. Kembali ke [vercel.com/new](https://vercel.com/new)
2. Import repository **berkahtanimandiri** yang sama
3. Konfigurasi:
   - **Root Directory**: klik Edit → ketik `apps/frontend` → Continue
   - **Framework Preset**: `Vite` *(otomatis terdeteksi)*

### 3b. Environment Variables

| Variable | Nilai |
|---|---|
| `VITE_API_URL` | `https://[url-backend-vercel]/api` ← URL dari Langkah 2c ditambah `/api` |

### 3c. Deploy

Klik **Deploy** → tunggu ~2–3 menit.

URL frontend contoh: `https://berkahtanimandiri.vercel.app`

---

## Langkah 4 — Update CORS Backend

1. Vercel Dashboard → **Project Backend** → **Settings → Environment Variables**
2. Edit `CORS_ORIGIN` → isi URL frontend sesungguhnya (tanpa `/` di akhir):
   ```
   https://berkahtanimandiri.vercel.app
   ```
3. **Save** → **Redeploy**

---

## Langkah 5 — Verifikasi

1. Buka URL frontend di browser
2. Login:
   - **Email**: `admin@kthbtm.id`
   - **Password**: `Admin@2024`
3. Dashboard muncul → ✅ Deploy berhasil!

> Segera ganti password admin setelah login pertama.

---

## Masalah Umum & Solusi

| Gejala | Solusi |
|---|---|
| Login gagal ("Email atau password salah") | Gunakan email `admin@kthbtm.id` (bukan `.com`) |
| CORS error di browser | Cek `CORS_ORIGIN` backend sama persis dengan URL frontend (tanpa trailing `/`) |
| Database connection failed | Pastikan port **6543** bukan 5432. Cek `DATABASE_URL` tidak ada spasi |
| 502 / Function Error | Vercel Dashboard → **Functions** → cek error log |
| File upload hilang | Expected — `/tmp` tidak persisten. Gunakan Supabase Storage untuk file permanen |
| Build error | Vercel Dashboard → tab **Build Logs** |
| Supabase project paused | Dashboard Supabase → klik **Restore project** → tunggu 2 menit |

---

## Catatan Keterbatasan Vercel Serverless

| Aspek | Detail |
|---|---|
| **Timeout request** | 10 detik (free tier). Request berat bisa timeout |
| **Cold start** | Delay ~1–3 detik setelah idle — normal |
| **Scheduler / Cron** | Tidak berjalan di serverless — backup otomatis tidak aktif |
| **File upload** | Hanya ke `/tmp` — dihapus setelah request selesai |

---

## Auto Deploy

Setiap `git push` ke `main` → Vercel otomatis rebuild dan deploy ulang.

---

## Custom Domain

Jika punya domain sendiri (misal `kthbtm.id`):
- Vercel Dashboard → **Settings → Domains → Add Domain**
- SSL otomatis aktif, tidak perlu setup tambahan

---

## Ringkasan URL Penting

| Layanan | URL |
|---|---|
| Frontend (Vercel) | `https://berkahtanimandiri.vercel.app` |
| Backend API (Vercel) | `https://berkahtanimandiri-api.vercel.app` |
| Database (Supabase) | `https://app.supabase.com/project/[project-id]` |

# Tutorial Deploy: Vercel + Supabase + Render

## Gambaran Arsitektur

```
Browser  ──►  Vercel  (Frontend React/Vite)
                │  VITE_API_URL
                ▼
             Render  (Backend Express)  ──►  Supabase (PostgreSQL)
```

---

## Persiapan — Buat 4 Akun Gratis

| Layanan | URL | Fungsi |
|---|---|---|
| GitHub | https://github.com | Menyimpan kode |
| Supabase | https://supabase.com | Database PostgreSQL |
| Render | https://render.com | Backend server |
| Vercel | https://vercel.com | Frontend web |

---

## Langkah 0 — Push Kode ke GitHub

Jika belum punya repository GitHub:

1. Buka github.com → klik **New** (tombol hijau)
2. Beri nama `berkahtanimandiri` → klik **Create repository**
3. Di terminal VS Code, jalankan perintah berikut satu per satu:

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
   - **Database Password**: buat password kuat (simpan, akan dipakai nanti!)
   - **Region**: `Southeast Asia (Singapore)`
3. Klik **Create new project** → tunggu sekitar **3–5 menit** hingga status berubah menjadi **"healthy"** (cek di Settings → General)
4. Jika muncul error `ECONNREFUSED` saat membuka SQL Editor → project belum siap, tunggu dan refresh browser
4. Setelah siap, klik **SQL Editor** di sidebar kiri
5. Klik **New query** → buka file `supabase/setup.sql` di VS Code → **copy semua isinya** → paste di SQL Editor → klik **RUN**
6. Verifikasi: klik **Table Editor** → pastikan tabel `users`, `anggota`, `sessions`, `settings_groups` dsb sudah muncul

### Ambil Connection String

1. Klik **Settings** (ikon gear di bagian bawah sidebar) → pilih **Database**
2. Scroll ke bagian **Connection string**
3. Pilih tab **Transaction** ← **WAJIB pilih ini, bukan Session!**
4. Salin stringnya yang bentuknya seperti:

```
postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

5. Ganti `[PASSWORD]` dengan password database yang dibuat di langkah 2

> ⚠️ **Penting**: Selalu gunakan **port 6543** (Transaction Pooler), bukan 5432.
> Port 5432 di environment cloud/serverless akan menyebabkan connection error atau timeout.

---

## Langkah 2 — Deploy Backend ke Render

1. Login ke **render.com** → klik **New +** → pilih **Web Service**
2. Pilih **Connect a repository** → klik **Connect GitHub** → authorize → pilih repo `berkahtanimandiri`
3. Isi konfigurasi berikut:

   | Field | Nilai |
   |---|---|
   | **Name** | `berkahtanimandiri-backend` |
   | **Root Directory** | `apps/backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |

4. Scroll ke bawah → klik **Advanced** → klik **Add Environment Variable**, tambahkan semua variabel berikut satu per satu:

   | Key | Value | Keterangan |
   |---|---|---|
   | `NODE_ENV` | `production` | |
   | `PORT` | `10000` | Port default Render |
   | `DATABASE_URL` | *(connection string dari Langkah 1)* | |
   | `DB_HOST` | `aws-0-ap-southeast-1.pooler.supabase.com` | Host dari conn string |
   | `DB_PORT` | `6543` | Transaction pooler port |
   | `DB_NAME` | `postgres` | |
   | `DB_USER` | `postgres.xxxx` | Bagian setelah `//` sampai tanda `:` pada conn string |
   | `DB_PASSWORD` | *(password Supabase kamu)* | |
   | `SESSION_SECRET` | *(string acak ≥ 32 karakter)* | Jalankan di terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` → salin outputnya |
   | `CORS_ORIGIN` | `https://berkahtanimandiri.vercel.app` | Isi sementara, akan diupdate setelah Langkah 3 |
   | `BCRYPT_ROUNDS` | `10` | |
   | `MAX_LOGIN_ATTEMPTS` | `5` | |
   | `LOCKOUT_DURATION` | `900000` | |
   | `MAX_FILE_SIZE` | `10485760` | |
   | `UPLOAD_DIR` | `/tmp/uploads` | Render hanya bisa tulis ke /tmp |
   | `PNBP_TARIF_PER_HA` | `15000` | |
   | `TAHUN_PNBP` | `2026` | |
   | `OTP_ISSUER` | `berkahtanimandiri` | |
   | `OTP_WINDOW` | `1` | |

5. Klik **Create Web Service** → tunggu proses build selesai (sekitar 5–10 menit)
6. Setelah selesai, URL backend akan muncul di bagian atas halaman, bentuknya:

```
https://berkahtanimandiri-backend.onrender.com
```

**Salin URL ini**, akan digunakan di Langkah 3.

---

## Langkah 3 — Deploy Frontend ke Vercel

1. Login ke **vercel.com** → klik **Add New → Project**
2. Klik **Import** di sebelah repo GitHub `berkahtanimandiri`
3. Di halaman konfigurasi:
   - Klik **Edit** di bagian **Root Directory** → ketik `apps/frontend` → klik **Continue**
   - **Framework Preset**: pastikan terpilih **Vite** (biasanya otomatis terdeteksi)
4. Buka bagian **Environment Variables**, tambahkan:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://berkahtanimandiri-backend.onrender.com` *(URL dari Langkah 2)* |

5. Klik **Deploy** → tunggu sekitar 2–3 menit
6. Setelah selesai, URL frontend akan muncul, bentuknya:

```
https://berkahtanimandiri.vercel.app
```

**Salin URL ini.**

---

## Langkah 4 — Update CORS di Render

Sekarang URL frontend sudah diketahui, update CORS di backend:

1. Buka Render Dashboard → klik service `berkahtanimandiri-backend`
2. Klik tab **Environment**
3. Cari variabel `CORS_ORIGIN` → klik **Edit**
4. Ganti nilainya dengan URL frontend yang benar:

```
https://berkahtanimandiri.vercel.app
```

5. Klik **Save Changes** → Render akan otomatis melakukan redeploy

---

## Langkah 5 — Verifikasi & Login Pertama

1. Buka URL frontend di browser: `https://berkahtanimandiri.vercel.app`
2. Login dengan akun default:
   - **Email**: `admin@kthbtm.com`
   - **Password**: `Admin@2024`
3. Jika dashboard berhasil tampil → ✅ **Deploy berhasil!**

> ⚠️ **Segera ganti password admin** setelah login pertama! Gunakan menu di header → dropdown user → **Ubah Password**.

---

## Masalah Umum & Solusi

| Gejala | Solusi |
|---|---|
| Halaman tampil tapi login gagal | Cek `VITE_API_URL` di Vercel sudah benar dan tanpa `/` di akhir |
| CORS error di browser console | Cek `CORS_ORIGIN` di Render **sama persis** dengan URL frontend (tanpa `/` di akhir) |
| `Database connection failed` | Pastikan pakai port **6543**, bukan 5432. Cek `DATABASE_URL` tidak ada spasi |
| Backend Render lambat 30–50 detik | Normal — free tier "tidur" jika tidak ada request selama 15 menit. Lihat solusi di bawah |
| File upload hilang setelah beberapa waktu | Normal di free tier — `/tmp` tidak persisten. Untuk produksi, integrasikan Supabase Storage |
| Build error di Render | Cek log build di Render Dashboard → tab **Logs** |
| `ECONNREFUSED ... :5432` di Supabase SQL Editor | Project Supabase sedang **paused**. Buka dashboard Supabase → klik **Restore project** → tunggu 2 menit → coba lagi |
| SQL Editor Supabase error saat project baru dibuat | Project masih inisialisasi. Tunggu 2–3 menit → refresh halaman → coba jalankan query ulang |

---

## Tips Penting

### Mencegah Backend Render "Tidur"

Free tier Render akan mematikan server jika tidak ada request selama 15 menit. Request pertama setelah tidur butuh ~30–50 detik.

**Solusi gratis**: Daftar di [uptimerobot.com](https://uptimerobot.com) → tambahkan monitor **HTTP** ke URL:

```
https://berkahtanimandiri-backend.onrender.com/health
```

Set interval **setiap 10 menit** → server tidak akan pernah tidur.

### Auto Deploy

Setiap kali kamu melakukan `git push`, **Vercel dan Render akan otomatis rebuild dan deploy ulang**. Tidak perlu deploy manual lagi.

### Custom Domain

Jika punya domain sendiri (misal `kthbtm.com`):
- **Vercel**: Settings → Domains → Add Domain
- **Render**: Settings → Custom Domains → Add Custom Domain

Keduanya gratis, termasuk SSL otomatis.

---

## Ringkasan URL Penting

Setelah semua langkah selesai, catat URL-URL ini:

| Layanan | URL |
|---|---|
| Frontend (Vercel) | `https://berkahtanimandiri.vercel.app` |
| Backend (Render) | `https://berkahtanimandiri-backend.onrender.com` |
| Database (Supabase) | `https://app.supabase.com/project/[project-id]` |
| Supabase SQL Editor | `https://app.supabase.com/project/[project-id]/sql` |

# 🌳 Sistem Informasi KTH Berkah Tani Mandiri

> **Sistem Administrasi Resmi KTH** — Tertib Administrasi, Kepatuhan PNBP, Transparansi Keuangan, Kesiapan Audit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ecf8e)](https://supabase.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://vercel.com/)
[![Backend](https://img.shields.io/badge/Backend-Vercel-black)](https://vercel.com/)

---

## 📋 Deskripsi

Web Application untuk **Kelompok Tani Hutan (KTH) Berkah Tani Mandiri** yang mendukung:

- ✅ Tertib administrasi anggota & lahan KHDPK
- ✅ Perhitungan & pencatatan PNBP otomatis
- ✅ Manajemen keuangan transparan
- ✅ Laporan resmi siap audit (PDF & Excel)
- ✅ Offline-first (PWA)
- ✅ Keamanan & audit trail lengkap
- ✅ Two-Factor Authentication (2FA)
- ✅ Role-based access control (RBAC)

---

## 🏗️ Arsitektur

### Development (Lokal)
```
Browser → Frontend :5173 → Backend :5001 → PostgreSQL :5433
```

### Production (Cloud)
```
Browser → Vercel Project 1 (Frontend) → Vercel Project 2 (Backend) → Supabase (Database)
```

```
Monorepo Structure:
├── apps/
│   ├── frontend/          → React + Vite + PWA          (deploy: Vercel)
│   └── backend/           → Node.js + Express + Drizzle (deploy: Vercel)
├── packages/
│   └── shared/            → Shared types & validators
├── supabase/
│   └── setup.sql          → SQL lengkap setup database Supabase
├── docs/                  → Dokumentasi & SOP
├── apps/frontend/vercel.json  → Konfigurasi Vercel frontend
└── apps/backend/vercel.json   → Konfigurasi Vercel backend
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** + **TypeScript 5.6**
- **Vite 5.4** (build tool)
- **Wouter** (routing)
- **TailwindCSS 3.4** (styling)
- **React Hook Form + Zod** (form & validasi)
- **Recharts** (grafik & chart)
- **PWA** (offline support)

### Backend
- **Node.js 20+** + **Express 4.21** + **TypeScript**
- **Drizzle ORM** + **PostgreSQL**
- **Express Session** + **connect-pg-simple**
- **bcrypt** (password hashing)
- **Helmet + CORS + CSRF** (keamanan)
- **Speakeasy** (2FA/OTP)
- **Nodemailer** (email)

### Database & Deployment
- **Supabase** — PostgreSQL cloud (production)
- **Vercel** — Frontend + Backend hosting (production)
- **PostgreSQL 18** — Local development

---

## 🚀 Instalasi (Development Lokal)

### Prerequisites
```
Node.js >= 20.0.0
PostgreSQL >= 16.0
npm >= 10.0.0
```

### Setup

**1. Clone & Install**
```bash
git clone https://github.com/NAMA/kth-btm.git
cd kth-btm
npm install
```

**2. Setup Environment**
```bash
# Copy env template
cp apps/backend/.env.production.example apps/backend/.env

# Edit sesuai database lokal Anda
# DB_HOST=localhost, DB_PORT=5433, DB_NAME=kth_btm
```

**3. Setup Database**
```bash
# Jalankan SQL di PostgreSQL lokal menggunakan file:
# supabase/setup.sql
# Atau jalankan migration:
cd apps/backend
npx tsx scripts/run-migration-001.ts
```

**4. Jalankan Development**
```bash
# Di root folder — jalankan backend + frontend sekaligus
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

---

## 📦 Modul Sistem

| No | Modul | Fitur Utama |
|----|-------|-------------|
| 1 | **Manajemen Anggota** | Registrasi, kartu anggota, QR code, import Excel |
| 2 | **Manajemen Lahan KHDPK** | Register lahan, peta, status legalitas |
| 3 | **Manajemen PNBP** | Perhitungan otomatis, bukti setor, rekap tahunan |
| 4 | **Manajemen Keuangan** | Kas masuk/keluar, laporan keuangan, verifikasi |
| 5 | **Manajemen Aset** | Inventaris aset KTH, kondisi, nilai perolehan |
| 6 | **Manajemen Kegiatan** | Tanam, panen, produksi, dokumentasi |
| 7 | **Manajemen Dokumen** | SK, AD/ART, arsip digital, versioning |
| 8 | **Audit Trail** | Log semua perubahan data, compliance audit |
| 9 | **Settings** | Profil organisasi, backup, keamanan sistem |

---

## 🔐 Keamanan

- ✅ Session-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (RBAC)
- ✅ Two-Factor Authentication (2FA/TOTP)
- ✅ CSRF Protection
- ✅ Helmet security headers
- ✅ Rate limiting (anti brute force)
- ✅ Input sanitization
- ✅ NIK uniqueness validation
- ✅ Audit trail lengkap

---

## 👥 Role & Akses

| Role | Akses |
|------|-------|
| **admin** | Full access semua modul + settings sistem |
| **ketua** | Full access semua modul |
| **sekretaris** | Anggota, lahan, dokumen, kegiatan |
| **bendahara** | Keuangan, PNBP, aset |
| **anggota** | Read-only data pribadi |

**Default login** (development & setelah setup production):
- Username: `admin`
- Password: `Admin@2024`
- ⚠️ **Segera ganti password setelah login pertama!**

---

## 📊 Output Laporan

Semua laporan tersedia dalam format **PDF** dan **Excel**:

- Buku Induk Anggota
- Register Lahan KHDPK
- Rekap PNBP Tahunan
- Laporan Keuangan
- Inventaris Aset
- Laporan Kegiatan & Produksi

---

## 📝 Scripts

```bash
npm run dev              # Jalankan backend + frontend sekaligus
npm run dev:frontend     # Frontend only (port 5173)
npm run dev:backend      # Backend only (port 5001)
npm run build            # Build production
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Jalankan migrations
npm run db:studio        # Drizzle Studio GUI (browser)
npm test                 # Run tests
npm run lint             # Lint code
npm run format           # Format code dengan Prettier
```

---

## 🌐 Deploy ke Production (Vercel + Supabase)

Aplikasi ini siap deploy dengan arsitektur gratis:
**Supabase** (Database) + **Vercel** (Frontend + Backend)

Lihat panduan lengkap di **[docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md)**.

---

### Ringkasan Langkah Deploy

| # | Langkah | Platform |
|---|---|---|
| 1 | Setup database & jalankan `supabase/setup.sql` | Supabase |
| 2 | Deploy backend (root dir: `apps/backend`) | Vercel |
| 3 | Deploy frontend (root dir: `apps/frontend`) | Vercel |
| 4 | Update `CORS_ORIGIN` di backend dengan URL frontend | Vercel |

### Environment Variables Backend (Vercel)

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(Supabase Transaction Pooler URL — port 6543)* |
| `SESSION_SECRET` | *(random string ≥ 32 karakter)* |
| `CORS_ORIGIN` | `https://[nama-frontend].vercel.app` |
| `UPLOAD_DIR` | `/tmp/uploads` |

### Environment Variables Frontend (Vercel)

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://[nama-backend].vercel.app/api` |

### ✅ Test Akhir

1. Buka URL Vercel frontend di browser
2. Login: **email** `admin@kthbtm.id`, **password** `Admin@2024`
3. **Segera ganti password** setelah masuk pertama kali!

---

### ⚠️ Hal Penting yang Perlu Diketahui

| # | Hal | Keterangan |
|---|---|---|
| 1 | **Cold start Vercel** | Delay ~1–3 detik pada request pertama setelah idle — normal |
| 2 | **File upload sementara** | File disimpan di `/tmp`, terhapus setelah request. Gunakan Supabase Storage untuk file permanen |
| 3 | **Scheduler tidak aktif** | Fitur backup/scheduler otomatis tidak berjalan di serverless |
| 4 | **Custom domain** | Vercel mendukung custom domain di semua tier (SSL otomatis) |
| 5 | **Backup database** | Supabase free tier punya backup harian 7 hari |

---

## 📚 Dokumentasi

Lihat folder [docs/](docs/) untuk panduan lengkap:

| File | Isi |
|------|-----|
| [QUICKSTART.md](docs/QUICKSTART.md) | Panduan cepat mulai |
| [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Setup detail development |
| [Database_ERD.md](docs/Database_ERD.md) | Skema & relasi database |
| [USER_ROLES_ACCESS.md](docs/USER_ROLES_ACCESS.md) | Hak akses per role |
| [SOP_Penggunaan.md](docs/SOP_Penggunaan.md) | SOP penggunaan sistem |
| [Security_Guide.md](docs/Security_Guide.md) | Panduan keamanan |
| [BULK_IMPORT_GUIDE.md](docs/BULK_IMPORT_GUIDE.md) | Import data massal via Excel |
| [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) | Rencana pengembangan fitur |

---

## 📄 License

Proprietary — KTH Berkah Tani Mandiri © 2026

---

**Built with ❤️ for KTH Berkah Tani Mandiri**

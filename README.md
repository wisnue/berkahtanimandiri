# 🌳 Sistem Informasi KTH Berkah Tani Mandiri

> **Sistem Administrasi Resmi KTH** - Tertib Administrasi, Kepatuhan PNBP, Transparansi Keuangan, Kesiapan Audit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue)](https://www.postgresql.org/)

---

## 📋 Deskripsi

Web Application untuk **Kelompok Tani Hutan (KTH) Berkah Tani Mandiri** yang mendukung:

- ✅ Tertib administrasi anggota & lahan KHDPK
- ✅ Perhitungan & pencatatan PNBP otomatis
- ✅ Manajemen keuangan transparan
- ✅ Laporan resmi siap audit
- ✅ Offline-first (PWA)
- ✅ Keamanan & audit trail lengkap

---

## 🏗️ Arsitektur

```
Monorepo Structure:
├── apps/
│   ├── frontend/    → React + Vite + PWA
│   └── backend/     → Node.js + Express + Drizzle
├── packages/
│   ├── shared/      → Shared types & validators
│   └── config/      → ESLint, Prettier, Tailwind
└── docs/           → Dokumentasi & SOP
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** + **TypeScript 5.6**
- **Vite 5.4** (build tool)
- **Wouter 3.7** (routing)
- **TailwindCSS 3.4** + **Radix UI / Shadcn**
- **React Hook Form 7.55** + **Zod 3.24**
- **TanStack Query 5.60**
- **Recharts 2.15** (charts)
- **Framer Motion** (animations)

### Backend
- **Node.js 20+** + **Express 4.21**
- **TypeScript 5.6**
- **Drizzle ORM 0.39** + **PostgreSQL**
- **Express Session** + **connect-pg-simple**
- **bcrypt 5.1** (password hashing)
- **Helmet 8.1** (security)
- **Socket.io** (realtime)

### Database
- **PostgreSQL 16+**
- **Drizzle Kit** (migrations)

### Additional
- **jsPDF** + **autoTable** (PDF export)
- **XLSX** (Excel export)
- **QRCode** (kartu anggota)
- **Speakeasy** (2FA/OTP)

---

## 🚀 Instalasi

### Prerequisites
```bash
Node.js >= 20.0.0
PostgreSQL >= 16.0
npm >= 10.0.0
```

### Setup

1. **Clone & Install**
```bash
git clone <repository-url>
cd KTHBTM
npm install
```

2. **Setup Database**
```bash
# Buat database PostgreSQL
createdb kth_btm

# Copy environment variables
cp .env.example .env

# Edit .env dengan kredensial database Anda
```

3. **Run Migrations**
```bash
npm run db:generate
npm run db:migrate
```

4. **Start Development**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

---

## 📦 Modul Sistem

1. **Manajemen Anggota** - Registrasi, kartu anggota, QR code
2. **Manajemen Lahan KHDPK** - Register lahan, relasi anggota
3. **Manajemen PNBP** - Perhitungan otomatis, bukti setor
4. **Manajemen Keuangan** - Kas masuk/keluar, laporan keuangan
5. **Manajemen Aset** - Inventaris aset KTH
6. **Manajemen Kegiatan** - Tanam, panen, produksi
7. **Manajemen Dokumen** - SK, AD/ART, arsip digital
8. **Manajemen Pengguna** - Role-based access, 2FA, audit trail

---

## 🔐 Keamanan

- ✅ Session-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (RBAC)
- ✅ 2FA/OTP login
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Activity logging (audit trail)
- ✅ Rate limiting

---

## 📊 Output Laporan

Semua laporan tersedia dalam format **PDF** dan **Excel**:

- Buku Anggota
- Register Lahan KHDPK
- Rekap PNBP Tahunan
- Laporan Keuangan
- Laporan Aset
- Laporan Kegiatan & Produksi
- Laporan Tahunan KTH

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test:watch
```

---

## 📝 Scripts

```bash
npm run dev              # Dev mode (backend + frontend)
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only
npm run build            # Build production
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:studio        # Drizzle Studio GUI
npm test                 # Run tests
npm run lint             # Lint code
npm run format           # Format code
```

---

## 📚 Dokumentasi

Lihat folder [docs/](docs/) untuk:
- SOP Penggunaan
- SOP PNBP
- Database ERD
- API Specification
- Audit Guide

---

## 👥 Role & Akses

| Role | Akses |
|------|-------|
| **Ketua** | Full access semua modul |
| **Sekretaris** | Manajemen anggota, lahan, dokumen |
| **Bendahara** | Keuangan, PNBP, aset |
| **Anggota** | Read-only data pribadi |

---

## 🌐 Offline-First (PWA)

Aplikasi dapat digunakan **offline** dan akan sinkronisasi otomatis saat online.

---

## 📄 License

Proprietary - KTH Berkah Tani Mandiri © 2025

---

## 📞 Support

Untuk bantuan teknis, hubungi tim IT KTH BTM.

---

**Built with ❤️ for KTH Berkah Tani Mandiri**

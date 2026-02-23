# 🚀 Panduan Setup & Instalasi

## Sistem Informasi KTH Berkah Tani Mandiri

---

## 📋 Prerequisites

Pastikan sistem Anda memiliki:

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 16.0
- **npm** >= 10.0.0
- **Git** (optional)

---

## 🔧 Langkah Instalasi

### 1. Install Dependencies

```bash
# Di root project
npm install

# Install dependencies backend
cd apps/backend
npm install

# Install dependencies frontend
cd ../frontend
npm install
cd ../..
```

---

### 2. Setup Database PostgreSQL

#### A. Buat Database

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE kth_btm;

# Keluar
\q
```

#### B. Konfigurasi Environment Variables

```bash
# Copy file .env.example
copy .env.example .env
```

Edit file `.env` dan sesuaikan dengan kredensial database Anda:

```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kth_btm
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kth_btm
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD

# Session Secret (GANTI dengan string random yang aman!)
SESSION_SECRET=ganti-dengan-random-string-minimal-32-karakter

# CORS
CORS_ORIGIN=http://localhost:5173

# PNBP
PNBP_TARIF_PER_HA=15000
TAHUN_PNBP=2025
```

---

### 3. Generate & Run Database Migrations

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

---

### 4. Seed Data Awal (Optional)

Buat file `apps/backend/src/scripts/seed.ts` untuk data awal:

```typescript
// Akan dibuat untuk insert data admin default
```

---

### 5. Jalankan Aplikasi

#### Development Mode

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend (buka terminal baru)
npm run dev:frontend
```

#### Atau jalankan keduanya sekaligus:

```bash
npm run dev
```

---

## 🌐 Akses Aplikasi

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🔑 Login Default

Setelah seed data:

- **Username**: `admin` atau `3201234567890123` (NIK)
- **Password**: `admin123`
- **Role**: Ketua

---

## 🗄️ Database Management

### Lihat Database dengan Drizzle Studio

```bash
npm run db:studio
```

Akses di: http://localhost:4983

### Backup Database

```bash
# Backup
pg_dump -U postgres kth_btm > backup_kth_btm.sql

# Restore
psql -U postgres kth_btm < backup_kth_btm.sql
```

---

## 🏗️ Build untuk Production

### Build Frontend

```bash
cd apps/frontend
npm run build
```

Output di: `apps/frontend/dist/`

### Build Backend

```bash
cd apps/backend
npm run build
```

Output di: `apps/backend/dist/`

### Jalankan Production

```bash
# Backend
cd apps/backend
npm start

# Frontend (static server)
cd apps/frontend
npm run preview
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

---

## 📁 Struktur File Penting

```
KTHBTM/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/         # Konfigurasi
│   │   │   ├── db/schema/      # Database schema
│   │   │   ├── routes/         # API routes
│   │   │   ├── controllers/    # Controllers
│   │   │   ├── services/       # Business logic
│   │   │   ├── middlewares/    # Middleware
│   │   │   └── utils/          # Utilities
│   │   └── drizzle.config.ts   # Drizzle config
│   └── frontend/
│       └── src/
│           ├── components/     # React components
│           ├── pages/          # Pages
│           ├── services/       # API services
│           └── styles/         # CSS
├── .env                        # Environment variables
└── package.json
```

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Pastikan PostgreSQL running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Port Already in Use

```bash
# Cek port yang digunakan
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Kill process jika perlu
taskkill /PID <PID> /F
```

### Module Not Found

```bash
# Clear node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Dokumentasi Lanjutan

- [Database ERD](./Database_ERD.md)
- [API Documentation](./API_Spec.md)
- [SOP Penggunaan](./SOP_Penggunaan.md)

---

## 🆘 Support

Untuk bantuan teknis:
- Email: support@kthbtm.id
- WhatsApp: +62 xxx xxxx xxxx

---

**Happy Coding! 🌳**

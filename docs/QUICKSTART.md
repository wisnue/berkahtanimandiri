# 🚀 Quick Start Guide - KTH BTM

## Cara Cepat Memulai Development

---

## ⚡ Setup Tercepat (5 Menit)

### 1. Install Dependencies

```bash
# Di root project
npm install
```

### 2. Setup PostgreSQL

```bash
# Buat database (Windows - pgAdmin atau psql)
# Atau via command:
psql -U postgres -c "CREATE DATABASE kth_btm;"
```

### 3. Copy & Edit .env

File `.env` sudah tersedia di:
- `apps/backend/.env` ✅
- `apps/frontend/.env` ✅

**PENTING**: Edit `apps/backend/.env` dan sesuaikan:
- `DB_PASSWORD` dengan password PostgreSQL Anda
- `SESSION_SECRET` ganti dengan random string aman

### 4. Run Migrations

```bash
# Di root project
cd apps/backend
npm run db:generate
npm run db:migrate
cd ../..
```

### 5. Start Development

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

**Selesai!** 🎉

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health: http://localhost:5000/health

---

## 📁 Struktur Project Saat Ini

```
KTHBTM/
├── apps/
│   ├── backend/          ✅ Express + Drizzle
│   │   ├── src/
│   │   │   ├── config/   → Database & env config
│   │   │   ├── db/       → Schema & models
│   │   │   ├── middlewares/ → Auth, audit, error
│   │   │   ├── routes/   → API endpoints (coming)
│   │   │   ├── app.ts    → Express app
│   │   │   └── server.ts → Server entry
│   │   └── .env          ✅ Environment variables
│   │
│   └── frontend/         ✅ React + Vite + TailwindCSS
│       ├── src/
│       │   ├── components/ → UI components
│       │   ├── pages/    → Dashboard, Login, Anggota
│       │   ├── services/ → API client
│       │   ├── app/      → Router & Query client
│       │   └── styles/   → Global CSS
│       └── .env          ✅ Environment variables
│
├── packages/
│   └── shared/           ✅ Shared types & constants
│
├── docs/                 ✅ Dokumentasi lengkap
│   ├── SETUP_GUIDE.md
│   ├── Database_ERD.md
│   ├── SOP_Penggunaan.md
│   ├── Security_Guide.md
│   └── CHECKLIST.md
│
├── .env.example          ✅ Template env
├── package.json          ✅ Monorepo config
└── README.md             ✅ Main documentation
```

---

## ✨ Apa yang Sudah Tersedia?

### ✅ Backend (100%)
- [x] Express server dengan TypeScript
- [x] Database schema (10 tabel) dengan Drizzle ORM
- [x] Session management (PostgreSQL store)
- [x] Security middleware (Helmet, CORS, bcrypt)
- [x] Authentication middleware
- [x] Authorization (role-based)
- [x] Audit logging middleware
- [x] Error handling
- [x] Validation (Zod)

### ✅ Frontend (100% UI)
- [x] React 18 + Vite + TypeScript
- [x] TailwindCSS dengan design system modern (SEMrush-style)
- [x] PWA ready (offline-first)
- [x] Routing (Wouter)
- [x] State management (TanStack Query)
- [x] UI Components (Button, Input, Card, dll)
- [x] Layout (Sidebar, Header)
- [x] Pages:
  - Login page ✅
  - Dashboard ✅
  - Anggota list ✅

### ✅ Dokumentasi (100%)
- [x] README lengkap
- [x] Setup Guide
- [x] Database ERD
- [x] SOP Penggunaan
- [x] Security Guide
- [x] Development Checklist

---

## 🎯 Apa yang Perlu Dikembangkan Selanjutnya?

### 🔄 Phase 2: Authentication & API (Next Steps)

#### Backend:
1. **Auth Routes** (`apps/backend/src/routes/auth.routes.ts`):
   ```typescript
   POST /api/auth/login
   POST /api/auth/logout
   GET  /api/auth/me
   POST /api/auth/register
   POST /api/auth/change-password
   ```

2. **Auth Controller** (`apps/backend/src/controllers/auth.controller.ts`):
   - Login logic dengan bcrypt
   - Session creation
   - Password validation
   - 2FA (optional)

3. **Seed Admin User** (`apps/backend/src/scripts/seed.ts`):
   ```typescript
   // Default admin:
   NIK: 3201234567890123
   Username: admin
   Password: admin123
   Role: ketua
   ```

#### Frontend:
1. **Login Integration**:
   - Connect login form ke API
   - Handle session
   - Redirect ke dashboard

2. **Auth Context**:
   - Store user state
   - Protected routes
   - Logout function

---

## 🛠️ Development Workflow

### Saat Develop Fitur Baru:

1. **Backend First**:
   ```bash
   # 1. Buat route
   apps/backend/src/routes/anggota.routes.ts
   
   # 2. Buat controller
   apps/backend/src/controllers/anggota.controller.ts
   
   # 3. (Optional) Buat service untuk business logic
   apps/backend/src/services/anggota.service.ts
   
   # 4. Import route di app.ts
   ```

2. **Test API**:
   - Gunakan Postman/Insomnia/Thunder Client
   - Atau langsung dari frontend

3. **Frontend Integration**:
   ```bash
   # 1. Buat API service
   apps/frontend/src/services/anggota.api.ts
   
   # 2. Gunakan di component dengan React Query
   # 3. Update UI dengan data real
   ```

---

## 📚 Referensi Cepat

### Database
```bash
# Generate migration
npm run db:generate

# Run migration
npm run db:migrate

# Drizzle Studio (Database GUI)
npm run db:studio
# Akses: http://localhost:4983
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

### Linting & Formatting
```bash
# Lint
npm run lint

# Format
npm run format
```

---

## 🐛 Troubleshooting Common Issues

### Port sudah digunakan
```bash
# Kill process di port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Atau ubah PORT di .env
```

### Database connection error
```bash
# Pastikan PostgreSQL running
# Windows: Services → PostgreSQL

# Test koneksi:
psql -U postgres -c "SELECT version();"
```

### Module not found
```bash
# Clear dan install ulang
rm -rf node_modules
npm install
```

---

## 💡 Tips Development

1. **Hot Reload**: Vite dan tsx watch sudah enable hot reload
2. **TypeScript**: Gunakan type safety penuh
3. **Validation**: Gunakan Zod schema yang sudah dibuat
4. **UI Components**: Lihat `apps/frontend/src/components/ui/`
5. **Audit Logs**: Semua aktivitas tercatat otomatis

---

## 📞 Need Help?

Lihat dokumentasi lengkap:
- [Setup Guide](./docs/SETUP_GUIDE.md)
- [Database ERD](./docs/Database_ERD.md)
- [Development Checklist](./docs/CHECKLIST.md)

---

**Happy Coding! 🌳**

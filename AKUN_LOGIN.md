# 🔐 Akun Login - KTH Berkah Tani Mandiri

## Akun Administrator

### Akun 1 (Admin Utama)
| Field | Value |
|-------|-------|
| **Email** | admin@kthbtm.com |
| **Password** | admin123 |
| **Role** | Ketua (Administrator) |
| **Username** | admin |

### Akun 2 (Test User)
| Field | Value |
|-------|-------|
| **Email** | test@kthbtm.com |
| **Password** | test123 |
| **Role** | Ketua (Administrator) |
| **Username** | testuser |

---

## ⚙️ Cara Menjalankan Aplikasi

### PENTING: Jalankan Backend Dulu!

### 1. Start Backend Server (Terminal 1)
```powershell
cd "c:\Users\maswi\Documents\KTH BTM\KTHBTM\apps\backend"
npm run dev
```
**Tunggu sampai muncul**: `🚀 Server running on port 5001`

### 2. Start Frontend Server (Terminal 2 - BARU)
```powershell
cd "c:\Users\maswi\Documents\KTH BTM\KTHBTM\apps\frontend"
npm run dev
```
**Tunggu sampai muncul**: `Local: http://localhost:5173/`

---

## 🌐 URL Akses

- **Frontend (UI)**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/health

---

## 🔑 Cara Login

1. **Pastikan backend sudah running** (cek http://localhost:5001/health di browser)
2. Buka frontend: http://localhost:5173
3. Pilih salah satu akun:
   - Email: `admin@kthbtm.com` | Password: `admin123`
   - Email: `test@kthbtm.com` | Password: `test123`
4. Klik tombol **Masuk**

---

## 🔧 Troubleshooting

### ❌ "Failed to fetch" Error?

**Penyebab**: Backend tidak running atau CORS issue

**Solusi**:
```powershell
# 1. Check apakah backend running
# Buka browser: http://localhost:5001/health
# Harus muncul: {"status":"ok"}

# 2. Restart backend
cd "c:\Users\maswi\Documents\KTH BTM\KTHBTM\apps\backend"
# Ctrl+C untuk stop
npm run dev

# 3. Check port sudah benar
# Frontend .env harus: VITE_API_URL=http://localhost:5001/api
```

### 🔒 Login Gagal "Email atau Password Salah"?

```powershell
# Reset password admin
cd "c:\Users\maswi\Documents\KTH BTM\KTHBTM\apps\backend"
npx tsx src/scripts/reset-admin-password.ts

# Atau buat user test baru
npx tsx src/scripts/create-test-user.ts
```

### 🗄️ Database Kosong?
```powershell
cd "c:\Users\maswi\Documents\KTH BTM\KTHBTM\apps\backend"
npm run db:seed
```

### 🔍 Check Database
```powershell
cd "c:\Users\maswi\Documents\KTH BTM\KTHBTM\apps\backend"
npm run db:studio
# Buka: https://local.drizzle.studio
```

---

## ✅ Checklist Sebelum Login

- [ ] PostgreSQL database running (port 5433)
- [ ] Backend running di http://localhost:5000 
- [ ] Frontend running di http://localhost:5173
- [ ] Buka http://localhost:5000/health → harus return `{"status":"ok"}`
- [ ] Browser tidak block CORS

---

## 📝 Catatan Keamanan

⚠️ **PENTING**: 
- Password default hanya untuk development
- Segera ubah password setelah login pertama
- Jangan gunakan password ini di production

---

_Dibuat: 3 Februari 2026_  
_Terakhir update: 3 Februari 2026_  
_Password admin direset: 3 Februari 2026_  
_User test dibuat: 3 Februari 2026_

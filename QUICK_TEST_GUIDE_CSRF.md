# 🧪 Quick Test Guide - CSRF Token Fix

**Status**: ✅ Code fixes complete, ready for testing  
**Date**: February 15, 2026  
**Issue**: "CSRF token tidak ditemukan" errors when creating/saving data

---

## 🎯 What Was Fixed

### **Root Cause**
Frontend `ApiClient` was NOT sending CSRF tokens to backend → All POST/PUT/DELETE requests rejected with 403 Forbidden.

### **Solution**
Enhanced `apps/frontend/src/services/api.ts` with:
- ✅ Auto-fetch CSRF token on app startup
- ✅ Add `x-csrf-token` header to all state-changing requests
- ✅ Auto-refresh token if expired
- ✅ Retry failed requests with fresh token

---

## 🚀 How to Test (Quick Version)

### **Step 1: Run Automated Tests** (2 minutes)

```powershell
# From project root
.\scripts\run-all-csrf-tests.ps1
```

**Expected**: ✅ All 3 tests PASS

---

### **Step 2: Manual Browser Test** (5 minutes)

1. **Start servers** (if not running):
   ```powershell
   # Terminal 1: Backend
   cd apps/backend
   npm run dev

   # Terminal 2: Frontend
   cd apps/frontend
   npm run dev
   ```

2. **Open browser**: http://localhost:5173

3. **Login** with your admin account

4. **Test ANY create function**:
   - Go to Anggota page
   - Click "Tambah Anggota"
   - Fill required fields
   - Click "Simpan Data"

5. **Check result**:
   - ✅ **PASS**: Green toast "Data anggota berhasil ditambahkan!"
   - ❌ **FAIL**: Red toast "CSRF token tidak ditemukan"

---

## 📊 Test All 7 Pages (10 minutes)

Test create/upload on each page:

| # | Page | Button | Expected Result |
|---|------|--------|-----------------|
| 1 | `/dashboard/anggota` | Tambah Anggota | ✅ Green toast |
| 2 | `/dashboard/aset` | Tambah Aset | ✅ Green toast |
| 3 | `/dashboard/kegiatan` | Tambah Kegiatan | ✅ Green toast |
| 4 | `/dashboard/dokumen` | Upload Dokumen | ✅ Green toast |
| 5 | `/dashboard/lahan` | Tambah Lahan | ✅ Green toast |
| 6 | `/dashboard/keuangan` | Tambah Transaksi | ✅ Green toast |
| 7 | `/dashboard/dokumen-organisasi` | Upload Dokumen | ✅ Green toast |

**Mark ✅ when green toast appears, ❌ if red error**

---

## 🛠️ DevTools Verification (Advanced)

### **Check CSRF Token is Being Sent**

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to create anggota
4. Find request: `POST /api/anggota`
5. Click it → **Headers** tab
6. Scroll to **Request Headers**
7. **Must see**: `x-csrf-token: <some-long-string>`

**Example**:
```
POST /api/anggota HTTP/1.1
Host: localhost:5001
Content-Type: application/json
x-csrf-token: 8kY2mP9nQ7vR4wX6zA1bC3dE5fG8hJ0kL2mN4oP6qR8s  ✅ THIS MUST BE PRESENT
```

---

### **Check Response Status**

In same request in Network tab:
- **Response** tab → Should show:
  ```json
  {
    "success": true,
    "message": "Data anggota berhasil ditambahkan",
    "data": { ... }
  }
  ```

- **Headers** tab → Status: `200 OK` (NOT 403!)

---

### **Check Console Logs**

Open **Console** tab in DevTools:

**On page load**, should see:
```
CSRF token fetched successfully
```

**If token invalid** (rare), might see:
```
CSRF token invalid, refreshing...
```

---

## ❌ Troubleshooting

### **Still getting "CSRF token tidak ditemukan"**

1. **Check backend is running**:
   ```powershell
   # Should see: Server running on http://localhost:5001
   ```

2. **Check console logs**:
   - Open DevTools Console
   - Look for "CSRF token fetched successfully"
   - If missing, check Network tab for failed `/api/csrf-token` request

3. **Hard refresh**:
   - Press Ctrl+Shift+R (clear cache)
   - Or close browser completely and reopen

4. **Check DevTools Network**:
   - Is `x-csrf-token` header present in POST request?
   - If NO → Frontend fix didn't apply (check api.ts)
   - If YES → Backend issue (check CSRF middleware)

---

### **Getting 403 Forbidden**

**If x-csrf-token header IS present**:
- Token might be invalid
- Check backend CSRF middleware configuration
- Try logout → login again

**If x-csrf-token header is MISSING**:
- Frontend fix didn't apply
- Clear browser cache
- Check `apps/frontend/src/services/api.ts`

---

### **Automated tests FAIL**

**Test 1 fails** (CSRF fetch):
- Backend not running
- Check `http://localhost:5001/api/csrf-token` manually

**Test 2 fails** (Create with token):
- Backend rejecting valid tokens
- Check CSRF middleware
- Check session configuration

**Test 3 PASSES but should FAIL**:
- ⚠️ **SECURITY ISSUE**: CSRF protection not enabled!
- Backend accepting requests without tokens

---

## ✅ Success Criteria

**Fix is working** if ALL of these are true:
- ✅ Automated tests: 3/3 PASS
- ✅ AnggotaPage: Green toast on create
- ✅ AsetPage: Green toast on create
- ✅ KegiatanPage: Green toast on create
- ✅ DokumenPage: Green toast on upload
- ✅ LahanPage: Green toast on create
- ✅ KeuanganPage: Green toast on create
- ✅ DokumenOrganisasiPage: Green toast on upload
- ✅ DevTools shows `x-csrf-token` header
- ✅ Response status: 200 OK (not 403)

---

## 📝 Quick Test Checklist

**Print this page and mark as you test**:

```
□ Backend running (npm run dev)
□ Frontend running (npm run dev)
□ Login successful
□ Console shows "CSRF token fetched successfully"

AUTOMATED TESTS:
□ Test 1: CSRF Token Fetch - PASS
□ Test 2: Create WITH Token - PASS
□ Test 3: Request WITHOUT Token - PASS

MANUAL TESTS:
□ AnggotaPage - Tambah Anggota - Green toast
□ AsetPage - Tambah Aset - Green toast
□ KegiatanPage - Tambah Kegiatan - Green toast
□ DokumenPage - Upload Dokumen - Green toast
□ LahanPage - Tambah Lahan - Green toast
□ KeuanganPage - Tambah Transaksi - Green toast
□ DokumenOrganisasiPage - Upload Dokumen - Green toast

DEVTOOLS VERIFICATION:
□ x-csrf-token header present in POST requests
□ Response status: 200 OK (not 403)
□ No red error toasts

RESULT: □ ALL PASS / □ SOME FAIL
```

---

## 📚 Documentation

**Detailed Test Report**: [TEST_REPORT_FEB15_2026.md](./TEST_REPORT_FEB15_2026.md)  
**Automated Test Scripts**: [scripts/README.md](./scripts/README.md)  
**Code Changes**: [apps/frontend/src/services/api.ts](./apps/frontend/src/services/api.ts)

---

## 🔄 Next Steps

### **If All Tests PASS** ✅
1. Mark todos as complete
2. Commit changes to Git
3. Deploy to staging for QA testing
4. Update PROGRESS.md

### **If Any Test FAILS** ❌
1. Screenshot the error
2. Copy console logs
3. Copy Network request details
4. Report to developer with evidence
5. Check [Troubleshooting](#❌-troubleshooting) section

---

**Estimated Testing Time**: 15 minutes total
- Automated: 2 min
- Manual (quick): 5 min
- Manual (all pages): 10 min
- DevTools verification: 3 min

**Last Updated**: Feb 15, 2026  
**Tester**: _______________  
**Test Date**: _______________  
**Result**: □ PASS / □ FAIL

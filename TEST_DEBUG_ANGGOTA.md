# 🐛 Debug Guide - Tambah Anggota Error

**Error**: "Terjadi kesalahan saat menambahkan anggota"  
**Date**: February 15, 2026

---

## 🔍 Step-by-Step Debugging

### **STEP 1: Hard Refresh Browser**

**PENTING**: Frontend code baru belum ter-load!

1. **Close ALL browser tabs** yang buka aplikasi
2. **Restart browser** completely
3. Buka aplikasi lagi: http://localhost:5173
4. Login dengan admin account
5. **Hard refresh**: Press `Ctrl + Shift + R` (atau `Ctrl + F5`)

---

### **STEP 2: Open Developer Tools**

1. Press `F12` untuk buka DevTools
2. Go to **Console** tab
3. **Clear** console (klik icon 🚫 atau kanan-klik → Clear console)

---

### **STEP 3: Navigate to Anggota Page**

1. Klik menu "Anggota" di sidebar
2. **Check console** → Should see:
   ```
   CSRF token fetched successfully: 8kY2mP9nQ7vR4wX6z...
   ```
   
   ✅ **JIKA MUNCUL** → Token berhasil di-fetch  
   ❌ **JIKA TIDAK MUNCUL** → Screenshot console + laporkan

---

### **STEP 4: Try Create Anggota**

1. Klik button **"Tambah Anggota"**
2. Fill form:
   - NIK: `TEST123456`
   - Nama Lengkap: `Test User Debug`
   - Tanggal Lahir: Pilih tanggal
   - Jenis Kelamin: `Laki-laki`
   - Alamat: `Test Address`
   - No. HP: `08123456789`
   - Status: `Aktif`
3. **Don't submit yet!**

---

### **STEP 5: Prepare Network Tab**

1. Switch to **Network** tab in DevTools
2. Filter: `Fetch/XHR`
3. **Clear** network log (icon 🚫)
4. **NOW click "Simpan Data"** button

---

### **STEP 6: Check Console Logs**

Immediately after clicking "Simpan Data", check **Console** tab:

**Expected logs** (SHOULD SEE THIS):
```
Submitting anggota data: {nik: "TEST123456", namaLengkap: "Test User Debug", ...}
Adding CSRF token to request: 8kY2mP9nQ7vR4wX6z...
Response received: {success: true, data: {...}, message: "..."}
```

**If you see ERROR logs**:
```
CSRF token required but not available!
```
→ **Screenshot this + report**

```
Error in handleSubmit: Error: ...
```
→ **Screenshot this + report**

---

### **STEP 7: Check Network Request**

In **Network** tab, find request:
- Name: `anggota` (POST request)
- Click on it to inspect

#### **Headers Tab**:

Scroll down to **Request Headers** section:

**MUST SEE**:
```
x-csrf-token: 8kY2mP9nQ7vR4wX6z... (some long string)
```

✅ **IF PRESENT** → Token sent correctly  
❌ **IF MISSING** → Screenshot Headers tab + report

#### **Payload Tab**:

Should see:
```json
{
  "nik": "TEST123456",
  "namaLengkap": "Test User Debug",
  ...
}
```

#### **Response Tab**:

Check status code:

**Scenario A: Status 200 OK** ✅
```json
{
  "success": true,
  "message": "Data anggota berhasil ditambahkan",
  "data": { ... }
}
```
→ **This is GOOD!** Check if green toast appeared.

**Scenario B: Status 403 Forbidden** ❌
```json
{
  "success": false,
  "message": "CSRF token tidak ditemukan",
  "code": "CSRF_TOKEN_MISSING"
}
```
→ **Token not sent or invalid** → Screenshot + report

**Scenario C: Status 401 Unauthorized** ❌
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
→ **Session expired** → Try logout + login again

**Scenario D: Status 400 Bad Request** ❌
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [ ... ]
}
```
→ **Form data invalid** → Check which fields have errors

---

### **STEP 8: Check Toast Notification**

After clicking "Simpan Data":

✅ **GREEN TOAST**: "Data anggota berhasil ditambahkan!"  
→ **SUCCESS!** Problem solved.

❌ **RED TOAST**: "Terjadi kesalahan saat menambahkan anggota"  
→ Go back to Step 6 & 7, screenshot console + network tab

---

## 📊 Debugging Checklist

**Print this and check each item**:

```
□ Browser completely restarted
□ Hard refresh (Ctrl+Shift+R)
□ DevTools opened (F12)
□ Console tab shows "CSRF token fetched successfully"
□ Navigate to Anggota page
□ Click "Tambah Anggota"
□ Fill form completely
□ Network tab cleared
□ Click "Simpan Data"

CONSOLE TAB:
□ "Submitting anggota data" logged
□ "Adding CSRF token to request" logged
□ "Response received" logged
□ NO errors in red text

NETWORK TAB (anggota request):
□ Request Headers contains x-csrf-token
□ Response status: 200 OK (not 403, 401, or 400)
□ Response body has success: true

UI RESULT:
□ Green toast appeared
□ Modal closed automatically
□ New data visible in table
```

---

## 🎯 Quick Diagnostic

### **Problem 1: "CSRF token required but not available!"**

**Meaning**: Token fetch failed or not completed

**Fix**:
1. Check backend is running (port 5001)
2. Test endpoint manually:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5001/api/csrf-token" -UseBasicParsing
   ```
3. Should return JSON with csrfToken field

---

### **Problem 2: x-csrf-token header missing in Network tab**

**Meaning**: Frontend not sending token

**Fix**:
1. Verify frontend code updated (hard refresh)
2. Check console errors
3. Try clearing browser cache completely

---

### **Problem 3: 403 Forbidden - "CSRF token tidak valid"**

**Meaning**: Token sent but backend rejects it

**Fix**:
1. Token might be stale
2. Try logout + login again
3. Clear all cookies
4. Restart both frontend and backend

---

### **Problem 4: Response success: false but status 200**

**Meaning**: Backend processed request but validation failed

**Fix**:
1. Check Response → Preview tab for error details
2. Look for `errors` array in response
3. Fix form data according to error messages

---

## 📸 What to Screenshot if Still Failed

**Please provide**:

1. **Console tab** - Full screenshot showing:
   - "Submitting anggota data" log
   - "Adding CSRF token" log (or error)
   - "Response received" log (or error)
   - Any red error messages

2. **Network tab** - Request details:
   - Headers tab → Request Headers section
   - Payload tab → Request payload
   - Response tab → Response body
   - Status code visible

3. **Full browser window** showing:
   - Error toast message
   - Form modal with filled data
   - DevTools visible

---

## 🔧 Advanced Debug (If Needed)

### **Test 1: Enable Verbose Logging**

Open browser console and run:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

This enables more detailed logging in api.ts.

---

### **Test 2: Manual API Call from Console**

```javascript
// Step 1: Get CSRF token
const tokenResp = await fetch('/api/csrf-token', {credentials: 'include'});
const tokenData = await tokenResp.json();
const token = tokenData.data.csrfToken;
console.log('Token:', token);

// Step 2: Try create anggota
const response = await fetch('/api/anggota', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': token
  },
  credentials: 'include',
  body: JSON.stringify({
    nik: 'CONSOLE123',
    namaLengkap: 'Test Console',
    tanggalLahir: '1990-01-01',
    jenisKelamin: 'L',
    alamat: 'Test',
    noHp: '08123456789',
    statusAnggota: 'aktif'
  })
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
```

**Expected output**:
```
Token: 8kY2mP9nQ7vR4wX6z...
Status: 200
Response: {success: true, message: "Data anggota berhasil ditambahkan", ...}
```

**If failed**: Screenshot the output + report

---

## 🚨 Emergency Fix

**If nothing works**:

1. **Clear everything**:
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   location.href = '/';
   ```

2. **Restart backend**:
   ```powershell
   # Stop backend (Ctrl+C)
   cd apps/backend
   npm run dev
   ```

3. **Restart frontend**:
   ```powershell
   # Stop frontend (Ctrl+C)
   cd apps/frontend
   npm run dev
   ```

4. **Try again from Step 1**

---

**Last Updated**: Feb 15, 2026  
**Version**: 2.0 (with improved logging)

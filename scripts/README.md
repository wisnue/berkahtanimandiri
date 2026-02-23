# CSRF Token Testing Scripts

Automated PowerShell scripts untuk testing CSRF token implementation di KTH BTM application.

## 📋 Prerequisites

1. **Backend Server Running**
   ```powershell
   cd apps/backend
   npm run dev
   # Should show: Server running on http://localhost:5001
   ```

2. **PowerShell Version**
   - Windows PowerShell 5.1+ atau PowerShell 7+

## 🧪 Available Tests

### 1. **test-csrf-fetch.ps1** - Test CSRF Token Fetch
Tests if CSRF token can be fetched from `/api/csrf-token` endpoint.

**Usage**:
```powershell
.\scripts\test-csrf-fetch.ps1
```

**Expected Output**:
```
=== Testing CSRF Token Fetch ===
✅ PASS: CSRF token fetched successfully
Token: abc123...xyz789
Length: 64 characters
```

---

### 2. **test-create-anggota.ps1** - Test Create with CSRF Token
Tests creating anggota WITH valid CSRF token (should succeed).

**Usage**:
```powershell
.\scripts\test-create-anggota.ps1
```

**Expected Output**:
```
=== Testing Create Anggota with CSRF Token ===
Step 1: Fetching CSRF token...
✅ Token fetched: abc123...

Step 2: Creating anggota with CSRF token...
✅ PASS: Anggota created successfully!
Status: 200
Message: Data anggota berhasil ditambahkan
```

---

### 3. **test-no-csrf-token.ps1** - Test Request WITHOUT Token
Tests creating anggota WITHOUT CSRF token (should FAIL with 403).

**Usage**:
```powershell
.\scripts\test-no-csrf-token.ps1
```

**Expected Output**:
```
=== Testing Request WITHOUT CSRF Token ===
✅ PASS: Request properly rejected with 403 Forbidden!
CSRF token protection is working correctly!
```

---

### 4. **run-all-csrf-tests.ps1** - Run All Tests
Master script that runs all tests in sequence.

**Usage**:
```powershell
.\scripts\run-all-csrf-tests.ps1
```

**Expected Output**:
```
========================================
   CSRF TOKEN TEST SUITE
========================================

TEST 1/3: CSRF Token Fetch
✅ PASS

TEST 2/3: Create Anggota (WITH Token)
✅ PASS

TEST 3/3: Request WITHOUT Token
✅ PASS

========================================
   TEST SUMMARY
========================================
✅ CSRF Token Fetch: PASS
✅ Create Anggota WITH Token: PASS
✅ Request WITHOUT Token: PASS

Total Tests: 3
Passed: 3
Failed: 0
Pass Rate: 100%

========================================
   ✅ ALL TESTS PASSED!
========================================
```

## 🚀 Quick Start

**Run all tests**:
```powershell
# Navigate to project root
cd "c:\Users\maswi\Documents\KTH BTM\KTHBTM"

# Run all CSRF tests
.\scripts\run-all-csrf-tests.ps1
```

## 📊 Test Results Interpretation

### ✅ All Tests PASS
**Meaning**: CSRF token implementation is working correctly
- Frontend can fetch CSRF token
- Frontend sends token in requests
- Backend validates token
- Requests without token are rejected

**Action**: Proceed with manual browser testing

---

### ❌ Test 1 FAILS (CSRF Token Fetch)
**Meaning**: Cannot fetch CSRF token from backend

**Possible Causes**:
1. Backend not running
2. CSRF endpoint `/api/csrf-token` not configured
3. CORS issues

**Fix**:
```powershell
# Check backend logs
cd apps/backend
npm run dev
# Look for errors in console
```

---

### ❌ Test 2 FAILS (Create WITH Token)
**Meaning**: Request with CSRF token is being rejected

**Possible Causes**:
1. Token not being sent in header
2. Token expired immediately
3. Session mismatch
4. Backend CSRF validation too strict

**Fix**:
1. Check `apps/frontend/src/services/api.ts` - ensure `x-csrf-token` header is added
2. Check `apps/backend/src/middlewares/csrf.middleware.ts` - review validation logic
3. Check session configuration

---

### ❌ Test 3 FAILS (Request WITHOUT Token) - SECURITY ISSUE!
**Meaning**: Requests without CSRF token are being ACCEPTED (BAD!)

**Possible Causes**:
1. CSRF middleware not enabled
2. CSRF middleware not applied to route
3. CSRF validation bypassed

**Fix**:
```typescript
// apps/backend/src/app.ts
import { csrfProtection } from './middlewares/csrf.middleware';

// Apply CSRF middleware globally
app.use(csrfProtection);
```

**⚠️ CRITICAL**: This is a security vulnerability! Do NOT deploy until fixed.

---

## 🐛 Troubleshooting

### Error: "Backend server is not running"
```powershell
# Start backend
cd apps/backend
npm run dev
```

### Error: "Cannot connect" or timeout
```powershell
# Check if port 5001 is in use
netstat -ano | findstr :5001

# If another process is using it, kill it or change backend port
```

### Error: "401 Unauthorized"
```powershell
# Tests require authentication
# Login to application first in browser
# Then run tests (they will use same session)
```

### Error: PowerShell execution policy
```powershell
# Allow script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Manual Browser Testing

After automated tests pass, perform manual testing:

1. Open browser (Chrome/Firefox)
2. Open DevTools (F12)
3. Go to Network tab
4. Navigate to `/dashboard/anggota`
5. Click "Tambah Anggota"
6. Fill form and submit
7. Check Network tab:
   - POST request to `/api/anggota`
   - Headers → `x-csrf-token` should be present
   - Response → Status 200 (not 403)

## 📚 Related Documentation

- [TEST_REPORT_FEB15_2026.md](../TEST_REPORT_FEB15_2026.md) - Complete test documentation
- [QUICK_TEST_GUIDE.md](../QUICK_TEST_GUIDE.md) - Manual testing guide
- [apps/frontend/src/services/api.ts](../apps/frontend/src/services/api.ts) - CSRF implementation

## ✅ Success Criteria

**All tests PASS** when:
- ✅ CSRF token can be fetched
- ✅ Requests WITH token succeed (200 OK)
- ✅ Requests WITHOUT token fail (403 Forbidden)
- ✅ All 7 pages can create/upload data
- ✅ No "CSRF token tidak ditemukan" errors

## 🔐 Security Notes

**Why CSRF Token is Important**:
- Prevents Cross-Site Request Forgery attacks
- Ensures requests originate from our frontend
- Protects state-changing operations (POST/PUT/DELETE)

**CSRF Token Flow**:
```
1. Frontend loads → Auto-fetch CSRF token
2. User submits form
3. Frontend adds x-csrf-token to request header
4. Backend validates token
5. If valid → Process request
6. If invalid → Return 403 Forbidden
```

**Best Practices**:
- ✅ Never expose CSRF token in URL
- ✅ Send token in header (not body)
- ✅ Refresh token on expiration
- ✅ Use HTTPS in production
- ✅ Validate token on ALL state-changing requests

---

**Last Updated**: February 15, 2026  
**Version**: 1.0.0  
**Status**: Ready for testing

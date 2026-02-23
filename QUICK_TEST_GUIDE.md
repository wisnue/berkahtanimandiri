# 🚀 QUICK START TESTING GUIDE
**5-Minute Critical Test** - Feb 15, 2026

---

## ⚡ FASTEST CRITICAL TESTS (Do This First!)

### 1️⃣ Settings System Tab - 30 seconds
```
✅ Open: http://localhost:5173
✅ Login (your credentials)
✅ Navigate: Sidebar → Sistem → Pengaturan
✅ Click tab: "Pengaturan Sistem"
✅ Press: Ctrl + Shift + R (hard refresh)
✅ Press: F12 (open console)
```

**WATCH FOR**:
- ✅ **SUCCESS**: Settings load in 2-3 seconds, shows 5 cards
- ❌ **FAIL**: "Memuat..." forever OR console error

**RESULT**: ________________

---

### 2️⃣ Organization Save - 45 seconds
```
✅ Click tab: "Info Organisasi"
✅ Change phone: 085691111711 → 085691111722
✅ Scroll down
✅ Click: "Simpan Informasi" button
✅ Watch console (F12)
```

**WATCH FOR**:
- ✅ **SUCCESS**: Green toast appears, console shows "📡 Response: {success: true}"
- ❌ **FAIL**: Red toast OR console shows "❌ Save error"

**RESULT**: ________________

---

### 3️⃣ Toast System - 20 seconds
```
✅ Open Console (F12)
✅ Paste this:
```
```javascript
showToast.success('Test Success!');
showToast.error('Test Error!');
showToast.warning('Test Warning!');
showToast.info('Test Info!');
```

**WATCH FOR**:
- ✅ **SUCCESS**: 4 gradient toasts appear top-right with icons
- ❌ **FAIL**: Plain toasts OR no icons OR position wrong

**RESULT**: ________________

---

## 🎨 TOAST VISUAL CHECK (10 seconds each)

### Expected Appearance:

**Success Toast** 🟢
```
┌───────────────────────────────────────┐
│ ✓  Test Success!              [X]     │ ← Green gradient
└───────────────────────────────────────┘
  ▓▓▓▓▓▓▓▓░░░░░░░░░░░ ← Progress bar
```

**Error Toast** 🔴
```
┌───────────────────────────────────────┐
│ ⊗  Test Error!                [X]     │ ← Red gradient
└───────────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ ← Progress bar
```

**Warning Toast** 🟡
```
┌───────────────────────────────────────┐
│ ⚠  Test Warning!              [X]     │ ← Amber gradient
└───────────────────────────────────────┘
  ▓▓▓▓▓▓▓▓▓▓░░░░░░░ ← Progress bar
```

**Info Toast** 🔵
```
┌───────────────────────────────────────┐
│ ℹ  Test Info!                 [X]     │ ← Blue gradient
└───────────────────────────────────────┘
  ▓▓▓▓▓▓▓▓░░░░░░░░░░ ← Progress bar
```

---

## 🔍 TROUBLESHOOTING

### Problem: Settings Still Loading Forever

**Debug Steps**:
```
1. F12 → Console tab
2. Look for errors (red text)
3. Copy full error message
4. Check Network tab → look for /api/settings/system
   - Status 200? → Request successful
   - Status 401? → Login expired
   - Status 500? → Server error
```

**Common Fixes**:
- Hard refresh: `Ctrl + Shift + R`
- Clear cache: `Ctrl + Shift + Delete`
- Restart backend: Check backend terminal still running
- Check database: is_sensitive column exists?

---

### Problem: Organization Save Fails

**Debug Steps**:
```
1. F12 → Console tab
2. Look for debug messages:
   💾 Saving organization settings: {...}
   📡 Response: {...}
   OR
   ❌ Save error: {...}
```

**What to Check**:
- Console shows request payload? → Copy it
- Console shows response? → Copy it
- Network tab shows PUT request? → Check status code
- Backend terminal shows error? → Read it

**Common Issues**:
- Missing required fields
- Invalid data format (camelCase vs snake_case)
- Database connection issue
- Permission denied (not admin role)

---

### Problem: Toast Looks Plain (Not Gradient)

**Possible Causes**:
- Browser cache not cleared
- Tailwind CSS not compiled
- CustomToast.tsx not loaded

**Quick Fix**:
```
1. Hard refresh: Ctrl + Shift + R
2. Clear cache
3. Check console for errors
4. Verify: showToast.success should show green gradient
```

---

## 📋 MINIMAL TEST CHECKLIST

Copy-paste this after testing:

```
[  ] Settings System tab loads (< 3 sec)
[  ] Organization save works
[  ] Success toast = green gradient + ✓ icon
[  ] Error toast = red gradient + ⊗ icon
[  ] Warning toast = amber gradient + ⚠ icon
[  ] Info toast = blue gradient + ℹ icon
[  ] Toast appears top-right
[  ] Toast has close button (X)
[  ] Toast has progress bar
[  ] Toast auto-dismisses
```

**Pass Rate**: ___ / 10 = ____%

---

## 🆘 QUICK REFERENCE - Console Commands

### Test All Toast Types
```javascript
// Copy-paste this entire block:
showToast.success('✅ Success - Data saved!');
setTimeout(() => showToast.error('❌ Error - Something failed!'), 500);
setTimeout(() => showToast.warning('⚠️ Warning - Be careful!'), 1000);
setTimeout(() => showToast.info('ℹ️ Info - For your information'), 1500);
```

### Check Toast Function Exists
```javascript
console.log(typeof showToast); // Should be "object"
console.log(showToast); // Should show: {success: f, error: f, warning: f, info: f, ...}
```

### Force Dismiss All Toasts
```javascript
showToast.dismissAll();
```

### Check CustomToast Component Loaded
```javascript
// This should NOT show error
showToast.success('Component check');
```

---

## 📸 SCREENSHOT CHECKLIST

Please take screenshots of:

1. ✅ Settings System tab fully loaded (**BEFORE** was infinite loading)
2. ✅ Organization Info save success with green toast
3. ✅ All 4 toast variants displayed together
4. ❌ Any errors in console (if found)
5. ❌ Any failed Network requests (if found)

Save screenshots as:
- `settings_system_loaded.png`
- `org_save_success.png`
- `toast_all_variants.png`
- `error_console.png` (if any)
- `error_network.png` (if any)

---

## ⏱️ TIME TRACKING

**Total Testing Time**: _______ minutes

Breakdown:
- Settings System test: _____ min
- Organization save test: _____ min
- Toast system test: _____ min
- Troubleshooting (if needed): _____ min

---

## 📞 REPORTING RESULTS

### If Everything Works ✅

Reply with:
```
✅ SEMUA TEST PASSED!

Settings System: BERHASIL LOAD
Organization Save: BERHASIL SIMPAN
Toast System: TAMPIL INDAH DENGAN GRADIENT

Screenshots: (attach files)
```

### If Something Fails ❌

Reply with:
```
❌ ADA YANG GAGAL:

1. Settings System: [PASS/FAIL]
   Error: _____________________

2. Organization Save: [PASS/FAIL]
   Console output: _____________________

3. Toast System: [PASS/FAIL]
   Issue: _____________________

Screenshots: (attach files)
Console errors: (copy-paste full error)
```

---

## 🎯 NEXT AFTER TESTING

### If All Pass (99%+ Success)
→ Mark project as ready
→ Document for users
→ Celebrate! 🎉

### If Some Fail
→ I will fix immediately based on your error reports
→ Re-test after fix
→ Iterate until 99% achieved

---

**Ready? Start testing now! ⚡**

Time started: _______
Time completed: _______

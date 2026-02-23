# Gmail SMTP Configuration - KTH BTM

## ✅ Konfigurasi Aktif

**Email**: kth.berkahtanimandiri@gmail.com  
**App Name**: KTH BTM Server  
**Status**: ✅ Configured

## 📧 Detail Konfigurasi

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=kth.berkahtanimandiri@gmail.com
EMAIL_PASS=bhsoxekctmnwzudi
EMAIL_FROM=KTH BTM <kth.berkahtanimandiri@gmail.com>
APP_URL=http://localhost:5173
```

## 🔍 Cara Test Email

### 1. Start Backend Server
```powershell
cd apps/backend
npm run dev
```

### 2. Test Email Configuration

**Option A: Via Postman/Thunder Client**

```http
POST http://localhost:5001/api/settings/test-email
Content-Type: application/json
Cookie: connect.sid=<your-session-cookie>

{
  "email": "recipient@example.com"
}
```

**Option B: Via Browser Console (setelah login)**

```javascript
fetch('http://localhost:5001/api/settings/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'your-test@email.com' })
})
.then(r => r.json())
.then(console.log)
```

### 3. Test Expiring Document Notification

```http
POST http://localhost:5001/api/settings/trigger-notifications
Cookie: connect.sid=<your-session-cookie>
```

## ⏰ Schedule Otomatis

- **Waktu**: Setiap hari jam 08:00 pagi
- **Fungsi**: Cek dokumen yang akan kadaluarsa dalam 30 hari
- **Penerima**: Admin, Ketua, Sekretaris (semua yang punya email di database)
- **Isi Email**: 
  - Daftar dokumen yang akan expire
  - Tanggal kadaluarsa
  - Sisa hari
  - Link ke sistem

## 📊 Gmail Limits

- **Free Tier**: 500 email/hari
- **Estimasi Usage KTH**: 1 email/hari = 30/bulan
- **Usage**: 0.2% dari limit (sangat aman)

## 🔐 Security Notes

1. **App Password** sudah dikonfigurasi (bukan password Gmail biasa)
2. **2FA** harus tetap aktif di Gmail
3. **Jangan share** app password ke pihak lain
4. **Revoke access**: https://myaccount.google.com/apppasswords jika perlu

## ✅ Checklist Konfigurasi

- ✅ Dependencies installed (nodemailer, node-cron)
- ✅ .env configured dengan Gmail credentials
- ✅ Email service created
- ✅ Notification scheduler created
- ✅ Server integration (auto-start on boot)
- ✅ Test endpoints available

## 🚀 Ready to Use!

Email notification system siap digunakan. Server akan otomatis:
1. Start scheduler saat boot
2. Check dokumen expiring setiap hari 08:00
3. Kirim email jika ada dokumen yang akan kadaluarsa
4. Log aktivitas ke console

**Status**: ✅ ACTIVE & CONFIGURED

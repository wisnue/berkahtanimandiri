<#
.SYNOPSIS
    Import environment variables dari .env.vercel ke Vercel project via Vercel CLI.

.DESCRIPTION
    Script ini membaca file .env.vercel dan memasukkan setiap variabel ke
    Vercel project menggunakan perintah 'vercel env add'.

.PARAMETER Target
    Pilih 'backend' atau 'frontend'.

.PARAMETER Environment
    Target environment Vercel: production (default), preview, development.

.EXAMPLE
    .\scripts\vercel-env-import.ps1 -Target backend
    .\scripts\vercel-env-import.ps1 -Target frontend
    .\scripts\vercel-env-import.ps1 -Target backend -Environment preview

.NOTES
    PRASYARAT:
    1. Install Vercel CLI: npm install -g vercel
    2. Login ke Vercel: vercel login
    3. Jalankan dari root folder project KTHBTM
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("backend", "frontend")]
    [string]$Target,

    [ValidateSet("production", "preview", "development")]
    [string]$Environment = "production"
)

# Resolve paths
$rootDir = Split-Path -Parent $PSScriptRoot
$envFile = if ($Target -eq "backend") {
    Join-Path $rootDir "apps\backend\.env.vercel"
} else {
    Join-Path $rootDir "apps\frontend\.env.vercel"
}

# Cek file ada
if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] File tidak ditemukan: $envFile" -ForegroundColor Red
    Write-Host "  Pastikan file .env.vercel sudah dibuat di folder yang benar." -ForegroundColor Yellow
    exit 1
}

# Cek vercel CLI terpasang
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Vercel CLI tidak ditemukan." -ForegroundColor Red
    Write-Host "  Install dulu: npm install -g vercel" -ForegroundColor Yellow
    Write-Host "  Lalu login  : vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Vercel Env Import" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Target     : $Target" -ForegroundColor White
Write-Host "  Environment: $Environment" -ForegroundColor White
Write-Host "  File       : $envFile" -ForegroundColor White
Write-Host ""
Write-Host "Memulai import..." -ForegroundColor Cyan
Write-Host ""

$count   = 0
$skipped = 0
$errors  = 0

foreach ($line in Get-Content $envFile -Encoding UTF8) {
    # Lewati baris komentar dan baris kosong
    if ($line -match "^\s*#" -or $line.Trim() -eq "") { continue }

    if ($line -match "^([^=]+)=(.*)$") {
        $key = $Matches[1].Trim()
        $val = $Matches[2].Trim()

        # Lewati jika masih placeholder (nilai diapit < >)
        if ($val -match "^GANTI-" -or $val -match "<.+>") {
            Write-Host "  [SKIP] $key" -ForegroundColor Yellow
            Write-Host "         Nilai masih placeholder — isi dulu di file .env.vercel!" -ForegroundColor Yellow
            $skipped++
            continue
        }

        Write-Host "  [+] $key" -NoNewline -ForegroundColor White
        try {
            # Pipe nilai ke vercel env add (non-interactive)
            $val | vercel env add $key $Environment --force 2>&1 | Out-Null
            Write-Host "  OK" -ForegroundColor Green
            $count++
        } catch {
            Write-Host "  GAGAL" -ForegroundColor Red
            Write-Host "      $_" -ForegroundColor Red
            $errors++
        }
    }
}

# Ringkasan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
$color = if ($errors -gt 0) { "Yellow" } else { "Green" }
Write-Host "  Selesai: $count berhasil | $skipped dilewati | $errors gagal" -ForegroundColor $color
Write-Host "==========================================" -ForegroundColor Cyan

if ($skipped -gt 0) {
    Write-Host ""
    Write-Host "  ⚠  Ada $skipped variabel yang dilewati (masih placeholder)." -ForegroundColor Yellow
    Write-Host "     Edit file .env.vercel, isi nilainya, lalu jalankan script ini lagi." -ForegroundColor Yellow
}

if ($count -gt 0) {
    Write-Host ""
    Write-Host "  Langkah selanjutnya:" -ForegroundColor Cyan
    Write-Host "   · Buka Vercel Dashboard → Project $Target → Deployments" -ForegroundColor White
    Write-Host "   · Klik '...' → Redeploy agar env vars aktif" -ForegroundColor White

    if ($Target -eq "backend") {
        Write-Host ""
        Write-Host "  Setelah backend live:" -ForegroundColor Cyan
        Write-Host "   · Salin URL backend (contoh: https://kthbtm-api.vercel.app)" -ForegroundColor White
        Write-Host "   · Edit  apps/frontend/.env.vercel → ubah VITE_API_URL" -ForegroundColor White
        Write-Host "   · Jalankan: .\scripts\vercel-env-import.ps1 -Target frontend" -ForegroundColor White
    }
}

Write-Host ""

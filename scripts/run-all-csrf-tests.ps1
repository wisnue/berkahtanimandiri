# run-all-csrf-tests.ps1
# Master script to run all CSRF token tests
# Usage: .\run-all-csrf-tests.ps1

$scriptDir = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   CSRF TOKEN TEST SUITE" -ForegroundColor Magenta
Write-Host "   KTH BTM Application" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "Environment: Development" -ForegroundColor Gray
Write-Host "Backend: http://localhost:5001" -ForegroundColor Gray
Write-Host ""

# Check if backend is running
Write-Host "Checking if backend server is running..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:5001/api/csrf-token" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend server is running" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Backend server is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend server first:" -ForegroundColor Yellow
    Write-Host "  cd apps/backend" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test Results Tracking
$testResults = @()
$totalTests = 3
$passedTests = 0
$failedTests = 0

# ==========================================
# TEST 1: CSRF Token Fetch
# ==========================================
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "TEST 1/3: CSRF Token Fetch" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

& "$scriptDir\test-csrf-fetch.ps1"

if ($LASTEXITCODE -eq 0 -or $global:CSRF_TOKEN) {
    $passedTests++
    $testResults += @{ Test = "CSRF Token Fetch"; Status = "PASS" }
    Write-Host "Result: ✅ PASS" -ForegroundColor Green
} else {
    $failedTests++
    $testResults += @{ Test = "CSRF Token Fetch"; Status = "FAIL" }
    Write-Host "Result: ❌ FAIL" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 1

# ==========================================
# TEST 2: Create Anggota WITH CSRF Token
# ==========================================
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "TEST 2/3: Create Anggota (WITH Token)" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

& "$scriptDir\test-create-anggota.ps1"

if ($LASTEXITCODE -eq 0) {
    $passedTests++
    $testResults += @{ Test = "Create Anggota WITH Token"; Status = "PASS" }
    Write-Host "Result: ✅ PASS" -ForegroundColor Green
} else {
    $failedTests++
    $testResults += @{ Test = "Create Anggota WITH Token"; Status = "FAIL" }
    Write-Host "Result: ❌ FAIL - This indicates CSRF token is not working!" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 1

# ==========================================
# TEST 3: Request WITHOUT CSRF Token
# ==========================================
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "TEST 3/3: Request WITHOUT Token (Should Fail)" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

& "$scriptDir\test-no-csrf-token.ps1"

if ($LASTEXITCODE -eq 0) {
    $passedTests++
    $testResults += @{ Test = "Request WITHOUT Token"; Status = "PASS" }
    Write-Host "Result: ✅ PASS" -ForegroundColor Green
} else {
    $failedTests++
    $testResults += @{ Test = "Request WITHOUT Token"; Status = "FAIL" }
    Write-Host "Result: ❌ FAIL" -ForegroundColor Red
}

Write-Host ""

# ==========================================
# SUMMARY
# ==========================================
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   TEST SUMMARY" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

foreach ($result in $testResults) {
    $statusColor = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    $statusIcon = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
    
    Write-Host "$statusIcon $($result.Test): $($result.Status)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor Gray
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Gray" } else { "Red" })

$passRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -eq 100) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "   CSRF Protection is working correctly" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ❌ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "   Please review the errors above" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Check if backend is running (npm run dev)" -ForegroundColor Yellow
    Write-Host "  2. Check backend CSRF middleware configuration" -ForegroundColor Yellow
    Write-Host "  3. Check frontend api.ts CSRF token implementation" -ForegroundColor Yellow
    Write-Host "  4. Review browser console for errors" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

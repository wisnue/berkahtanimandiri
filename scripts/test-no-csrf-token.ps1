# test-no-csrf-token.ps1
# Test that requests WITHOUT CSRF token are properly rejected
# This should FAIL with 403 Forbidden (which is the expected/desired behavior)
# Usage: .\test-no-csrf-token.ps1

Write-Host ""
Write-Host "=== Testing Request WITHOUT CSRF Token (Should Be Rejected) ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5001/api"

Write-Host "Attempting to create anggota WITHOUT CSRF token..." -ForegroundColor Yellow
Write-Host "Expected result: 403 Forbidden (CSRF protection working)" -ForegroundColor Yellow
Write-Host ""

$randomNik = "NOTOK$(Get-Random -Minimum 100000 -Maximum 999999)"

$anggotaData = @{
    nik = $randomNik
    namaLengkap = "This Should Fail"
    tanggalLahir = "1990-01-01"
    jenisKelamin = "L"
    alamat = "Should be rejected"
    noHp = "08111111111"
    statusKeanggotaan = "aktif"
} | ConvertTo-Json

Write-Host "Request Data:" -ForegroundColor Gray
Write-Host "  NIK: $randomNik" -ForegroundColor Gray
Write-Host "  CSRF Token: ❌ NONE (intentionally omitted)" -ForegroundColor Gray
Write-Host ""

try {
    # Explicitly NOT sending x-csrf-token header
    $response = Invoke-WebRequest `
        -Uri "$baseUrl/anggota" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
        } `
        -Body $anggotaData `
        -UseBasicParsing

    # If we get here, the request succeeded (which is BAD!)
    $statusCode = $response.StatusCode
    
    Write-Host ""
    Write-Host "❌ FAIL: Request succeeded without CSRF token!" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️ SECURITY ISSUE: CSRF protection is NOT working!" -ForegroundColor Red
    Write-Host "Status Code: $statusCode (should be 403)" -ForegroundColor Red
    Write-Host "This is a critical security vulnerability!" -ForegroundColor Red
    Write-Host ""
    
    exit 1

} catch {
    $statusCode = 0
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    if ($statusCode -eq 403) {
        # This is EXPECTED behavior - request was properly rejected
        Write-Host ""
        Write-Host "✅ PASS: Request properly rejected with 403 Forbidden!" -ForegroundColor Green
        Write-Host ""
        Write-Host "CSRF Protection Details:" -ForegroundColor Gray
        Write-Host "  Status Code: $statusCode" -ForegroundColor Gray
        Write-Host "  Result: Request blocked" -ForegroundColor Gray
        Write-Host ""
        
        # Try to parse error response
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            $errorData = $errorBody | ConvertFrom-Json
            
            Write-Host "Error Response:" -ForegroundColor Gray
            Write-Host "  Code: $($errorData.code)" -ForegroundColor Gray
            Write-Host "  Message: $($errorData.message)" -ForegroundColor Gray
        } catch {
            # Could not parse error body
        }
        
        Write-Host ""
        Write-Host "✅ CSRF token protection is working correctly!" -ForegroundColor Green
        Write-Host "Requests without valid CSRF token are being rejected." -ForegroundColor Green
        Write-Host ""
        
    } elseif ($statusCode -eq 401) {
        # Unauthorized - might need to login first
        Write-Host ""
        Write-Host "⚠️ WARNING: Request rejected with 401 Unauthorized" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "This might mean:" -ForegroundColor Yellow
        Write-Host "  1. Not logged in (need authentication first)" -ForegroundColor Yellow
        Write-Host "  2. Session expired" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Note: We cannot test CSRF protection without authentication." -ForegroundColor Yellow
        Write-Host "Please login to the application first, then run this test again." -ForegroundColor Yellow
        Write-Host ""
        
    } else {
        # Some other error
        Write-Host ""
        Write-Host "⚠️ UNEXPECTED: Request failed with status $statusCode" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Expected 403 (CSRF rejection) but got $statusCode" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host ""
    }
}

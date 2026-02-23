# test-create-anggota.ps1
# Test creating anggota with CSRF token
# Usage: .\test-create-anggota.ps1

Write-Host ""
Write-Host "=== Testing Create Anggota with CSRF Token ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5001/api"

# Step 1: Fetch CSRF token
Write-Host "Step 1: Fetching CSRF token..." -ForegroundColor Yellow

try {
    $tokenResponse = Invoke-WebRequest `
        -Uri "$baseUrl/csrf-token" `
        -Method GET `
        -SessionVariable session `
        -UseBasicParsing

    $data = $tokenResponse.Content | ConvertFrom-Json
    $token = $data.data.csrfToken
    
    if (-not $token) {
        Write-Host "❌ FAIL: Could not fetch CSRF token" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Token fetched: $($token.Substring(0,20))..." -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host "❌ FAIL: Error fetching CSRF token" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 2: Create anggota
Write-Host "Step 2: Creating anggota with CSRF token..." -ForegroundColor Yellow

$randomNik = "TEST$(Get-Random -Minimum 100000 -Maximum 999999)"

$anggotaData = @{
    nik = $randomNik
    namaLengkap = "Test User CSRF Token"
    tanggalLahir = "1990-01-15"
    jenisKelamin = "L"
    alamat = "Jl. Test CSRF No. 123, Jakarta"
    noHp = "08123456789"
    statusKeanggotaan = "aktif"
    email = "test.csrf@example.com"
} | ConvertTo-Json

Write-Host "Request Data:" -ForegroundColor Gray
Write-Host "  NIK: $randomNik" -ForegroundColor Gray
Write-Host "  Nama: Test User CSRF Token" -ForegroundColor Gray
Write-Host "  CSRF Token: $($token.Substring(0,20))..." -ForegroundColor Gray
Write-Host ""

try {
    $createResponse = Invoke-WebRequest `
        -Uri "$baseUrl/anggota" `
        -Method POST `
        -Headers @{
            "x-csrf-token" = $token
            "Content-Type" = "application/json"
        } `
        -Body $anggotaData `
        -WebSession $session `
        -UseBasicParsing

    $statusCode = $createResponse.StatusCode
    $resultData = $createResponse.Content | ConvertFrom-Json

    if ($statusCode -eq 200 -or $statusCode -eq 201) {
        Write-Host ""
        Write-Host "✅ PASS: Anggota created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Response Details:" -ForegroundColor Gray
        Write-Host "  Status: $statusCode" -ForegroundColor Gray
        Write-Host "  Success: $($resultData.success)" -ForegroundColor Gray
        Write-Host "  Message: $($resultData.message)" -ForegroundColor Gray
        
        if ($resultData.data) {
            Write-Host "  Anggota ID: $($resultData.data.id)" -ForegroundColor Gray
            Write-Host "  NIK: $($resultData.data.nik)" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "✅ CSRF protection is working correctly!" -ForegroundColor Green
        Write-Host ""
        
    } else {
        Write-Host ""
        Write-Host "⚠️ WARNING: Unexpected status code $statusCode" -ForegroundColor Yellow
        Write-Host "Response: $($createResponse.Content)" -ForegroundColor Yellow
        Write-Host ""
    }

} catch {
    $statusCode = 0
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    Write-Host ""
    Write-Host "❌ FAIL: Error creating anggota" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to parse error response
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $errorData = $errorBody | ConvertFrom-Json
        
        Write-Host "Error Details:" -ForegroundColor Red
        Write-Host "  Code: $($errorData.code)" -ForegroundColor Red
        Write-Host "  Message: $($errorData.message)" -ForegroundColor Red
    } catch {
        # Could not parse error
    }
    
    Write-Host ""
    
    if ($statusCode -eq 403) {
        Write-Host "⚠️ This indicates CSRF token validation failed!" -ForegroundColor Yellow
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. Token not sent in request" -ForegroundColor Yellow
        Write-Host "  2. Token expired" -ForegroundColor Yellow
        Write-Host "  3. Session mismatch" -ForegroundColor Yellow
        Write-Host ""
    }
}

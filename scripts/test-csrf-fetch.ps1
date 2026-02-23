# test-csrf-fetch.ps1
# Test CSRF token fetch endpoint
# Usage: .\test-csrf-fetch.ps1

Write-Host ""
Write-Host "=== Testing CSRF Token Fetch ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5001/api"

try {
    Write-Host "Fetching CSRF token from $baseUrl/csrf-token..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest `
        -Uri "$baseUrl/csrf-token" `
        -Method GET `
        -SessionVariable session `
        -UseBasicParsing

    $statusCode = $response.StatusCode
    Write-Host "Status Code: $statusCode" -ForegroundColor Gray

    if ($statusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        $token = $data.data.csrfToken

        if ($token -and $token.Length -gt 0) {
            Write-Host ""
            Write-Host "✅ PASS: CSRF token fetched successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "Token Details:" -ForegroundColor Gray
            Write-Host "  Value: $token" -ForegroundColor Gray
            Write-Host "  Length: $($token.Length) characters" -ForegroundColor Gray
            Write-Host "  Session ID: $($session.Cookies.GetCookies($baseUrl)['connect.sid'].Value.Substring(0,10))..." -ForegroundColor Gray
            Write-Host ""
            
            # Export token for use in other tests
            $global:CSRF_TOKEN = $token
            $global:CSRF_SESSION = $session
            
            Write-Host "Token exported to `$global:CSRF_TOKEN for subsequent tests" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ FAIL: CSRF token is empty or null" -ForegroundColor Red
            Write-Host "Response: $($response.Content)" -ForegroundColor Red
            Write-Host ""
        }
    } else {
        Write-Host ""
        Write-Host "❌ FAIL: Unexpected status code $statusCode" -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "❌ FAIL: Error fetching CSRF token" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
    Write-Host ""
}

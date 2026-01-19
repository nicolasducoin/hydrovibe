# Test script for Hydrovibe API

$apiKey = "mz05FfMgHsTFmDOmB6AKcZOaOdBq6w9d"
$baseUrl = "http://localhost:8080"

Write-Host "Testing Hydrovibe API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if API is running
Write-Host "Test 1: Checking if API is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api-docs" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ API is running! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ API is not responding. Make sure the application is running." -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Test search endpoint with a simple query
Write-Host "Test 2: Testing search endpoint with query 'Lakes water level in July 2023'..." -ForegroundColor Yellow
try {
    $query = "Lakes water level in July 2023"
    $encodedQuery = [System.Web.HttpUtility]::UrlEncode($query)
    $url = "$baseUrl/searchparams?requestString=$encodedQuery"
    
    Write-Host "  Calling: $url" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 30 -ErrorAction Stop
    
    Write-Host "✓ Request successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "✗ Request failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can also:" -ForegroundColor Yellow
Write-Host "  - Open index.html in your browser" -ForegroundColor White
Write-Host "  - Visit http://localhost:8080/swagger-ui.html for interactive API docs" -ForegroundColor White
Write-Host "  - Visit http://localhost:8080/api-docs for OpenAPI JSON" -ForegroundColor White

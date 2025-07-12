# Test Backend Connection
Write-Host "🧪 Testing backend connection..." -ForegroundColor Yellow

$backendUrl = "https://agentic-xai-401.azurewebsites.net"

# Test health endpoint
Write-Host "Testing health endpoint..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "$backendUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Health check passed: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test task endpoint
Write-Host "Testing task endpoint..." -ForegroundColor Cyan
$testPayload = @{
    task = "Test connection"
    context = "Testing if backend is working"
    priority = "medium"
} | ConvertTo-Json

try {
    $taskResponse = Invoke-WebRequest -Uri "$backendUrl/task" -Method POST -Body $testPayload -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Task endpoint working: $($taskResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($taskResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Task endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎯 Backend test completed!" -ForegroundColor Green 
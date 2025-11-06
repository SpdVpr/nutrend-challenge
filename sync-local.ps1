# Simple sync script
Write-Host "Starting Strava sync..." -ForegroundColor Cyan
Write-Host ""

$Token = "your-secret-token-change-this-123"
$Url = "http://localhost:3000/api/sync"

try {
    Write-Host "Calling API endpoint: $Url" -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $Url -Method POST -Headers @{
        "Authorization" = "Bearer $Token"
    }

    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $response.Content
    Write-Host ""
    Write-Host "Sync completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "ERROR: Sync failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
    exit 1
}
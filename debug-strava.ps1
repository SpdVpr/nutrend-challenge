# Debug Strava API
Write-Host "Loading environment variables..." -ForegroundColor Yellow

# Load .env.local
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim() -replace '^"' -replace '"$'
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

Write-Host "Running debug script..." -ForegroundColor Cyan
Write-Host ""

node scripts/debug-strava-api.js


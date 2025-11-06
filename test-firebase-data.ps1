# PowerShell script to test Firebase data
# Run with: .\test-firebase-data.ps1

Write-Host "Testing Firebase data..." -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env.local
if (Test-Path ".env.local") {
    Write-Host "Loading .env.local..." -ForegroundColor Yellow
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "Environment variables loaded" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    exit 1
}

# Create Firebase service account JSON
# Note: private_key needs to be properly escaped
$privateKey = $env:FIREBASE_PRIVATE_KEY -replace '"', ''
$serviceAccount = @"
{
  "type": "service_account",
  "project_id": "$($env:NEXT_PUBLIC_FIREBASE_PROJECT_ID)",
  "private_key": "$privateKey",
  "client_email": "$($env:FIREBASE_CLIENT_EMAIL)"
}
"@

[Environment]::SetEnvironmentVariable("FIREBASE_SERVICE_ACCOUNT_KEY", $serviceAccount, "Process")

Write-Host "Running test script..." -ForegroundColor Cyan
Write-Host ""

node scripts/test-sync.js

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green


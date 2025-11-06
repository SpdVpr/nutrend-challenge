#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Helper script to extract Firebase Service Account credentials for .env.local

.DESCRIPTION
    Extracts client_email and private_key from Firebase Service Account JSON
    and formats them for use in .env.local file

.PARAMETER JsonPath
    Path to the downloaded service account JSON file

.EXAMPLE
    .\scripts\extract-service-account.ps1 C:\Downloads\nutrend-challenge-firebase-adminsdk.json

.EXAMPLE
    .\scripts\extract-service-account.ps1 .\service-account.json
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$JsonPath
)

# Resolve full path
$fullPath = Resolve-Path $JsonPath -ErrorAction SilentlyContinue

if (-not $fullPath) {
    Write-Host "❌ Error: File not found: $JsonPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\extract-service-account.ps1 path\to\service-account.json"
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host "  .\scripts\extract-service-account.ps1 C:\Downloads\nutrend-challenge-firebase-adminsdk.json"
    exit 1
}

try {
    # Read and parse JSON
    $serviceAccount = Get-Content -Path $fullPath -Raw | ConvertFrom-Json

    $clientEmail = $serviceAccount.client_email
    $privateKey = $serviceAccount.private_key
    $projectId = $serviceAccount.project_id

    if (-not $clientEmail -or -not $privateKey -or -not $projectId) {
        Write-Host "❌ Error: Invalid service account JSON file" -ForegroundColor Red
        Write-Host "   Make sure you downloaded the correct file from Firebase Console" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "✅ Service Account credentials extracted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Copy these lines to your .env.local file:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host ("─" * 80) -ForegroundColor Gray
    Write-Host "FIREBASE_CLIENT_EMAIL=$clientEmail"
    
    # Escape the private key for .env file
    $escapedPrivateKey = $privateKey -replace "`n", "\n"
    Write-Host "FIREBASE_PRIVATE_KEY=`"$escapedPrivateKey`""
    
    Write-Host ("─" * 80) -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Keep these credentials secret! Never commit them to Git." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Project ID: $projectId" -ForegroundColor Cyan
    Write-Host "Make sure NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local matches: $projectId" -ForegroundColor Cyan
    Write-Host ""

} catch {
    Write-Host "❌ Error reading or parsing JSON file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
# Quick Start Script for Expense Management System

Write-Host "`n🚀 Starting Expense Management System" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Check if firebase-config.js exists
$firebaseConfigExists = Test-Path "client\src\services\firebase-config.js"
if (-not $firebaseConfigExists) {
    Write-Host "⚠ WARNING: firebase-config.js not found!" -ForegroundColor Red
    Write-Host "Please create client/src/services/firebase-config.js with your Firebase credentials" -ForegroundColor Yellow
    Write-Host "See SETUP_GUIDE.md for instructions`n" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Check if .env exists
$envExists = Test-Path "server\.env"
if (-not $envExists) {
    Write-Host "⚠ WARNING: server/.env not found!" -ForegroundColor Red
    Write-Host "Please create server/.env with your Firebase Admin credentials" -ForegroundColor Yellow
    Write-Host "See SETUP_GUIDE.md for instructions`n" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Check if node_modules exist
$clientModules = Test-Path "client\node_modules"
$serverModules = Test-Path "server\node_modules"

if (-not $clientModules -or -not $serverModules) {
    Write-Host "⚠ Dependencies not installed. Running installation..." -ForegroundColor Yellow
    & .\install.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n✗ Installation failed. Please check errors above." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Configuration check complete`n" -ForegroundColor Green

Write-Host "📋 Starting services..." -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Backend:  http://localhost:5000`n" -ForegroundColor Cyan

Write-Host "Press Ctrl+C to stop both services`n" -ForegroundColor Gray

# Start both client and server
$clientJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location client
    npm run dev
}

$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location server
    npm run dev
}

Write-Host "✓ Services started!`n" -ForegroundColor Green

# Monitor jobs and show output
try {
    while ($true) {
        # Get and display client output
        $clientOutput = Receive-Job -Job $clientJob
        if ($clientOutput) {
            Write-Host "[CLIENT] " -NoNewline -ForegroundColor Blue
            Write-Host $clientOutput
        }

        # Get and display server output
        $serverOutput = Receive-Job -Job $serverJob
        if ($serverOutput) {
            Write-Host "[SERVER] " -NoNewline -ForegroundColor Green
            Write-Host $serverOutput
        }

        # Check if jobs are still running
        if ($clientJob.State -eq "Failed" -or $serverJob.State -eq "Failed") {
            Write-Host "`n✗ One or more services failed" -ForegroundColor Red
            break
        }

        Start-Sleep -Milliseconds 500
    }
}
finally {
    Write-Host "`n🛑 Stopping services..." -ForegroundColor Yellow
    Stop-Job -Job $clientJob, $serverJob
    Remove-Job -Job $clientJob, $serverJob -Force
    Write-Host "✓ Services stopped`n" -ForegroundColor Green
}

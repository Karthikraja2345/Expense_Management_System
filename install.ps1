# Expense Management System - Installation Script

Write-Host "🚀 Expense Management System - Installation" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
}
catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion found`n" -ForegroundColor Green
}
catch {
    Write-Host "✗ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
 
  Write-Host "✓ Root dependencies installed`n" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -eq 0) {
 
  Write-Host "✓ Client dependencies installed`n" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install client dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -eq 0) {
 
  Write-Host "✓ Server dependencies installed`n" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install server dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Check for Firebase configuration
Write-Host "Checking Firebase configuration..." -ForegroundColor Yellow
$firebaseConfigExists = Test-Path "client\src\services\firebase-config.js"
$envExists = Test-Path "server\.env"

if (-not $firebaseConfigExists) {
    Write-Host "⚠ firebase-config.js not found in client/src/services/" -ForegroundColor Yellow
    Write-Host "  Please copy firebase-config.example.js and add your Firebase credentials" -ForegroundColor Yellow
}

if (-not $envExists) {
    Write-Host "⚠ .env not found in server/" -ForegroundColor Yellow
    Write-Host "  Please copy .env.example and add your Firebase Admin credentials" -ForegroundColor Yellow
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "✓ Installation Complete!" -ForegroundColor Green
Write-Host "=========================================`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure Firebase (see SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "2. Create firebase-config.js in client/src/services/" -ForegroundColor White
Write-Host "3. Create .env file in server/" -ForegroundColor White
Write-Host "4. Run 'npm run dev' to start the application`n" -ForegroundColor White

Write-Host "📚 For detailed setup instructions, see SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host "`nHappy coding! 🎉`n" -ForegroundColor Green

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Starting PantryPartner App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Start Metro Bundler
Write-Host "[2/3] Starting Metro Bundler..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start" -WindowStyle Normal

# Wait for Metro to initialize
Start-Sleep -Seconds 5

# Build and Run Android App
Write-Host "[3/3] Building and Running Android App..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run android" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PantryPartner is starting!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Three windows opened:" -ForegroundColor Yellow
Write-Host "  1. Backend Server (port 3001)" -ForegroundColor White
Write-Host "  2. Metro Bundler" -ForegroundColor White
Write-Host "  3. Android Build" -ForegroundColor White
Write-Host ""
Write-Host "Make sure your Android Emulator is running!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

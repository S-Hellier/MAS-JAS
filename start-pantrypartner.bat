@echo off
echo ========================================
echo Starting PantryPartner App
echo ========================================

REM Start Backend Server
echo.
echo [1/3] Starting Backend Server...
start "PantryPartner Backend" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

REM Start Metro Bundler
echo [2/3] Starting Metro Bundler...
start "PantryPartner Metro" cmd /k "cd frontend && npm start"

REM Wait 5 seconds for Metro to initialize
timeout /t 5 /nobreak >nul

REM Build and Run Android App
echo [3/3] Building and Running Android App...
start "PantryPartner Android Build" cmd /k "cd frontend && npm run android"

echo.
echo ========================================
echo PantryPartner is starting!
echo ========================================
echo.
echo Three windows will open:
echo   1. Backend Server (port 3001)
echo   2. Metro Bundler
echo   3. Android Build
echo.
echo Wait for the build to complete...
echo.
pause

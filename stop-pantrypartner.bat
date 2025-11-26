@echo off
echo ========================================
echo Stopping PantryPartner App
echo ========================================

REM Kill Metro Bundler (Node process on port 8081)
echo Stopping Metro Bundler...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /F /PID %%a 2>nul

REM Kill Backend Server (Node process on port 3001)
echo Stopping Backend Server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /F /PID %%a 2>nul

REM Kill any Gradle processes
echo Stopping Gradle processes...
taskkill /F /IM java.exe /FI "WINDOWTITLE eq *gradle*" 2>nul

echo.
echo ========================================
echo All PantryPartner processes stopped!
echo ========================================
echo.
pause

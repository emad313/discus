@echo off
echo ================================================
echo  Mediasoup Build Tools Installer for Windows
echo ================================================
echo.
echo This script will help you install the necessary
echo build tools for Mediasoup on Windows.
echo.
echo What will be installed:
echo   1. node-gyp (Node.js native addon build tool)
echo   2. Visual Studio Build Tools (C++ compiler)
echo.
echo NOTE: This requires Administrator privileges
echo       and about 7 GB of disk space.
echo.
pause

echo.
echo [1/3] Installing node-gyp globally...
call npm install -g node-gyp
if %errorlevel% neq 0 (
    echo ERROR: Failed to install node-gyp
    pause
    exit /b 1
)
echo ✓ node-gyp installed successfully
echo.

echo [2/3] Checking for Visual Studio Build Tools...
where cl.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Visual Studio Build Tools already installed!
    goto :build_mediasoup
)

echo.
echo Visual Studio Build Tools NOT found.
echo.
echo Please install Visual Studio Build Tools manually:
echo.
echo 1. Download from: https://aka.ms/vs/17/release/vs_BuildTools.exe
echo 2. Run the installer
echo 3. Select "Desktop development with C++"
echo 4. Click Install (requires ~7 GB)
echo 5. Restart your computer
echo 6. Run this script again
echo.
echo Press any key to open download page in browser...
pause >nul
start https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
echo.
echo After installation, restart your computer and run this script again.
pause
exit /b 0

:build_mediasoup
echo [3/3] Building Mediasoup...
cd /d "%~dp0..\backend"
if not exist "package.json" (
    echo ERROR: backend/package.json not found
    echo Please run this script from the scripts folder
    pause
    exit /b 1
)

echo.
echo Rebuilding mediasoup with native dependencies...
call npm rebuild mediasoup
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Mediasoup build failed
    echo.
    echo Common solutions:
    echo   1. Make sure Visual Studio Build Tools are installed
    echo   2. Restart your computer after installing Build Tools
    echo   3. Run this script as Administrator
    echo   4. Check: npm config set msvs_version 2022
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo  ✓ SUCCESS! Mediasoup built successfully
echo ================================================
echo.
echo You can now start the backend server:
echo   cd backend
echo   npm run dev
echo.
echo The server should show:
echo   [INFO] Mediasoup workers initialized successfully
echo.
pause

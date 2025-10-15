@echo off
REM Discus - Start Development Servers
echo ================================================
echo   Discus - Starting Development Mode
echo ================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo OK: Node.js is installed
node --version
echo.

REM Start backend in background
echo Starting Backend Server (port 3000)...
start "Discus Backend" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting Frontend Server (port 5173)...
echo.
echo ================================================
echo   Development Servers Starting...
echo ================================================
echo.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
echo Press Ctrl+C in backend window to stop
echo ================================================
echo.

cd frontend && npm run dev

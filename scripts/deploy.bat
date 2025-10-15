@echo off
REM Discus Video Conferencing - Easy Deploy Script for Windows
REM Supports 100+ concurrent users with Docker

echo ================================================
echo   Discus Video Conferencing - Easy Deploy
echo ================================================
echo.
echo This script will deploy Discus with Docker.
echo Supports 100+ concurrent users!
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed!
    echo.
    echo Please install Docker Desktop first:
    echo   https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo OK: Docker is installed
docker --version
echo.

REM Check if docker-compose is available
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not installed!
    echo.
    echo Please install Docker Compose:
    echo   https://docs.docker.com/compose/install/
    echo.
    pause
    exit /b 1
)

echo OK: Docker Compose is available
docker-compose --version
echo.

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env and update these values:
    echo    - DB_PASSWORD
    echo    - REDIS_PASSWORD
    echo    - JWT_SECRET
    echo    - TURN_PASSWORD
    echo    - PUBLIC_IP ^(your server's public IP^)
    echo.
    pause
)

REM Build and start services
echo.
echo Building Docker images...
echo This may take 5-10 minutes on first run ^(compiling Mediasoup^)...
echo.

docker-compose build

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo OK: Build complete!
echo.
echo Starting services...
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start services!
    pause
    exit /b 1
)

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo.
echo Service Status:
docker-compose ps

echo.
echo ================================================
echo   Deployment Complete!
echo ================================================
echo.
echo   Access Your Application:
echo ================================================
echo.
echo   Frontend:  http://localhost
echo   Backend:   http://localhost:3000
echo   Health:    http://localhost:3000/health
echo.
echo ================================================
echo   Useful Commands:
echo ================================================
echo.
echo   View logs:     docker-compose logs -f
echo   Stop:          docker-compose down
echo   Restart:       docker-compose restart
echo   Update:        git pull ^&^& docker-compose up -d --build
echo.
echo Your 100+ user video conferencing platform is ready!
echo.
pause

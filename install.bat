@echo off
echo ====================================
echo   Game Saver CLI - Installation
echo ====================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please install Git first: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 16+: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking requirements...
node -v
git --version
echo.

echo [2/4] Cloning repository...
if exist "choi-cung-teppy" (
    echo Folder already exists, updating...
    cd choi-cung-teppy
    git pull
) else (
    git clone https://github.com/duonghuyhieu/choi-cung-teppy.git
    cd choi-cung-teppy
)
echo.

echo [3/4] Installing dependencies...
call npm install
echo.

echo [4/4] Starting CLI...
echo.
call npm run cli

pause

@echo off
SETLOCAL EnableDelayedExpansion

:: Change to the directory of the script
cd /d "%~dp0"

echo ========================================
echo   Lexicon - Launch Script
echo ========================================

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install it from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies
echo [1/3] Installing dependencies...
call npm install

:: Launch browser (delayed slightly to give server time to initialize)
echo [2/3] Launching browser to http://localhost:3000...
start http://localhost:3000

:: Start the development server
echo [3/3] Starting development server...
echo.
call npm run dev

pause

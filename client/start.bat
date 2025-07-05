@echo off
title BotWeaver - Secure Discord Bot Builder Setup
color 0A

echo ========================================
echo    🤖 BotWeaver v1.0
echo    Secure Self-Hosted Discord Bot Builder
echo ========================================
echo.

REM Node.js check
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js not found!
    echo.
    echo BotWeaver needs Node.js to work. Please install it first:
    echo 1. Go to: https://nodejs.org
    echo 2. Download the LTS version (recommended)
    echo 3. Install it with default settings
    echo 4. Restart this script
    echo.
    echo After installing Node.js, double-click this file again.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM npm check
echo.
echo [2/5] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm not found!
    echo.
    echo npm should come with Node.js. Try:
    echo 1. Reinstalling Node.js from https://nodejs.org
    echo 2. Make sure to restart your computer after installation
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ npm found:
npm --version

REM Install dependencies
echo.
echo [3/5] Checking dependencies...
if not exist "node_modules" (
    echo 📦 First installation - installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Failed to install main dependencies!
        echo.
        echo This could happen due to:
        echo 1. Internet connection issues
        echo 2. Antivirus blocking the installation
        echo 3. Insufficient permissions
        echo.
        echo Solutions:
        echo - Check your internet connection
        echo - Try running as Administrator (right-click → Run as administrator)
        echo - Temporarily disable antivirus and try again
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo 📦 Installing client dependencies...
    cd client
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Failed to install client dependencies!
        pause
        exit /b 1
    )
    cd ..
    echo ✅ All dependencies installed!
) else (
    echo ✅ Dependencies already installed
)

REM Client build
echo.
echo [4/5] Checking client build...
if not exist "client\dist" (
    echo 🔨 Building client application...
    cd client
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Client build failed!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Client build completed!
) else (
    echo ✅ Client build exists
)

REM Port check
echo.
echo [5/5] Checking port availability...
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3001 in use, terminating existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo ✅ Port ready

echo.
echo ========================================
echo     🤖 BotWeaver Starting Securely
echo ========================================
echo.
echo 🌐 Web Interface: http://localhost:3001
echo 📡 API Endpoint: http://localhost:3001/api
echo 🛡️ Security: Self-hosted and Discord ToS compliant
echo.
echo ⏹️  Press Ctrl+C to stop
echo 📖 Opening BotWeaver in your browser...
echo.

REM Wait a moment then open browser
timeout /t 3 /nobreak >nul
start "" "http://localhost:3001"

REM Start server
call npm start

echo.
echo ========================================
echo   BotWeaver shutdown complete
echo ========================================
pause

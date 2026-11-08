@echo off
REM ==============================================================================
REM Autonomous AI Trading Firm - Windows Laptop Setup Script
REM ==============================================================================
echo ================================================================================
echo           AUTONOMOUS AI TRADING FIRM - WINDOWS LAPTOP INSTALLER
echo ================================================================================

python --version >nul 2>&1
if errorlevel 1 (
    echo [!] Python is not installed or not in your PATH.
    echo [i] Please install Python 3.10+ from https://www.python.org/downloads/
    echo [i] Make sure to check "Add python.exe to PATH" during installation.
    pause
    exit /b 1
)

echo [*] Python detected.
if not exist "venv" (
    echo [*] Creating virtual environment in venv...
    python -m venv venv
)

echo [*] Activating virtual environment...
call venv\Scripts\activate.bat

echo [*] Installing dependencies from requirements.txt...
python -m pip install --upgrade pip
pip install -r requirements.txt

if not exist ".env" (
    if exist ".env.example" (
        echo [*] Creating .env from .env.example...
        copy .env.example .env
    )
)

echo.
echo ================================================================================
echo [+] Installation completed successfully!
echo ================================================================================
echo To dispatch the multi-agent trading desk:
echo.
echo   call venv\Scripts\activate
echo   python main.py --ticker RELIANCE --exchange NSE --currency INR
echo   python main.py --ticker 500325 --exchange BSE --currency INR
echo   python main.py --ticker SENSEX --exchange BSE --currency INR
echo.
echo Or run with Docker:
echo   docker compose up --build
echo ================================================================================
pause

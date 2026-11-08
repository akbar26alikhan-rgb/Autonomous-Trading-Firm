#!/usr/bin/env bash
# ==============================================================================
# Autonomous AI Trading Firm - Laptop Setup Script (Mac / Linux)
# ==============================================================================
set -e

echo "================================================================================"
echo "          AUTONOMOUS AI TRADING FIRM - LOCAL LAPTOP INSTALLER"
echo "================================================================================"

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "[!] Error: Python 3 is not installed on your laptop."
    echo "[i] Please install Python 3.10+ from https://www.python.org/downloads/"
    exit 1
fi

echo "[*] Detected Python: $(python3 --version)"

# Create virtual environment if not present
if [ ! -d "venv" ]; then
    echo "[*] Creating virtual environment in ./venv..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "[*] Activating virtual environment..."
source venv/bin/activate

# Upgrade pip and install dependencies
echo "[*] Installing Python quantitative trading dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[*] Creating .env file from .env.example..."
    cp .env.example .env
    echo "[i] Tip: Add your GEMINI_API_KEY into .env for live Gemini AI models."
fi

echo ""
echo "================================================================================"
echo "[+] Setup successfully completed!"
echo "================================================================================"
echo "To run the autonomous trading committee on any stock:"
echo ""
echo "  1. Activate environment:   source venv/bin/activate"
echo "  2. Run Indian NSE stock:   python main.py --ticker RELIANCE --exchange NSE --currency INR"
echo "  3. Run Indian BSE stock:   python main.py --ticker 500325 --exchange BSE --currency INR"
echo "  4. Run Sensex benchmark:   python main.py --ticker SENSEX --exchange BSE --currency INR"
echo "  5. Run US tech stock:      python main.py --ticker NVDA --currency USD"
echo ""
echo "  Or run with Docker:        docker compose up --build"
echo "================================================================================"

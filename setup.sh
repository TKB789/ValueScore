#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Graham Value Platform - Quick Setup Script             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detected: $(node --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "📝 NEXT STEP: Edit .env and add your API keys:"
    echo "   1. Get Alpha Vantage key: https://www.alphavantage.co/"
    echo "   2. Get Finnhub key: https://finnhub.io/"
    echo "   3. Open .env and paste your keys"
    echo ""
    exit 0
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✓ Dependencies installed"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✓ Dependencies already installed"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "To start the backend server, run:"
echo "   npm start"
echo ""
echo "The server will run on: http://localhost:3001"
echo ""
echo "For frontend setup, see README.md"
echo ""

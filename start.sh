#!/bin/bash

# BotWeaver - Secure Discord Bot Builder Setup Script
# Usage: ./start.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo -e "    🤖 BotWeaver v1.0"
echo -e "    Secure Self-Hosted Discord Bot Builder"
echo -e "========================================${NC}"
echo

# Node.js check
echo -e "${YELLOW}[1/5] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ERROR: Node.js not found!${NC}"
    echo
    echo "Download Node.js from: https://nodejs.org"
    echo "Minimum requirement: Node.js v18 or higher"
    echo
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# npm check
echo
echo -e "${YELLOW}[2/5] Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ ERROR: npm not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

# Install dependencies
echo
echo -e "${YELLOW}[3/5] Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 First installation - installing dependencies...${NC}"
    echo "This may take a few minutes..."
    echo
    npm install
    
    echo
    echo -e "${BLUE}📦 Installing client dependencies...${NC}"
    cd client
    npm install
    cd ..
    echo -e "${GREEN}✅ All dependencies installed!${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Client build
echo
echo -e "${YELLOW}[4/5] Checking client build...${NC}"
if [ ! -d "client/dist" ]; then
    echo -e "${BLUE}🔨 Building client...${NC}"
    cd client
    npm run build
    cd ..
    echo -e "${GREEN}✅ Client build completed!${NC}"
else
    echo -e "${GREEN}✅ Client build exists${NC}"
fi

# Port check
echo
echo -e "${YELLOW}[5/5] Checking port...${NC}"
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
    echo -e "${YELLOW}⚠️  Port 3001 in use, terminating existing process...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}✅ Port ready${NC}"

echo
echo -e "${BLUE}========================================"
echo -e "     🚀 Starting Discord Bot Builder"
echo -e "========================================${NC}"
echo
echo -e "${GREEN}🌐 Web Interface: http://localhost:3001${NC}"
echo -e "${GREEN}📡 API Endpoint: http://localhost:3001/api${NC}"
echo -e "${GREEN}🛡️ Security: Self-hosted and Discord ToS compliant${NC}"
echo
echo -e "${YELLOW}⏹️  Press Ctrl+C to stop${NC}"
echo

# Open browser (optional)
if command -v xdg-open &> /dev/null; then
    sleep 3 && xdg-open http://localhost:3001 &
elif command -v open &> /dev/null; then
    sleep 3 && open http://localhost:3001 &
fi

# Start server
npm start

echo
echo -e "${BLUE}========================================"
echo -e "   BotWeaver shutdown complete"
echo -e "========================================${NC}"

#!/bin/bash

echo "================================================"
echo " Mediasoup Build Tools Installer (Linux/Mac)"
echo "================================================"
echo ""
echo "This script will install build tools for Mediasoup"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Detected: Linux"
    
    if command -v apt-get &> /dev/null; then
        echo "Installing build tools with apt-get..."
        sudo apt-get update
        sudo apt-get install -y build-essential python3 python3-pip
    elif command -v yum &> /dev/null; then
        echo "Installing build tools with yum..."
        sudo yum groupinstall "Development Tools"
        sudo yum install python3
    else
        echo "ERROR: Package manager not found"
        exit 1
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected: macOS"
    echo "Installing Xcode Command Line Tools..."
    xcode-select --install
else
    echo "ERROR: Unsupported OS: $OSTYPE"
    exit 1
fi

echo ""
echo "Installing node-gyp globally..."
npm install -g node-gyp

echo ""
echo "Building Mediasoup..."
cd "$(dirname "$0")/../backend"

if [ ! -f "package.json" ]; then
    echo "ERROR: backend/package.json not found"
    exit 1
fi

npm rebuild mediasoup

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo " ✓ SUCCESS! Mediasoup built successfully"
    echo "================================================"
    echo ""
    echo "You can now start the backend server:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
else
    echo ""
    echo "ERROR: Mediasoup build failed"
    exit 1
fi

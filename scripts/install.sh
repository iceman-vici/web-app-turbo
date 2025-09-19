#!/bin/bash

# Installation script with dependency resolution

set -e

echo "🚀 Installing Web App Turbo Dependencies"
echo "========================================"

# Function to install with fallback
install_with_fallback() {
    local dir=$1
    echo "📦 Installing dependencies in $dir..."
    
    cd $dir
    
    # Try normal install first
    if npm install 2>/dev/null; then
        echo "✅ $dir dependencies installed successfully"
    else
        echo "⚠️  Retrying with --legacy-peer-deps for $dir..."
        npm install --legacy-peer-deps
        echo "✅ $dir dependencies installed with legacy peer deps"
    fi
    
    cd ..
}

# Clean previous installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
install_with_fallback "backend"

# Install frontend dependencies
install_with_fallback "frontend"

echo ""
echo "✨ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your credentials"
echo "2. Configure frontend/.env with your API URL"
echo "3. Start development: npm run dev"
echo ""
echo "If you still encounter issues, try:"
echo "  npm install --legacy-peer-deps"
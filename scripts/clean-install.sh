#!/bin/bash

# Clean installation script for Web App Turbo

set -e

echo "🧹 Cleaning previous installations..."
echo "==================================="

# Remove all node_modules and lock files
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Remove build artifacts
rm -rf backend/dist
rm -rf frontend/build
rm -rf frontend/dist

# Remove TypeScript build info if exists
rm -f backend/*.tsbuildinfo
rm -f frontend/*.tsbuildinfo

echo "✅ Cleanup complete"
echo ""

echo "📦 Installing dependencies..."
echo "============================"

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies (JavaScript/JSX)
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed"
echo ""

echo "🔧 Setting up environment files..."
echo "================================="

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please configure backend/.env with your credentials"
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend/.env from template..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please configure frontend/.env with your API URL"
fi

echo ""
echo "🎉 Installation complete!"
echo "========================"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with:"
echo "   - Google Service Account (base64)"
echo "   - Dialpad API key"
echo "   - Redis URL"
echo "   - JWT Secret"
echo ""
echo "2. Configure frontend/.env with:"
echo "   - VITE_API_URL"
echo "   - VITE_WS_URL"
echo ""
echo "3. Start Redis:"
echo "   docker-compose up redis -d"
echo ""
echo "4. Start development servers:"
echo "   npm run dev"
echo ""
echo "Frontend is now using JavaScript/JSX (no TypeScript)! 🚀"
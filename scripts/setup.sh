#!/bin/bash

# Web App Turbo Setup Script

set -e

echo "🚀 Web App Turbo Setup"
echo "======================"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker is recommended but not installed."; }

echo "✅ Prerequisites checked"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
echo "✅ Dependencies installed"

# Create environment files
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please configure backend/.env with your credentials"
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env from template..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please configure frontend/.env with your API URL"
fi

# Create logs directory
mkdir -p backend/logs
echo "✅ Logs directory created"

# Generate JWT secret if not set
if grep -q "your-super-secret-jwt-key" backend/.env; then
    echo "🔐 Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your-super-secret-jwt-key/$JWT_SECRET/g" backend/.env
    else
        sed -i "s/your-super-secret-jwt-key/$JWT_SECRET/g" backend/.env
    fi
    echo "✅ JWT secret generated"
fi

# Build TypeScript
echo "🔨 Building backend..."
cd backend && npm run build && cd ..
echo "✅ Backend built"

# Docker setup
if command -v docker >/dev/null 2>&1; then
    echo "🐳 Docker detected. Run 'docker-compose up' to start with Docker"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your credentials:"
echo "   - Google Service Account (base64 encoded)"
echo "   - Dialpad API key"
echo "   - Router Spreadsheet ID"
echo "2. Configure frontend/.env with your API URL"
echo "3. Start Redis: docker-compose up redis"
echo "4. Start development: npm run dev"
echo ""
echo "For production deployment, see docs/DEPLOYMENT.md"
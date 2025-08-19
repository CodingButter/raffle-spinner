#!/bin/bash

# DrawDay Development Environment Setup Script
# This script sets up the complete development environment

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "======================================"
echo "DrawDay Development Environment Setup"
echo "======================================"

# Check prerequisites
echo "Checking prerequisites..."

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
MIN_NODE_VERSION="20.0.0"
if [ "$(printf '%s\n' "$MIN_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$MIN_NODE_VERSION" ]; then
    echo "❌ Node.js version must be >= $MIN_NODE_VERSION (current: $NODE_VERSION)"
    exit 1
fi
echo "✅ Node.js version: $NODE_VERSION"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Install it with: npm install -g pnpm"
    exit 1
fi
echo "✅ pnpm is installed"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi
echo "✅ Docker is installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install Docker Compose."
    exit 1
fi
echo "✅ docker-compose is installed"

echo ""
echo "Setting up environment files..."

# Backend .env setup
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "Creating backend/.env from example..."
    cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env"
    echo "⚠️  Please update backend/.env with your configuration"
else
    echo "✅ backend/.env exists"
fi

# Website .env.local setup
if [ ! -f "$PROJECT_ROOT/apps/website/.env.local" ]; then
    echo "Creating apps/website/.env.local..."
    if [ -f "$PROJECT_ROOT/apps/website/.env.development" ]; then
        cp "$PROJECT_ROOT/apps/website/.env.development" "$PROJECT_ROOT/apps/website/.env.local"
        echo "⚠️  Please update apps/website/.env.local with your Stripe keys"
    else
        echo "❌ apps/website/.env.development not found"
    fi
else
    echo "✅ apps/website/.env.local exists"
fi

# Extension .env setup
if [ ! -f "$PROJECT_ROOT/apps/spinner-extension/.env" ]; then
    echo "Creating apps/spinner-extension/.env..."
    if [ -f "$PROJECT_ROOT/apps/spinner-extension/.env.development" ]; then
        cp "$PROJECT_ROOT/apps/spinner-extension/.env.development" "$PROJECT_ROOT/apps/spinner-extension/.env"
        echo "✅ Extension environment created"
    else
        echo "⚠️  apps/spinner-extension/.env.development not found"
    fi
else
    echo "✅ apps/spinner-extension/.env exists"
fi

echo ""
echo "Installing dependencies..."
cd "$PROJECT_ROOT"
pnpm install

echo ""
echo "Building packages..."
pnpm build

echo ""
echo "Starting backend services..."
cd "$PROJECT_ROOT/backend"
docker-compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 5

# Check if Directus is running
if curl -s http://localhost:8055/server/health > /dev/null; then
    echo "✅ Directus is running at http://localhost:8055"
else
    echo "⚠️  Directus is not responding. Check logs with: pnpm backend:logs"
fi

echo ""
echo "======================================"
echo "✅ Development environment setup complete!"
echo "======================================"
echo ""
echo "Available commands:"
echo "  pnpm dev:all       - Start all services (website, extension, backend)"
echo "  pnpm dev:frontend  - Start website and extension only"
echo "  pnpm dev:website   - Start website only"
echo "  pnpm dev:extension - Start extension standalone server"
echo ""
echo "  pnpm backend:start - Start backend services (detached)"
echo "  pnpm backend:stop  - Stop backend services"
echo "  pnpm backend:logs  - View backend logs"
echo "  pnpm backend:reset - Reset backend (removes all data)"
echo ""
echo "Service URLs:"
echo "  Website:   http://localhost:3000"
echo "  Extension: http://localhost:5174"
echo "  Directus:  http://localhost:8055"
echo ""
echo "Next steps:"
echo "1. Update environment files with your API keys"
echo "2. Run 'pnpm dev:all' to start all services"
echo "3. Open http://localhost:3000 for the website"
echo "4. Open http://localhost:5174 for the extension standalone"
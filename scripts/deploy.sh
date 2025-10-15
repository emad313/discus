#!/bin/bash

# Discus Video Conferencing - Easy Deploy Script
# Supports 100+ concurrent users with Docker

set -e  # Exit on error

echo "================================================"
echo "  🎥 Discus Video Conferencing - Easy Deploy"
echo "================================================"
echo ""
echo "This script will deploy Discus with Docker."
echo "Supports 100+ concurrent users!"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo ""
    echo "Please install Docker first:"
    echo "  Windows/Mac: https://www.docker.com/products/docker-desktop/"
    echo "  Linux: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

echo "✅ Docker is installed: $(docker --version)"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo ""
    echo "Please install Docker Compose:"
    echo "  https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker Compose is available"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and update these values:"
    echo "   - DB_PASSWORD"
    echo "   - REDIS_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - TURN_PASSWORD"
    echo "   - PUBLIC_IP (your server's public IP)"
    echo ""
    read -p "Press Enter after editing .env to continue..."
fi

# Get public IP
echo "🌐 Detecting public IP address..."
PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
echo "Detected IP: $PUBLIC_IP"
echo ""

# Ask if user wants to use detected IP
read -p "Use this IP in .env? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sed -i.bak "s/PUBLIC_IP=.*/PUBLIC_IP=$PUBLIC_IP/" .env
    echo "✅ Updated PUBLIC_IP in .env"
fi
echo ""

# Build and start services
echo "🚀 Building Docker images..."
echo "This may take 5-10 minutes on first run (compiling Mediasoup)..."
echo ""

docker-compose build

echo ""
echo "✅ Build complete!"
echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "================================================"
echo "  Access Your Application:"
echo "================================================"
echo ""
echo "  🌐 Frontend:  http://localhost"
echo "  🔧 Backend:   http://localhost:3000"
echo "  ❤️  Health:    http://localhost:3000/health"
echo ""
echo "================================================"
echo "  Useful Commands:"
echo "================================================"
echo ""
echo "  View logs:     docker-compose logs -f"
echo "  Stop:          docker-compose down"
echo "  Restart:       docker-compose restart"
echo "  Update:        git pull && docker-compose up -d --build"
echo ""
echo "================================================"
echo "  Firewall Configuration (if deploying on server):"
echo "================================================"
echo ""
echo "  sudo ufw allow 80/tcp      # HTTP"
echo "  sudo ufw allow 443/tcp     # HTTPS"
echo "  sudo ufw allow 3000/tcp    # API"
echo "  sudo ufw allow 3478/tcp    # TURN/STUN"
echo "  sudo ufw allow 3478/udp    # TURN/STUN"
echo "  sudo ufw allow 10000:10100/tcp  # WebRTC Media"
echo "  sudo ufw allow 10000:10100/udp  # WebRTC Media"
echo ""
echo "🎥 Your 100+ user video conferencing platform is ready!"
echo ""

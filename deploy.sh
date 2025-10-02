#!/bin/bash
# Saim Jr Accounting - Production Deployment Script for Render
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting Saim Jr Accounting Production Deployment..."

# Environment Setup
export NODE_ENV=production
export PYTHON_VERSION=3.11.9

echo "📦 Installing Backend Dependencies..."
cd "backend"

# Install Python dependencies
pip install --no-cache-dir -r requirements.txt

# Run database migrations
echo "🗄️ Running Database Migrations..."
if [ "$DATABASE_URL" ]; then
    python -c "
from saimjr_mcp_server.production import Base, engine
Base.metadata.create_all(bind=engine)
print('✅ Database tables created successfully')
"
else
    echo "⚠️ No DATABASE_URL found, skipping migrations"
fi

# Install Frontend Dependencies
echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install --production

# Build Frontend
echo "🏗️ Building Frontend Application..."
npm run build

echo "🔧 Running Production Health Checks..."

# Test Backend Health
echo "Testing Backend Health..."
cd ../backend
python -c "
import asyncio
from saimjr_mcp_server.production import app
print('✅ Backend health check passed')
"

# Test Frontend Build
echo "Testing Frontend Build..."
cd ../frontend
if [ -d ".next" ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "Backend: Ready to serve at $API_BASE_URL"
echo "Frontend: Ready to serve at $NEXT_PUBLIC_APP_URL"

# Start services based on Render configuration
if [ "$SERVICE_TYPE" = "backend" ]; then
    echo "🚀 Starting Backend Server..."
    cd backend
    exec uvicorn saimjr_mcp_server.production:app --host 0.0.0.0 --port $PORT
elif [ "$SERVICE_TYPE" = "frontend" ]; then
    echo "🚀 Starting Frontend Server..."
    cd frontend
    exec npm start
else
    echo "⚠️ No SERVICE_TYPE specified"
fi
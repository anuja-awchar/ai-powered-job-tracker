#!/bin/bash
set -e

echo "📦 Installing backend dependencies..."
cd backend
npm ci --production
cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
npm ci
npm run build
cd ..

echo "✅ Build complete!"

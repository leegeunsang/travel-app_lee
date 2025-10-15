#!/bin/bash
set -e

echo "🔨 Starting Vite build..."
npm run build

echo "✅ Build completed!"
echo "📁 Output directory: dist"

# Verify dist folder exists
if [ -d "dist" ]; then
  echo "✓ dist folder found"
  ls -la dist/
else
  echo "✗ ERROR: dist folder not found!"
  exit 1
fi

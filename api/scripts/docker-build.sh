#!/bin/bash
set -e

echo "🔨 Building API for Docker..."

# Limpar dist anterior
rm -rf dist

# Build do NestJS
echo "📦 Building NestJS..."
npm run build:dev

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
    echo "❌ Build failed: dist/main.js not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Files ready in dist/"

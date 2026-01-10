#!/bin/sh
set -e

echo "=========================================="
echo "  GO-API - Starting Services"
echo "=========================================="

# Verificar se ffmpeg está disponível
if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "❌ ERROR: ffmpeg not found in PATH"
    exit 1
fi
echo "✅ ffmpeg found: $(which ffmpeg)"

# Sincronizar schema do Prisma
echo "🔄 Running Prisma db push..."
if ! npx prisma@5.22.0 db push --accept-data-loss --skip-generate; then
    echo "❌ ERROR: Prisma db push failed"
    exit 1
fi
echo "✅ Database schema synced!"

# Iniciar Nginx (proxy CORS na porta 3001)
echo "🚀 Starting Nginx (CORS proxy on port 3001)..."
nginx

# Iniciar API na porta 3002 (interno)
echo "🚀 Starting API on port 3002 (internal)..."
export PORT=3002
exec node dist/main.js

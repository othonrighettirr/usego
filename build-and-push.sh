#!/bin/bash
echo "=========================================="
echo "  GO-API - Build e Push para Docker Hub"
echo "=========================================="

DOCKER_USER="usegoapi"

echo ""
echo "[1/4] Fazendo build do Backend..."
docker build -t $DOCKER_USER/gopro-backend:latest -f api/Dockerfile .

echo ""
echo "[2/4] Fazendo build do Frontend..."
docker build -t $DOCKER_USER/gopro-frontend:latest -f frontend/Dockerfile .

echo ""
echo "[3/4] Push Backend para Docker Hub..."
docker push $DOCKER_USER/gopro-backend:latest

echo ""
echo "[4/4] Push Frontend para Docker Hub..."
docker push $DOCKER_USER/gopro-frontend:latest

echo ""
echo "=========================================="
echo "  Build e Push concluidos!"
echo "=========================================="
echo ""
echo "Imagens disponiveis:"
echo "  - $DOCKER_USER/gopro-backend:latest"
echo "  - $DOCKER_USER/gopro-frontend:latest"

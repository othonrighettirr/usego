#!/bin/bash
set -e

echo "=========================================="
echo "  GO-API Backend - Iniciando"
echo "=========================================="

# Aguardar PostgreSQL estar pronto
echo "Aguardando PostgreSQL em ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
max_attempts=60
attempt=0

while ! nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432} 2>/dev/null; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "ERRO: PostgreSQL não disponível após $max_attempts tentativas"
        exit 1
    fi
    echo "Tentativa $attempt/$max_attempts - PostgreSQL não disponível, aguardando..."
    sleep 2
done

echo "PostgreSQL conectado!"

# Aguardar mais um pouco para garantir que o banco está pronto para conexões
sleep 3

# Executar migrations do Prisma
echo "Sincronizando schema do banco de dados..."
if npx prisma@5.22.0 db push --accept-data-loss --skip-generate; then
    echo "Schema sincronizado com sucesso!"
else
    echo "ERRO: Falha ao sincronizar schema"
    exit 1
fi

# Iniciar Nginx em background
echo "Iniciando Nginx (proxy na porta 3000)..."
nginx

# Iniciar API na porta 3001 (interno)
echo "Iniciando API na porta 3001..."
export PORT=3001
exec node dist/main.js

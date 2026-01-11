# =============================================
# GO-API Backend - Dockerfile Otimizado
# Apenas API + Nginx (PostgreSQL externo)
# =============================================

FROM node:20-alpine AS builder

RUN apk add --no-cache git python3 make g++

WORKDIR /build

# Baileys pré-compilado
COPY baileys/lib/ ./baileys/lib/
COPY baileys/WAProto/ ./baileys/WAProto/
COPY baileys/engine-requirements.js ./baileys/

RUN echo '{"name":"baileys","type":"module","version":"7.0.0-rc.9","main":"lib/index.js","dependencies":{"@cacheable/node-cache":"^1.4.0","@hapi/boom":"^9.1.3","async-mutex":"^0.5.0","libsignal":"git+https://github.com/whiskeysockets/libsignal-node","lru-cache":"^11.1.0","music-metadata":"^11.7.0","node-addon-api":"^8.5.0","p-queue":"^9.0.0","pino":"^9.6","protobufjs":"^7.2.4","ws":"^8.13.0"},"peerDependencies":{"jimp":"^1.6.0","link-preview-js":"^3.0.0","sharp":"*"},"peerDependenciesMeta":{"jimp":{"optional":true},"link-preview-js":{"optional":true}}}' > ./baileys/package.json

# Dependências
COPY api/package*.json ./
RUN sed -i 's|"baileys": "file:../baileys"|"baileys": "file:./baileys"|g' package.json
RUN npm install --legacy-peer-deps --omit=dev

# Prisma
COPY api/prisma/ ./prisma/
RUN npx prisma@5.22.0 generate

# =============================================
# Runtime - Imagem Final Leve
# =============================================
FROM node:20-alpine

LABEL maintainer="GO-API"
LABEL description="WhatsApp API Backend"

RUN apk add --no-cache curl openssl ffmpeg nginx bash && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar do builder
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/baileys ./baileys
COPY --from=builder /build/prisma ./prisma
COPY api/dist/ ./dist/

# Nginx com CORS
RUN cat > /etc/nginx/http.d/default.conf << 'EOF'
server {
    listen 3000;
    server_name _;
    client_max_body_size 50M;
    
    location / {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, Origin, X-Requested-With, x-api-key, X-Api-Key, X-API-KEY, apikey' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' '86400' always;
            return 204;
        }
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, Origin, X-Requested-With, x-api-key, X-Api-Key, X-API-KEY, apikey' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        
        proxy_hide_header 'Access-Control-Allow-Origin';
        proxy_hide_header 'Access-Control-Allow-Methods';
        proxy_hide_header 'Access-Control-Allow-Headers';
        proxy_hide_header 'Access-Control-Allow-Credentials';
    }
    
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
EOF

# Script de inicialização
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

echo "=========================================="
echo "  GO-API Backend"
echo "=========================================="

# Aguardar PostgreSQL estar pronto
echo "Aguardando PostgreSQL..."
until nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432} 2>/dev/null; do
    echo "PostgreSQL não disponível, aguardando..."
    sleep 2
done
echo "PostgreSQL conectado!"

# Executar migrations
echo "Sincronizando schema..."
npx prisma@5.22.0 db push --accept-data-loss --skip-generate
echo "Schema sincronizado!"

# Iniciar Nginx
echo "Iniciando Nginx..."
nginx

# Iniciar API
echo "Iniciando API na porta 3001..."
export PORT=3001
exec node dist/main.js
EOF

RUN chmod +x /app/start.sh
RUN apk add --no-cache netcat-openbsd
RUN mkdir -p /app/sessions && chmod 777 /app/sessions

EXPOSE 3000

VOLUME ["/app/sessions"]

CMD ["/app/start.sh"]

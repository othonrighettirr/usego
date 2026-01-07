FROM node:20-alpine

RUN apk add --no-cache curl git python3 make g++ openssl ffmpeg nginx

WORKDIR /app

# =============================================
# BAILEYS - Copiar apenas arquivos pré-compilados
# =============================================
RUN mkdir -p ./baileys/lib ./baileys/WAProto

COPY baileys/engine-requirements.js ./baileys/
COPY baileys/lib/ ./baileys/lib/
COPY baileys/WAProto/ ./baileys/WAProto/

# Criar package.json limpo do Baileys SEM scripts de build
RUN cat > ./baileys/package.json << 'EOF'
{
  "name": "baileys",
  "type": "module",
  "version": "7.0.0-rc.9",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "scripts": {},
  "dependencies": {
    "@cacheable/node-cache": "^1.4.0",
    "@hapi/boom": "^9.1.3",
    "async-mutex": "^0.5.0",
    "libsignal": "git+https://github.com/whiskeysockets/libsignal-node",
    "lru-cache": "^11.1.0",
    "music-metadata": "^11.7.0",
    "node-addon-api": "^8.5.0",
    "p-queue": "^9.0.0",
    "pino": "^9.6",
    "protobufjs": "^7.2.4",
    "ws": "^8.13.0"
  },
  "peerDependencies": {
    "jimp": "^1.6.0",
    "link-preview-js": "^3.0.0",
    "sharp": "*"
  },
  "peerDependenciesMeta": {
    "jimp": { "optional": true },
    "link-preview-js": { "optional": true }
  }
}
EOF

# =============================================
# API - Instalar dependências
# =============================================
COPY api/package*.json ./

RUN sed -i 's|"baileys": "file:../baileys"|"baileys": "file:./baileys"|g' package.json

RUN npm install --legacy-peer-deps --omit=dev

# =============================================
# PRISMA - Gerar cliente (usando versão 5.x)
# =============================================
COPY api/prisma/ ./prisma/
RUN npx prisma@5.22.0 generate

# =============================================
# DIST - Copiar código já compilado e ofuscado
# =============================================
COPY api/dist/ ./dist/

# =============================================
# NGINX - Proxy com CORS (apenas se não existir)
# =============================================
RUN cat > /etc/nginx/http.d/default.conf << 'NGINXCONF'
map $http_origin $cors_origin {
    default "*";
    "~^https://front-usego" $http_origin;
    "~^https://frontend" $http_origin;
}

server {
    listen 3001;
    server_name _;
    
    location / {
        # Preflight OPTIONS - responder imediatamente
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' $cors_origin always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, Origin, X-Requested-With, x-api-key, X-Api-Key, X-API-KEY' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' '86400' always;
            add_header 'Content-Length' '0';
            add_header 'Content-Type' 'text/plain';
            return 204;
        }
        
        # CORS Headers para respostas normais
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, Origin, X-Requested-With, x-api-key, X-Api-Key, X-API-KEY' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        proxy_pass http://127.0.0.1:3002;
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
        
        # Esconder headers CORS duplicados do upstream
        proxy_hide_header 'Access-Control-Allow-Origin';
        proxy_hide_header 'Access-Control-Allow-Methods';
        proxy_hide_header 'Access-Control-Allow-Headers';
        proxy_hide_header 'Access-Control-Allow-Credentials';
    }
}
NGINXCONF

# Porta 3001 = Nginx (com CORS), Porta 3002 = Node interno
EXPOSE 3001

# Criar pasta de sessões com permissões corretas
RUN mkdir -p /app/sessions && chmod 777 /app/sessions

# Criar script de inicialização
RUN cat > /app/start.sh << 'EOF'
#!/bin/sh
set -e

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
EOF
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]

#!/bin/bash
# =============================================
# GO-API Installer v2.0 - Corrigido
# Instalação com PostgreSQL + Redis + Backend + Frontend
# =============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

INSTALL_DIR="/opt/goapi"

show_banner() {
    clear
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           GO-API Installer v2.0                   ║${NC}"
    echo -e "${CYAN}║     PostgreSQL + Redis + Backend + Frontend       ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
}

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERRO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[AVISO]${NC} $1"; }

# =============================================
# VERIFICAÇÕES INICIAIS
# =============================================
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Execute como root: sudo bash install-goapi.sh"
        exit 1
    fi
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_info "Instalando Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    fi
    log_success "Docker instalado"
}

# =============================================
# COLETA DE INFORMAÇÕES
# =============================================
collect_info() {
    echo ""
    echo -e "${YELLOW}Configure os domínios (devem apontar para este servidor):${NC}"
    echo ""
    
    read -p "Domínio do FRONTEND [ex: app.seusite.com]: " FRONTEND_DOMAIN
    read -p "Domínio da API [ex: api.seusite.com]: " API_DOMAIN
    read -p "Seu EMAIL [para SSL e login admin]: " ADMIN_EMAIL
    read -sp "SENHA do admin: " ADMIN_PASSWORD
    echo ""
    
    if [ -z "$FRONTEND_DOMAIN" ] || [ -z "$API_DOMAIN" ] || [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
        log_error "Todos os campos são obrigatórios!"
        exit 1
    fi
    
    JWT_SECRET=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -hex 16)
}

# =============================================
# CRIAR DOCKER COMPOSE
# =============================================
create_docker_compose() {
    log_info "Criando configuração Docker..."
    
    mkdir -p $INSTALL_DIR
    cd $INSTALL_DIR
    
    cat > docker-compose.yml << EOF
# GO-API Stack - PostgreSQL + Redis + Backend + Frontend
version: '3.8'

services:
  # =============================================
  # 1. POSTGRESQL - Inicia primeiro
  # =============================================
  postgres:
    image: postgres:15-alpine
    container_name: goapi-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: goapi
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: goapi
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U goapi -d goapi"]
      interval: 5s
      timeout: 5s
      retries: 30
      start_period: 10s
    networks:
      - goapi-network

  # =============================================
  # 2. REDIS - Inicia segundo
  # =============================================
  redis:
    image: redis:7-alpine
    container_name: goapi-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 30
      start_period: 5s
    networks:
      - goapi-network

  # =============================================
  # 3. BACKEND - Aguarda PostgreSQL e Redis
  # =============================================
  backend:
    image: usegoapi/gopro-backend:latest
    container_name: goapi-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # PostgreSQL
      DB_HOST: postgres
      DB_PORT: 5432
      DATABASE_URL: postgresql://goapi:${POSTGRES_PASSWORD}@postgres:5432/goapi
      # Redis
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_URL: redis://redis:6379
      # JWT
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      # Admin
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      # Outros
      NODE_ENV: production
      CORS_ORIGIN: "*"
    volumes:
      - sessions_data:/app/sessions
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 10s
      retries: 30
      start_period: 60s
    networks:
      - goapi-network

  # =============================================
  # 4. FRONTEND - Aguarda Backend
  # =============================================
  frontend:
    image: usegoapi/gopro-frontend:latest
    container_name: goapi-frontend
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: https://${API_DOMAIN}
      NODE_ENV: production
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - goapi-network

volumes:
  postgres_data:
  redis_data:
  sessions_data:

networks:
  goapi-network:
    driver: bridge
EOF

    # Salvar configurações
    cat > .env << EOF
FRONTEND_DOMAIN=${FRONTEND_DOMAIN}
API_DOMAIN=${API_DOMAIN}
ADMIN_EMAIL=${ADMIN_EMAIL}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
EOF

    log_success "Configuração criada"
}

# =============================================
# INICIAR SERVIÇOS EM ORDEM
# =============================================
start_services() {
    cd $INSTALL_DIR
    
    # 1. Iniciar PostgreSQL
    log_info "Iniciando PostgreSQL..."
    docker compose up -d postgres
    
    log_info "Aguardando PostgreSQL ficar pronto..."
    until docker compose exec -T postgres pg_isready -U goapi -d goapi > /dev/null 2>&1; do
        echo -n "."
        sleep 2
    done
    echo ""
    log_success "PostgreSQL pronto!"
    
    # 2. Iniciar Redis
    log_info "Iniciando Redis..."
    docker compose up -d redis
    
    log_info "Aguardando Redis ficar pronto..."
    until docker compose exec -T redis redis-cli ping > /dev/null 2>&1; do
        echo -n "."
        sleep 2
    done
    echo ""
    log_success "Redis pronto!"
    
    # 3. Iniciar Backend
    log_info "Iniciando Backend (isso pode levar 1-2 minutos)..."
    docker compose up -d backend
    
    log_info "Aguardando Backend criar tabelas e iniciar..."
    local count=0
    local max_attempts=60
    until curl -sf http://localhost:3000/health > /dev/null 2>&1; do
        echo -n "."
        sleep 3
        count=$((count + 1))
        if [ $count -ge $max_attempts ]; then
            log_error "Backend não iniciou. Verificando logs..."
            docker compose logs backend --tail 50
            exit 1
        fi
    done
    echo ""
    log_success "Backend pronto! Tabelas criadas!"
    
    # 4. Iniciar Frontend
    log_info "Iniciando Frontend..."
    docker compose up -d frontend
    sleep 10
    log_success "Frontend pronto!"
}

# =============================================
# CONFIGURAR NGINX + SSL
# =============================================
setup_nginx_ssl() {
    log_info "Instalando Nginx e Certbot..."
    apt-get update -qq
    apt-get install -y -qq nginx certbot python3-certbot-nginx
    
    # Configurar Backend
    log_info "Configurando Nginx para API..."
    cat > /etc/nginx/sites-available/${API_DOMAIN} << EOF
server {
    listen 80;
    server_name ${API_DOMAIN};
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        client_max_body_size 50M;
    }
}
EOF
    
    # Configurar Frontend
    log_info "Configurando Nginx para Frontend..."
    cat > /etc/nginx/sites-available/${FRONTEND_DOMAIN} << EOF
server {
    listen 80;
    server_name ${FRONTEND_DOMAIN};
    
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Ativar sites
    ln -sf /etc/nginx/sites-available/${API_DOMAIN} /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/${FRONTEND_DOMAIN} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null
    
    nginx -t && systemctl reload nginx
    
    # SSL
    log_info "Gerando certificados SSL..."
    certbot --nginx -d ${API_DOMAIN} --non-interactive --agree-tos --email ${ADMIN_EMAIL} --redirect || log_warn "SSL API falhou"
    certbot --nginx -d ${FRONTEND_DOMAIN} --non-interactive --agree-tos --email ${ADMIN_EMAIL} --redirect || log_warn "SSL Frontend falhou"
    
    # Renovação automática
    echo "0 0 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew
    
    log_success "Nginx e SSL configurados!"
}

# =============================================
# VERIFICAR INSTALAÇÃO
# =============================================
verify_installation() {
    echo ""
    log_info "Verificando instalação..."
    
    # Verificar containers
    if docker compose -f $INSTALL_DIR/docker-compose.yml ps | grep -q "running"; then
        log_success "Containers rodando"
    else
        log_error "Alguns containers não estão rodando"
        docker compose -f $INSTALL_DIR/docker-compose.yml ps
    fi
    
    # Verificar API
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        log_success "API respondendo"
    else
        log_error "API não está respondendo"
    fi
    
    # Verificar banco
    if docker compose -f $INSTALL_DIR/docker-compose.yml exec -T postgres psql -U goapi -d goapi -c "SELECT 1" > /dev/null 2>&1; then
        log_success "Banco de dados conectado"
    else
        log_error "Erro na conexão com banco"
    fi
}

# =============================================
# MOSTRAR RESULTADO
# =============================================
show_result() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║       GO-API INSTALADA COM SUCESSO!               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${CYAN}Frontend:${NC} https://${FRONTEND_DOMAIN}"
    echo -e "  ${CYAN}API:${NC}      https://${API_DOMAIN}"
    echo ""
    echo -e "  ${YELLOW}Login:${NC}"
    echo -e "  ${CYAN}Email:${NC}    ${ADMIN_EMAIL}"
    echo -e "  ${CYAN}Senha:${NC}    (a que você definiu)"
    echo ""
    echo -e "  ${YELLOW}Comandos úteis:${NC}"
    echo -e "  ${CYAN}Ver logs:${NC}     cd $INSTALL_DIR && docker compose logs -f"
    echo -e "  ${CYAN}Reiniciar:${NC}    cd $INSTALL_DIR && docker compose restart"
    echo -e "  ${CYAN}Parar:${NC}        cd $INSTALL_DIR && docker compose down"
    echo ""
}

# =============================================
# MAIN
# =============================================
main() {
    show_banner
    check_root
    check_docker
    collect_info
    create_docker_compose
    start_services
    setup_nginx_ssl
    verify_installation
    show_result
}

main "$@"

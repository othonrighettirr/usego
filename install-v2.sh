#!/bin/bash
# =============================================
# GO-API Installer v2.0
# Instalação via Portainer com detecção de portas
# =============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Diretórios
INSTALL_DIR="/opt/goapi"
CONFIG_FILE="$INSTALL_DIR/config.json"

# Portainer
PORTAINER_URL=""
PORTAINER_TOKEN=""

# =============================================
# FUNÇÕES AUXILIARES
# =============================================
log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERRO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[AVISO]${NC} $1"; }

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Execute como root: sudo bash install-v2.sh"
        exit 1
    fi
}

show_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════╗"
    echo "║           GO-API Installer v2.0                   ║"
    echo "║      Gerenciamento via Portainer                  ║"
    echo "╚═══════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# =============================================
# DETECÇÃO DE PORTAS
# =============================================
is_port_in_use() {
    local port=$1
    ss -tuln 2>/dev/null | grep -q ":$port " && return 0 || return 1
}

find_free_port() {
    local start_port=$1
    local port=$start_port
    while is_port_in_use $port; do
        port=$((port + 1))
    done
    echo $port
}

# =============================================
# DOCKER
# =============================================
install_docker() {
    if command -v docker &> /dev/null; then
        log_success "Docker já instalado"
        return 0
    fi
    
    log_info "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    log_success "Docker instalado"
}

# =============================================
# PORTAINER
# =============================================
install_portainer() {
    if docker ps -a --format '{{.Names}}' | grep -q "^portainer$"; then
        log_success "Portainer já instalado"
        return 0
    fi
    
    log_info "Instalando Portainer..."
    
    local PORT_PORTAINER=$(find_free_port 9000)
    
    docker volume create portainer_data
    
    docker run -d \
        --name portainer \
        --restart=always \
        -p ${PORT_PORTAINER}:9000 \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data \
        portainer/portainer-ce:latest
    
    log_success "Portainer instalado na porta $PORT_PORTAINER"
    
    # Salvar configuração
    mkdir -p $INSTALL_DIR
    echo "{\"portainer_port\": $PORT_PORTAINER}" > $CONFIG_FILE
    
    echo ""
    log_warn "IMPORTANTE: Acesse http://SEU_IP:$PORT_PORTAINER"
    log_warn "Crie um usuário admin no primeiro acesso"
    echo ""
}

get_portainer_port() {
    if [ -f "$CONFIG_FILE" ]; then
        cat $CONFIG_FILE | grep -o '"portainer_port": [0-9]*' | grep -o '[0-9]*'
    else
        echo "9000"
    fi
}

# =============================================
# INSTALAÇÃO GO-API
# =============================================
install_goapi() {
    show_banner
    echo -e "${YELLOW}=== INSTALAÇÃO GO-API ===${NC}"
    echo ""
    
    # Coletar informações
    read -p "Domínio do Frontend [ex: app.seusite.com]: " FRONTEND_DOMAIN
    read -p "Domínio da API [ex: api.seusite.com]: " API_DOMAIN
    read -p "Seu Email: " ADMIN_EMAIL
    read -sp "Senha do Admin: " ADMIN_PASSWORD
    echo ""
    
    # Encontrar portas livres
    PORT_POSTGRES=$(find_free_port 5432)
    PORT_REDIS=$(find_free_port 6379)
    PORT_BACKEND=$(find_free_port 3000)
    PORT_FRONTEND=$(find_free_port 3001)
    
    log_info "Portas alocadas:"
    echo "  PostgreSQL: $PORT_POSTGRES"
    echo "  Redis: $PORT_REDIS"
    echo "  Backend: $PORT_BACKEND"
    echo "  Frontend: $PORT_FRONTEND"
    
    # Gerar secrets
    JWT_SECRET=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -hex 16)
    
    # Criar diretório
    mkdir -p $INSTALL_DIR/goapi
    
    # Criar docker-compose
    cat > $INSTALL_DIR/goapi/docker-compose.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: goapi-postgres
    restart: unless-stopped
    ports:
      - "${PORT_POSTGRES}:5432"
    environment:
      POSTGRES_USER: goapi
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: goapi
    volumes:
      - goapi_postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U goapi -d goapi"]
      interval: 5s
      timeout: 5s
      retries: 30
    networks:
      - goapi-net

  redis:
    image: redis:7-alpine
    container_name: goapi-redis
    restart: unless-stopped
    ports:
      - "${PORT_REDIS}:6379"
    command: redis-server --appendonly yes
    volumes:
      - goapi_redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 30
    networks:
      - goapi-net

  backend:
    image: usegoapi/gopro-backend:latest
    container_name: goapi-backend
    restart: unless-stopped
    ports:
      - "${PORT_BACKEND}:3000"
    environment:
      DB_HOST: postgres
      DATABASE_URL: postgresql://goapi:${POSTGRES_PASSWORD}@postgres:5432/goapi
      REDIS_HOST: redis
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      NODE_ENV: production
    volumes:
      - goapi_sessions:/app/sessions
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - goapi-net

  frontend:
    image: usegoapi/gopro-frontend:latest
    container_name: goapi-frontend
    restart: unless-stopped
    ports:
      - "${PORT_FRONTEND}:3000"
    environment:
      NEXT_PUBLIC_API_URL: https://${API_DOMAIN}
    depends_on:
      - backend
    networks:
      - goapi-net

volumes:
  goapi_postgres:
  goapi_redis:
  goapi_sessions:

networks:
  goapi-net:
    driver: bridge
EOF

    # Iniciar
    log_info "Iniciando GO-API..."
    cd $INSTALL_DIR/goapi
    docker compose up -d
    
    # Configurar Nginx + SSL
    setup_nginx_ssl "$FRONTEND_DOMAIN" "$PORT_FRONTEND" "$ADMIN_EMAIL"
    setup_nginx_ssl "$API_DOMAIN" "$PORT_BACKEND" "$ADMIN_EMAIL"
    
    # Salvar config
    save_config "goapi" "$FRONTEND_DOMAIN" "$API_DOMAIN" "$PORT_BACKEND" "$PORT_FRONTEND" "$ADMIN_EMAIL"
    
    log_success "GO-API instalada!"
    show_goapi_info
}

# =============================================
# NGINX + SSL
# =============================================
setup_nginx_ssl() {
    local domain=$1
    local port=$2
    local email=$3
    
    # Instalar nginx e certbot se necessário
    if ! command -v nginx &> /dev/null; then
        apt-get update -qq
        apt-get install -y -qq nginx certbot python3-certbot-nginx
    fi
    
    # Criar config nginx
    cat > /etc/nginx/sites-available/${domain} << EOF
server {
    listen 80;
    server_name ${domain};
    
    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        client_max_body_size 50M;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    
    # SSL
    certbot --nginx -d ${domain} --non-interactive --agree-tos --email ${email} --redirect 2>/dev/null || true
}

# =============================================
# SALVAR/CARREGAR CONFIG
# =============================================
save_config() {
    local service=$1
    local frontend_domain=$2
    local api_domain=$3
    local port_backend=$4
    local port_frontend=$5
    local email=$6
    
    mkdir -p $INSTALL_DIR
    
    # Criar ou atualizar JSON
    if [ -f "$CONFIG_FILE" ]; then
        # Adicionar ao existente
        tmp=$(mktemp)
        jq --arg s "$service" --arg fd "$frontend_domain" --arg ad "$api_domain" \
           --arg pb "$port_backend" --arg pf "$port_frontend" --arg e "$email" \
           '.services[$s] = {frontend_domain: $fd, api_domain: $ad, port_backend: $pb, port_frontend: $pf, email: $e}' \
           $CONFIG_FILE > $tmp && mv $tmp $CONFIG_FILE 2>/dev/null || true
    fi
}

show_goapi_info() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║       GO-API INSTALADA COM SUCESSO!               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${CYAN}Frontend:${NC} https://${FRONTEND_DOMAIN}"
    echo -e "  ${CYAN}API:${NC}      https://${API_DOMAIN}"
    echo -e "  ${CYAN}Email:${NC}    ${ADMIN_EMAIL}"
    echo ""
}

# =============================================
# FUNÇÕES DE GERENCIAMENTO
# =============================================
show_status() {
    show_banner
    echo -e "${YELLOW}=== STATUS DOS SERVIÇOS ===${NC}"
    echo ""
    
    echo -e "${WHITE}Portainer:${NC}"
    docker ps --filter "name=portainer" --format "  {{.Names}}: {{.Status}}"
    
    echo ""
    echo -e "${WHITE}GO-API:${NC}"
    docker ps --filter "name=goapi" --format "  {{.Names}}: {{.Status}}"
    
    echo ""
    echo -e "${WHITE}Typebot:${NC}"
    docker ps --filter "name=typebot" --format "  {{.Names}}: {{.Status}}"
    
    echo ""
    echo -e "${WHITE}N8N:${NC}"
    docker ps --filter "name=n8n" --format "  {{.Names}}: {{.Status}}"
    
    echo ""
    echo -e "${WHITE}Chatwoot:${NC}"
    docker ps --filter "name=chatwoot" --format "  {{.Names}}: {{.Status}}"
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

restart_service() {
    show_banner
    echo -e "${YELLOW}=== REINICIAR SERVIÇO ===${NC}"
    echo ""
    echo "  1) GO-API"
    echo "  2) Typebot"
    echo "  3) N8N"
    echo "  4) Chatwoot"
    echo "  5) Portainer"
    echo "  0) Voltar"
    echo ""
    read -p "Escolha: " opt
    
    case $opt in
        1) cd $INSTALL_DIR/goapi && docker compose restart ;;
        2) cd $INSTALL_DIR/typebot && docker compose restart ;;
        3) cd $INSTALL_DIR/n8n && docker compose restart ;;
        4) cd $INSTALL_DIR/chatwoot && docker compose restart ;;
        5) docker restart portainer ;;
    esac
    
    log_success "Serviço reiniciado!"
    sleep 2
}

view_logs() {
    show_banner
    echo -e "${YELLOW}=== VER LOGS ===${NC}"
    echo ""
    echo "  1) GO-API Backend"
    echo "  2) GO-API Frontend"
    echo "  3) PostgreSQL"
    echo "  4) Redis"
    echo "  5) Portainer"
    echo "  0) Voltar"
    echo ""
    read -p "Escolha: " opt
    
    case $opt in
        1) docker logs goapi-backend --tail 100 -f ;;
        2) docker logs goapi-frontend --tail 100 -f ;;
        3) docker logs goapi-postgres --tail 100 -f ;;
        4) docker logs goapi-redis --tail 100 -f ;;
        5) docker logs portainer --tail 100 -f ;;
    esac
}

update_images() {
    show_banner
    echo -e "${YELLOW}=== ATUALIZAR IMAGENS ===${NC}"
    echo ""
    
    log_info "Atualizando imagens..."
    
    docker pull usegoapi/gopro-backend:latest
    docker pull usegoapi/gopro-frontend:latest
    docker pull postgres:15-alpine
    docker pull redis:7-alpine
    
    log_success "Imagens atualizadas!"
    log_info "Reinicie os serviços para aplicar as atualizações"
    
    read -p "Pressione ENTER para continuar..."
}

# =============================================
# REMOÇÃO E LIMPEZA
# =============================================
remove_service() {
    show_banner
    echo -e "${YELLOW}=== REMOVER SERVIÇO ===${NC}"
    echo ""
    echo "  1) GO-API"
    echo "  2) Typebot"
    echo "  3) N8N"
    echo "  4) Chatwoot"
    echo "  0) Voltar"
    echo ""
    read -p "Escolha: " opt
    
    case $opt in
        1)
            read -p "Remover GO-API? (s/N): " confirm
            if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
                cd $INSTALL_DIR/goapi 2>/dev/null && docker compose down -v
                rm -rf $INSTALL_DIR/goapi
                log_success "GO-API removida"
            fi
            ;;
        2)
            read -p "Remover Typebot? (s/N): " confirm
            if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
                cd $INSTALL_DIR/typebot 2>/dev/null && docker compose down -v
                rm -rf $INSTALL_DIR/typebot
                log_success "Typebot removido"
            fi
            ;;
        3)
            read -p "Remover N8N? (s/N): " confirm
            if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
                cd $INSTALL_DIR/n8n 2>/dev/null && docker compose down -v
                rm -rf $INSTALL_DIR/n8n
                log_success "N8N removido"
            fi
            ;;
        4)
            read -p "Remover Chatwoot? (s/N): " confirm
            if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
                cd $INSTALL_DIR/chatwoot 2>/dev/null && docker compose down -v
                rm -rf $INSTALL_DIR/chatwoot
                log_success "Chatwoot removido"
            fi
            ;;
    esac
    
    sleep 2
}

reset_all() {
    show_banner
    echo -e "${RED}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║            ⚠️  ZERAR TUDO ⚠️                       ║${NC}"
    echo -e "${RED}╠═══════════════════════════════════════════════════╣${NC}"
    echo -e "${RED}║  Esta ação irá:                                   ║${NC}"
    echo -e "${RED}║  - Parar todos os containers                      ║${NC}"
    echo -e "${RED}║  - Remover todas as stacks                        ║${NC}"
    echo -e "${RED}║  - Remover todos os volumes (DADOS!)              ║${NC}"
    echo -e "${RED}║  - Manter apenas o Portainer                      ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    read -p "Digite 'ZERAR' para confirmar: " confirm
    
    if [ "$confirm" = "ZERAR" ]; then
        log_warn "Zerando tudo..."
        
        # Parar e remover GO-API
        if [ -d "$INSTALL_DIR/goapi" ]; then
            cd $INSTALL_DIR/goapi && docker compose down -v 2>/dev/null
            rm -rf $INSTALL_DIR/goapi
        fi
        
        # Parar e remover Typebot
        if [ -d "$INSTALL_DIR/typebot" ]; then
            cd $INSTALL_DIR/typebot && docker compose down -v 2>/dev/null
            rm -rf $INSTALL_DIR/typebot
        fi
        
        # Parar e remover N8N
        if [ -d "$INSTALL_DIR/n8n" ]; then
            cd $INSTALL_DIR/n8n && docker compose down -v 2>/dev/null
            rm -rf $INSTALL_DIR/n8n
        fi
        
        # Parar e remover Chatwoot
        if [ -d "$INSTALL_DIR/chatwoot" ]; then
            cd $INSTALL_DIR/chatwoot && docker compose down -v 2>/dev/null
            rm -rf $INSTALL_DIR/chatwoot
        fi
        
        # Limpar containers órfãos
        docker container prune -f 2>/dev/null
        
        # Limpar volumes não utilizados
        docker volume prune -f 2>/dev/null
        
        # Limpar imagens não utilizadas
        docker image prune -f 2>/dev/null
        
        log_success "Tudo zerado! Portainer mantido."
    else
        log_info "Operação cancelada"
    fi
    
    sleep 2
}

uninstall_complete() {
    show_banner
    echo -e "${RED}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║       ⚠️  DESINSTALAR COMPLETAMENTE ⚠️             ║${NC}"
    echo -e "${RED}╠═══════════════════════════════════════════════════╣${NC}"
    echo -e "${RED}║  Esta ação irá:                                   ║${NC}"
    echo -e "${RED}║  - Remover TUDO (incluindo Portainer)             ║${NC}"
    echo -e "${RED}║  - Remover todos os dados                         ║${NC}"
    echo -e "${RED}║  - Remover configurações Nginx                    ║${NC}"
    echo -e "${RED}║  - NÃO remove o Docker                            ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    read -p "Digite 'DESINSTALAR' para confirmar: " confirm
    
    if [ "$confirm" = "DESINSTALAR" ]; then
        log_warn "Desinstalando completamente..."
        
        # Zerar tudo primeiro
        reset_all_silent
        
        # Remover Portainer
        docker stop portainer 2>/dev/null
        docker rm portainer 2>/dev/null
        docker volume rm portainer_data 2>/dev/null
        
        # Remover configs nginx
        rm -f /etc/nginx/sites-enabled/goapi* 2>/dev/null
        rm -f /etc/nginx/sites-available/goapi* 2>/dev/null
        systemctl reload nginx 2>/dev/null
        
        # Remover diretório de instalação
        rm -rf $INSTALL_DIR
        
        log_success "Desinstalação completa!"
    else
        log_info "Operação cancelada"
    fi
    
    sleep 2
}

reset_all_silent() {
    # Versão silenciosa para uso interno
    [ -d "$INSTALL_DIR/goapi" ] && cd $INSTALL_DIR/goapi && docker compose down -v 2>/dev/null
    [ -d "$INSTALL_DIR/typebot" ] && cd $INSTALL_DIR/typebot && docker compose down -v 2>/dev/null
    [ -d "$INSTALL_DIR/n8n" ] && cd $INSTALL_DIR/n8n && docker compose down -v 2>/dev/null
    [ -d "$INSTALL_DIR/chatwoot" ] && cd $INSTALL_DIR/chatwoot && docker compose down -v 2>/dev/null
    docker container prune -f 2>/dev/null
    docker volume prune -f 2>/dev/null
}

# =============================================
# INSTALAÇÃO TYPEBOT
# =============================================
install_typebot() {
    show_banner
    echo -e "${YELLOW}=== INSTALAÇÃO TYPEBOT ===${NC}"
    echo ""
    
    read -p "Domínio do Builder [ex: typebot.seusite.com]: " TYPEBOT_DOMAIN
    read -p "Domínio do Viewer [ex: bot.seusite.com]: " VIEWER_DOMAIN
    read -p "Seu Email: " TYPEBOT_EMAIL
    
    PORT_BUILDER=$(find_free_port 3002)
    PORT_VIEWER=$(find_free_port 3003)
    PORT_TB_PG=$(find_free_port 5433)
    
    ENCRYPTION_SECRET=$(openssl rand -hex 16)
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    mkdir -p $INSTALL_DIR/typebot
    
    cat > $INSTALL_DIR/typebot/docker-compose.yml << EOF
version: '3.8'

services:
  typebot-postgres:
    image: postgres:15-alpine
    container_name: typebot-postgres
    restart: unless-stopped
    ports:
      - "${PORT_TB_PG}:5432"
    environment:
      POSTGRES_USER: typebot
      POSTGRES_PASSWORD: typebot_2024
      POSTGRES_DB: typebot
    volumes:
      - typebot_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U typebot"]
      interval: 5s
      timeout: 5s
      retries: 30
    networks:
      - typebot-net

  typebot-builder:
    image: baptistearno/typebot-builder:2.28
    container_name: typebot-builder
    restart: unless-stopped
    ports:
      - "${PORT_BUILDER}:3000"
    environment:
      DATABASE_URL: postgresql://typebot:typebot_2024@typebot-postgres:5432/typebot
      NEXTAUTH_URL: https://${TYPEBOT_DOMAIN}
      NEXT_PUBLIC_VIEWER_URL: https://${VIEWER_DOMAIN}
      ENCRYPTION_SECRET: ${ENCRYPTION_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      ADMIN_EMAIL: ${TYPEBOT_EMAIL}
    depends_on:
      typebot-postgres:
        condition: service_healthy
    networks:
      - typebot-net

  typebot-viewer:
    image: baptistearno/typebot-viewer:2.28
    container_name: typebot-viewer
    restart: unless-stopped
    ports:
      - "${PORT_VIEWER}:3000"
    environment:
      DATABASE_URL: postgresql://typebot:typebot_2024@typebot-postgres:5432/typebot
      NEXTAUTH_URL: https://${TYPEBOT_DOMAIN}
      NEXT_PUBLIC_VIEWER_URL: https://${VIEWER_DOMAIN}
      ENCRYPTION_SECRET: ${ENCRYPTION_SECRET}
    depends_on:
      typebot-postgres:
        condition: service_healthy
    networks:
      - typebot-net

volumes:
  typebot_pg:

networks:
  typebot-net:
    driver: bridge
EOF

    log_info "Iniciando Typebot..."
    cd $INSTALL_DIR/typebot
    docker compose up -d
    
    setup_nginx_ssl "$TYPEBOT_DOMAIN" "$PORT_BUILDER" "$TYPEBOT_EMAIL"
    setup_nginx_ssl "$VIEWER_DOMAIN" "$PORT_VIEWER" "$TYPEBOT_EMAIL"
    
    log_success "Typebot instalado!"
    echo ""
    echo -e "  ${CYAN}Builder:${NC} https://${TYPEBOT_DOMAIN}"
    echo -e "  ${CYAN}Viewer:${NC}  https://${VIEWER_DOMAIN}"
    echo ""
    read -p "Pressione ENTER..."
}

# =============================================
# INSTALAÇÃO N8N
# =============================================
install_n8n() {
    show_banner
    echo -e "${YELLOW}=== INSTALAÇÃO N8N ===${NC}"
    echo ""
    
    read -p "Domínio do N8N [ex: n8n.seusite.com]: " N8N_DOMAIN
    read -p "Seu Email: " N8N_EMAIL
    
    PORT_N8N=$(find_free_port 5678)
    PORT_N8N_PG=$(find_free_port 5434)
    N8N_KEY=$(openssl rand -hex 16)
    
    mkdir -p $INSTALL_DIR/n8n
    
    cat > $INSTALL_DIR/n8n/docker-compose.yml << EOF
version: '3.8'

services:
  n8n-postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: unless-stopped
    ports:
      - "${PORT_N8N_PG}:5432"
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: n8n_2024
      POSTGRES_DB: n8n
    volumes:
      - n8n_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 5s
      timeout: 5s
      retries: 30
    networks:
      - n8n-net

  n8n:
    image: n8nio/n8n:1.70.0
    container_name: n8n
    restart: unless-stopped
    ports:
      - "${PORT_N8N}:5678"
    environment:
      N8N_HOST: ${N8N_DOMAIN}
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://${N8N_DOMAIN}/
      N8N_ENCRYPTION_KEY: ${N8N_KEY}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: n8n-postgres
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: n8n_2024
      GENERIC_TIMEZONE: America/Sao_Paulo
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      n8n-postgres:
        condition: service_healthy
    networks:
      - n8n-net

volumes:
  n8n_pg:
  n8n_data:

networks:
  n8n-net:
    driver: bridge
EOF

    log_info "Iniciando N8N..."
    cd $INSTALL_DIR/n8n
    docker compose up -d
    
    setup_nginx_ssl "$N8N_DOMAIN" "$PORT_N8N" "$N8N_EMAIL"
    
    log_success "N8N instalado!"
    echo ""
    echo -e "  ${CYAN}URL:${NC} https://${N8N_DOMAIN}"
    echo ""
    read -p "Pressione ENTER..."
}

# =============================================
# INSTALAÇÃO CHATWOOT
# =============================================
install_chatwoot() {
    show_banner
    echo -e "${YELLOW}=== INSTALAÇÃO CHATWOOT ===${NC}"
    echo ""
    
    read -p "Domínio do Chatwoot [ex: chat.seusite.com]: " CW_DOMAIN
    read -p "Seu Email: " CW_EMAIL
    
    PORT_CW=$(find_free_port 3004)
    PORT_CW_PG=$(find_free_port 5435)
    SECRET=$(openssl rand -hex 32)
    
    mkdir -p $INSTALL_DIR/chatwoot
    
    cat > $INSTALL_DIR/chatwoot/docker-compose.yml << EOF
version: '3.8'

services:
  chatwoot-postgres:
    image: postgres:15-alpine
    container_name: chatwoot-postgres
    restart: unless-stopped
    ports:
      - "${PORT_CW_PG}:5432"
    environment:
      POSTGRES_USER: chatwoot
      POSTGRES_PASSWORD: chatwoot_2024
      POSTGRES_DB: chatwoot_production
    volumes:
      - cw_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatwoot"]
      interval: 5s
      timeout: 5s
      retries: 30
    networks:
      - chatwoot-net

  chatwoot-redis:
    image: redis:7-alpine
    container_name: chatwoot-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - cw_redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 30
    networks:
      - chatwoot-net

  chatwoot-rails:
    image: chatwoot/chatwoot:v3.13.0
    container_name: chatwoot-rails
    restart: unless-stopped
    ports:
      - "${PORT_CW}:3000"
    environment:
      RAILS_ENV: production
      SECRET_KEY_BASE: ${SECRET}
      FRONTEND_URL: https://${CW_DOMAIN}
      DEFAULT_LOCALE: pt_BR
      DATABASE_URL: postgresql://chatwoot:chatwoot_2024@chatwoot-postgres:5432/chatwoot_production
      REDIS_URL: redis://chatwoot-redis:6379
    depends_on:
      chatwoot-postgres:
        condition: service_healthy
      chatwoot-redis:
        condition: service_healthy
    entrypoint: docker/entrypoints/rails.sh
    command: ['bundle', 'exec', 'rails', 's', '-p', '3000', '-b', '0.0.0.0']
    networks:
      - chatwoot-net

  chatwoot-sidekiq:
    image: chatwoot/chatwoot:v3.13.0
    container_name: chatwoot-sidekiq
    restart: unless-stopped
    environment:
      RAILS_ENV: production
      SECRET_KEY_BASE: ${SECRET}
      FRONTEND_URL: https://${CW_DOMAIN}
      DATABASE_URL: postgresql://chatwoot:chatwoot_2024@chatwoot-postgres:5432/chatwoot_production
      REDIS_URL: redis://chatwoot-redis:6379
    depends_on:
      chatwoot-postgres:
        condition: service_healthy
    command: ['bundle', 'exec', 'sidekiq', '-C', 'config/sidekiq.yml']
    networks:
      - chatwoot-net

volumes:
  cw_pg:
  cw_redis:

networks:
  chatwoot-net:
    driver: bridge
EOF

    log_info "Iniciando Chatwoot..."
    cd $INSTALL_DIR/chatwoot
    docker compose up -d
    
    # Aguardar e rodar migrations
    sleep 30
    docker compose run --rm chatwoot-rails bundle exec rails db:chatwoot_prepare 2>/dev/null || true
    
    setup_nginx_ssl "$CW_DOMAIN" "$PORT_CW" "$CW_EMAIL"
    
    log_success "Chatwoot instalado!"
    echo ""
    echo -e "  ${CYAN}URL:${NC} https://${CW_DOMAIN}"
    echo -e "  ${CYAN}Crie sua conta no primeiro acesso${NC}"
    echo ""
    read -p "Pressione ENTER..."
}

# =============================================
# INSTALAR TUDO
# =============================================
install_all() {
    show_banner
    echo -e "${YELLOW}=== INSTALAR TUDO ===${NC}"
    echo ""
    log_info "Isso irá instalar: GO-API + Typebot + N8N + Chatwoot"
    echo ""
    read -p "Continuar? (s/N): " confirm
    
    if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
        install_goapi
        install_typebot
        install_n8n
        install_chatwoot
        
        log_success "Tudo instalado!"
    fi
}

# =============================================
# MOSTRAR CONFIGURAÇÕES
# =============================================
show_configs() {
    show_banner
    echo -e "${YELLOW}=== CONFIGURAÇÕES SALVAS ===${NC}"
    echo ""
    
    local portainer_port=$(get_portainer_port)
    echo -e "${WHITE}Portainer:${NC} http://SEU_IP:${portainer_port}"
    echo ""
    
    if [ -d "$INSTALL_DIR/goapi" ]; then
        echo -e "${WHITE}GO-API:${NC}"
        echo "  Diretório: $INSTALL_DIR/goapi"
    fi
    
    if [ -d "$INSTALL_DIR/typebot" ]; then
        echo -e "${WHITE}Typebot:${NC}"
        echo "  Diretório: $INSTALL_DIR/typebot"
    fi
    
    if [ -d "$INSTALL_DIR/n8n" ]; then
        echo -e "${WHITE}N8N:${NC}"
        echo "  Diretório: $INSTALL_DIR/n8n"
    fi
    
    if [ -d "$INSTALL_DIR/chatwoot" ]; then
        echo -e "${WHITE}Chatwoot:${NC}"
        echo "  Diretório: $INSTALL_DIR/chatwoot"
    fi
    
    echo ""
    read -p "Pressione ENTER..."
}

# =============================================
# MENU PRINCIPAL
# =============================================
show_menu() {
    show_banner
    
    local portainer_port=$(get_portainer_port)
    echo -e "  ${CYAN}Portainer:${NC} http://SEU_IP:${portainer_port}"
    echo ""
    
    echo -e "${WHITE}═══ INSTALAÇÃO ═══${NC}"
    echo "  1) Instalar GO-API"
    echo "  2) Instalar Typebot"
    echo "  3) Instalar N8N"
    echo "  4) Instalar Chatwoot"
    echo "  5) Instalar Tudo"
    echo ""
    echo -e "${WHITE}═══ GERENCIAMENTO ═══${NC}"
    echo "  6) Ver Status"
    echo "  7) Reiniciar Serviço"
    echo "  8) Ver Logs"
    echo "  9) Atualizar Imagens"
    echo ""
    echo -e "${WHITE}═══ REMOÇÃO ═══${NC}"
    echo "  10) Remover Serviço"
    echo -e "  11) ${RED}ZERAR TUDO${NC}"
    echo -e "  12) ${RED}Desinstalar Completamente${NC}"
    echo ""
    echo -e "${WHITE}═══ OUTROS ═══${NC}"
    echo "  13) Ver Configurações"
    echo "  0) Sair"
    echo ""
    echo -n "Escolha: "
}

# =============================================
# MAIN
# =============================================
main() {
    check_root
    
    # Instalar Docker se necessário
    install_docker
    
    # Instalar Portainer se necessário
    install_portainer
    
    while true; do
        show_menu
        read opt
        
        case $opt in
            1) install_goapi ;;
            2) install_typebot ;;
            3) install_n8n ;;
            4) install_chatwoot ;;
            5) install_all ;;
            6) show_status ;;
            7) restart_service ;;
            8) view_logs ;;
            9) update_images ;;
            10) remove_service ;;
            11) reset_all ;;
            12) uninstall_complete ;;
            13) show_configs ;;
            0) 
                echo ""
                log_info "Até logo!"
                exit 0
                ;;
            *)
                log_error "Opção inválida"
                sleep 1
                ;;
        esac
    done
}

# Executar
main "$@"

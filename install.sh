#!/bin/bash

# GO-API Installer v2.0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
ORANGE='\033[38;5;208m'
AMBER='\033[38;5;214m'
GRAY='\033[0;90m'
NC='\033[0m'

INSTALL_DIR="/opt/goapi"
EXTRAS_DIR="/opt/goapi-extras"
REPO_URL="https://github.com/usegoapi/usego.git"

check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Execute como root: sudo bash install.sh${NC}"
        exit 1
    fi
}

show_progress() {
    echo -e "${AMBER}⏳ $1...${NC}"
}

show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_info() {
    echo -e "${ORANGE}ℹ️  $1${NC}"
}

is_port_in_use() {
    local port=$1
    if command -v ss >/dev/null 2>&1; then
        ss -tuln 2>/dev/null | grep -q ":$port " && return 0 || return 1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tuln 2>/dev/null | grep -q ":$port " && return 0 || return 1
    else
        return 1
    fi
}

find_free_port() {
    local start_port=$1
    local port=$start_port
    while is_port_in_use $port; do
        port=$((port + 1))
        if [ $port -gt 65535 ]; then
            echo "$start_port"
            return
        fi
    done
    echo $port
}

show_banner() {
    clear
    echo -e "${ORANGE}"
    echo "   ██████╗  ██████╗        █████╗ ██████╗ ██╗    ██╗   ██╗██████╗ "
    echo "  ██╔════╝ ██╔═══██╗      ██╔══██╗██╔══██╗██║    ██║   ██║╚════██╗"
    echo "  ██║  ███╗██║   ██║█████╗███████║██████╔╝██║    ██║   ██║ █████╔╝"
    echo "  ██║   ██║██║   ██║╚════╝██╔══██║██╔═══╝ ██║    ╚██╗ ██╔╝██╔═══╝ "
    echo "  ╚██████╔╝╚██████╔╝      ██║  ██║██║     ██║     ╚████╔╝ ███████╗"
    echo "   ╚═════╝  ╚═════╝       ╚═╝  ╚═╝╚═╝     ╚═╝      ╚═══╝  ╚══════╝"
    echo -e "${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}   Bem-vindo ao instalador GO-API v2.0${NC}"
    echo -e "${WHITE}   Agora com suporte a Typebot, N8N e Chatwoot!${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

detect_system() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        show_error "Sistema nao suportado"
        exit 1
    fi
}

install_docker() {
    if command -v docker >/dev/null 2>&1; then
        show_success "Docker ja instalado"
    else
        show_progress "Instalando Docker"
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
        show_success "Docker instalado"
    fi
    
    if docker compose version >/dev/null 2>&1; then
        show_success "Docker Compose disponivel"
    else
        apt-get install -y docker-compose-plugin
        show_success "Docker Compose instalado"
    fi
}

prepare_extras() {
    show_progress "Preparando ambiente"
    mkdir -p $EXTRAS_DIR
    detect_system
    apt-get update -qq
    apt-get install -y -qq curl wget git openssl ca-certificates gnupg net-tools
    install_docker
    show_success "Ambiente preparado"
}

install_typebot() {
    show_banner
    echo -e "${ORANGE}INSTALANDO TYPEBOT${NC}"
    echo ""
    
    prepare_extras
    
    echo -n "Dominio do Typebot Builder [ex: typebot.seusite.com]: "
    read TYPEBOT_DOMAIN
    echo -n "Dominio do Typebot Viewer [ex: bot.seusite.com]: "
    read TYPEBOT_VIEWER_DOMAIN
    echo -n "Seu EMAIL [para admin]: "
    read TYPEBOT_EMAIL
    
    PORT_TYPEBOT=$(find_free_port 3002)
    PORT_TYPEBOT_BUILDER=$(find_free_port 3003)
    PORT_TYPEBOT_POSTGRES=$(find_free_port 5433)
    
    show_info "Builder: porta $PORT_TYPEBOT_BUILDER"
    show_info "Viewer: porta $PORT_TYPEBOT"
    show_info "PostgreSQL: porta $PORT_TYPEBOT_POSTGRES"
    
    TYPEBOT_SECRET=$(openssl rand -hex 32)
    
    cd $EXTRAS_DIR
    
    cat > docker-compose-typebot.yml << EOF
services:
  typebot-postgres:
    image: postgres:15-alpine
    container_name: typebot-postgres
    restart: always
    ports:
      - "${PORT_TYPEBOT_POSTGRES}:5432"
    environment:
      - POSTGRES_USER=typebot
      - POSTGRES_PASSWORD=typebot_secret_2024
      - POSTGRES_DB=typebot
    volumes:
      - typebot_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U typebot -d typebot"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - typebot-network

  typebot-builder:
    image: baptistearno/typebot-builder:latest
    container_name: typebot-builder
    restart: always
    ports:
      - "${PORT_TYPEBOT_BUILDER}:3000"
    environment:
      - DATABASE_URL=postgresql://typebot:typebot_secret_2024@typebot-postgres:5432/typebot?schema=public
      - NEXTAUTH_URL=https://${TYPEBOT_DOMAIN}
      - NEXT_PUBLIC_VIEWER_URL=https://${TYPEBOT_VIEWER_DOMAIN}
      - ENCRYPTION_SECRET=${TYPEBOT_SECRET}
      - ADMIN_EMAIL=${TYPEBOT_EMAIL}
      - DISABLE_SIGNUP=false
    depends_on:
      typebot-postgres:
        condition: service_healthy
    networks:
      - typebot-network

  typebot-viewer:
    image: baptistearno/typebot-viewer:latest
    container_name: typebot-viewer
    restart: always
    ports:
      - "${PORT_TYPEBOT}:3000"
    environment:
      - DATABASE_URL=postgresql://typebot:typebot_secret_2024@typebot-postgres:5432/typebot?schema=public
      - NEXTAUTH_URL=https://${TYPEBOT_DOMAIN}
      - NEXT_PUBLIC_VIEWER_URL=https://${TYPEBOT_VIEWER_DOMAIN}
      - ENCRYPTION_SECRET=${TYPEBOT_SECRET}
    depends_on:
      typebot-postgres:
        condition: service_healthy
    networks:
      - typebot-network

volumes:
  typebot_postgres_data:

networks:
  typebot-network:
    driver: bridge
EOF

    show_progress "Iniciando Typebot"
    docker compose -f docker-compose-typebot.yml up -d
    
    echo ""
    show_success "Typebot instalado!"
    echo -e "  ${ORANGE}Builder:${NC} https://${TYPEBOT_DOMAIN} (porta ${PORT_TYPEBOT_BUILDER})"
    echo -e "  ${ORANGE}Viewer:${NC}  https://${TYPEBOT_VIEWER_DOMAIN} (porta ${PORT_TYPEBOT})"
    echo ""
    
    echo "TYPEBOT_DOMAIN=$TYPEBOT_DOMAIN" >> $EXTRAS_DIR/.env
    echo "PORT_TYPEBOT=$PORT_TYPEBOT" >> $EXTRAS_DIR/.env
    echo "PORT_TYPEBOT_BUILDER=$PORT_TYPEBOT_BUILDER" >> $EXTRAS_DIR/.env
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

install_n8n() {
    show_banner
    echo -e "${ORANGE}INSTALANDO N8N${NC}"
    echo ""
    
    prepare_extras
    
    echo -n "Dominio do N8N [ex: n8n.seusite.com]: "
    read N8N_DOMAIN
    
    PORT_N8N=$(find_free_port 5678)
    PORT_N8N_POSTGRES=$(find_free_port 5434)
    
    show_info "N8N: porta $PORT_N8N"
    show_info "PostgreSQL: porta $PORT_N8N_POSTGRES"
    
    N8N_KEY=$(openssl rand -hex 16)
    
    cd $EXTRAS_DIR
    
    cat > docker-compose-n8n.yml << EOF
services:
  n8n-postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: always
    ports:
      - "${PORT_N8N_POSTGRES}:5432"
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_secret_2024
      - POSTGRES_DB=n8n
    volumes:
      - n8n_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n -d n8n"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - n8n-network

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "${PORT_N8N}:5678"
    environment:
      - N8N_HOST=${N8N_DOMAIN}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://${N8N_DOMAIN}/
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - N8N_ENCRYPTION_KEY=${N8N_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=n8n-postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_secret_2024
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      n8n-postgres:
        condition: service_healthy
    networks:
      - n8n-network

volumes:
  n8n_postgres_data:
  n8n_data:

networks:
  n8n-network:
    driver: bridge
EOF

    show_progress "Iniciando N8N"
    docker compose -f docker-compose-n8n.yml up -d
    
    echo ""
    show_success "N8N instalado!"
    echo -e "  ${ORANGE}URL:${NC} https://${N8N_DOMAIN} (porta ${PORT_N8N})"
    echo ""
    
    echo "N8N_DOMAIN=$N8N_DOMAIN" >> $EXTRAS_DIR/.env
    echo "PORT_N8N=$PORT_N8N" >> $EXTRAS_DIR/.env
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}


install_chatwoot() {
    show_banner
    echo -e "${ORANGE}INSTALANDO CHATWOOT${NC}"
    echo ""
    
    prepare_extras
    
    echo -n "Dominio do Chatwoot [ex: chat.seusite.com]: "
    read CHATWOOT_DOMAIN
    
    PORT_CHATWOOT=$(find_free_port 3004)
    PORT_CHATWOOT_REDIS=$(find_free_port 6379)
    PORT_CHATWOOT_POSTGRES=$(find_free_port 5435)
    
    show_info "Chatwoot: porta $PORT_CHATWOOT"
    show_info "Redis: porta $PORT_CHATWOOT_REDIS"
    show_info "PostgreSQL: porta $PORT_CHATWOOT_POSTGRES"
    
    CHATWOOT_SECRET=$(openssl rand -hex 32)
    
    cd $EXTRAS_DIR
    
    cat > docker-compose-chatwoot.yml << EOF
services:
  chatwoot-postgres:
    image: postgres:15-alpine
    container_name: chatwoot-postgres
    restart: always
    ports:
      - "${PORT_CHATWOOT_POSTGRES}:5432"
    environment:
      - POSTGRES_USER=chatwoot
      - POSTGRES_PASSWORD=chatwoot_secret_2024
      - POSTGRES_DB=chatwoot
    volumes:
      - chatwoot_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatwoot -d chatwoot"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - chatwoot-network

  chatwoot-redis:
    image: redis:alpine
    container_name: chatwoot-redis
    restart: always
    ports:
      - "${PORT_CHATWOOT_REDIS}:6379"
    volumes:
      - chatwoot_redis_data:/data
    networks:
      - chatwoot-network

  chatwoot:
    image: chatwoot/chatwoot:latest
    container_name: chatwoot
    restart: always
    ports:
      - "${PORT_CHATWOOT}:3000"
    environment:
      - RAILS_ENV=production
      - RAILS_LOG_TO_STDOUT=true
      - SECRET_KEY_BASE=${CHATWOOT_SECRET}
      - FRONTEND_URL=https://${CHATWOOT_DOMAIN}
      - DATABASE_URL=postgresql://chatwoot:chatwoot_secret_2024@chatwoot-postgres:5432/chatwoot
      - REDIS_URL=redis://chatwoot-redis:6379
      - ACTIVE_STORAGE_SERVICE=local
    volumes:
      - chatwoot_storage:/app/storage
    depends_on:
      chatwoot-postgres:
        condition: service_healthy
    entrypoint: docker/entrypoints/rails.sh
    command: ['bundle', 'exec', 'rails', 's', '-p', '3000', '-b', '0.0.0.0']
    networks:
      - chatwoot-network

  chatwoot-sidekiq:
    image: chatwoot/chatwoot:latest
    container_name: chatwoot-sidekiq
    restart: always
    environment:
      - RAILS_ENV=production
      - SECRET_KEY_BASE=${CHATWOOT_SECRET}
      - FRONTEND_URL=https://${CHATWOOT_DOMAIN}
      - DATABASE_URL=postgresql://chatwoot:chatwoot_secret_2024@chatwoot-postgres:5432/chatwoot
      - REDIS_URL=redis://chatwoot-redis:6379
    depends_on:
      chatwoot-postgres:
        condition: service_healthy
    command: ['bundle', 'exec', 'sidekiq', '-C', 'config/sidekiq.yml']
    networks:
      - chatwoot-network

volumes:
  chatwoot_postgres_data:
  chatwoot_redis_data:
  chatwoot_storage:

networks:
  chatwoot-network:
    driver: bridge
EOF

    show_progress "Iniciando Chatwoot"
    docker compose -f docker-compose-chatwoot.yml up -d
    
    sleep 30
    show_progress "Executando migrations"
    docker compose -f docker-compose-chatwoot.yml exec -T chatwoot bundle exec rails db:chatwoot_prepare 2>/dev/null || true
    
    echo ""
    show_success "Chatwoot instalado!"
    echo -e "  ${ORANGE}URL:${NC} https://${CHATWOOT_DOMAIN} (porta ${PORT_CHATWOOT})"
    echo -e "  ${GRAY}Crie sua conta de admin no primeiro acesso${NC}"
    echo ""
    
    echo "CHATWOOT_DOMAIN=$CHATWOOT_DOMAIN" >> $EXTRAS_DIR/.env
    echo "PORT_CHATWOOT=$PORT_CHATWOOT" >> $EXTRAS_DIR/.env
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

do_install_goapi() {
    show_banner
    echo -e "${ORANGE}INSTALACAO GO-API${NC}"
    echo ""
    
    show_progress "Preparando sistema"
    detect_system
    apt-get update -qq
    apt-get upgrade -y -qq
    apt-get install -y -qq curl wget git openssl ca-certificates gnupg net-tools
    install_docker
    
    echo ""
    echo -n "Dominio do FRONTEND [ex: app.seusite.com]: "
    read FRONTEND_DOMAIN
    echo -n "Dominio da API [ex: api.seusite.com]: "
    read API_DOMAIN
    echo -n "Seu EMAIL [para SSL e login]: "
    read USER_EMAIL
    echo -n "SENHA do painel: "
    read ADMIN_PASSWORD
    
    PORT_FRONTEND=$(find_free_port 3000)
    PORT_API=$(find_free_port 3001)
    PORT_POSTGRES=$(find_free_port 5432)
    
    echo ""
    show_info "Frontend: porta $PORT_FRONTEND"
    show_info "API: porta $PORT_API"
    show_info "PostgreSQL: porta $PORT_POSTGRES"
    
    show_progress "Clonando repositorio"
    mkdir -p $INSTALL_DIR
    cd $INSTALL_DIR
    
    if [ -d ".git" ]; then
        git pull --quiet
    else
        rm -rf $INSTALL_DIR/*
        git clone --quiet $REPO_URL .
    fi
    
    rm -f docker-compose*.yaml docker-compose*.yml 2>/dev/null
    
    JWT_SECRET=$(openssl rand -hex 32)
    
    cat > docker-compose.yml << EOF
services:
  postgres:
    image: postgres:15-alpine
    container_name: goapi-postgres
    restart: always
    ports:
      - "${PORT_POSTGRES}:5432"
    environment:
      - POSTGRES_USER=goapi
      - POSTGRES_PASSWORD=goapi_secret_2024
      - POSTGRES_DB=goapi
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U goapi -d goapi"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - goapi-network

  api:
    build:
      context: .
      dockerfile: api/Dockerfile
    container_name: goapi-backend
    restart: always
    ports:
      - "${PORT_API}:3001"
    environment:
      - PORT=3001
      - NODE_ENV=production
      - DATABASE_URL=postgresql://goapi:goapi_secret_2024@postgres:5432/goapi?schema=public
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=3000000d
      - CORS_ORIGIN=*
      - ADMIN_EMAIL=${USER_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    volumes:
      - sessions_data:/app/sessions
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - goapi-network

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: goapi-frontend
    restart: always
    ports:
      - "${PORT_FRONTEND}:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_PUBLIC_API_URL=https://${API_DOMAIN}
      - ADMIN_EMAIL=${USER_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    depends_on:
      - api
    networks:
      - goapi-network

volumes:
  postgres_data:
  sessions_data:

networks:
  goapi-network:
    driver: bridge
EOF

    cat > .env << EOF
FRONTEND_DOMAIN=${FRONTEND_DOMAIN}
API_DOMAIN=${API_DOMAIN}
USER_EMAIL=${USER_EMAIL}
PORT_FRONTEND=${PORT_FRONTEND}
PORT_API=${PORT_API}
PORT_POSTGRES=${PORT_POSTGRES}
EOF

    show_progress "Construindo imagens (pode demorar)"
    docker compose build --quiet
    
    show_progress "Iniciando servicos"
    docker compose up -d postgres
    sleep 10
    docker compose up -d api
    sleep 20
    docker compose up -d frontend
    
    show_progress "Criando usuario admin"
    sleep 10
    
    PASSWORD_HASH=$(docker compose exec -T api node -e "const bcrypt=require('bcryptjs');console.log(bcrypt.hashSync('${ADMIN_PASSWORD}',10));" 2>/dev/null | tr -d '\r\n')
    
    if [ -n "$PASSWORD_HASH" ]; then
        docker compose exec -T postgres psql -U goapi -d goapi -c "INSERT INTO \"User\" (id,email,password,role,\"createdAt\") VALUES (gen_random_uuid(),'${USER_EMAIL}','${PASSWORD_HASH}','ADMIN',NOW()) ON CONFLICT (email) DO UPDATE SET password='${PASSWORD_HASH}',role='ADMIN';" >/dev/null 2>&1
        show_success "Usuario admin criado"
    fi
    
    echo ""
    show_success "GO-API INSTALADA!"
    echo ""
    echo -e "  ${ORANGE}Frontend:${NC} https://${FRONTEND_DOMAIN} (porta ${PORT_FRONTEND})"
    echo -e "  ${ORANGE}API:${NC}      https://${API_DOMAIN} (porta ${PORT_API})"
    echo -e "  ${ORANGE}Email:${NC}    ${USER_EMAIL}"
    echo -e "  ${ORANGE}Senha:${NC}    ${ADMIN_PASSWORD}"
    echo ""
    echo -e "${AMBER}Configure seu proxy reverso para as portas acima.${NC}"
    echo ""
    
    read -p "Pressione ENTER para continuar..."
}


show_status() {
    show_banner
    echo -e "${ORANGE}STATUS DOS SERVICOS${NC}"
    echo ""
    
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${WHITE}GO-API:${NC}"
        cd $INSTALL_DIR 2>/dev/null && docker compose ps 2>/dev/null || echo "  Nao instalado"
        echo ""
    fi
    
    if [ -d "$EXTRAS_DIR" ]; then
        cd $EXTRAS_DIR
        if [ -f "docker-compose-typebot.yml" ]; then
            echo -e "${WHITE}Typebot:${NC}"
            docker compose -f docker-compose-typebot.yml ps 2>/dev/null || echo "  Nao rodando"
            echo ""
        fi
        if [ -f "docker-compose-n8n.yml" ]; then
            echo -e "${WHITE}N8N:${NC}"
            docker compose -f docker-compose-n8n.yml ps 2>/dev/null || echo "  Nao rodando"
            echo ""
        fi
        if [ -f "docker-compose-chatwoot.yml" ]; then
            echo -e "${WHITE}Chatwoot:${NC}"
            docker compose -f docker-compose-chatwoot.yml ps 2>/dev/null || echo "  Nao rodando"
            echo ""
        fi
    fi
    
    read -p "Pressione ENTER para continuar..."
}

view_logs() {
    show_banner
    echo -e "${ORANGE}LOGS DOS SERVICOS${NC}"
    echo ""
    echo "  [1] GO-API (API)"
    echo "  [2] GO-API (Frontend)"
    echo "  [3] Typebot"
    echo "  [4] N8N"
    echo "  [5] Chatwoot"
    echo "  [0] Voltar"
    echo ""
    echo -n "Escolha: "
    read LOG_OPT
    
    case $LOG_OPT in
        1) cd $INSTALL_DIR 2>/dev/null && docker compose logs -f --tail=100 api || show_error "Nao instalado" ;;
        2) cd $INSTALL_DIR 2>/dev/null && docker compose logs -f --tail=100 frontend || show_error "Nao instalado" ;;
        3) cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-typebot.yml logs -f --tail=100 2>/dev/null || show_error "Nao instalado" ;;
        4) cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-n8n.yml logs -f --tail=100 2>/dev/null || show_error "Nao instalado" ;;
        5) cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-chatwoot.yml logs -f --tail=100 2>/dev/null || show_error "Nao instalado" ;;
        0) return ;;
    esac
    
    read -p "Pressione ENTER para continuar..."
}

restart_services() {
    show_banner
    echo -e "${ORANGE}REINICIANDO SERVICOS${NC}"
    echo ""
    
    if [ -d "$INSTALL_DIR" ]; then
        show_progress "Reiniciando GO-API"
        cd $INSTALL_DIR && docker compose restart
        show_success "GO-API reiniciada"
    fi
    
    if [ -d "$EXTRAS_DIR" ]; then
        cd $EXTRAS_DIR
        [ -f "docker-compose-typebot.yml" ] && docker compose -f docker-compose-typebot.yml restart 2>/dev/null && show_success "Typebot reiniciado"
        [ -f "docker-compose-n8n.yml" ] && docker compose -f docker-compose-n8n.yml restart 2>/dev/null && show_success "N8N reiniciado"
        [ -f "docker-compose-chatwoot.yml" ] && docker compose -f docker-compose-chatwoot.yml restart 2>/dev/null && show_success "Chatwoot reiniciado"
    fi
    
    read -p "Pressione ENTER para continuar..."
}

change_credentials() {
    show_banner
    echo -e "${ORANGE}ALTERAR CREDENCIAIS GO-API${NC}"
    echo ""
    
    if [ ! -d "$INSTALL_DIR" ]; then
        show_error "GO-API nao instalada"
        read -p "Pressione ENTER para continuar..."
        return
    fi
    
    echo -n "Novo EMAIL: "
    read NEW_EMAIL
    echo -n "Nova SENHA: "
    read NEW_PASSWORD
    
    cd $INSTALL_DIR
    
    PASSWORD_HASH=$(docker compose exec -T api node -e "const bcrypt=require('bcryptjs');console.log(bcrypt.hashSync('${NEW_PASSWORD}',10));" 2>/dev/null | tr -d '\r\n')
    
    if [ -n "$PASSWORD_HASH" ]; then
        docker compose exec -T postgres psql -U goapi -d goapi -c "UPDATE \"User\" SET email='${NEW_EMAIL}',password='${PASSWORD_HASH}' WHERE role='ADMIN';" >/dev/null 2>&1
        show_success "Credenciais atualizadas!"
        echo -e "  ${ORANGE}Email:${NC} ${NEW_EMAIL}"
        echo -e "  ${ORANGE}Senha:${NC} ${NEW_PASSWORD}"
    else
        show_error "Erro ao atualizar"
    fi
    
    read -p "Pressione ENTER para continuar..."
}

reset_system() {
    show_banner
    echo -e "${RED}RESETAR SISTEMA${NC}"
    echo ""
    echo -e "${RED}ATENCAO: Todos os dados serao perdidos!${NC}"
    echo ""
    echo -n "Digite 'RESETAR' para confirmar: "
    read CONFIRM
    
    if [ "$CONFIRM" = "RESETAR" ]; then
        if [ -d "$INSTALL_DIR" ]; then
            cd $INSTALL_DIR && docker compose down -v --remove-orphans 2>/dev/null
            rm -rf $INSTALL_DIR
        fi
        
        if [ -d "$EXTRAS_DIR" ]; then
            cd $EXTRAS_DIR
            [ -f "docker-compose-typebot.yml" ] && docker compose -f docker-compose-typebot.yml down -v 2>/dev/null
            [ -f "docker-compose-n8n.yml" ] && docker compose -f docker-compose-n8n.yml down -v 2>/dev/null
            [ -f "docker-compose-chatwoot.yml" ] && docker compose -f docker-compose-chatwoot.yml down -v 2>/dev/null
            rm -rf $EXTRAS_DIR
        fi
        
        docker system prune -af --volumes 2>/dev/null
        show_success "Sistema resetado!"
    else
        show_info "Operacao cancelada"
    fi
    
    read -p "Pressione ENTER para continuar..."
}

extras_menu() {
    while true; do
        show_banner
        echo -e "${ORANGE}FERRAMENTAS EXTRAS${NC}"
        echo ""
        echo "  [1] Instalar Typebot"
        echo "  [2] Instalar N8N"
        echo "  [3] Instalar Chatwoot"
        echo "  [4] Instalar Todos"
        echo "  [0] Voltar"
        echo ""
        echo -n "Escolha: "
        read EXTRA_OPT
        
        case $EXTRA_OPT in
            1) install_typebot ;;
            2) install_n8n ;;
            3) install_chatwoot ;;
            4) install_typebot; install_n8n; install_chatwoot ;;
            0) break ;;
            *) show_error "Opcao invalida"; sleep 1 ;;
        esac
    done
}

main_menu() {
    check_root
    
    while true; do
        show_banner
        echo -e "${ORANGE}MENU${NC}"
        echo ""
        echo "  [1] Instalar GO-API"
        echo "  [2] Instalar Ferramentas Extras (Typebot, N8N, Chatwoot)"
        echo "  [3] Verificar Certificados SSL"
        echo "  [4] Mudar Login e Senha"
        echo "  [5] Ver Logs"
        echo "  [6] Reiniciar Servicos"
        echo "  [7] Status dos Servicos"
        echo "  [8] Resetar Sistema"
        echo "  [0] Sair"
        echo ""
        echo -e "${WHITE}Contribua: ${AMBER}https://usego.com.br/members/payments${NC}"
        echo ""
        echo -n "Escolha uma opcao: "
        read MENU_OPT
        
        case $MENU_OPT in
            1) do_install_goapi ;;
            2) extras_menu ;;
            3) 
                show_banner
                echo -e "${ORANGE}CERTIFICADOS SSL${NC}"
                echo ""
                show_info "Configure seu proxy reverso (Nginx/Traefik/Caddy)"
                show_info "para gerenciar os certificados SSL."
                echo ""
                if [ -f "$INSTALL_DIR/.env" ]; then
                    source $INSTALL_DIR/.env 2>/dev/null
                    echo "  Frontend: porta ${PORT_FRONTEND:-3000}"
                    echo "  API: porta ${PORT_API:-3001}"
                fi
                read -p "Pressione ENTER para continuar..."
                ;;
            4) change_credentials ;;
            5) view_logs ;;
            6) restart_services ;;
            7) show_status ;;
            8) reset_system ;;
            0) echo ""; echo -e "${ORANGE}Ate logo!${NC}"; echo ""; exit 0 ;;
            *) show_error "Opcao invalida"; sleep 1 ;;
        esac
    done
}

main_menu

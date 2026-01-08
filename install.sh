#!/bin/bash

# ===========================================
# GO-API - Instalador Profissional v2.0
# Com suporte a Typebot, N8N e Chatwoot
# ===========================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
ORANGE='\033[38;5;208m'
AMBER='\033[38;5;214m'
GRAY='\033[0;90m'
NC='\033[0m'

# Variáveis globais
INSTALL_DIR="/opt/goapi"
EXTRAS_DIR="/opt/goapi-extras"
REPO_URL="https://github.com/usegoapi/usego.git"

# Portas padrão
PORT_FRONTEND=3000
PORT_API=3001
PORT_POSTGRES=5432
PORT_TYPEBOT=3002
PORT_TYPEBOT_BUILDER=3003
PORT_N8N=5678
PORT_CHATWOOT=3004
PORT_CHATWOOT_REDIS=6379

# Função para limpar tela
clear_screen() {
    clear
}

# Função para verificar se porta está em uso
is_port_in_use() {
    local port=$1
    if command -v ss &> /dev/null; then
        ss -tuln 2>/dev/null | grep -q ":$port " && return 0 || return 1
    elif command -v netstat &> /dev/null; then
        netstat -tuln 2>/dev/null | grep -q ":$port " && return 0 || return 1
    else
        (echo >/dev/tcp/localhost/$port) &>/dev/null && return 0 || return 1
    fi
}

# Função para encontrar porta livre
find_free_port() {
    local start_port=$1
    local port=$start_port
    while is_port_in_use $port; do
        ((port++))
        if [ $port -gt 65535 ]; then
            echo "$start_port"
            return
        fi
    done
    echo $port
}

# Função para mostrar o banner
show_banner() {
    clear_screen
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

# Função para mostrar o menu principal
show_menu() {
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}                           MENU${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${ORANGE}[1]${NC} ${WHITE}INSTALAR GO-API${NC}"
    echo -e "      ${GRAY}Instalação completa com todas as dependências${NC}"
    echo -e "  ${ORANGE}[2]${NC} ${WHITE}INSTALAR FERRAMENTAS EXTRAS${NC}"
    echo -e "      ${GRAY}Typebot, N8N, Chatwoot (instalação independente)${NC}"
    echo -e "  ${ORANGE}[3]${NC} ${WHITE}VERIFICAR CERTIFICADOS SSL${NC}"
    echo -e "      ${GRAY}Verifica e instala certificados HTTPS${NC}"
    echo -e "  ${ORANGE}[4]${NC} ${WHITE}MUDAR LOGIN E SENHA${NC}"
    echo -e "      ${GRAY}Altera credenciais de acesso ao painel${NC}"
    echo -e "  ${ORANGE}[5]${NC} ${WHITE}VER LOGS${NC}"
    echo -e "      ${GRAY}Visualiza logs dos serviços${NC}"
    echo -e "  ${ORANGE}[6]${NC} ${WHITE}REINICIAR SERVIÇOS${NC}"
    echo -e "      ${GRAY}Reinicia todos os containers${NC}"
    echo -e "  ${ORANGE}[7]${NC} ${WHITE}STATUS DOS SERVIÇOS${NC}"
    echo -e "      ${GRAY}Mostra status e portas de todos os serviços${NC}"
    echo -e "  ${RED}[8]${NC} ${WHITE}RESETAR SISTEMA${NC}"
    echo -e "      ${GRAY}Remove tudo e permite reinstalar do zero${NC}"
    echo -e "  ${ORANGE}[0]${NC} ${WHITE}SAIR${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}Contribua: ${AMBER}https://usego.com.br/members/payments${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Função para menu de ferramentas extras
show_extras_menu() {
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}              FERRAMENTAS EXTRAS${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${ORANGE}[1]${NC} ${WHITE}INSTALAR TYPEBOT${NC}"
    echo -e "      ${GRAY}Chatbot builder visual - typebot.io${NC}"
    echo -e "  ${ORANGE}[2]${NC} ${WHITE}INSTALAR N8N${NC}"
    echo -e "      ${GRAY}Automação de workflows - n8n.io${NC}"
    echo -e "  ${ORANGE}[3]${NC} ${WHITE}INSTALAR CHATWOOT${NC}"
    echo -e "      ${GRAY}Atendimento ao cliente - chatwoot.com${NC}"
    echo -e "  ${ORANGE}[4]${NC} ${WHITE}INSTALAR TODOS${NC}"
    echo -e "      ${GRAY}Instala Typebot + N8N + Chatwoot${NC}"
    echo -e "  ${ORANGE}[0]${NC} ${WHITE}VOLTAR${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Funções de utilidade
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ Este script precisa ser executado como root!${NC}"
        echo -e "${YELLOW}Execute: sudo bash install.sh${NC}"
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

pause() {
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função para detectar e atualizar sistema
detect_system() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        show_error "Sistema operacional não suportado"
        exit 1
    fi
}

update_system() {
    apt-get update -qq
    apt-get upgrade -y -qq
}

install_dependencies() {
    apt-get install -y -qq curl wget git openssl ca-certificates gnupg lsb-release net-tools
}

install_docker() {
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
        show_success "Docker já instalado (versão $DOCKER_VERSION)"
    else
        show_progress "Instalando Docker"
        curl -fsSL https://get.docker.com | sh -s -- --quiet
        systemctl enable docker
        systemctl start docker
        show_success "Docker instalado"
    fi
    
    if docker compose version &> /dev/null; then
        show_success "Docker Compose disponível"
    else
        apt-get install -y -qq docker-compose-plugin
        show_success "Docker Compose instalado"
    fi
}

# Função para preparar ambiente de extras (sem GO-API)
prepare_extras_environment() {
    show_progress "Preparando ambiente para ferramentas extras"
    
    mkdir -p $EXTRAS_DIR
    cd $EXTRAS_DIR
    
    # Instalar dependências básicas
    detect_system
    install_dependencies > /dev/null 2>&1
    install_docker
    
    # Criar docker-compose base se não existir
    if [ ! -f "$EXTRAS_DIR/docker-compose.yml" ]; then
        cat > $EXTRAS_DIR/docker-compose.yml << 'ENDOFBASE'
services:
  postgres-extras:
    image: postgres:15-alpine
    container_name: extras-postgres
    restart: always
    environment:
      - POSTGRES_USER=extras
      - POSTGRES_PASSWORD=extras_secret_2024
      - POSTGRES_DB=extras
    volumes:
      - extras_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U extras -d extras"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - extras-network

volumes:
  extras_postgres_data:

networks:
  extras-network:
    driver: bridge
ENDOFBASE
    fi
    
    show_success "Ambiente preparado"
}

# Função para coletar informações
collect_info() {
    echo ""
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           CONFIGURAÇÃO DA INSTALAÇÃO${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    read -p "$(echo -e ${ORANGE}Domínio do FRONTEND ${GRAY}[ex: app.seusite.com]${NC}: )" FRONTEND_DOMAIN
    read -p "$(echo -e ${ORANGE}Domínio da API ${GRAY}[ex: api.seusite.com]${NC}: )" API_DOMAIN
    read -p "$(echo -e ${ORANGE}Seu EMAIL ${GRAY}[para SSL e login]${NC}: )" USER_EMAIL
    read -p "$(echo -e ${ORANGE}SENHA do painel${NC}: )" ADMIN_PASSWORD
    
    echo ""
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           CONFIRME AS INFORMAÇÕES${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${ORANGE}Frontend:${NC}    https://$FRONTEND_DOMAIN"
    echo -e "  ${ORANGE}API:${NC}         https://$API_DOMAIN"
    echo -e "  ${ORANGE}Email:${NC}       $USER_EMAIL"
    echo -e "  ${ORANGE}Senha:${NC}       $ADMIN_PASSWORD"
    echo ""
    
    read -p "$(echo -e ${AMBER}As informações estão corretas? ${WHITE}[S/n]${NC}: )" CONFIRM
    
    if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
        collect_info
    fi
}

# Função para configurar portas automaticamente
setup_ports() {
    show_progress "Detectando portas disponíveis"
    
    PORT_FRONTEND=$(find_free_port 3000)
    PORT_API=$(find_free_port $((PORT_FRONTEND + 1)))
    PORT_POSTGRES=$(find_free_port 5432)
    
    show_success "Portas configuradas automaticamente"
    echo ""
    echo -e "  ${ORANGE}Frontend:${NC}   $PORT_FRONTEND"
    echo -e "  ${ORANGE}API:${NC}        $PORT_API"
    echo -e "  ${ORANGE}PostgreSQL:${NC} $PORT_POSTGRES"
    echo ""
}

# Função para criar docker-compose principal
create_docker_compose() {
    show_progress "Criando configuração do Docker Compose"
    
    JWT_SECRET=$(openssl rand -hex 32)
    
    cat > $INSTALL_DIR/docker-compose.yml << ENDOFFILE
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
      - JWT_SECRET=$JWT_SECRET
      - JWT_EXPIRES_IN=3000000d
      - CORS_ORIGIN=*
      - ADMIN_EMAIL=$USER_EMAIL
      - ADMIN_PASSWORD=$ADMIN_PASSWORD
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
      - NEXT_PUBLIC_API_URL=https://$API_DOMAIN
      - ADMIN_EMAIL=$USER_EMAIL
      - ADMIN_PASSWORD=$ADMIN_PASSWORD
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
ENDOFFILE

    show_success "Docker Compose configurado"
}


# Função para instalar Typebot (independente)
install_typebot_standalone() {
    show_banner
    echo -e "${ORANGE}▶ INSTALANDO TYPEBOT${NC}"
    echo ""
    
    prepare_extras_environment
    
    read -p "$(echo -e ${ORANGE}Domínio do Typebot Builder ${GRAY}[ex: typebot.seusite.com]${NC}: )" TYPEBOT_DOMAIN
    read -p "$(echo -e ${ORANGE}Domínio do Typebot Viewer ${GRAY}[ex: bot.seusite.com]${NC}: )" TYPEBOT_VIEWER_DOMAIN
    read -p "$(echo -e ${ORANGE}Seu EMAIL ${GRAY}[para admin]${NC}: )" TYPEBOT_EMAIL
    
    # Encontrar portas livres
    PORT_TYPEBOT=$(find_free_port 3002)
    PORT_TYPEBOT_BUILDER=$(find_free_port $((PORT_TYPEBOT + 1)))
    PORT_TYPEBOT_POSTGRES=$(find_free_port 5433)
    
    show_info "Typebot Builder: porta $PORT_TYPEBOT_BUILDER"
    show_info "Typebot Viewer: porta $PORT_TYPEBOT"
    show_info "PostgreSQL: porta $PORT_TYPEBOT_POSTGRES"
    
    TYPEBOT_SECRET=$(openssl rand -hex 32)
    
    cd $EXTRAS_DIR
    
    cat > $EXTRAS_DIR/docker-compose-typebot.yml << ENDOFTYPEBOT
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
ENDOFTYPEBOT

    show_progress "Iniciando Typebot"
    docker compose -f docker-compose-typebot.yml up -d
    
    echo ""
    show_success "Typebot instalado!"
    echo -e "  ${ORANGE}Builder:${NC} https://${TYPEBOT_DOMAIN} (porta ${PORT_TYPEBOT_BUILDER})"
    echo -e "  ${ORANGE}Viewer:${NC}  https://${TYPEBOT_VIEWER_DOMAIN} (porta ${PORT_TYPEBOT})"
    echo -e "  ${ORANGE}PostgreSQL:${NC} porta ${PORT_TYPEBOT_POSTGRES}"
    echo ""
    
    # Salvar configuração
    echo "TYPEBOT_DOMAIN=$TYPEBOT_DOMAIN" >> $EXTRAS_DIR/.env
    echo "TYPEBOT_VIEWER_DOMAIN=$TYPEBOT_VIEWER_DOMAIN" >> $EXTRAS_DIR/.env
    echo "PORT_TYPEBOT=$PORT_TYPEBOT" >> $EXTRAS_DIR/.env
    echo "PORT_TYPEBOT_BUILDER=$PORT_TYPEBOT_BUILDER" >> $EXTRAS_DIR/.env
}

# Função para instalar N8N (independente)
install_n8n_standalone() {
    show_banner
    echo -e "${ORANGE}▶ INSTALANDO N8N${NC}"
    echo ""
    
    prepare_extras_environment
    
    read -p "$(echo -e ${ORANGE}Domínio do N8N ${GRAY}[ex: n8n.seusite.com]${NC}: )" N8N_DOMAIN
    
    # Encontrar portas livres
    PORT_N8N=$(find_free_port 5678)
    PORT_N8N_POSTGRES=$(find_free_port 5434)
    
    show_info "N8N: porta $PORT_N8N"
    show_info "PostgreSQL: porta $PORT_N8N_POSTGRES"
    
    N8N_ENCRYPTION_KEY=$(openssl rand -hex 16)
    
    cd $EXTRAS_DIR
    
    cat > $EXTRAS_DIR/docker-compose-n8n.yml << ENDOFN8N
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
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
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
ENDOFN8N

    show_progress "Iniciando N8N"
    docker compose -f docker-compose-n8n.yml up -d
    
    echo ""
    show_success "N8N instalado!"
    echo -e "  ${ORANGE}URL:${NC} https://${N8N_DOMAIN} (porta ${PORT_N8N})"
    echo -e "  ${ORANGE}PostgreSQL:${NC} porta ${PORT_N8N_POSTGRES}"
    echo ""
    
    # Salvar configuração
    echo "N8N_DOMAIN=$N8N_DOMAIN" >> $EXTRAS_DIR/.env
    echo "PORT_N8N=$PORT_N8N" >> $EXTRAS_DIR/.env
}

# Função para instalar Chatwoot (independente)
install_chatwoot_standalone() {
    show_banner
    echo -e "${ORANGE}▶ INSTALANDO CHATWOOT${NC}"
    echo ""
    
    prepare_extras_environment
    
    read -p "$(echo -e ${ORANGE}Domínio do Chatwoot ${GRAY}[ex: chat.seusite.com]${NC}: )" CHATWOOT_DOMAIN
    
    # Encontrar portas livres
    PORT_CHATWOOT=$(find_free_port 3004)
    PORT_CHATWOOT_REDIS=$(find_free_port 6379)
    PORT_CHATWOOT_POSTGRES=$(find_free_port 5435)
    
    show_info "Chatwoot: porta $PORT_CHATWOOT"
    show_info "Redis: porta $PORT_CHATWOOT_REDIS"
    show_info "PostgreSQL: porta $PORT_CHATWOOT_POSTGRES"
    
    CHATWOOT_SECRET=$(openssl rand -hex 32)
    
    cd $EXTRAS_DIR
    
    cat > $EXTRAS_DIR/docker-compose-chatwoot.yml << ENDOFCHATWOOT
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

  chatwoot-rails:
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
      chatwoot-redis:
        condition: service_started
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
      chatwoot-redis:
        condition: service_started
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
ENDOFCHATWOOT

    show_progress "Iniciando Chatwoot (pode demorar alguns minutos)"
    docker compose -f docker-compose-chatwoot.yml up -d
    
    # Aguardar e rodar migrations
    sleep 30
    show_progress "Executando migrations do Chatwoot"
    docker compose -f docker-compose-chatwoot.yml exec -T chatwoot-rails bundle exec rails db:chatwoot_prepare 2>/dev/null || true
    
    echo ""
    show_success "Chatwoot instalado!"
    echo -e "  ${ORANGE}URL:${NC} https://${CHATWOOT_DOMAIN} (porta ${PORT_CHATWOOT})"
    echo -e "  ${ORANGE}PostgreSQL:${NC} porta ${PORT_CHATWOOT_POSTGRES}"
    echo -e "  ${ORANGE}Redis:${NC} porta ${PORT_CHATWOOT_REDIS}"
    echo -e "  ${GRAY}Crie sua conta de admin no primeiro acesso${NC}"
    echo ""
    
    # Salvar configuração
    echo "CHATWOOT_DOMAIN=$CHATWOOT_DOMAIN" >> $EXTRAS_DIR/.env
    echo "PORT_CHATWOOT=$PORT_CHATWOOT" >> $EXTRAS_DIR/.env
}


# Função para clonar repositório
clone_repository() {
    show_progress "Preparando diretório de instalação"
    
    mkdir -p $INSTALL_DIR
    cd $INSTALL_DIR
    
    if [ -d ".git" ]; then
        show_progress "Atualizando repositório existente"
        git pull --quiet
        show_success "Repositório atualizado"
    else
        show_progress "Clonando repositório GO-API"
        rm -rf $INSTALL_DIR/*
        git clone --quiet $REPO_URL .
        show_success "Repositório clonado"
    fi
    
    rm -f docker-compose*.yaml docker-compose*.yml 2>/dev/null
}

# Função para build e start
build_and_start() {
    cd $INSTALL_DIR
    
    show_progress "Construindo imagens Docker (pode demorar alguns minutos)"
    docker compose build --quiet
    show_success "Imagens construídas"
    
    show_progress "Iniciando PostgreSQL"
    docker compose up -d postgres
    
    show_progress "Aguardando PostgreSQL inicializar"
    sleep 10
    
    for i in {1..30}; do
        if docker compose exec -T postgres pg_isready -U goapi -d goapi > /dev/null 2>&1; then
            show_success "PostgreSQL pronto"
            break
        fi
        sleep 2
    done
    
    show_progress "Iniciando API"
    docker compose up -d api
    sleep 20
    
    show_progress "Iniciando Frontend"
    docker compose up -d frontend
    sleep 5
    
    show_success "Serviços iniciados"
}

# Função para mostrar status
show_status() {
    show_banner
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}                    STATUS DOS SERVIÇOS${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # GO-API
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${ORANGE}GO-API:${NC}"
        cd $INSTALL_DIR 2>/dev/null && docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  Não instalado"
        echo ""
    fi
    
    # Extras
    if [ -d "$EXTRAS_DIR" ]; then
        echo -e "${ORANGE}FERRAMENTAS EXTRAS:${NC}"
        cd $EXTRAS_DIR 2>/dev/null
        
        if [ -f "docker-compose-typebot.yml" ]; then
            echo -e "  ${WHITE}Typebot:${NC}"
            docker compose -f docker-compose-typebot.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "    Não rodando"
        fi
        
        if [ -f "docker-compose-n8n.yml" ]; then
            echo -e "  ${WHITE}N8N:${NC}"
            docker compose -f docker-compose-n8n.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "    Não rodando"
        fi
        
        if [ -f "docker-compose-chatwoot.yml" ]; then
            echo -e "  ${WHITE}Chatwoot:${NC}"
            docker compose -f docker-compose-chatwoot.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "    Não rodando"
        fi
    fi
    
    echo ""
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    
    # Mostrar URLs se existir .env
    if [ -f "$INSTALL_DIR/.env" ]; then
        echo ""
        echo -e "${ORANGE}URLs GO-API:${NC}"
        source $INSTALL_DIR/.env 2>/dev/null
        [ -n "$FRONTEND_DOMAIN" ] && echo -e "  ${WHITE}Frontend:${NC} https://$FRONTEND_DOMAIN"
        [ -n "$API_DOMAIN" ] && echo -e "  ${WHITE}API:${NC} https://$API_DOMAIN"
    fi
    
    if [ -f "$EXTRAS_DIR/.env" ]; then
        echo ""
        echo -e "${ORANGE}URLs Extras:${NC}"
        source $EXTRAS_DIR/.env 2>/dev/null
        [ -n "$TYPEBOT_DOMAIN" ] && echo -e "  ${WHITE}Typebot:${NC} https://$TYPEBOT_DOMAIN"
        [ -n "$N8N_DOMAIN" ] && echo -e "  ${WHITE}N8N:${NC} https://$N8N_DOMAIN"
        [ -n "$CHATWOOT_DOMAIN" ] && echo -e "  ${WHITE}Chatwoot:${NC} https://$CHATWOOT_DOMAIN"
    fi
    
    pause
}

# Função para ver logs
view_logs() {
    show_banner
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}                    LOGS DOS SERVIÇOS${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${ORANGE}[1]${NC} GO-API (API)"
    echo -e "  ${ORANGE}[2]${NC} GO-API (Frontend)"
    echo -e "  ${ORANGE}[3]${NC} GO-API (PostgreSQL)"
    echo -e "  ${ORANGE}[4]${NC} Typebot"
    echo -e "  ${ORANGE}[5]${NC} N8N"
    echo -e "  ${ORANGE}[6]${NC} Chatwoot"
    echo -e "  ${ORANGE}[0]${NC} Voltar"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    read -p "$(echo -e ${ORANGE}Escolha: ${NC})" LOG_CHOICE
    
    case $LOG_CHOICE in
        1) 
            cd $INSTALL_DIR 2>/dev/null && docker compose logs -f --tail=100 api || show_error "GO-API não instalada"
            ;;
        2) 
            cd $INSTALL_DIR 2>/dev/null && docker compose logs -f --tail=100 frontend || show_error "GO-API não instalada"
            ;;
        3) 
            cd $INSTALL_DIR 2>/dev/null && docker compose logs -f --tail=100 postgres || show_error "GO-API não instalada"
            ;;
        4) 
            cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-typebot.yml logs -f --tail=100 2>/dev/null || show_error "Typebot não instalado"
            ;;
        5) 
            cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-n8n.yml logs -f --tail=100 2>/dev/null || show_error "N8N não instalado"
            ;;
        6) 
            cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-chatwoot.yml logs -f --tail=100 chatwoot-rails 2>/dev/null || show_error "Chatwoot não instalado"
            ;;
        0) 
            return 
            ;;
    esac
    
    pause
}

# Função para reiniciar serviços
restart_services() {
    show_banner
    echo -e "${ORANGE}▶ REINICIANDO SERVIÇOS${NC}"
    echo ""
    
    # GO-API
    if [ -d "$INSTALL_DIR" ]; then
        show_progress "Reiniciando GO-API"
        cd $INSTALL_DIR
        docker compose down
        docker compose up -d
        show_success "GO-API reiniciada"
    fi
    
    # Extras
    if [ -d "$EXTRAS_DIR" ]; then
        cd $EXTRAS_DIR
        
        if [ -f "docker-compose-typebot.yml" ]; then
            show_progress "Reiniciando Typebot"
            docker compose -f docker-compose-typebot.yml down
            docker compose -f docker-compose-typebot.yml up -d
            show_success "Typebot reiniciado"
        fi
        
        if [ -f "docker-compose-n8n.yml" ]; then
            show_progress "Reiniciando N8N"
            docker compose -f docker-compose-n8n.yml down
            docker compose -f docker-compose-n8n.yml up -d
            show_success "N8N reiniciado"
        fi
        
        if [ -f "docker-compose-chatwoot.yml" ]; then
            show_progress "Reiniciando Chatwoot"
            docker compose -f docker-compose-chatwoot.yml down
            docker compose -f docker-compose-chatwoot.yml up -d
            show_success "Chatwoot reiniciado"
        fi
    fi
    
    show_success "Todos os serviços reiniciados"
    pause
}

# Função para mudar credenciais
change_credentials() {
    show_banner
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           ALTERAR CREDENCIAIS GO-API${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ ! -d "$INSTALL_DIR" ]; then
        show_error "GO-API não instalada"
        pause
        return
    fi
    
    read -p "$(echo -e ${ORANGE}Novo EMAIL: ${NC})" NEW_EMAIL
    read -p "$(echo -e ${ORANGE}Nova SENHA: ${NC})" NEW_PASSWORD
    
    cd $INSTALL_DIR
    
    show_progress "Gerando hash da senha"
    
    PASSWORD_HASH=$(docker compose exec -T api node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('$NEW_PASSWORD', 10);
console.log(hash);
" 2>/dev/null | tr -d '\r\n')
    
    if [ -n "$PASSWORD_HASH" ]; then
        show_progress "Atualizando credenciais"
        
        docker compose exec -T postgres psql -U goapi -d goapi -c "
            UPDATE \"User\" SET email = '$NEW_EMAIL', password = '$PASSWORD_HASH' WHERE role = 'ADMIN';
        " > /dev/null 2>&1
        
        show_success "Credenciais atualizadas!"
        echo -e "  ${ORANGE}Email:${NC} $NEW_EMAIL"
        echo -e "  ${ORANGE}Senha:${NC} $NEW_PASSWORD"
    else
        show_error "Erro ao gerar hash da senha"
    fi
    
    pause
}

# Função para resetar sistema
reset_system() {
    show_banner
    echo -e "${RED}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}                    ⚠️  ATENÇÃO ⚠️${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${WHITE}Esta ação irá:${NC}"
    echo -e "  ${RED}•${NC} Parar todos os containers"
    echo -e "  ${RED}•${NC} Remover todos os volumes (dados)"
    echo -e "  ${RED}•${NC} Remover todas as imagens"
    echo -e "  ${RED}•${NC} Apagar diretórios de instalação"
    echo ""
    echo -e "${RED}TODOS OS DADOS SERÃO PERDIDOS!${NC}"
    echo ""
    
    read -p "$(echo -e ${RED}Digite 'RESETAR' para confirmar: ${NC})" CONFIRM_RESET
    
    if [ "$CONFIRM_RESET" = "RESETAR" ]; then
        # GO-API
        if [ -d "$INSTALL_DIR" ]; then
            show_progress "Removendo GO-API"
            cd $INSTALL_DIR 2>/dev/null && docker compose down -v --remove-orphans 2>/dev/null
            rm -rf $INSTALL_DIR
        fi
        
        # Extras
        if [ -d "$EXTRAS_DIR" ]; then
            show_progress "Removendo ferramentas extras"
            cd $EXTRAS_DIR 2>/dev/null
            [ -f "docker-compose-typebot.yml" ] && docker compose -f docker-compose-typebot.yml down -v --remove-orphans 2>/dev/null
            [ -f "docker-compose-n8n.yml" ] && docker compose -f docker-compose-n8n.yml down -v --remove-orphans 2>/dev/null
            [ -f "docker-compose-chatwoot.yml" ] && docker compose -f docker-compose-chatwoot.yml down -v --remove-orphans 2>/dev/null
            rm -rf $EXTRAS_DIR
        fi
        
        show_progress "Limpando Docker"
        docker system prune -af --volumes 2>/dev/null
        
        show_success "Sistema resetado!"
        echo -e "${ORANGE}Execute o instalador novamente para reinstalar.${NC}"
    else
        show_info "Operação cancelada"
    fi
    
    pause
}


# Função principal de instalação GO-API
do_install() {
    show_banner
    
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}                    INSTALAÇÃO GO-API${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # ETAPA 1: PREPARAÇÃO
    echo -e "${ORANGE}▶ ETAPA 1/4: Preparando sistema...${NC}"
    echo ""
    
    show_progress "Detectando sistema"
    detect_system
    show_success "Sistema: $OS $VER"
    
    show_progress "Atualizando pacotes"
    update_system > /dev/null 2>&1
    show_success "Pacotes atualizados"
    
    show_progress "Instalando dependências"
    install_dependencies > /dev/null 2>&1
    show_success "Dependências instaladas"
    
    show_progress "Configurando Docker"
    install_docker
    
    echo ""
    echo -e "${GREEN}✓ ETAPA 1 CONCLUÍDA${NC}"
    sleep 2
    
    # ETAPA 2: CONFIGURAÇÃO
    clear_screen
    show_banner
    echo -e "${ORANGE}▶ ETAPA 2/4: Configuração...${NC}"
    collect_info
    
    # Configurar portas
    setup_ports
    
    echo ""
    echo -e "${GREEN}✓ ETAPA 2 CONCLUÍDA${NC}"
    sleep 2
    
    # ETAPA 3: DOWNLOAD E CONFIGURAÇÃO
    clear_screen
    show_banner
    echo -e "${ORANGE}▶ ETAPA 3/4: Baixando e configurando...${NC}"
    echo ""
    
    clone_repository
    create_docker_compose
    
    # Salvar configuração
    cat > $INSTALL_DIR/.env << ENVFILE
FRONTEND_DOMAIN=$FRONTEND_DOMAIN
API_DOMAIN=$API_DOMAIN
USER_EMAIL=$USER_EMAIL
PORT_FRONTEND=$PORT_FRONTEND
PORT_API=$PORT_API
PORT_POSTGRES=$PORT_POSTGRES
ENVFILE
    
    echo ""
    echo -e "${GREEN}✓ ETAPA 3 CONCLUÍDA${NC}"
    sleep 2
    
    # ETAPA 4: BUILD E INICIALIZAÇÃO
    clear_screen
    show_banner
    echo -e "${ORANGE}▶ ETAPA 4/4: Construindo e iniciando...${NC}"
    echo ""
    
    build_and_start
    
    # Criar admin
    echo ""
    show_progress "Configurando usuário administrador"
    sleep 10
    
    PASSWORD_HASH=$(docker compose exec -T api node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('$ADMIN_PASSWORD', 10));
" 2>/dev/null | tr -d '\r\n')
    
    if [ -n "$PASSWORD_HASH" ]; then
        docker compose exec -T postgres psql -U goapi -d goapi -c "
            INSERT INTO \"User\" (id, email, password, role, \"createdAt\") 
            VALUES (gen_random_uuid(), '$USER_EMAIL', '$PASSWORD_HASH', 'ADMIN', NOW())
            ON CONFLICT (email) DO UPDATE SET password = '$PASSWORD_HASH', role = 'ADMIN';
        " > /dev/null 2>&1
        show_success "Usuário admin criado"
    fi
    
    # FINALIZAÇÃO
    clear_screen
    show_banner
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}              ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${WHITE}Acesse seu painel:${NC}"
    echo -e "  ${ORANGE}Frontend:${NC} https://$FRONTEND_DOMAIN (porta $PORT_FRONTEND)"
    echo -e "  ${ORANGE}API:${NC}      https://$API_DOMAIN (porta $PORT_API)"
    echo ""
    echo -e "${WHITE}Credenciais:${NC}"
    echo -e "  ${ORANGE}Email:${NC}    $USER_EMAIL"
    echo -e "  ${ORANGE}Senha:${NC}    $ADMIN_PASSWORD"
    echo ""
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}Configure seu proxy reverso (Nginx/Traefik) para as portas acima.${NC}"
    echo -e "${WHITE}Use a opção 2 do menu para instalar Typebot, N8N ou Chatwoot.${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    
    pause
}

# Menu de ferramentas extras
do_extras_menu() {
    while true; do
        show_banner
        show_extras_menu
        
        read -p "$(echo -e ${ORANGE}Escolha uma opção: ${NC})" EXTRAS_CHOICE
        
        case $EXTRAS_CHOICE in
            1)
                install_typebot_standalone
                pause
                ;;
            2)
                install_n8n_standalone
                pause
                ;;
            3)
                install_chatwoot_standalone
                pause
                ;;
            4)
                install_typebot_standalone
                install_n8n_standalone
                install_chatwoot_standalone
                pause
                ;;
            0)
                break
                ;;
            *)
                show_error "Opção inválida"
                sleep 1
                ;;
        esac
    done
}

# Função principal - Menu
main_menu() {
    check_root
    
    while true; do
        show_banner
        show_menu
        
        read -p "$(echo -e ${ORANGE}Escolha uma opção: ${NC})" MENU_CHOICE
        
        case $MENU_CHOICE in
            1)
                do_install
                ;;
            2)
                do_extras_menu
                ;;
            3)
                show_banner
                echo -e "${ORANGE}▶ VERIFICAR CERTIFICADOS SSL${NC}"
                echo ""
                show_info "Configure seu proxy reverso (Nginx/Traefik/Caddy)"
                show_info "para gerenciar os certificados SSL."
                echo ""
                show_info "Portas dos serviços:"
                if [ -f "$INSTALL_DIR/.env" ]; then
                    source $INSTALL_DIR/.env 2>/dev/null
                    echo -e "  Frontend: ${PORT_FRONTEND:-3000}"
                    echo -e "  API: ${PORT_API:-3001}"
                else
                    echo -e "  GO-API não instalada"
                fi
                if [ -f "$EXTRAS_DIR/.env" ]; then
                    source $EXTRAS_DIR/.env 2>/dev/null
                    [ -n "$PORT_TYPEBOT" ] && echo -e "  Typebot: $PORT_TYPEBOT"
                    [ -n "$PORT_N8N" ] && echo -e "  N8N: $PORT_N8N"
                    [ -n "$PORT_CHATWOOT" ] && echo -e "  Chatwoot: $PORT_CHATWOOT"
                fi
                pause
                ;;
            4)
                change_credentials
                ;;
            5)
                view_logs
                ;;
            6)
                restart_services
                ;;
            7)
                show_status
                ;;
            8)
                reset_system
                ;;
            0)
                echo ""
                echo -e "${ORANGE}Obrigado por usar GO-API! Até logo! 👋${NC}"
                echo ""
                exit 0
                ;;
            *)
                show_error "Opção inválida"
                sleep 1
                ;;
        esac
    done
}

# Iniciar
main_menu

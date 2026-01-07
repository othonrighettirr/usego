#!/bin/bash

# ===========================================
# GO-API - Instalador Profissional v1.0
# ===========================================

set -e

# Cores - Tema Laranja/Amber combinando com o sistema
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
REPO_URL="https://github.com/othonrighettirr/gofree.git"

# Função para limpar tela
clear_screen() {
    clear
}

# Função para mostrar o banner
show_banner() {
    clear_screen
    echo -e "${ORANGE}"
    echo "   ██████╗  ██████╗        █████╗ ██████╗ ██╗    ██╗   ██╗ ██╗"
    echo "  ██╔════╝ ██╔═══██╗      ██╔══██╗██╔══██╗██║    ██║   ██║███║"
    echo "  ██║  ███╗██║   ██║█████╗███████║██████╔╝██║    ██║   ██║╚██║"
    echo "  ██║   ██║██║   ██║╚════╝██╔══██║██╔═══╝ ██║    ╚██╗ ██╔╝ ██║"
    echo "  ╚██████╔╝╚██████╔╝      ██║  ██║██║     ██║     ╚████╔╝  ██║"
    echo "   ╚═════╝  ╚═════╝       ╚═╝  ╚═╝╚═╝     ╚═╝      ╚═══╝   ╚═╝"
    echo -e "${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}   Bem-vindo ao mundo da GO-API, é muito bom ter você aqui${NC}"
    echo -e "${WHITE}   para fazer sua instalação.${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Função para mostrar o menu
show_menu() {
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}                           MENU${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${ORANGE}[1]${NC} ${WHITE}INSTALAR GO-API${NC}"
    echo -e "      ${GRAY}Instalação completa com todas as dependências${NC}"
    echo -e "  ${ORANGE}[2]${NC} ${WHITE}VERIFICAR LICENÇA${NC}"
    echo -e "      ${GRAY}Verifica e ativa sua licença${NC}"
    echo -e "  ${ORANGE}[3]${NC} ${WHITE}VERIFICAR CERTIFICADOS SSL${NC}"
    echo -e "      ${GRAY}Verifica e instala certificados HTTPS${NC}"
    echo -e "  ${ORANGE}[4]${NC} ${WHITE}MUDAR LOGIN E SENHA${NC}"
    echo -e "      ${GRAY}Altera credenciais de acesso ao painel${NC}"
    echo -e "  ${ORANGE}[5]${NC} ${WHITE}VER LOGS${NC}"
    echo -e "      ${GRAY}Visualiza logs dos serviços${NC}"
    echo -e "  ${ORANGE}[6]${NC} ${WHITE}REINICIAR SERVIÇOS${NC}"
    echo -e "      ${GRAY}Reinicia todos os containers${NC}"
    echo -e "  ${RED}[7]${NC} ${WHITE}RESETAR SISTEMA${NC}"
    echo -e "      ${GRAY}Remove tudo e permite reinstalar do zero${NC}"
    echo -e "  ${ORANGE}[0]${NC} ${WHITE}SAIR${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}Contribua com nosso time para que possamos cada vez mais crescer${NC}"
    echo -e "${WHITE}e manter nossa API atualizada para você utilizar.${NC}"
    echo -e "${ORANGE}Para contribuir: ${AMBER}https://usego.com.br/members/payments${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Função para verificar se é root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ Este script precisa ser executado como root!${NC}"
        echo -e "${YELLOW}Execute: sudo bash install.sh${NC}"
        exit 1
    fi
}

# Função para verificar se está rodando via pipe
check_pipe() {
    if [ ! -t 0 ]; then
        echo -e "${RED}❌ ERRO: Não execute via pipe (curl | bash)${NC}"
        echo ""
        echo -e "${YELLOW}Execute assim:${NC}"
        echo -e "  ${WHITE}curl -fsSL https://raw.githubusercontent.com/othonrighettirr/gofree/main/install.sh -o install.sh${NC}"
        echo -e "  ${WHITE}sudo bash install.sh${NC}"
        echo ""
        exit 1
    fi
}

# Função para mostrar progresso
show_progress() {
    local message=$1
    echo -e "${AMBER}⏳ ${message}...${NC}"
}

# Função para mostrar sucesso
show_success() {
    local message=$1
    echo -e "${GREEN}✅ ${message}${NC}"
}

# Função para mostrar erro
show_error() {
    local message=$1
    echo -e "${RED}❌ ${message}${NC}"
}

# Função para mostrar info
show_info() {
    local message=$1
    echo -e "${ORANGE}ℹ️  ${message}${NC}"
}

# Função para mostrar barra de progresso (porcentagem abaixo)
show_progress_bar() {
    local current=$1
    local total=$2
    local message=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 2))
    local empty=$((50 - filled))
    
    # Criar barra
    local bar=""
    for ((i=0; i<filled; i++)); do bar+="█"; done
    for ((i=0; i<empty; i++)); do bar+="░"; done
    
    # Mostrar barra com porcentagem e mensagem ABAIXO
    echo -e "${AMBER}[${ORANGE}${bar}${AMBER}]${NC}"
    echo -e "${WHITE}${percent}%${NC} ${GRAY}${message}${NC}"
}

# Função para finalizar barra de progresso
finish_progress_bar() {
    echo ""
}

# Função para spinner animado durante operações longas
show_spinner() {
    local pid=$1
    local message=$2
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    
    while kill -0 $pid 2>/dev/null; do
        for ((i=0; i<${#spinstr}; i++)); do
            printf "\r${AMBER}${spinstr:$i:1} ${WHITE}%s${NC}   " "$message"
            sleep 0.1
        done
    done
    printf "\r"
}

# Função para pausar
pause() {
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função para detectar versão do sistema
detect_system() {
    show_progress "Detectando sistema operacional"
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
        show_success "Sistema detectado: $OS $VER"
    else
        show_error "Sistema operacional não suportado"
        exit 1
    fi
}

# Função para atualizar sistema
update_system() {
    show_progress "Atualizando lista de pacotes"
    apt-get update -qq
    show_success "Lista de pacotes atualizada"
    
    show_progress "Atualizando pacotes do sistema"
    apt-get upgrade -y -qq
    show_success "Pacotes atualizados"
}

# Função para instalar dependências
install_dependencies() {
    show_progress "Instalando dependências essenciais"
    apt-get install -y -qq curl wget git openssl ca-certificates gnupg lsb-release
    show_success "Dependências instaladas"
}

# Função para instalar Docker
install_docker() {
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
        show_success "Docker já instalado (versão $DOCKER_VERSION)"
    else
        show_progress "Instalando Docker"
        curl -fsSL https://get.docker.com | sh -s -- --quiet
        systemctl enable docker
        systemctl start docker
        show_success "Docker instalado com sucesso"
    fi
    
    # Verificar Docker Compose
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version --short)
        show_success "Docker Compose disponível (versão $COMPOSE_VERSION)"
    else
        show_progress "Instalando Docker Compose plugin"
        apt-get install -y -qq docker-compose-plugin
        show_success "Docker Compose instalado"
    fi
}


# Função para coletar informações
collect_info() {
    echo ""
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           CONFIGURAÇÃO DA INSTALAÇÃO${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Domínio Frontend
    read -p "$(echo -e ${ORANGE}Domínio do FRONTEND ${GRAY}[ex: app.seusite.com]${NC}: )" FRONTEND_DOMAIN
    
    # Domínio API
    read -p "$(echo -e ${ORANGE}Domínio da API ${GRAY}[ex: api.seusite.com]${NC}: )" API_DOMAIN
    
    # Email
    read -p "$(echo -e ${ORANGE}Seu EMAIL ${GRAY}[para SSL e login]${NC}: )" USER_EMAIL
    
    # Senha
    read -p "$(echo -e ${ORANGE}SENHA do painel${NC}: )" ADMIN_PASSWORD
    
    # License Key
    read -p "$(echo -e ${ORANGE}LICENSE_KEY ${GRAY}[da usego.com.br]${NC}: )" LICENSE_KEY
    
    # Machine ID
    read -p "$(echo -e ${ORANGE}MACHINE_ID${NC}: )" MACHINE_ID
    
    # Confirmar informações
    echo ""
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           CONFIRME AS INFORMAÇÕES${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${ORANGE}Frontend:${NC}    https://$FRONTEND_DOMAIN"
    echo -e "  ${ORANGE}API:${NC}         https://$API_DOMAIN"
    echo -e "  ${ORANGE}Email:${NC}       $USER_EMAIL"
    echo -e "  ${ORANGE}Senha:${NC}       $ADMIN_PASSWORD"
    echo -e "  ${ORANGE}License:${NC}     $LICENSE_KEY"
    echo -e "  ${ORANGE}Machine ID:${NC}  $MACHINE_ID"
    echo ""
    
    read -p "$(echo -e ${AMBER}As informações estão corretas? ${WHITE}[S/n]${NC}: )" CONFIRM
    
    if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
        echo -e "${ORANGE}Vamos preencher novamente...${NC}"
        collect_info
    fi
}

# Função para criar docker-compose
create_docker_compose() {
    show_progress "Criando configuração do Docker Compose"
    
    JWT_SECRET=$(openssl rand -hex 32)
    
    cat > $INSTALL_DIR/docker-compose.yml << ENDOFFILE
services:
  nginx:
    image: nginx:alpine
    container_name: goapi-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - api
    networks:
      - goapi-network

  certbot:
    image: certbot/certbot
    container_name: goapi-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait \$\${!}; done;'"
    networks:
      - goapi-network

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: goapi-frontend
    restart: always
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

  api:
    build:
      context: .
      dockerfile: api/Dockerfile
    container_name: goapi-backend
    restart: always
    environment:
      - PORT=3001
      - NODE_ENV=production
      - DATABASE_URL=postgresql://goapi:goapi_secret_2024@postgres:5432/goapi?schema=public
      - JWT_SECRET=$JWT_SECRET
      - JWT_EXPIRES_IN=3000000d
      - CORS_ORIGIN=*
      - ADMIN_EMAIL=$USER_EMAIL
      - ADMIN_PASSWORD=$ADMIN_PASSWORD
      - LICENSE_SERVER=https://usego.com.br
      - LICENSE_KEY=$LICENSE_KEY
      - MACHINE_ID=$MACHINE_ID
    volumes:
      - sessions_data:/app/sessions
      - license_data:/app/license
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - goapi-network

  postgres:
    image: postgres:15-alpine
    container_name: goapi-postgres
    restart: always
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

volumes:
  postgres_data:
  sessions_data:
  license_data:

networks:
  goapi-network:
    driver: bridge
ENDOFFILE

    show_success "Docker Compose configurado"
}

# Função para criar nginx.conf
create_nginx_conf() {
    show_progress "Criando configuração do Nginx"
    
    cat > $INSTALL_DIR/nginx.conf << 'ENDOFNGINX'
events {
    worker_connections 1024;
}

http {
    client_max_body_size 50M;
    
    server {
        listen 80;
        server_name FRONTEND_DOMAIN_PLACEHOLDER API_DOMAIN_PLACEHOLDER;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name FRONTEND_DOMAIN_PLACEHOLDER;

        ssl_certificate /etc/letsencrypt/live/FRONTEND_DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/FRONTEND_DOMAIN_PLACEHOLDER/privkey.pem;

        location / {
            proxy_pass http://goapi-frontend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    server {
        listen 443 ssl;
        server_name API_DOMAIN_PLACEHOLDER;

        ssl_certificate /etc/letsencrypt/live/API_DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/API_DOMAIN_PLACEHOLDER/privkey.pem;

        location / {
            proxy_pass http://goapi-backend:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
ENDOFNGINX

    # Substituir placeholders
    sed -i "s/FRONTEND_DOMAIN_PLACEHOLDER/$FRONTEND_DOMAIN/g" $INSTALL_DIR/nginx.conf
    sed -i "s/API_DOMAIN_PLACEHOLDER/$API_DOMAIN/g" $INSTALL_DIR/nginx.conf
    
    show_success "Nginx configurado"
}


# Função para gerar certificados SSL
generate_ssl() {
    show_progress "Preparando geração de certificados SSL"
    
    # Limpar certificados antigos se existirem
    rm -rf $INSTALL_DIR/certbot/conf/* 2>/dev/null
    rm -rf $INSTALL_DIR/certbot/www/* 2>/dev/null
    
    mkdir -p $INSTALL_DIR/certbot/conf
    mkdir -p $INSTALL_DIR/certbot/www/.well-known/acme-challenge
    
    # Criar arquivo de teste para verificar se o diretório está acessível
    echo "test" > $INSTALL_DIR/certbot/www/.well-known/acme-challenge/test.txt
    
    # Parar qualquer container usando porta 80
    docker stop nginx-ssl-temp 2>/dev/null || true
    docker rm nginx-ssl-temp 2>/dev/null || true
    
    # Liberar porta 80 se estiver em uso
    fuser -k 80/tcp 2>/dev/null || true
    sleep 2
    
    # Criar arquivo de configuração nginx temporário
    cat > /tmp/nginx-ssl.conf << 'NGINXTEMP'
events {
    worker_connections 1024;
}
http {
    server {
        listen 80 default_server;
        server_name _;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            allow all;
        }
        
        location / {
            return 200 'GO-API SSL Setup OK';
            add_header Content-Type text/plain;
        }
    }
}
NGINXTEMP

    show_progress "Iniciando servidor temporário para validação"
    
    docker run -d --name nginx-ssl-temp \
        -p 80:80 \
        -v /tmp/nginx-ssl.conf:/etc/nginx/nginx.conf:ro \
        -v $INSTALL_DIR/certbot/www:/var/www/certbot:ro \
        nginx:alpine > /dev/null 2>&1
    
    # Aguardar nginx iniciar completamente
    show_info "Aguardando servidor iniciar (15 segundos)..."
    sleep 15
    
    # Verificar se nginx está rodando
    if ! docker ps | grep -q nginx-ssl-temp; then
        show_error "Nginx temporário não iniciou"
        docker logs nginx-ssl-temp 2>/dev/null
        return 1
    fi
    
    # Testar se o servidor está respondendo
    TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
    if [ "$TEST_RESPONSE" != "200" ]; then
        show_error "Servidor não está respondendo (código: $TEST_RESPONSE)"
    else
        show_success "Servidor temporário rodando"
    fi
    
    # Gerar certificado para Frontend
    echo ""
    show_progress "Gerando certificado SSL para $FRONTEND_DOMAIN"
    
    docker run --rm \
        -v $INSTALL_DIR/certbot/conf:/etc/letsencrypt \
        -v $INSTALL_DIR/certbot/www:/var/www/certbot \
        certbot/certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        -d $FRONTEND_DOMAIN \
        --email $USER_EMAIL \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        --force-renewal
    
    if [ $? -eq 0 ]; then
        show_success "Certificado SSL do Frontend gerado"
    else
        show_error "Falha ao gerar certificado do Frontend"
        show_info "Verifique se o domínio $FRONTEND_DOMAIN aponta para este servidor"
    fi
    
    # Gerar certificado para API
    echo ""
    show_progress "Gerando certificado SSL para $API_DOMAIN"
    
    docker run --rm \
        -v $INSTALL_DIR/certbot/conf:/etc/letsencrypt \
        -v $INSTALL_DIR/certbot/www:/var/www/certbot \
        certbot/certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        -d $API_DOMAIN \
        --email $USER_EMAIL \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        --force-renewal
    
    if [ $? -eq 0 ]; then
        show_success "Certificado SSL da API gerado"
    else
        show_error "Falha ao gerar certificado da API"
        show_info "Verifique se o domínio $API_DOMAIN aponta para este servidor"
    fi
    
    # Parar nginx temporário
    docker stop nginx-ssl-temp > /dev/null 2>&1
    docker rm nginx-ssl-temp > /dev/null 2>&1
    rm -f /tmp/nginx-ssl.conf
    
    # Verificar se os certificados foram criados e ajustar nginx.conf
    if [ -d "$INSTALL_DIR/certbot/conf/live" ]; then
        FRONTEND_CERT_DIR=$(ls -d $INSTALL_DIR/certbot/conf/live/$FRONTEND_DOMAIN* 2>/dev/null | head -1 | xargs basename 2>/dev/null)
        API_CERT_DIR=$(ls -d $INSTALL_DIR/certbot/conf/live/$API_DOMAIN* 2>/dev/null | head -1 | xargs basename 2>/dev/null)
        
        if [ -n "$FRONTEND_CERT_DIR" ] && [ "$FRONTEND_CERT_DIR" != "$FRONTEND_DOMAIN" ]; then
            sed -i "s|/etc/letsencrypt/live/$FRONTEND_DOMAIN/|/etc/letsencrypt/live/$FRONTEND_CERT_DIR/|g" $INSTALL_DIR/nginx.conf
        fi
        
        if [ -n "$API_CERT_DIR" ] && [ "$API_CERT_DIR" != "$API_DOMAIN" ]; then
            sed -i "s|/etc/letsencrypt/live/$API_DOMAIN/|/etc/letsencrypt/live/$API_CERT_DIR/|g" $INSTALL_DIR/nginx.conf
        fi
        
        show_success "Certificados SSL configurados"
    else
        show_error "Certificados não gerados. Use opção 3 do menu depois."
    fi
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
    
    # Remover docker-compose existentes
    rm -f docker-compose*.yaml docker-compose*.yml 2>/dev/null
}

# Função para build e start
build_and_start() {
    cd $INSTALL_DIR
    
    show_progress "Construindo imagens Docker (isso pode demorar alguns minutos)"
    docker compose build --quiet
    show_success "Imagens construídas"
    
    # Primeiro, iniciar apenas o PostgreSQL
    show_progress "Iniciando banco de dados PostgreSQL"
    docker compose up -d postgres
    
    # Aguardar PostgreSQL estar pronto
    show_progress "Aguardando PostgreSQL inicializar"
    sleep 10
    
    # Verificar se PostgreSQL está rodando
    for i in {1..30}; do
        if docker compose exec -T postgres pg_isready -U goapi -d goapi > /dev/null 2>&1; then
            show_success "PostgreSQL pronto"
            break
        fi
        sleep 2
    done
    
    # Iniciar API
    show_progress "Iniciando API"
    docker compose up -d api
    
    # Aguardar API iniciar e criar tabelas
    show_progress "Aguardando API criar tabelas e usuário admin"
    sleep 20
    
    # Verificar se o admin foi criado
    ADMIN_CHECK=$(docker compose logs api 2>/dev/null | grep -i "admin user")
    if [ -n "$ADMIN_CHECK" ]; then
        show_success "Usuário admin configurado"
        echo -e "  ${BLUE}$ADMIN_CHECK${NC}"
    fi
    
    # Iniciar Frontend
    show_progress "Iniciando Frontend"
    docker compose up -d frontend
    sleep 5
    
    # Iniciar Nginx
    show_progress "Iniciando Nginx"
    docker compose up -d nginx certbot
    sleep 3
    
    # Verificar status final
    echo ""
    show_progress "Verificando status dos serviços"
    
    if docker compose ps | grep -q "goapi-backend.*Up"; then
        show_success "API rodando"
    else
        show_error "API pode ter problemas, verifique os logs"
    fi
    
    if docker compose ps | grep -q "goapi-frontend.*Up"; then
        show_success "Frontend rodando"
    else
        show_error "Frontend pode ter problemas, verifique os logs"
    fi
    
    if docker compose ps | grep -q "goapi-nginx.*Up"; then
        show_success "Nginx rodando"
    else
        show_error "Nginx pode ter problemas, verifique os logs"
    fi
    
    if docker compose ps | grep -q "goapi-postgres.*Up"; then
        show_success "PostgreSQL rodando"
    else
        show_error "PostgreSQL pode ter problemas"
    fi
}

# Função principal de instalação
do_install() {
    show_banner
    
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}                    INSTALAÇÃO GO-API${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # ============================================
    # ETAPA 1: PREPARAÇÃO DO SISTEMA
    # ============================================
    echo -e "${ORANGE}▶ ETAPA 1/5: Preparando sistema...${NC}"
    echo ""
    
    show_progress "Detectando sistema operacional"
    detect_system > /dev/null 2>&1
    show_success "Sistema detectado"
    
    show_progress "Atualizando pacotes"
    update_system > /dev/null 2>&1
    show_success "Pacotes atualizados"
    
    show_progress "Instalando dependências"
    install_dependencies > /dev/null 2>&1
    show_success "Dependências instaladas"
    
    show_progress "Configurando Docker"
    install_docker > /dev/null 2>&1
    show_success "Docker configurado"
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}                    ETAPA 1 CONCLUÍDA - 20%${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    sleep 2
    clear_screen
    show_banner
    
    # ============================================
    # ETAPA 2: COLETA DE INFORMAÇÕES
    # ============================================
    echo -e "${ORANGE}▶ ETAPA 2/5: Configuração...${NC}"
    collect_info
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}                    ETAPA 2 CONCLUÍDA - 40%${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    sleep 2
    clear_screen
    show_banner
    
    # ============================================
    # ETAPA 3: DOWNLOAD E CONFIGURAÇÃO
    # ============================================
    echo -e "${ORANGE}▶ ETAPA 3/5: Baixando e configurando...${NC}"
    echo ""
    
    show_progress "Clonando repositório GO-API"
    clone_repository > /dev/null 2>&1
    show_success "Repositório clonado"
    
    show_progress "Criando docker-compose.yml"
    create_docker_compose > /dev/null 2>&1
    show_success "Docker Compose criado"
    
    show_progress "Criando nginx.conf"
    create_nginx_conf > /dev/null 2>&1
    show_success "Nginx configurado"
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}                    ETAPA 3 CONCLUÍDA - 60%${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    sleep 2
    clear_screen
    show_banner
    
    # ============================================
    # ETAPA 4: SSL E BUILD
    # ============================================
    echo -e "${ORANGE}▶ ETAPA 4/5: Certificados SSL e Build...${NC}"
    echo ""
    
    generate_ssl
    
    echo ""
    show_progress "Construindo imagens Docker (2-5 minutos)"
    cd $INSTALL_DIR
    docker compose build --quiet > /dev/null 2>&1
    show_success "Imagens construídas"
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}                    ETAPA 4 CONCLUÍDA - 80%${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    sleep 2
    clear_screen
    show_banner
    
    # ============================================
    # ETAPA 5: INICIALIZAÇÃO DOS SERVIÇOS
    # ============================================
    echo -e "${ORANGE}▶ ETAPA 5/5: Iniciando serviços...${NC}"
    echo ""
    
    cd $INSTALL_DIR
    
    # PostgreSQL
    show_progress "Iniciando PostgreSQL"
    docker compose up -d postgres > /dev/null 2>&1
    
    echo -e "${GRAY}   Aguardando healthcheck...${NC}"
    for i in {1..30}; do
        if docker compose exec -T postgres pg_isready -U goapi -d goapi > /dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    show_success "PostgreSQL pronto"
    
    # API
    show_progress "Iniciando API"
    docker compose up -d api > /dev/null 2>&1
    echo -e "${GRAY}   Aguardando API criar tabelas (30s)...${NC}"
    sleep 30
    show_success "API iniciada"
    
    # Frontend
    show_progress "Iniciando Frontend"
    docker compose up -d frontend > /dev/null 2>&1
    sleep 5
    show_success "Frontend iniciado"
    
    # Nginx
    show_progress "Iniciando Nginx"
    docker compose up -d nginx certbot > /dev/null 2>&1
    sleep 3
    show_success "Nginx iniciado"
    
    # ============================================
    # CRIAR ADMIN NO BANCO DE DADOS
    # ============================================
    echo ""
    echo -e "${ORANGE}▶ Configurando usuário administrador...${NC}"
    echo ""
    
    # Aguardar mais um pouco para garantir que as tabelas foram criadas
    sleep 5
    
    # Verificar se tabela User existe
    TABLE_EXISTS=$(docker compose exec -T postgres psql -U goapi -d goapi -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User');" 2>/dev/null | tr -d ' ')
    
    if [ "$TABLE_EXISTS" != "t" ]; then
        show_info "Aguardando criação das tabelas..."
        sleep 15
    fi
    
    # Gerar hash da senha usando bcrypt
    show_progress "Gerando hash da senha"
    
    # Escapar caracteres especiais na senha para o Node.js
    ESCAPED_PASSWORD=$(echo "$ADMIN_PASSWORD" | sed "s/'/\\\\'/g" | sed 's/"/\\"/g')
    
    PASSWORD_HASH=$(docker compose exec -T api node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('$ESCAPED_PASSWORD', 10);
console.log(hash);
" 2>/dev/null | tr -d '\r\n')
    
    if [ -z "$PASSWORD_HASH" ]; then
        show_error "Falha ao gerar hash - tentando método alternativo"
        PASSWORD_HASH=$(docker compose exec -T api node -e "const b=require('bcryptjs');console.log(b.hashSync(process.argv[1],10));" "$ADMIN_PASSWORD" 2>/dev/null | tr -d '\r\n')
    fi
    
    if [ -n "$PASSWORD_HASH" ]; then
        show_success "Hash gerado"
        
        # Verificar se admin já existe
        ADMIN_EXISTS=$(docker compose exec -T postgres psql -U goapi -d goapi -t -c "SELECT COUNT(*) FROM \"User\" WHERE email = '$USER_EMAIL';" 2>/dev/null | tr -d ' \r\n')
        
        if [ "$ADMIN_EXISTS" = "0" ] || [ -z "$ADMIN_EXISTS" ]; then
            show_progress "Criando usuário admin"
            
            # Inserir admin
            docker compose exec -T postgres psql -U goapi -d goapi -c "
                INSERT INTO \"User\" (id, email, password, role, \"createdAt\", \"updatedAt\") 
                VALUES (gen_random_uuid(), '$USER_EMAIL', '$PASSWORD_HASH', 'ADMIN', NOW(), NOW())
                ON CONFLICT (email) DO UPDATE SET password = '$PASSWORD_HASH', role = 'ADMIN';
            " > /dev/null 2>&1
            
            # Verificar se foi criado
            VERIFY=$(docker compose exec -T postgres psql -U goapi -d goapi -t -c "SELECT email FROM \"User\" WHERE email = '$USER_EMAIL' AND role = 'ADMIN';" 2>/dev/null | tr -d ' \r\n')
            
            if [ "$VERIFY" = "$USER_EMAIL" ]; then
                show_success "Usuário admin criado com sucesso!"
            else
                show_error "Erro ao criar admin - use opção 4 do menu para criar manualmente"
            fi
        else
            show_progress "Atualizando senha do admin existente"
            docker compose exec -T postgres psql -U goapi -d goapi -c "UPDATE \"User\" SET password = '$PASSWORD_HASH' WHERE email = '$USER_EMAIL';" > /dev/null 2>&1
            show_success "Senha do admin atualizada"
        fi
    else
        show_error "Não foi possível gerar hash da senha"
        show_info "Use a opção 4 do menu para configurar as credenciais"
    fi
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}                    ETAPA 5 CONCLUÍDA - 100%${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    sleep 2
    clear_screen
    show_banner
    
    # ============================================
    # VERIFICAÇÃO COMPLETA DO SISTEMA
    # ============================================
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           🔍 VERIFICAÇÃO DO SISTEMA${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    TESTS_PASSED=0
    TESTS_FAILED=0
    
    # Teste 1: Verificar se containers estão rodando
    echo -e "${ORANGE}▶ Verificando containers...${NC}"
    
    if docker compose ps | grep -q "goapi-postgres.*Up"; then
        echo -e "  ${GREEN}✅ PostgreSQL:${NC} Rodando"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}❌ PostgreSQL:${NC} Não está rodando"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    if docker compose ps | grep -q "goapi-backend.*Up"; then
        echo -e "  ${GREEN}✅ API:${NC} Rodando"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}❌ API:${NC} Não está rodando"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    if docker compose ps | grep -q "goapi-frontend.*Up"; then
        echo -e "  ${GREEN}✅ Frontend:${NC} Rodando"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}❌ Frontend:${NC} Não está rodando"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    if docker compose ps | grep -q "goapi-nginx.*Up"; then
        echo -e "  ${GREEN}✅ Nginx:${NC} Rodando"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}❌ Nginx:${NC} Não está rodando"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
    
    # Teste 2: Verificar admin no banco de dados
    echo -e "${ORANGE}▶ Verificando usuário admin no banco...${NC}"
    
    ADMIN_DB=$(docker compose exec -T postgres psql -U goapi -d goapi -t -c "SELECT email, role FROM \"User\" WHERE role = 'ADMIN' LIMIT 1;" 2>/dev/null | tr -d ' \r\n')
    
    if [ -n "$ADMIN_DB" ]; then
        echo -e "  ${GREEN}✅ Admin encontrado:${NC} $USER_EMAIL"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # Verificar se o hash da senha está correto
        STORED_HASH=$(docker compose exec -T postgres psql -U goapi -d goapi -t -c "SELECT password FROM \"User\" WHERE email = '$USER_EMAIL';" 2>/dev/null | tr -d ' \r\n')
        
        if [ -n "$STORED_HASH" ] && [ ${#STORED_HASH} -gt 50 ]; then
            echo -e "  ${GREEN}✅ Hash da senha:${NC} Configurado (${#STORED_HASH} caracteres)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "  ${RED}❌ Hash da senha:${NC} Inválido ou não encontrado"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "  ${RED}❌ Admin não encontrado no banco${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
    
    # Teste 3: Verificar comunicação API
    echo -e "${ORANGE}▶ Verificando comunicação da API...${NC}"
    
    # Testar API internamente
    API_HEALTH=$(docker compose exec -T api wget -q -O - http://localhost:3001/health 2>/dev/null || docker compose exec -T api curl -s http://localhost:3001/health 2>/dev/null || echo "")
    
    if [ -n "$API_HEALTH" ]; then
        echo -e "  ${GREEN}✅ API Health:${NC} Respondendo"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        # Tentar endpoint alternativo
        API_TEST=$(docker compose exec -T nginx wget -q -O - http://goapi-backend:3001/ 2>/dev/null || echo "")
        if [ -n "$API_TEST" ]; then
            echo -e "  ${GREEN}✅ API:${NC} Acessível via Nginx"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "  ${YELLOW}⚠️  API Health:${NC} Endpoint /health não disponível (normal)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        fi
    fi
    
    # Teste 4: Verificar comunicação Frontend -> API
    echo -e "${ORANGE}▶ Verificando comunicação Frontend → API...${NC}"
    
    FRONTEND_ENV=$(docker compose exec -T frontend printenv NEXT_PUBLIC_API_URL 2>/dev/null | tr -d '\r\n')
    
    if [ "$FRONTEND_ENV" = "https://$API_DOMAIN" ]; then
        echo -e "  ${GREEN}✅ Frontend API URL:${NC} https://$API_DOMAIN"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Frontend API URL:${NC} $FRONTEND_ENV"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
    
    echo ""
    
    # Teste 5: Testar login na API
    echo -e "${ORANGE}▶ Testando autenticação na API...${NC}"
    
    # Fazer login de teste
    LOGIN_RESPONSE=$(docker compose exec -T api node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogin() {
    try {
        const user = await prisma.user.findUnique({ where: { email: '$USER_EMAIL' } });
        if (!user) {
            console.log('USER_NOT_FOUND');
            return;
        }
        const valid = bcrypt.compareSync('$ESCAPED_PASSWORD', user.password);
        if (valid) {
            console.log('LOGIN_OK');
        } else {
            console.log('PASSWORD_INVALID');
        }
    } catch (e) {
        console.log('ERROR:' + e.message);
    } finally {
        await prisma.\$disconnect();
    }
}
testLogin();
" 2>/dev/null | tr -d '\r\n')
    
    if [ "$LOGIN_RESPONSE" = "LOGIN_OK" ]; then
        echo -e "  ${GREEN}✅ Autenticação:${NC} Login e senha funcionando!"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    elif [ "$LOGIN_RESPONSE" = "USER_NOT_FOUND" ]; then
        echo -e "  ${RED}❌ Autenticação:${NC} Usuário não encontrado no banco"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    elif [ "$LOGIN_RESPONSE" = "PASSWORD_INVALID" ]; then
        echo -e "  ${RED}❌ Autenticação:${NC} Senha incorreta no banco"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Autenticação:${NC} Não foi possível testar (verifique manualmente)"
    fi
    
    echo ""
    
    # Teste 6: Verificar SSL
    echo -e "${ORANGE}▶ Verificando certificados SSL...${NC}"
    
    if [ -f "$INSTALL_DIR/certbot/conf/live/$FRONTEND_DOMAIN/fullchain.pem" ]; then
        echo -e "  ${GREEN}✅ SSL Frontend:${NC} Certificado encontrado"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        FRONTEND_CERT_DIR=$(ls -d $INSTALL_DIR/certbot/conf/live/$FRONTEND_DOMAIN* 2>/dev/null | head -1)
        if [ -n "$FRONTEND_CERT_DIR" ]; then
            echo -e "  ${GREEN}✅ SSL Frontend:${NC} Certificado encontrado"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "  ${YELLOW}⚠️  SSL Frontend:${NC} Certificado não encontrado"
        fi
    fi
    
    if [ -f "$INSTALL_DIR/certbot/conf/live/$API_DOMAIN/fullchain.pem" ]; then
        echo -e "  ${GREEN}✅ SSL API:${NC} Certificado encontrado"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        API_CERT_DIR=$(ls -d $INSTALL_DIR/certbot/conf/live/$API_DOMAIN* 2>/dev/null | head -1)
        if [ -n "$API_CERT_DIR" ]; then
            echo -e "  ${GREEN}✅ SSL API:${NC} Certificado encontrado"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "  ${YELLOW}⚠️  SSL API:${NC} Certificado não encontrado"
        fi
    fi
    
    echo ""
    
    # Resumo dos testes
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           📊 RESUMO DA VERIFICAÇÃO${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${GREEN}✅ Testes OK:${NC}     $TESTS_PASSED"
    echo -e "  ${RED}❌ Testes FALHA:${NC} $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}  🎉 TODOS OS TESTES PASSARAM! Sistema pronto para uso.${NC}"
    elif [ $TESTS_FAILED -le 2 ]; then
        echo -e "${YELLOW}  ⚠️  Alguns testes falharam, mas o sistema pode funcionar.${NC}"
        echo -e "${YELLOW}     Verifique os itens marcados com ❌${NC}"
    else
        echo -e "${RED}  ❌ Vários testes falharam. Verifique os logs com opção [5]${NC}"
    fi
    
    echo ""
    sleep 3
    clear_screen
    show_banner
    
    # ============================================
    # RESULTADO FINAL
    # ============================================
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}           ✅ INSTALAÇÃO CONCLUÍDA!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${ORANGE}Frontend:${NC}  ${WHITE}https://$FRONTEND_DOMAIN${NC}"
    echo -e "  ${ORANGE}API:${NC}       ${WHITE}https://$API_DOMAIN${NC}"
    echo -e "  ${ORANGE}Swagger:${NC}   ${WHITE}https://$API_DOMAIN/docs${NC}"
    echo ""
    echo -e "  ${ORANGE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${ORANGE}CREDENCIAIS DE ACESSO:${NC}"
    echo -e "  ${ORANGE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${WHITE}Email:${NC}     ${CYAN}$USER_EMAIL${NC}"
    echo -e "  ${WHITE}Senha:${NC}     ${CYAN}$ADMIN_PASSWORD${NC}"
    echo ""
    echo -e "  ${ORANGE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${ORANGE}RESULTADO DOS TESTES:${NC}"
    echo -e "  ${ORANGE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${GREEN}✅ Passou:${NC} $TESTS_PASSED  ${RED}❌ Falhou:${NC} $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "${AMBER}Se o login não funcionar, use a opção [4] do menu para reconfigurar.${NC}"
        echo ""
    fi
    
    pause
}


# Função para verificar licença
do_check_license() {
    show_banner
    
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           VERIFICAÇÃO DE LICENÇA${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ ! -d "$INSTALL_DIR" ]; then
        show_error "GO-API não está instalada. Execute a instalação primeiro."
        pause
        return
    fi
    
    cd $INSTALL_DIR
    
    show_progress "Verificando status da licença"
    
    # Verificar logs da API
    LICENSE_STATUS=$(docker compose logs api 2>/dev/null | grep -i "license" | tail -5)
    
    if echo "$LICENSE_STATUS" | grep -qi "valid\|success\|ativad"; then
        echo ""
        show_success "Licença está ATIVA e válida!"
        echo ""
        echo -e "${CYAN}Últimos logs de licença:${NC}"
        echo "$LICENSE_STATUS"
    else
        echo ""
        show_error "Licença pode estar inválida ou não configurada"
        echo ""
        echo -e "${YELLOW}Deseja configurar/atualizar a licença? [S/n]${NC}"
        read -p "" UPDATE_LICENSE
        
        if [[ ! "$UPDATE_LICENSE" =~ ^[Nn]$ ]]; then
            echo ""
            read -p "$(echo -e ${CYAN}Digite sua LICENSE_KEY${NC}: )" NEW_LICENSE_KEY
            read -p "$(echo -e ${CYAN}Digite seu MACHINE_ID${NC}: )" NEW_MACHINE_ID
            
            # Atualizar docker-compose.yml
            show_progress "Atualizando configuração de licença"
            
            sed -i "s/LICENSE_KEY=.*/LICENSE_KEY=$NEW_LICENSE_KEY/g" $INSTALL_DIR/docker-compose.yml
            sed -i "s/MACHINE_ID=.*/MACHINE_ID=$NEW_MACHINE_ID/g" $INSTALL_DIR/docker-compose.yml
            
            show_success "Configuração atualizada"
            
            # Reiniciar API
            show_progress "Reiniciando API para aplicar licença"
            docker compose restart api
            
            sleep 10
            
            # Verificar novamente
            LICENSE_CHECK=$(docker compose logs api --tail=20 2>/dev/null | grep -i "license")
            
            if echo "$LICENSE_CHECK" | grep -qi "valid\|success\|ativad"; then
                echo ""
                show_success "🎉 Licença ativada com sucesso!"
            else
                echo ""
                show_info "Verifique os logs para mais detalhes:"
                echo "$LICENSE_CHECK"
            fi
        fi
    fi
    
    pause
}

# Função para verificar SSL
do_check_ssl() {
    show_banner
    
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           VERIFICAÇÃO DE CERTIFICADOS SSL${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ ! -d "$INSTALL_DIR" ]; then
        show_error "GO-API não está instalada. Execute a instalação primeiro."
        pause
        return
    fi
    
    cd $INSTALL_DIR
    
    show_progress "Verificando certificados SSL"
    
    # Listar certificados
    if [ -d "$INSTALL_DIR/certbot/conf/live" ]; then
        echo ""
        echo -e "${CYAN}Certificados encontrados:${NC}"
        echo ""
        
        for cert_dir in $INSTALL_DIR/certbot/conf/live/*/; do
            if [ -d "$cert_dir" ]; then
                cert_name=$(basename "$cert_dir")
                if [ "$cert_name" != "README" ]; then
                    if [ -f "$cert_dir/fullchain.pem" ]; then
                        EXPIRY=$(openssl x509 -enddate -noout -in "$cert_dir/fullchain.pem" 2>/dev/null | cut -d= -f2)
                        echo -e "  ${GREEN}✅ $cert_name${NC}"
                        echo -e "     ${BLUE}Expira em: $EXPIRY${NC}"
                    else
                        echo -e "  ${RED}❌ $cert_name (certificado não encontrado)${NC}"
                    fi
                fi
            fi
        done
    else
        show_error "Nenhum certificado SSL encontrado"
    fi
    
    echo ""
    read -p "$(echo -e ${YELLOW}Deseja gerar/renovar certificados SSL? [s/N]${NC}: )" RENEW_SSL
    
    if [[ "$RENEW_SSL" =~ ^[Ss]$ ]]; then
        echo ""
        read -p "$(echo -e ${CYAN}Domínio do Frontend${NC}: )" FRONTEND_DOMAIN
        read -p "$(echo -e ${CYAN}Domínio da API${NC}: )" API_DOMAIN
        read -p "$(echo -e ${CYAN}Seu Email${NC}: )" USER_EMAIL
        
        # Parar nginx
        docker compose stop nginx 2>/dev/null
        
        # Gerar certificados
        generate_ssl
        
        # Reiniciar nginx
        docker compose up -d nginx
        
        show_success "Certificados SSL atualizados!"
    fi
    
    pause
}

# Função para mudar login e senha
do_change_credentials() {
    show_banner
    
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           ALTERAR LOGIN E SENHA${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ ! -d "$INSTALL_DIR" ]; then
        show_error "GO-API não está instalada. Execute a instalação primeiro."
        pause
        return
    fi
    
    cd $INSTALL_DIR
    
    echo -e "${ORANGE}Digite as novas credenciais:${NC}"
    echo ""
    
    read -p "$(echo -e ${ORANGE}Novo EMAIL${NC}: )" NEW_EMAIL
    read -p "$(echo -e ${ORANGE}Nova SENHA${NC}: )" NEW_PASSWORD
    
    echo ""
    echo -e "${AMBER}Confirme as novas credenciais:${NC}"
    echo -e "  Email: ${WHITE}$NEW_EMAIL${NC}"
    echo -e "  Senha: ${WHITE}$NEW_PASSWORD${NC}"
    echo ""
    
    read -p "$(echo -e ${AMBER}Confirma a alteração? [S/n]${NC}: )" CONFIRM_CHANGE
    
    if [[ ! "$CONFIRM_CHANGE" =~ ^[Nn]$ ]]; then
        show_progress "Atualizando credenciais"
        
        # Atualizar docker-compose.yml (escapar caracteres especiais)
        NEW_EMAIL_ESCAPED=$(printf '%s\n' "$NEW_EMAIL" | sed 's/[&/\]/\\&/g')
        NEW_PASSWORD_ESCAPED=$(printf '%s\n' "$NEW_PASSWORD" | sed 's/[&/\]/\\&/g')
        
        sed -i "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=$NEW_EMAIL_ESCAPED/g" $INSTALL_DIR/docker-compose.yml
        sed -i "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$NEW_PASSWORD_ESCAPED/g" $INSTALL_DIR/docker-compose.yml
        
        show_success "docker-compose.yml atualizado"
        
        # Gerar hash da senha
        show_progress "Gerando hash da senha"
        
        # Escapar aspas simples para o Node.js
        NEW_PASSWORD_NODE=$(printf '%s' "$NEW_PASSWORD" | sed "s/'/\\\\'/g")
        
        PASSWORD_HASH=$(docker compose exec -T api node -e "
            const bcrypt = require('bcryptjs');
            const hash = bcrypt.hashSync('$NEW_PASSWORD_NODE', 10);
            console.log(hash);
        " 2>/dev/null | tr -d '\r\n')
        
        if [ -n "$PASSWORD_HASH" ] && [ ${#PASSWORD_HASH} -gt 50 ]; then
            show_success "Hash gerado: ${PASSWORD_HASH:0:20}..."
            
            # Deletar admin existente
            show_progress "Removendo admin antigo"
            docker compose exec -T postgres psql -U goapi -d goapi -c "DELETE FROM \"User\" WHERE role = 'ADMIN';" 2>/dev/null
            
            # Criar novo admin
            show_progress "Criando novo admin no banco"
            
            # Escapar aspas simples para SQL
            NEW_EMAIL_SQL=$(printf '%s' "$NEW_EMAIL" | sed "s/'/''/g")
            PASSWORD_HASH_SQL=$(printf '%s' "$PASSWORD_HASH" | sed "s/'/''/g")
            
            RESULT=$(docker compose exec -T postgres psql -U goapi -d goapi -c "INSERT INTO \"User\" (id, email, password, role, \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), '$NEW_EMAIL_SQL', '$PASSWORD_HASH_SQL', 'ADMIN', NOW(), NOW()) RETURNING email;" 2>&1)
            
            if echo "$RESULT" | grep -q "$NEW_EMAIL"; then
                echo ""
                show_success "✅ Credenciais atualizadas com sucesso!"
                echo ""
                echo -e "${GREEN}Novas credenciais de acesso:${NC}"
                echo -e "  Email: ${WHITE}$NEW_EMAIL${NC}"
                echo -e "  Senha: ${WHITE}$NEW_PASSWORD${NC}"
            else
                show_error "Erro ao inserir no banco: $RESULT"
            fi
        else
            show_error "Não foi possível gerar hash da senha"
            show_info "Tentando reiniciar API para criar admin automaticamente..."
            
            docker compose restart api
            sleep 15
            
            API_LOG=$(docker compose logs api --tail=5 2>/dev/null | grep -i "admin")
            echo -e "${GRAY}$API_LOG${NC}"
        fi
    else
        show_info "Operação cancelada"
    fi
    
    pause
}

# Função para ver logs
do_view_logs() {
    show_banner
    
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           VISUALIZAR LOGS${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ ! -d "$INSTALL_DIR" ]; then
        show_error "GO-API não está instalada."
        pause
        return
    fi
    
    cd $INSTALL_DIR
    
    echo -e "  ${ORANGE}[1]${NC} Logs da API"
    echo -e "  ${ORANGE}[2]${NC} Logs do Frontend"
    echo -e "  ${ORANGE}[3]${NC} Logs do Nginx"
    echo -e "  ${ORANGE}[4]${NC} Logs do PostgreSQL"
    echo -e "  ${ORANGE}[5]${NC} Todos os logs"
    echo -e "  ${ORANGE}[0]${NC} Voltar"
    echo ""
    
    read -p "Escolha uma opção: " LOG_OPTION
    
    case $LOG_OPTION in
        1)
            echo ""
            echo -e "${ORANGE}=== LOGS DA API ===${NC}"
            docker compose logs api --tail=50
            ;;
        2)
            echo ""
            echo -e "${ORANGE}=== LOGS DO FRONTEND ===${NC}"
            docker compose logs frontend --tail=50
            ;;
        3)
            echo ""
            echo -e "${ORANGE}=== LOGS DO NGINX ===${NC}"
            docker compose logs nginx --tail=50
            ;;
        4)
            echo ""
            echo -e "${ORANGE}=== LOGS DO POSTGRESQL ===${NC}"
            docker compose logs postgres --tail=50
            ;;
        5)
            echo ""
            echo -e "${ORANGE}=== TODOS OS LOGS ===${NC}"
            docker compose logs --tail=30
            ;;
        *)
            return
            ;;
    esac
    
    pause
}

# Função para reiniciar serviços
do_restart_services() {
    show_banner
    
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           REINICIAR SERVIÇOS${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ ! -d "$INSTALL_DIR" ]; then
        show_error "GO-API não está instalada."
        pause
        return
    fi
    
    cd $INSTALL_DIR
    
    echo -e "  ${ORANGE}[1]${NC} Reiniciar todos os serviços"
    echo -e "  ${ORANGE}[2]${NC} Reiniciar apenas API"
    echo -e "  ${ORANGE}[3]${NC} Reiniciar apenas Frontend"
    echo -e "  ${ORANGE}[4]${NC} Reiniciar apenas Nginx"
    echo -e "  ${ORANGE}[5]${NC} Parar todos os serviços"
    echo -e "  ${ORANGE}[6]${NC} Iniciar todos os serviços"
    echo -e "  ${ORANGE}[0]${NC} Voltar"
    echo ""
    
    read -p "Escolha uma opção: " RESTART_OPTION
    
    case $RESTART_OPTION in
        1)
            show_progress "Reiniciando todos os serviços"
            docker compose restart
            show_success "Serviços reiniciados"
            ;;
        2)
            show_progress "Reiniciando API"
            docker compose restart api
            show_success "API reiniciada"
            ;;
        3)
            show_progress "Reiniciando Frontend"
            docker compose restart frontend
            show_success "Frontend reiniciado"
            ;;
        4)
            show_progress "Reiniciando Nginx"
            docker compose restart nginx
            show_success "Nginx reiniciado"
            ;;
        5)
            show_progress "Parando todos os serviços"
            docker compose down
            show_success "Serviços parados"
            ;;
        6)
            show_progress "Iniciando todos os serviços"
            docker compose up -d
            show_success "Serviços iniciados"
            ;;
        *)
            return
            ;;
    esac
    
    # Mostrar status
    echo ""
    echo -e "${ORANGE}Status dos serviços:${NC}"
    docker compose ps
    
    pause
}

# Função para resetar o sistema completamente
do_reset_system() {
    show_banner
    
    echo -e "${RED}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}           ⚠️  RESETAR SISTEMA - ATENÇÃO!${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${RED}Esta ação irá REMOVER COMPLETAMENTE:${NC}"
    echo -e "  ${RED}•${NC} Todos os containers GO-API"
    echo -e "  ${RED}•${NC} Todos os volumes (banco de dados, sessões)"
    echo -e "  ${RED}•${NC} Todas as imagens Docker do GO-API"
    echo -e "  ${RED}•${NC} Certificados SSL"
    echo -e "  ${RED}•${NC} Logs do sistema"
    echo -e "  ${RED}•${NC} Configurações (docker-compose.yml, nginx.conf)"
    echo -e "  ${RED}•${NC} Diretório /opt/goapi completo"
    echo -e "  ${RED}•${NC} Cache do Docker"
    echo ""
    echo -e "${RED}⚠️  TODOS OS DADOS SERÃO PERDIDOS PERMANENTEMENTE!${NC}"
    echo -e "${RED}⚠️  NÃO HÁ COMO RECUPERAR APÓS ESTA AÇÃO!${NC}"
    echo ""
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Para confirmar, digite ${WHITE}RESETAR${YELLOW} (em maiúsculas):${NC}"
    read -p "" CONFIRM_RESET
    
    if [ "$CONFIRM_RESET" != "RESETAR" ]; then
        echo ""
        show_info "Operação cancelada. Nenhuma alteração foi feita."
        pause
        return
    fi
    
    echo ""
    echo -e "${RED}Última chance! Tem certeza? [s/N]${NC}"
    read -p "" FINAL_CONFIRM
    
    if [[ ! "$FINAL_CONFIRM" =~ ^[Ss]$ ]]; then
        echo ""
        show_info "Operação cancelada."
        pause
        return
    fi
    
    echo ""
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${ORANGE}           RESETANDO SISTEMA COMPLETAMENTE...${NC}"
    echo -e "${AMBER}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Passo 1: Parar e remover containers com volumes
    show_progress "Parando todos os containers GO-API"
    if [ -d "$INSTALL_DIR" ]; then
        cd $INSTALL_DIR
        docker compose down -v --remove-orphans 2>/dev/null || true
    fi
    
    # Parar containers por nome também
    docker stop goapi-nginx goapi-frontend goapi-backend goapi-postgres goapi-certbot goapi-traefik nginx-ssl-temp 2>/dev/null || true
    docker rm -f goapi-nginx goapi-frontend goapi-backend goapi-postgres goapi-certbot goapi-traefik nginx-ssl-temp 2>/dev/null || true
    show_success "Containers parados e removidos"
    
    # Passo 2: Remover volumes específicos do GO-API
    show_progress "Removendo volumes do GO-API"
    docker volume rm goapi_postgres_data goapi_sessions_data goapi_license_data goapi_letsencrypt_data 2>/dev/null || true
    docker volume rm $(docker volume ls -q | grep -E "goapi|gofree" 2>/dev/null) 2>/dev/null || true
    show_success "Volumes removidos"
    
    # Passo 3: Remover imagens do GO-API
    show_progress "Removendo imagens do GO-API"
    GOAPI_IMAGES=$(docker images --format "{{.ID}} {{.Repository}}" | grep -E "goapi|gofree" | awk '{print $1}' 2>/dev/null)
    if [ -n "$GOAPI_IMAGES" ]; then
        echo "$GOAPI_IMAGES" | xargs docker rmi -f 2>/dev/null || true
    fi
    show_success "Imagens removidas"
    
    # Passo 4: Remover redes do GO-API
    show_progress "Removendo redes do GO-API"
    docker network rm goapi_goapi-network goapi-network 2>/dev/null || true
    docker network rm $(docker network ls -q --filter name=goapi 2>/dev/null) 2>/dev/null || true
    show_success "Redes removidas"
    
    # Passo 5: Remover diretório de instalação COMPLETO
    show_progress "Removendo diretório /opt/goapi (incluindo SSL, logs, configs)"
    rm -rf $INSTALL_DIR
    show_success "Diretório removido completamente"
    
    # Passo 6: Remover arquivos temporários
    show_progress "Removendo arquivos temporários"
    rm -f /tmp/nginx-ssl.conf 2>/dev/null || true
    rm -f /tmp/goapi-* 2>/dev/null || true
    show_success "Arquivos temporários removidos"
    
    # Passo 7: Limpar cache do Docker
    show_progress "Limpando cache do Docker"
    docker system prune -af 2>/dev/null || true
    show_success "Cache do Docker limpo"
    
    # Passo 8: Remover volumes órfãos
    show_progress "Removendo volumes órfãos"
    docker volume prune -f 2>/dev/null || true
    show_success "Volumes órfãos removidos"
    
    # Passo 9: Limpar logs do Let's Encrypt
    show_progress "Limpando logs do Let's Encrypt"
    rm -rf /var/log/letsencrypt/* 2>/dev/null || true
    show_success "Logs do Let's Encrypt limpos"
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}           ✅ SISTEMA RESETADO COMPLETAMENTE!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${WHITE}Itens removidos:${NC}"
    echo -e "  ${GREEN}✓${NC} Containers"
    echo -e "  ${GREEN}✓${NC} Volumes (banco de dados, sessões)"
    echo -e "  ${GREEN}✓${NC} Imagens Docker"
    echo -e "  ${GREEN}✓${NC} Redes Docker"
    echo -e "  ${GREEN}✓${NC} Certificados SSL"
    echo -e "  ${GREEN}✓${NC} Configurações"
    echo -e "  ${GREEN}✓${NC} Logs"
    echo -e "  ${GREEN}✓${NC} Cache"
    echo ""
    echo -e "${WHITE}O sistema está limpo para uma nova instalação.${NC}"
    echo -e "${WHITE}Selecione a opção [1] para instalar novamente.${NC}"
    echo ""
    
    pause
}

# Loop principal do menu
main_menu() {
    while true; do
        show_banner
        show_menu
        
        read -p "Escolha uma opção: " MENU_OPTION
        
        case $MENU_OPTION in
            1)
                do_install
                ;;
            2)
                do_check_license
                ;;
            3)
                do_check_ssl
                ;;
            4)
                do_change_credentials
                ;;
            5)
                do_view_logs
                ;;
            6)
                do_restart_services
                ;;
            7)
                do_reset_system
                ;;
            0)
                clear_screen
                echo -e "${ORANGE}Obrigado por usar GO-API! Até logo!${NC}"
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

# Início do script
check_root
check_pipe
main_menu

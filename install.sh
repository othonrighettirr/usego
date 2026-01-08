#!/bin/bash
# GO-API Installer v1.0 - Com Licenciamento e SSL Automatico

LICENSE_SERVER="https://usego.com.br"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
ORANGE='\033[38;5;208m'
CYAN='\033[0;36m'
NC='\033[0m'

INSTALL_DIR="/opt/goapi"
EXTRAS_DIR="/opt/goapi-extras"
REPO_URL="https://github.com/usegoapi/usego.git"

VALIDATED_LICENSE_KEY=""
VALIDATED_MACHINE_ID=""

check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Execute como root: sudo bash install.sh${NC}"
        exit 1
    fi
}

show_banner() {
    clear
    echo ""
    echo -e "${ORANGE}   ######   #######         ###    ######  ##     ##    ##  ${NC}"
    echo -e "${ORANGE}  ##    ## ##     ##       ## ##   ##   ## ##     ##   ###  ${NC}"
    echo -e "${ORANGE}  ##       ##     ##      ##   ##  ##   ## ##     ##    ##  ${NC}"
    echo -e "${ORANGE}  ##   ### ##     ## ### ##     ## ######  ##     ##    ##  ${NC}"
    echo -e "${ORANGE}  ##    ## ##     ##     ######### ##       ##   ##     ##  ${NC}"
    echo -e "${ORANGE}  ##    ## ##     ##     ##     ## ##        ## ##      ##  ${NC}"
    echo -e "${ORANGE}   ######   #######      ##     ## ##         ###      #### ${NC}"
    echo ""
    echo -e "${YELLOW}=============================================================${NC}"
    echo -e "${WHITE}       GO-API Installer v1.0 - Com SSL Automatico${NC}"
    echo -e "${YELLOW}=============================================================${NC}"
    echo ""
}

show_progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percent=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))
    printf "\r${CYAN}["
    printf "%${filled}s" | tr ' ' '#'
    printf "%${empty}s" | tr ' ' '-'
    printf "] ${percent}%% ${NC}"
}

run_with_progress() {
    local message="$1"
    local command="$2"
    local duration=${3:-30}
    echo -e "${YELLOW}>>> $message${NC}"
    eval "$command" > /tmp/install_output.log 2>&1 &
    local pid=$!
    local elapsed=0
    while kill -0 $pid 2>/dev/null; do
        if [ $elapsed -lt $duration ]; then
            show_progress_bar $elapsed $duration
        else
            show_progress_bar $duration $duration
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    wait $pid
    local exit_code=$?
    show_progress_bar $duration $duration
    echo ""
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}[OK] $message${NC}"
    else
        echo -e "${RED}[ERRO] $message${NC}"
        tail -20 /tmp/install_output.log
    fi
    return $exit_code
}

show_success() { echo -e "${GREEN}[OK] $1${NC}"; }
show_error() { echo -e "${RED}[ERRO] $1${NC}"; }
show_info() { echo -e "${ORANGE}[INFO] $1${NC}"; }

# ========================================
# SELECAO DE VERSAO
# ========================================
select_typebot_version() {
    echo -e "${WHITE}Qual versao do Typebot deseja instalar?${NC}" >&2
    echo "  1) 2.28 (Recomendada)" >&2
    echo "  2) 2.27" >&2
    echo "  3) 2.26" >&2
    echo "  4) latest" >&2
    echo "" >&2
    echo -n "Escolha [1]: " >&2
    read -r opt
    case "$opt" in
        2) echo "2.27" ;;
        3) echo "2.26" ;;
        4) echo "latest" ;;
        *) echo "2.28" ;;
    esac
}

select_n8n_version() {
    echo -e "${WHITE}Qual versao do N8N deseja instalar?${NC}" >&2
    echo "  1) 1.70 (Recomendada)" >&2
    echo "  2) 1.69" >&2
    echo "  3) 1.68" >&2
    echo "  4) latest" >&2
    echo "" >&2
    echo -n "Escolha [1]: " >&2
    read -r opt
    case "$opt" in
        2) echo "1.69" ;;
        3) echo "1.68" ;;
        4) echo "latest" ;;
        *) echo "1.70" ;;
    esac
}

select_chatwoot_version() {
    echo -e "${WHITE}Qual versao do Chatwoot deseja instalar?${NC}" >&2
    echo "  1) v3.13.0 (Recomendada)" >&2
    echo "  2) v3.12.0" >&2
    echo "  3) v3.11.0" >&2
    echo "  4) latest" >&2
    echo "" >&2
    echo -n "Escolha [1]: " >&2
    read -r opt
    case "$opt" in
        2) echo "v3.12.0" ;;
        3) echo "v3.11.0" ;;
        4) echo "latest" ;;
        *) echo "v3.13.0" ;;
    esac
}


# ========================================
# VALIDACAO DE LICENCA
# ========================================
generate_machine_id() {
    local cpu_id=$(cat /proc/cpuinfo 2>/dev/null | grep -m1 "Serial\|model name" | md5sum | cut -d' ' -f1 | cut -c1-8)
    local mac_id=$(ip link 2>/dev/null | grep -m1 "link/ether" | awk '{print $2}' | md5sum | cut -d' ' -f1 | cut -c1-8)
    local disk_id=$(lsblk -o UUID 2>/dev/null | grep -v UUID | head -1 | md5sum | cut -d' ' -f1 | cut -c1-8)
    echo "MID-${cpu_id^^}-${mac_id^^}-${disk_id^^}"
}

validate_license() {
    local api_key="$1"
    local machine_id="$2"
    echo -e "${YELLOW}>>> Validando licenca...${NC}"
    local response=$(curl -s -X POST "${LICENSE_SERVER}/api/license/validate" \
        -H "Content-Type: application/json" \
        -d "{\"licenseKey\": \"${api_key}\", \"machineId\": \"${machine_id}\"}" \
        --connect-timeout 10 --max-time 30 2>/dev/null)
    if [ -z "$response" ]; then
        response=$(curl -s "${LICENSE_SERVER}/api/license/check?key=${api_key}&mid=${machine_id}" \
            --connect-timeout 10 --max-time 30 2>/dev/null)
    fi
    if echo "$response" | grep -qi "valid\|success\|true\|active"; then
        return 0
    elif echo "$response" | grep -qi "invalid\|expired\|blocked\|false"; then
        return 1
    else
        if [[ "$api_key" =~ ^[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$ ]]; then
            echo -e "${YELLOW}[AVISO] Servidor indisponivel. Validando formato...${NC}"
            return 0
        fi
        return 1
    fi
}

request_license() {
    show_banner
    echo -e "${ORANGE}=== VALIDACAO DE LICENCA ===${NC}"
    echo ""
    echo -e "${WHITE}Para instalar, voce precisa de uma licenca valida.${NC}"
    echo -e "${WHITE}Adquira em: ${CYAN}https://usego.com.br/licencas${NC}"
    echo ""
    VALIDATED_MACHINE_ID=$(generate_machine_id)
    echo -e "${WHITE}Seu Machine ID: ${CYAN}${VALIDATED_MACHINE_ID}${NC}"
    echo ""
    echo -n "Digite sua LICENSE KEY: "
    read -r LICENSE_KEY
    if [ -z "$LICENSE_KEY" ]; then
        show_error "LICENSE KEY obrigatoria!"
        echo "Pressione ENTER..."
        read -r
        return 1
    fi
    if ! [[ "$LICENSE_KEY" =~ ^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{8}-[A-Fa-f0-9]{8}-[A-Fa-f0-9]{8}$ ]]; then
        show_error "Formato invalido! Use: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
        echo "Pressione ENTER..."
        read -r
        return 1
    fi
    LICENSE_KEY=$(echo "$LICENSE_KEY" | tr '[:lower:]' '[:upper:]')
    if validate_license "$LICENSE_KEY" "$VALIDATED_MACHINE_ID"; then
        show_success "Licenca validada!"
        VALIDATED_LICENSE_KEY="$LICENSE_KEY"
        sleep 2
        return 0
    else
        show_error "Licenca invalida ou expirada!"
        echo "Pressione ENTER..."
        read -r
        return 1
    fi
}

check_license_before_install() {
    if [ -z "$VALIDATED_LICENSE_KEY" ]; then
        if ! request_license; then
            return 1
        fi
    fi
    return 0
}


# ========================================
# NGINX + SSL AUTOMATICO
# ========================================
install_nginx_ssl() {
    echo -e "${YELLOW}>>> Instalando Nginx e Certbot...${NC}"
    apt-get install -y -qq nginx certbot python3-certbot-nginx
    systemctl enable nginx
    systemctl start nginx
    show_success "Nginx instalado!"
}

configure_nginx_domain() {
    local domain="$1"
    local port="$2"
    local email="$3"
    
    echo -e "${YELLOW}>>> Configurando Nginx para ${domain}...${NC}"
    
    cat > /etc/nginx/sites-available/${domain} << EOFNGINX
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
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOFNGINX

    ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null
    nginx -t > /dev/null 2>&1
    systemctl reload nginx
    
    echo -e "${YELLOW}>>> Gerando certificado SSL para ${domain}...${NC}"
    certbot --nginx -d ${domain} --non-interactive --agree-tos --email ${email} --redirect > /tmp/certbot.log 2>&1
    
    if [ $? -eq 0 ]; then
        show_success "SSL configurado para ${domain}!"
        return 0
    else
        echo -e "${YELLOW}[AVISO] SSL falhou. Verifique se o dominio aponta para este servidor.${NC}"
        return 1
    fi
}

setup_ssl_renewal() {
    echo "0 0 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew
    show_success "Renovacao automatica de SSL configurada!"
}

# ========================================
# FUNCOES AUXILIARES
# ========================================
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
        run_with_progress "Instalando Docker" "curl -fsSL https://get.docker.com | sh && systemctl enable docker && systemctl start docker" 60
    fi
    if docker compose version >/dev/null 2>&1; then
        show_success "Docker Compose disponivel"
    else
        run_with_progress "Instalando Docker Compose" "apt-get install -y docker-compose-plugin" 30
    fi
}

prepare_system() {
    detect_system
    run_with_progress "Atualizando sistema" "apt-get update -qq" 20
    run_with_progress "Instalando dependencias" "apt-get install -y -qq curl wget git openssl ca-certificates gnupg net-tools" 30
    install_docker
    install_nginx_ssl
}


# ========================================
# INSTALACAO GO-API PRINCIPAL
# ========================================
do_install_goapi() {
    if ! check_license_before_install; then
        return 1
    fi
    
    show_banner
    echo -e "${ORANGE}=== INSTALACAO GO-API ===${NC}"
    echo -e "${GREEN}Licenca: ${VALIDATED_LICENSE_KEY}${NC}"
    echo ""
    
    prepare_system
    
    echo ""
    echo -e "${WHITE}Configure os dominios (devem apontar para este servidor):${NC}"
    echo ""
    echo -n "Dominio do FRONTEND [ex: app.seusite.com]: "
    read -r FRONTEND_DOMAIN
    echo -n "Dominio da API [ex: api.seusite.com]: "
    read -r API_DOMAIN
    echo -n "Seu EMAIL [para SSL e login]: "
    read -r USER_EMAIL
    echo -n "SENHA do painel: "
    read -r ADMIN_PASSWORD
    
    PORT_FRONTEND=$(find_free_port 3000)
    PORT_API=$(find_free_port 3001)
    PORT_POSTGRES=$(find_free_port 5432)
    
    echo ""
    show_info "Frontend: porta $PORT_FRONTEND"
    show_info "API: porta $PORT_API"
    
    run_with_progress "Clonando repositorio" "mkdir -p $INSTALL_DIR && cd $INSTALL_DIR && ([ -d .git ] && git pull --quiet || (rm -rf $INSTALL_DIR/* && git clone --quiet $REPO_URL .))" 60
    
    cd $INSTALL_DIR
    rm -f docker-compose*.yaml docker-compose*.yml 2>/dev/null
    
    JWT_SECRET=$(openssl rand -hex 32)
    
    cat > docker-compose.yml << EOFGOAPI
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
      - LICENSE_SERVER=${LICENSE_SERVER}
      - LICENSE_KEY=${VALIDATED_LICENSE_KEY}
      - MACHINE_ID=${VALIDATED_MACHINE_ID}
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
EOFGOAPI

    cat > .env << EOFENV
FRONTEND_DOMAIN=${FRONTEND_DOMAIN}
API_DOMAIN=${API_DOMAIN}
USER_EMAIL=${USER_EMAIL}
PORT_FRONTEND=${PORT_FRONTEND}
PORT_API=${PORT_API}
LICENSE_KEY=${VALIDATED_LICENSE_KEY}
MACHINE_ID=${VALIDATED_MACHINE_ID}
EOFENV

    run_with_progress "Construindo imagens (5-10 min)" "docker compose build" 400
    run_with_progress "Iniciando PostgreSQL" "docker compose up -d postgres && sleep 15" 30
    run_with_progress "Iniciando API" "docker compose up -d api && sleep 25" 40
    run_with_progress "Iniciando Frontend" "docker compose up -d frontend && sleep 10" 30
    
    echo ""
    echo -e "${YELLOW}>>> Criando usuario admin...${NC}"
    sleep 5
    PASSWORD_HASH=$(docker compose exec -T api node -e "const bcrypt=require('bcryptjs');console.log(bcrypt.hashSync('${ADMIN_PASSWORD}',10));" 2>/dev/null | tr -d '\r\n')
    if [ -n "$PASSWORD_HASH" ]; then
        docker compose exec -T postgres psql -U goapi -d goapi -c "INSERT INTO \"User\" (id,email,password,role,\"createdAt\") VALUES (gen_random_uuid(),'${USER_EMAIL}','${PASSWORD_HASH}','ADMIN',NOW()) ON CONFLICT (email) DO UPDATE SET password='${PASSWORD_HASH}',role='ADMIN';" >/dev/null 2>&1
        show_success "Usuario admin criado"
    fi
    
    echo ""
    echo -e "${YELLOW}>>> Configurando SSL automatico...${NC}"
    configure_nginx_domain "$FRONTEND_DOMAIN" "$PORT_FRONTEND" "$USER_EMAIL"
    configure_nginx_domain "$API_DOMAIN" "$PORT_API" "$USER_EMAIL"
    setup_ssl_renewal
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   GO-API INSTALADA COM SUCESSO!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  ${ORANGE}Frontend:${NC} https://${FRONTEND_DOMAIN}"
    echo -e "  ${ORANGE}API:${NC}      https://${API_DOMAIN}"
    echo -e "  ${ORANGE}Email:${NC}    ${USER_EMAIL}"
    echo -e "  ${ORANGE}Senha:${NC}    ${ADMIN_PASSWORD}"
    echo ""
    echo -e "  ${CYAN}License:${NC}  ${VALIDATED_LICENSE_KEY}"
    echo ""
    
    echo "Pressione ENTER para continuar..."
    read -r
}


# ========================================
# INSTALACAO TYPEBOT
# ========================================
install_typebot() {
    if ! check_license_before_install; then return 1; fi
    
    show_banner
    echo -e "${ORANGE}=== INSTALANDO TYPEBOT ===${NC}"
    echo ""
    
    # Selecionar versao
    TYPEBOT_VERSION=$(select_typebot_version)
    echo ""
    show_info "Versao selecionada: ${TYPEBOT_VERSION}"
    echo ""
    
    prepare_system
    mkdir -p $EXTRAS_DIR && cd $EXTRAS_DIR
    
    echo ""
    echo -n "Dominio do Builder [ex: typebot.seusite.com]: "
    read -r TYPEBOT_DOMAIN
    echo -n "Dominio do Viewer [ex: bot.seusite.com]: "
    read -r TYPEBOT_VIEWER_DOMAIN
    echo -n "Seu EMAIL (admin): "
    read -r TYPEBOT_EMAIL
    
    # Configurar SMTP (opcional)
    echo ""
    echo -e "${WHITE}Deseja configurar SMTP para envio de emails? (necessario para login)${NC}"
    echo "  1) Sim, configurar SMTP"
    echo "  2) Nao, vou configurar depois"
    echo ""
    echo -n "Escolha [2]: "
    read -r SMTP_OPT
    
    SMTP_CONFIG=""
    if [ "$SMTP_OPT" = "1" ]; then
        echo ""
        echo -n "SMTP Host [ex: smtp.gmail.com]: "
        read -r SMTP_HOST
        echo -n "SMTP Porta [ex: 587]: "
        read -r SMTP_PORT
        echo -n "SMTP Usuario (email): "
        read -r SMTP_USER
        echo -n "SMTP Senha: "
        read -r SMTP_PASS
        SMTP_CONFIG="
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USERNAME: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASS}
      SMTP_SECURE: \"false\"
      SMTP_AUTH_DISABLED: \"false\""
    fi
    
    PORT_BUILDER=$(find_free_port 3003)
    PORT_VIEWER=$(find_free_port 3002)
    PORT_TYPEBOT_PG=$(find_free_port 5433)
    ENCRYPTION_SECRET=$(openssl rand -hex 16)
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    cat > docker-compose-typebot.yml << EOF
services:
  typebot-postgres:
    image: postgres:15-alpine
    container_name: typebot-postgres
    restart: always
    ports:
      - "${PORT_TYPEBOT_PG}:5432"
    environment:
      POSTGRES_USER: typebot
      POSTGRES_PASSWORD: typebot_2024
      POSTGRES_DB: typebot
    volumes:
      - typebot_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U typebot -d typebot"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - typebot-network

  typebot-builder:
    image: baptistearno/typebot-builder:${TYPEBOT_VERSION}
    container_name: typebot-builder
    restart: always
    ports:
      - "${PORT_BUILDER}:3000"
    environment:
      DATABASE_URL: postgresql://typebot:typebot_2024@typebot-postgres:5432/typebot
      NEXTAUTH_URL: https://${TYPEBOT_DOMAIN}
      NEXT_PUBLIC_VIEWER_URL: https://${TYPEBOT_VIEWER_DOMAIN}
      ENCRYPTION_SECRET: ${ENCRYPTION_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      ADMIN_EMAIL: ${TYPEBOT_EMAIL}
      DISABLE_SIGNUP: "false"
      NEXT_PUBLIC_SMTP_FROM: "${TYPEBOT_EMAIL}"${SMTP_CONFIG}
    depends_on:
      typebot-postgres:
        condition: service_healthy
    networks:
      - typebot-network

  typebot-viewer:
    image: baptistearno/typebot-viewer:${TYPEBOT_VERSION}
    container_name: typebot-viewer
    restart: always
    ports:
      - "${PORT_VIEWER}:3000"
    environment:
      DATABASE_URL: postgresql://typebot:typebot_2024@typebot-postgres:5432/typebot
      NEXTAUTH_URL: https://${TYPEBOT_DOMAIN}
      NEXT_PUBLIC_VIEWER_URL: https://${TYPEBOT_VIEWER_DOMAIN}
      ENCRYPTION_SECRET: ${ENCRYPTION_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      typebot-postgres:
        condition: service_healthy
    networks:
      - typebot-network

volumes:
  typebot_pg:

networks:
  typebot-network:
    driver: bridge
EOF

    # Salvar versao no .env
    cat > .env-typebot << EOFENV
TYPEBOT_VERSION=${TYPEBOT_VERSION}
TYPEBOT_DOMAIN=${TYPEBOT_DOMAIN}
TYPEBOT_VIEWER_DOMAIN=${TYPEBOT_VIEWER_DOMAIN}
TYPEBOT_EMAIL=${TYPEBOT_EMAIL}
EOFENV

    run_with_progress "Baixando Typebot ${TYPEBOT_VERSION}" "docker compose -f docker-compose-typebot.yml pull" 120
    run_with_progress "Iniciando PostgreSQL" "docker compose -f docker-compose-typebot.yml up -d typebot-postgres && sleep 10" 30
    
    echo -e "${YELLOW}>>> Aguardando banco de dados...${NC}"
    sleep 15
    
    run_with_progress "Iniciando Typebot Builder" "docker compose -f docker-compose-typebot.yml up -d typebot-builder && sleep 20" 40
    run_with_progress "Iniciando Typebot Viewer" "docker compose -f docker-compose-typebot.yml up -d typebot-viewer && sleep 10" 30
    
    configure_nginx_domain "$TYPEBOT_DOMAIN" "$PORT_BUILDER" "$TYPEBOT_EMAIL"
    configure_nginx_domain "$TYPEBOT_VIEWER_DOMAIN" "$PORT_VIEWER" "$TYPEBOT_EMAIL"
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   TYPEBOT INSTALADO COM SUCESSO!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  ${ORANGE}Versao:${NC}  ${TYPEBOT_VERSION}"
    echo -e "  ${ORANGE}Builder:${NC} https://${TYPEBOT_DOMAIN}"
    echo -e "  ${ORANGE}Viewer:${NC}  https://${TYPEBOT_VIEWER_DOMAIN}"
    echo -e "  ${ORANGE}Email:${NC}   ${TYPEBOT_EMAIL}"
    echo ""
    echo "Pressione ENTER..."
    read -r
}

# ========================================
# INSTALACAO N8N
# ========================================
install_n8n() {
    if ! check_license_before_install; then return 1; fi
    
    show_banner
    echo -e "${ORANGE}=== INSTALANDO N8N ===${NC}"
    echo ""
    
    # Selecionar versao
    N8N_VERSION=$(select_n8n_version)
    echo ""
    show_info "Versao selecionada: ${N8N_VERSION}"
    echo ""
    
    prepare_system
    mkdir -p $EXTRAS_DIR && cd $EXTRAS_DIR
    
    echo ""
    echo -n "Dominio do N8N [ex: n8n.seusite.com]: "
    read -r N8N_DOMAIN
    echo -n "Seu EMAIL: "
    read -r N8N_EMAIL
    
    PORT_N8N=$(find_free_port 5678)
    PORT_N8N_PG=$(find_free_port 5434)
    N8N_KEY=$(openssl rand -hex 16)
    
    cat > docker-compose-n8n.yml << EOF
services:
  n8n-postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: always
    ports:
      - "${PORT_N8N_PG}:5432"
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: n8n_2024
      POSTGRES_DB: n8n
    volumes:
      - n8n_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n -d n8n"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - n8n-network

  n8n:
    image: n8nio/n8n:${N8N_VERSION}
    container_name: n8n
    restart: always
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
      - n8n-network

volumes:
  n8n_pg:
  n8n_data:

networks:
  n8n-network:
    driver: bridge
EOF

    # Salvar versao no .env
    cat > .env-n8n << EOFENV
N8N_VERSION=${N8N_VERSION}
N8N_DOMAIN=${N8N_DOMAIN}
N8N_EMAIL=${N8N_EMAIL}
EOFENV

    run_with_progress "Baixando N8N ${N8N_VERSION}" "docker compose -f docker-compose-n8n.yml pull" 90
    run_with_progress "Iniciando PostgreSQL" "docker compose -f docker-compose-n8n.yml up -d n8n-postgres && sleep 10" 30
    run_with_progress "Iniciando N8N" "docker compose -f docker-compose-n8n.yml up -d n8n && sleep 15" 40
    
    configure_nginx_domain "$N8N_DOMAIN" "$PORT_N8N" "$N8N_EMAIL"
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   N8N INSTALADO COM SUCESSO!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  ${ORANGE}Versao:${NC} ${N8N_VERSION}"
    echo -e "  ${ORANGE}URL:${NC}    https://${N8N_DOMAIN}"
    echo -e "  ${ORANGE}Email:${NC}  ${N8N_EMAIL}"
    echo ""
    echo "Pressione ENTER..."
    read -r
}

# ========================================
# INSTALACAO CHATWOOT
# ========================================
install_chatwoot() {
    if ! check_license_before_install; then return 1; fi
    
    show_banner
    echo -e "${ORANGE}=== INSTALANDO CHATWOOT ===${NC}"
    echo ""
    
    # Selecionar versao
    CHATWOOT_VERSION=$(select_chatwoot_version)
    echo ""
    show_info "Versao selecionada: ${CHATWOOT_VERSION}"
    echo ""
    
    prepare_system
    mkdir -p $EXTRAS_DIR && cd $EXTRAS_DIR
    
    echo ""
    echo -n "Dominio do Chatwoot [ex: chat.seusite.com]: "
    read -r CHATWOOT_DOMAIN
    echo -n "Seu EMAIL: "
    read -r CHATWOOT_EMAIL
    
    PORT_CW=$(find_free_port 3004)
    PORT_CW_PG=$(find_free_port 5435)
    SECRET=$(openssl rand -hex 32)
    
    cat > docker-compose-chatwoot.yml << EOF
services:
  chatwoot-postgres:
    image: postgres:15-alpine
    container_name: chatwoot-postgres
    restart: always
    ports:
      - "${PORT_CW_PG}:5432"
    environment:
      POSTGRES_USER: chatwoot
      POSTGRES_PASSWORD: chatwoot_2024
      POSTGRES_DB: chatwoot_production
    volumes:
      - cw_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatwoot -d chatwoot_production"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - chatwoot-network

  chatwoot-redis:
    image: redis:7-alpine
    container_name: chatwoot-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - cw_redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - chatwoot-network

  chatwoot-rails:
    image: chatwoot/chatwoot:${CHATWOOT_VERSION}
    container_name: chatwoot-rails
    restart: always
    ports:
      - "${PORT_CW}:3000"
    environment:
      RAILS_ENV: production
      RACK_ENV: production
      NODE_ENV: production
      SECRET_KEY_BASE: ${SECRET}
      FRONTEND_URL: https://${CHATWOOT_DOMAIN}
      DEFAULT_LOCALE: pt_BR
      DATABASE_URL: postgresql://chatwoot:chatwoot_2024@chatwoot-postgres:5432/chatwoot_production
      REDIS_URL: redis://chatwoot-redis:6379
      RAILS_LOG_TO_STDOUT: "true"
      LOG_LEVEL: info
    depends_on:
      chatwoot-postgres:
        condition: service_healthy
      chatwoot-redis:
        condition: service_healthy
    entrypoint: docker/entrypoints/rails.sh
    command: ['bundle', 'exec', 'rails', 's', '-p', '3000', '-b', '0.0.0.0']
    networks:
      - chatwoot-network

  chatwoot-sidekiq:
    image: chatwoot/chatwoot:${CHATWOOT_VERSION}
    container_name: chatwoot-sidekiq
    restart: always
    environment:
      RAILS_ENV: production
      RACK_ENV: production
      NODE_ENV: production
      SECRET_KEY_BASE: ${SECRET}
      FRONTEND_URL: https://${CHATWOOT_DOMAIN}
      DEFAULT_LOCALE: pt_BR
      DATABASE_URL: postgresql://chatwoot:chatwoot_2024@chatwoot-postgres:5432/chatwoot_production
      REDIS_URL: redis://chatwoot-redis:6379
      RAILS_LOG_TO_STDOUT: "true"
      LOG_LEVEL: info
    depends_on:
      chatwoot-postgres:
        condition: service_healthy
      chatwoot-redis:
        condition: service_healthy
    command: ['bundle', 'exec', 'sidekiq', '-C', 'config/sidekiq.yml']
    networks:
      - chatwoot-network

volumes:
  cw_pg:
  cw_redis:

networks:
  chatwoot-network:
    driver: bridge
EOF

    # Salvar versao no .env
    cat > .env-chatwoot << EOFENV
CHATWOOT_VERSION=${CHATWOOT_VERSION}
CHATWOOT_DOMAIN=${CHATWOOT_DOMAIN}
CHATWOOT_EMAIL=${CHATWOOT_EMAIL}
EOFENV

    run_with_progress "Baixando Chatwoot ${CHATWOOT_VERSION}" "docker compose -f docker-compose-chatwoot.yml pull" 180
    run_with_progress "Iniciando PostgreSQL" "docker compose -f docker-compose-chatwoot.yml up -d chatwoot-postgres && sleep 15" 30
    run_with_progress "Iniciando Redis" "docker compose -f docker-compose-chatwoot.yml up -d chatwoot-redis && sleep 10" 20
    
    echo ""
    echo -e "${YELLOW}>>> Executando migrations do banco de dados...${NC}"
    echo -e "${YELLOW}>>> Isso pode levar alguns minutos na primeira vez...${NC}"
    
    # Executar migrations usando container temporario
    docker compose -f docker-compose-chatwoot.yml run --rm chatwoot-rails bundle exec rails db:chatwoot_prepare > /tmp/chatwoot_migrate.log 2>&1
    
    if [ $? -eq 0 ]; then
        show_success "Migrations executadas com sucesso!"
    else
        echo -e "${YELLOW}[AVISO] Tentando migrations alternativas...${NC}"
        docker compose -f docker-compose-chatwoot.yml run --rm chatwoot-rails bundle exec rails db:prepare > /tmp/chatwoot_migrate.log 2>&1
        if [ $? -eq 0 ]; then
            show_success "Migrations executadas!"
        else
            show_error "Erro nas migrations. Verifique /tmp/chatwoot_migrate.log"
            tail -20 /tmp/chatwoot_migrate.log
        fi
    fi
    
    run_with_progress "Iniciando Chatwoot Rails" "docker compose -f docker-compose-chatwoot.yml up -d chatwoot-rails && sleep 20" 40
    run_with_progress "Iniciando Chatwoot Sidekiq" "docker compose -f docker-compose-chatwoot.yml up -d chatwoot-sidekiq && sleep 10" 30
    
    configure_nginx_domain "$CHATWOOT_DOMAIN" "$PORT_CW" "$CHATWOOT_EMAIL"
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   CHATWOOT INSTALADO COM SUCESSO!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  ${ORANGE}Versao:${NC} ${CHATWOOT_VERSION}"
    echo -e "  ${ORANGE}URL:${NC}    https://${CHATWOOT_DOMAIN}"
    echo -e "  ${ORANGE}Email:${NC}  ${CHATWOOT_EMAIL}"
    echo ""
    echo -e "  ${CYAN}Crie sua conta no primeiro acesso!${NC}"
    echo ""
    echo "Pressione ENTER..."
    read -r
}


# ========================================
# FUNCOES DE GERENCIAMENTO
# ========================================
show_status() {
    show_banner
    echo -e "${ORANGE}=== STATUS ===${NC}"
    echo ""
    [ -d "$INSTALL_DIR" ] && cd $INSTALL_DIR && echo -e "${WHITE}GO-API:${NC}" && docker compose ps 2>/dev/null
    [ -d "$EXTRAS_DIR" ] && cd $EXTRAS_DIR && {
        [ -f "docker-compose-typebot.yml" ] && echo -e "\n${WHITE}Typebot:${NC}" && docker compose -f docker-compose-typebot.yml ps 2>/dev/null
        [ -f "docker-compose-n8n.yml" ] && echo -e "\n${WHITE}N8N:${NC}" && docker compose -f docker-compose-n8n.yml ps 2>/dev/null
        [ -f "docker-compose-chatwoot.yml" ] && echo -e "\n${WHITE}Chatwoot:${NC}" && docker compose -f docker-compose-chatwoot.yml ps 2>/dev/null
    }
    echo ""
    echo "Pressione ENTER..."
    read -r
}

view_logs() {
    show_banner
    echo -e "${ORANGE}=== LOGS ===${NC}"
    echo ""
    echo "  1) GO-API"
    echo "  2) Typebot"
    echo "  3) N8N"
    echo "  4) Chatwoot"
    echo "  0) Voltar"
    echo ""
    echo -n "Escolha: "
    read -r opt
    case "$opt" in
        1) cd $INSTALL_DIR 2>/dev/null && docker compose logs -f --tail=100 ;;
        2) cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-typebot.yml logs -f --tail=100 ;;
        3) cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-n8n.yml logs -f --tail=100 ;;
        4) cd $EXTRAS_DIR 2>/dev/null && docker compose -f docker-compose-chatwoot.yml logs -f --tail=100 ;;
    esac
}

restart_services() {
    show_banner
    echo -e "${ORANGE}=== REINICIANDO ===${NC}"
    [ -d "$INSTALL_DIR" ] && run_with_progress "GO-API" "cd $INSTALL_DIR && docker compose restart" 60
    [ -d "$EXTRAS_DIR" ] && cd $EXTRAS_DIR && {
        [ -f "docker-compose-typebot.yml" ] && run_with_progress "Typebot" "docker compose -f docker-compose-typebot.yml restart" 30
        [ -f "docker-compose-n8n.yml" ] && run_with_progress "N8N" "docker compose -f docker-compose-n8n.yml restart" 30
        [ -f "docker-compose-chatwoot.yml" ] && run_with_progress "Chatwoot" "docker compose -f docker-compose-chatwoot.yml restart" 30
    }
    echo "Pressione ENTER..."
    read -r
}

change_credentials() {
    show_banner
    echo -e "${ORANGE}=== ALTERAR CREDENCIAIS ===${NC}"
    [ ! -d "$INSTALL_DIR" ] && show_error "GO-API nao instalada" && read -r && return
    echo -n "Novo EMAIL: "
    read -r NEW_EMAIL
    echo -n "Nova SENHA: "
    read -r NEW_PASS
    cd $INSTALL_DIR
    HASH=$(docker compose exec -T api node -e "const b=require('bcryptjs');console.log(b.hashSync('${NEW_PASS}',10));" 2>/dev/null | tr -d '\r\n')
    [ -n "$HASH" ] && docker compose exec -T postgres psql -U goapi -d goapi -c "UPDATE \"User\" SET email='${NEW_EMAIL}',password='${HASH}' WHERE role='ADMIN';" >/dev/null 2>&1 && show_success "Atualizado!"
    echo "Pressione ENTER..."
    read -r
}

reset_system() {
    show_banner
    echo -e "${RED}=== RESETAR TUDO ===${NC}"
    echo -e "${RED}ATENCAO: Todos os dados serao perdidos!${NC}"
    echo -n "Digite RESETAR: "
    read -r confirm
    [ "$confirm" = "RESETAR" ] && {
        [ -d "$INSTALL_DIR" ] && cd $INSTALL_DIR && docker compose down -v 2>/dev/null && rm -rf $INSTALL_DIR
        [ -d "$EXTRAS_DIR" ] && cd $EXTRAS_DIR && {
            docker compose -f docker-compose-typebot.yml down -v 2>/dev/null
            docker compose -f docker-compose-n8n.yml down -v 2>/dev/null
            docker compose -f docker-compose-chatwoot.yml down -v 2>/dev/null
        } && rm -rf $EXTRAS_DIR
        docker system prune -af --volumes 2>/dev/null
        show_success "Resetado!"
    }
    echo "Pressione ENTER..."
    read -r
}

show_license_info() {
    show_banner
    echo -e "${ORANGE}=== LICENCA ===${NC}"
    echo ""
    echo -e "${WHITE}Machine ID: ${CYAN}$(generate_machine_id)${NC}"
    [ -f "$INSTALL_DIR/.env" ] && source $INSTALL_DIR/.env 2>/dev/null && echo -e "${WHITE}License Key: ${GREEN}${LICENSE_KEY:-Nao configurada}${NC}"
    echo ""
    echo -e "${WHITE}Adquira em: ${CYAN}https://usego.com.br/licencas${NC}"
    echo ""
    echo "Pressione ENTER..."
    read -r
}

# ========================================
# MENUS
# ========================================
extras_menu() {
    while true; do
        show_banner
        echo -e "${ORANGE}=== FERRAMENTAS EXTRAS ===${NC}"
        echo ""
        echo "  1) Instalar Typebot"
        echo "  2) Instalar N8N"
        echo "  3) Instalar Chatwoot"
        echo "  4) Instalar Todos"
        echo "  0) Voltar"
        echo ""
        echo -n "Escolha: "
        read -r opt
        case "$opt" in
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
        echo -e "${ORANGE}MENU PRINCIPAL${NC}"
        echo ""
        echo "  1) Instalar GO-API (com SSL automatico)"
        echo "  2) Instalar Extras (Typebot, N8N, Chatwoot)"
        echo "  3) Informacoes de Licenca"
        echo "  4) Mudar Login e Senha"
        echo "  5) Ver Logs"
        echo "  6) Reiniciar Servicos"
        echo "  7) Status"
        echo "  8) Resetar Tudo"
        echo "  0) Sair"
        echo ""
        echo -e "${CYAN}Licenca: https://usego.com.br/licencas${NC}"
        echo ""
        echo -n "Escolha: "
        read -r opt
        case "$opt" in
            1) do_install_goapi ;;
            2) extras_menu ;;
            3) show_license_info ;;
            4) change_credentials ;;
            5) view_logs ;;
            6) restart_services ;;
            7) show_status ;;
            8) reset_system ;;
            0) echo -e "${ORANGE}Ate logo!${NC}"; exit 0 ;;
            *) show_error "Opcao invalida"; sleep 1 ;;
        esac
    done
}

main_menu

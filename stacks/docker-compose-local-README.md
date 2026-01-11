# 🖥️ GO-API - Instalação Local (Desenvolvimento)

Stack para desenvolvimento local sem SSL.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Portas 3000 e 3001 disponíveis

## 🚀 Instalação

### 1. Criar arquivo .env (opcional)

```bash
cat > .env << EOF
POSTGRES_PASSWORD=sua-senha-forte
JWT_SECRET=$(openssl rand -hex 32)
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=sua-senha-admin
API_URL=http://localhost:3000
EOF
```

### 2. Iniciar os serviços

```bash
docker-compose -f stacks/docker-compose-local.yaml up -d
```

### 3. Verificar status

```bash
docker-compose -f stacks/docker-compose-local.yaml ps
```

## 🌐 Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |

## 🔐 Login Padrão

- Email: `admin@goapi.com`
- Senha: `admin123`

## 📊 Comandos Úteis

```bash
# Ver logs
docker-compose -f stacks/docker-compose-local.yaml logs -f

# Ver logs de um serviço específico
docker-compose -f stacks/docker-compose-local.yaml logs -f backend

# Reiniciar
docker-compose -f stacks/docker-compose-local.yaml restart

# Parar
docker-compose -f stacks/docker-compose-local.yaml down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker-compose -f stacks/docker-compose-local.yaml down -v
```

## 🔧 Troubleshooting

### Backend não inicia
```bash
# Verificar logs do backend
docker-compose -f stacks/docker-compose-local.yaml logs backend

# Verificar se PostgreSQL está pronto
docker-compose -f stacks/docker-compose-local.yaml exec postgres pg_isready -U goapi
```

### Erro de conexão com banco
```bash
# Reiniciar apenas o backend
docker-compose -f stacks/docker-compose-local.yaml restart backend
```

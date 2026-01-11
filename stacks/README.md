# 📦 GO-API - Stacks de Instalação

Este diretório contém todas as stacks Docker para diferentes cenários de instalação.

## 📋 Índice de Stacks

| Arquivo | Descrição | PostgreSQL | Redis | Traefik/SSL |
|---------|-----------|------------|-------|-------------|
| `docker-compose-local.yaml` | Desenvolvimento local | ✅ Independente | ✅ Independente | ❌ |
| `docker-compose-traefik.yaml` | Produção com SSL | ✅ Independente | ✅ Independente | ✅ |
| `portainer-stack.yaml` | Portainer sem SSL | ✅ Independente | ✅ Independente | ❌ |
| `portainer-stack-traefik.yaml` | Portainer com SSL | ✅ Independente | ✅ Independente | ✅ |
| `easypanel-stack.yaml` | EasyPanel | ✅ Independente | ✅ Independente | ✅ (automático) |

## 🏗️ Arquitetura

Todas as stacks seguem a mesma arquitetura:

```
┌──────────────┐     ┌──────────────┐
│  PostgreSQL  │     │    Redis     │
│   (5432)     │     │   (6379)     │
└──────┬───────┘     └──────┬───────┘
       │                    │
       └────────┬───────────┘
                │
        ┌───────▼───────┐
        │    Backend    │
        │   (3000)      │
        └───────┬───────┘
                │
        ┌───────▼───────┐
        │   Frontend    │
        │   (3001)      │
        └───────────────┘
```

## 🚀 Qual Stack Usar?

### Para Desenvolvimento Local
```bash
docker-compose -f stacks/docker-compose-local.yaml up -d
```

### Para Produção com Domínio e SSL
```bash
docker-compose -f stacks/docker-compose-traefik.yaml up -d
```

### Para Portainer
1. Acesse Portainer > Stacks > Add Stack
2. Cole o conteúdo de `portainer-stack.yaml` ou `portainer-stack-traefik.yaml`

### Para EasyPanel
Siga o guia em `easypanel-README.md`

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `goapi123` |
| `JWT_SECRET` | Chave secreta JWT | (gerar) |
| `ADMIN_EMAIL` | Email do admin | `admin@goapi.com` |
| `ADMIN_PASSWORD` | Senha do admin | `admin123` |
| `API_URL` | URL pública da API | `http://localhost:3000` |
| `DOMAIN` | Domínio (para SSL) | - |
| `ACME_EMAIL` | Email Let's Encrypt | - |

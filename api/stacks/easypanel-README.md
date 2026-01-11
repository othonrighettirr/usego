# 🎛️ GO-API - Instalação no EasyPanel

Guia completo para instalar GO-API no EasyPanel.

## 📋 Pré-requisitos

- EasyPanel instalado e funcionando
- Domínio apontando para o servidor

---

## 🚀 Passo a Passo

### 1️⃣ Criar Projeto

1. Acesse seu EasyPanel
2. Clique em **Create Project**
3. Nome: `goapi`
4. Clique em **Create**

---

### 2️⃣ Criar PostgreSQL (1º Serviço)

1. Clique em **+ Service**
2. Selecione **Postgres** (seção Databases)
3. Configure:

| Campo | Valor |
|-------|-------|
| Service Name | `postgres` |
| Database | `goapi` |
| Username | `goapi` |
| Password | `goapi123` |

4. Clique em **Create**
5. ⏳ Aguarde ficar **Running**

---

### 3️⃣ Criar Redis (2º Serviço)

1. Clique em **+ Service**
2. Selecione **Redis** (seção Databases)
3. Configure:

| Campo | Valor |
|-------|-------|
| Service Name | `redis` |

4. Clique em **Create**
5. ⏳ Aguarde ficar **Running**

---

### 4️⃣ Criar Backend (3º Serviço)

1. Clique em **+ Service**
2. Selecione **App**
3. Configure:

**General:**
| Campo | Valor |
|-------|-------|
| Service Name | `backend` |
| Image | `usegoapi/gopro-backend:latest` |

**Domains:**
| Campo | Valor |
|-------|-------|
| Domain | `api.seudominio.com` |
| Port | `3000` |
| HTTPS | ✅ Enabled |

**Environment Variables:**
```
DB_HOST=goapi_postgres
DB_PORT=5432
DATABASE_URL=postgresql://goapi:goapi123@goapi_postgres:5432/goapi
REDIS_HOST=goapi_redis
REDIS_PORT=6379
REDIS_URL=redis://goapi_redis:6379
JWT_SECRET=sua-chave-jwt-super-secreta-mude-isso-123456
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=SuaSenhaForte123!
NODE_ENV=production
CORS_ORIGIN=*
```

**Volumes:**
| Host Path | Container Path |
|-----------|----------------|
| `backend_sessions` | `/app/sessions` |

4. Clique em **Create**
5. ⏳ Aguarde ficar **Running** (1-2 min)

---

### 5️⃣ Criar Frontend (4º Serviço)

1. Clique em **+ Service**
2. Selecione **App**
3. Configure:

**General:**
| Campo | Valor |
|-------|-------|
| Service Name | `frontend` |
| Image | `usegoapi/gopro-frontend:latest` |

**Domains:**
| Campo | Valor |
|-------|-------|
| Domain | `seudominio.com` |
| Port | `3000` |
| HTTPS | ✅ Enabled |

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NODE_ENV=production
```

4. Clique em **Create**

---

## ✅ Verificação

| URL | Esperado |
|-----|----------|
| `https://api.seudominio.com/health` | "OK" |
| `https://seudominio.com` | Tela de login |

---

## 🔐 Login

- Email: `admin@seudominio.com`
- Senha: `SuaSenhaForte123!`

---

## 📊 Arquitetura no EasyPanel

```
┌──────────────┐     ┌──────────────┐
│  PostgreSQL  │     │    Redis     │
│goapi_postgres│     │ goapi_redis  │
└──────┬───────┘     └──────┬───────┘
       │                    │
       └────────┬───────────┘
                │
        ┌───────▼───────┐
        │    Backend    │
        │ api.dominio   │
        └───────┬───────┘
                │
        ┌───────▼───────┐
        │   Frontend    │
        │   dominio     │
        └───────────────┘
```

---

## 🔧 Hostnames no EasyPanel

> ⚠️ **IMPORTANTE:** O hostname segue o padrão `{projeto}_{serviço}`

| Serviço | Hostname Interno |
|---------|------------------|
| PostgreSQL | `goapi_postgres` |
| Redis | `goapi_redis` |
| Backend | `goapi_backend` |
| Frontend | `goapi_frontend` |

---

## 🐛 Troubleshooting

### Backend não conecta no PostgreSQL
```
Verifique: DATABASE_URL=postgresql://goapi:goapi123@goapi_postgres:5432/goapi
```

### Backend não conecta no Redis
```
Verifique: REDIS_URL=redis://goapi_redis:6379
```

### Frontend não carrega dados
```
Verifique: NEXT_PUBLIC_API_URL=https://api.seudominio.com (com HTTPS!)
```

### Erro de Prisma
Se aparecer erro de "Query Engine", atualize a imagem:
```
docker pull usegoapi/gopro-backend:latest
```
E reinicie o serviço no EasyPanel.

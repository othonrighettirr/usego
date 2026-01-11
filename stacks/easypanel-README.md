# 🚀 GO-API - Instalação no EasyPanel

## Pré-requisitos
- EasyPanel instalado e funcionando
- Domínios configurados apontando para o servidor

## Instalação

### 1. Criar Projeto
1. Acesse o EasyPanel
2. Clique em "Create Project"
3. Nome: `goapi`

### 2. Criar Serviços

#### PostgreSQL
1. Add Service > Database > PostgreSQL
2. Nome: `postgres`
3. Configurações:
   - Database: `goapi`
   - Username: `goapi`
   - Password: (anote a senha gerada)

#### Redis
1. Add Service > Database > Redis
2. Nome: `redis`

#### Backend
1. Add Service > App > Docker Image
2. Nome: `backend`
3. Image: `usegoapi/gopro-backend:latest`
4. Environment Variables:
```
DATABASE_URL=postgresql://goapi:SENHA@goapi_postgres:5432/goapi
REDIS_URL=redis://goapi_redis:6379
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@goapi.com
ADMIN_PASSWORD=admin123
NODE_ENV=production
```
5. Domains: `api.seudominio.com`
6. Port: `3000`

#### Frontend
1. Add Service > App > Docker Image
2. Nome: `frontend`
3. Image: `usegoapi/gopro-frontend:latest`
4. Environment Variables:
```
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```
5. Domains: `app.seudominio.com`
6. Port: `3000`

### 3. Ordem de Inicialização
1. Inicie PostgreSQL primeiro
2. Aguarde ficar healthy
3. Inicie Redis
4. Inicie Backend
5. Inicie Frontend

## Hostnames no EasyPanel

O EasyPanel usa o formato `{projeto}_{serviço}`:
- PostgreSQL: `goapi_postgres`
- Redis: `goapi_redis`
- Backend: `goapi_backend`
- Frontend: `goapi_frontend`

## Acesso

- Frontend: `https://app.seudominio.com`
- API: `https://api.seudominio.com`
- Swagger: `https://api.seudominio.com/docs`

## Credenciais Padrão
- Email: `admin@goapi.com`
- Senha: `admin123`

⚠️ **IMPORTANTE**: Altere as credenciais após o primeiro acesso!

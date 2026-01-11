# 🔒 GO-API - Instalação Produção com SSL (Traefik)

Stack para produção com SSL automático via Let's Encrypt.

## 📋 Pré-requisitos

- Servidor com IP público
- Domínio apontando para o servidor (DNS configurado)
- Docker e Docker Compose instalados
- Portas 80 e 443 liberadas no firewall

## 🌐 DNS Necessário

Configure os seguintes registros DNS:

| Tipo | Nome | Valor |
|------|------|-------|
| A | seudominio.com | IP_DO_SERVIDOR |
| A | api.seudominio.com | IP_DO_SERVIDOR |
| A | www.seudominio.com | IP_DO_SERVIDOR |

## 🚀 Instalação

### 1. Criar arquivo .env

```bash
cat > .env << EOF
# Domínio
DOMAIN=seudominio.com
ACME_EMAIL=seu-email@seudominio.com

# PostgreSQL
POSTGRES_PASSWORD=$(openssl rand -hex 16)

# JWT
JWT_SECRET=$(openssl rand -hex 32)

# Admin
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=SuaSenhaForte123!
EOF
```

### 2. Iniciar os serviços

```bash
docker-compose -f stacks/docker-compose-traefik.yaml up -d
```

### 3. Verificar certificados SSL

```bash
# Aguarde 1-2 minutos para os certificados serem gerados
docker logs traefik 2>&1 | grep -i "certificate"
```

## 🌐 Acesso

| Serviço | URL |
|---------|-----|
| Frontend | https://seudominio.com |
| API | https://api.seudominio.com |
| Health Check | https://api.seudominio.com/health |

## 🔐 Login

Use as credenciais definidas no `.env`:
- Email: valor de `ADMIN_EMAIL`
- Senha: valor de `ADMIN_PASSWORD`

## 📊 Comandos Úteis

```bash
# Ver logs
docker-compose -f stacks/docker-compose-traefik.yaml logs -f

# Ver logs do Traefik (SSL)
docker logs traefik -f

# Reiniciar
docker-compose -f stacks/docker-compose-traefik.yaml restart

# Parar
docker-compose -f stacks/docker-compose-traefik.yaml down
```

## 🔧 Troubleshooting

### SSL não funciona
1. Verifique se o DNS está propagado: `nslookup seudominio.com`
2. Verifique logs do Traefik: `docker logs traefik`
3. Certifique-se que portas 80 e 443 estão abertas

### Backend não conecta
```bash
# Verificar status dos containers
docker-compose -f stacks/docker-compose-traefik.yaml ps

# Verificar logs do backend
docker logs goapi-backend
```

### Renovação de certificados
Os certificados são renovados automaticamente pelo Traefik.

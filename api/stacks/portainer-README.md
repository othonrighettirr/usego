# 🐳 GO-API - Instalação via Portainer

Guia para instalar GO-API usando Portainer.

## 📋 Arquivos Disponíveis

| Arquivo | Descrição |
|---------|-----------|
| `portainer-stack.yaml` | Sem SSL (acesso via IP:porta) |
| `portainer-stack-traefik.yaml` | Com SSL automático (Let's Encrypt) |

---

## 🚀 Instalação SEM SSL (portainer-stack.yaml)

### Passo 1: Acessar Portainer
1. Acesse seu Portainer
2. Vá em **Stacks** > **Add Stack**

### Passo 2: Configurar Stack
1. Nome: `goapi`
2. Cole o conteúdo de `portainer-stack.yaml`

### Passo 3: Configurar Variáveis
Na seção **Environment variables**, adicione:

| Nome | Valor |
|------|-------|
| `POSTGRES_PASSWORD` | sua-senha-forte |
| `JWT_SECRET` | chave-secreta-longa |
| `ADMIN_EMAIL` | admin@seudominio.com |
| `ADMIN_PASSWORD` | sua-senha-admin |
| `API_URL` | http://SEU_IP:3000 |

### Passo 4: Deploy
Clique em **Deploy the stack**

### Acesso
- Frontend: `http://SEU_IP:3001`
- API: `http://SEU_IP:3000`

---

## 🔒 Instalação COM SSL (portainer-stack-traefik.yaml)

### Pré-requisitos
- Domínio apontando para o servidor
- Portas 80 e 443 liberadas

### Passo 1: Acessar Portainer
1. Acesse seu Portainer
2. Vá em **Stacks** > **Add Stack**

### Passo 2: Configurar Stack
1. Nome: `goapi`
2. Cole o conteúdo de `portainer-stack-traefik.yaml`

### Passo 3: Configurar Variáveis
Na seção **Environment variables**, adicione:

| Nome | Valor |
|------|-------|
| `DOMAIN` | seudominio.com |
| `ACME_EMAIL` | seu-email@seudominio.com |
| `POSTGRES_PASSWORD` | sua-senha-forte |
| `JWT_SECRET` | chave-secreta-longa |
| `ADMIN_EMAIL` | admin@seudominio.com |
| `ADMIN_PASSWORD` | sua-senha-admin |

### Passo 4: Deploy
Clique em **Deploy the stack**

### Acesso
- Frontend: `https://seudominio.com`
- API: `https://api.seudominio.com`

---

## 🔧 Troubleshooting

### Containers não iniciam
1. Verifique os logs em **Containers** > clique no container > **Logs**
2. Aguarde o PostgreSQL ficar healthy antes do backend iniciar

### SSL não funciona
1. Verifique se o DNS está propagado
2. Verifique logs do container `traefik`
3. Certifique-se que portas 80 e 443 estão abertas

### Erro de conexão com banco
1. Verifique se o container `goapi-postgres` está running
2. Verifique a variável `POSTGRES_PASSWORD`

---

## 📊 Arquitetura

```
┌──────────────┐     ┌──────────────┐
│  PostgreSQL  │     │    Redis     │
│   (interno)  │     │  (interno)   │
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

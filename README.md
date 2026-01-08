<p align="center">
  <img src="https://content.pstmn.io/c7241132-63e7-4e78-b371-ebbb9fccee3e/aW1nLWxvZ28ucG5n" alt="GO-API Logo" width="550"/>
</p>

<p align="center">
  <strong>API completa para WhatsApp com múltiplas instâncias, integrações e painel administrativo</strong>
</p>

<p align="center">
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-endpoints">Endpoints</a> •
  <a href="#-integrações">Integrações</a> •
  <a href="#-suporte">Suporte</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-green.svg" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"/>
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg" alt="Node"/>
  <img src="https://img.shields.io/badge/docker-ready-blue.svg" alt="Docker"/>
</p>

---

## 📋 Sobre

A **GO-API** é uma solução completa e profissional para integração com WhatsApp, desenvolvida com tecnologias modernas e focada em performance, estabilidade e facilidade de uso. Com suporte a múltiplas instâncias, você pode gerenciar diversos números de WhatsApp em uma única plataforma.

## ✨ Funcionalidades

### 📱 Gerenciamento de Instâncias
- ✅ Múltiplas instâncias simultâneas
- ✅ Conexão via QR Code ou Código de Pareamento
- ✅ Reconexão automática
- ✅ Status em tempo real
- ✅ Sincronização completa de histórico

### 💬 Mensagens
- ✅ Envio de texto, imagens, vídeos, áudios e documentos
- ✅ Envio de localização e contatos
- ✅ Envio de stickers
- ✅ Envio de enquetes (polls)
- ✅ Envio de listas interativas
- ✅ Reações em mensagens
- ✅ Exclusão de mensagens
- ✅ Mensagens com menções

### 👥 Grupos
- ✅ Criar grupos
- ✅ Adicionar/remover participantes
- ✅ Promover/rebaixar administradores
- ✅ Alterar nome e descrição
- ✅ Configurações do grupo (quem pode enviar, etc.)
- ✅ Obter/revogar link de convite
- ✅ Listar todos os grupos
- ✅ Listar participantes

### 📢 Newsletter / Canais
- ✅ Criar canais
- ✅ Enviar texto, imagem e vídeo para canais
- ✅ Seguir/deixar de seguir canais
- ✅ Silenciar/dessilenciar canais
- ✅ Obter metadados e inscritos
- ✅ Buscar mensagens do canal

### 📞 Contatos
- ✅ Listar todos os contatos
- ✅ Verificar se número existe no WhatsApp
- ✅ Obter foto de perfil
- ✅ Buscar status do contato

### ⚙️ Comportamento da Instância
- ✅ Rejeitar chamadas automaticamente
- ✅ Ignorar mensagens de grupos
- ✅ Manter sempre online
- ✅ Marcar mensagens como lidas
- ✅ Sincronizar histórico completo
- ✅ Ler status automaticamente
- ✅ Configuração de proxy

### 🔗 Integrações
- ✅ **Webhook** - Receba eventos via HTTP POST
- ✅ **WebSocket** - Eventos em tempo real
- ✅ **RabbitMQ** - Filas de mensagens
- ✅ **Amazon SQS** - Filas na AWS
- ✅ **N8N** - Automação de fluxos
- ✅ **Typebot** - Chatbots inteligentes
- ✅ **Chatwoot** - Atendimento ao cliente
- ✅ **Whaticket** - Sistema de tickets

---

## 🚀 Instalação

### Método 1: Auto Instalador (Recomendado)

Execute o comando abaixo em um servidor Ubuntu/Debian:

```bash
curl -fsSL https://raw.githubusercontent.com/usegoapi/usego/main/install.sh | bash
```

O instalador irá:
- ✅ Instalar Docker e Docker Compose
- ✅ Configurar PostgreSQL
- ✅ Configurar a API e Frontend
- ✅ Gerar certificados SSL (opcional)
- ✅ Criar usuário administrador

### Método 2: Docker Compose (Manual)

**1. Clone o repositório:**
```bash
git clone https://github.com/usegoapi/usego.git
cd usego
```

**2. Configure as variáveis de ambiente:**
```bash
cp docker-compose.example.yaml docker-compose.yaml
```

Edite o arquivo `docker-compose.yaml` e configure:
- `DATABASE_URL` - URL do PostgreSQL
- `JWT_SECRET` - Chave secreta para tokens
- `ADMIN_EMAIL` - Email do administrador
- `ADMIN_PASSWORD` - Senha do administrador

**3. Inicie os containers:**
```bash
docker-compose up -d
```

**4. Acesse o painel:**
- Frontend: `http://seu-ip:3000`
- API: `http://seu-ip:3001`

### Método 3: Easypanel / Portainer

Use a imagem Docker diretamente:

```
https://github.com/usegoapi/usego.git#main
```

**Variáveis de ambiente necessárias:**

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Chave secreta JWT | `sua-chave-secreta-aqui` |
| `ADMIN_EMAIL` | Email do admin | `admin@exemplo.com` |
| `ADMIN_PASSWORD` | Senha do admin | `SuaSenhaForte123` |
| `NEXT_PUBLIC_API_URL` | URL da API (frontend) | `https://api.seudominio.com` |

---

## 📡 Endpoints da API

### Autenticação
Todas as requisições (exceto login) requerem o header `x-api-key` com a chave da instância.

```bash
curl -X GET "https://api.seudominio.com/api/contacts" \
  -H "x-api-key: sua-api-key-aqui"
```

### Mensagens

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/text` | Enviar texto |
| POST | `/api/image` | Enviar imagem |
| POST | `/api/video` | Enviar vídeo |
| POST | `/api/audio` | Enviar áudio/PTT |
| POST | `/api/document` | Enviar documento |
| POST | `/api/location` | Enviar localização |
| POST | `/api/contact` | Enviar contato |
| POST | `/api/sticker` | Enviar sticker |
| POST | `/api/poll` | Enviar enquete |
| POST | `/api/list` | Enviar lista |
| POST | `/api/react` | Reagir mensagem |
| DELETE | `/api/message` | Deletar mensagem |

### Grupos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/groups` | Listar grupos |
| GET | `/api/groups/:id/participants` | Listar participantes |
| POST | `/api/groups/create` | Criar grupo |
| POST | `/api/groups/add` | Adicionar participantes |
| POST | `/api/groups/remove` | Remover participantes |
| POST | `/api/groups/promote` | Promover a admin |
| POST | `/api/groups/demote` | Rebaixar admin |
| PUT | `/api/groups/subject` | Alterar nome |
| PUT | `/api/groups/description` | Alterar descrição |
| GET | `/api/groups/:id/invite` | Obter link convite |
| POST | `/api/groups/:id/revoke` | Revogar link |
| DELETE | `/api/groups/:id/leave` | Sair do grupo |

### Contatos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/contacts` | Listar contatos |
| GET | `/api/contacts/check/:phone` | Verificar WhatsApp |
| GET | `/api/contacts/:phone/picture` | Foto de perfil |
| GET | `/api/contacts/:phone/status` | Status do contato |

### Newsletter / Canais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/newsletters` | Listar canais |
| GET | `/api/newsletter/:id` | Metadados do canal |
| POST | `/api/newsletter/create` | Criar canal |
| POST | `/api/newsletter/text` | Enviar texto |
| POST | `/api/newsletter/image` | Enviar imagem |
| POST | `/api/newsletter/video` | Enviar vídeo |
| POST | `/api/newsletter/follow` | Seguir canal |
| POST | `/api/newsletter/unfollow` | Deixar de seguir |
| POST | `/api/newsletter/mute` | Silenciar |
| POST | `/api/newsletter/unmute` | Dessilenciar |
| GET | `/api/newsletter/:id/subscribers` | Nº de inscritos |
| GET | `/api/newsletter/:id/messages` | Mensagens |

---

## 🔧 Configuração de Integrações

### Webhook
Configure uma URL para receber eventos via HTTP POST:
```json
{
  "enabled": true,
  "url": "https://seu-servidor.com/webhook",
  "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
}
```

### N8N
```json
{
  "enabled": true,
  "webhookUrl": "https://n8n.seudominio.com/webhook/xxx",
  "triggerType": "keyword",
  "keyword": "atendimento"
}
```

### Typebot
```json
{
  "enabled": true,
  "apiUrl": "https://typebot.io/api/v1/typebots/xxx/startChat",
  "triggerType": "all"
}
```

### Chatwoot
```json
{
  "enabled": true,
  "url": "https://app.chatwoot.com",
  "accountId": "1",
  "token": "seu-token-aqui"
}
```

---

## 📦 Tecnologias

- **Backend:** NestJS, TypeScript, Prisma ORM
- **Frontend:** Next.js, React, TailwindCSS
- **Banco de Dados:** PostgreSQL
- **WhatsApp:** Baileys (Multi-Device)
- **Containerização:** Docker, Docker Compose
- **Proxy:** Nginx (CORS)

---

## 🆘 Suporte

- 📧 **Email:** suporte@usego.com.br
- 💬 **Chat:** [usego.com.br/members/chat](https://usego.com.br/members/chat)
- 📚 **Documentação:** Acesse `/docs` no painel

---

## 🤝 Contribuição

Contribuições são bem-vindas! Acesse [usego.com.br/members/payments](https://usego.com.br/members/payments) para apoiar o projeto.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com ❤️ pelo <strong>Time GO</strong>
</p>

<p align="center">
  <a href="https://usego.com.br">usego.com.br</a>
</p>

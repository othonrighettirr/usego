# Implementation Plan: API Key Authentication Refactor (MVP)

## Fase 1: Infraestrutura de API Keys

- [ ] 1. Atualizar Schema Prisma
  - [ ] 1.1 Criar model ApiKey com campos: id, keyHash, keyPrefix, type, instanceId, createdAt, lastUsedAt, revokedAt
  - [ ] 1.2 Criar enum ApiKeyType (GLOBAL, INSTANCE)
  - [ ] 1.3 Remover campo apiKey do model Instance (será migrado)
  - [ ] 1.4 Executar migration do Prisma
  - _Requirements: 3.2, 2.1_

- [ ] 2. Criar ApiKeyService
  - [ ] 2.1 Implementar método generateKey() com crypto.randomBytes(32)
  - [ ] 2.2 Implementar método hashKey() usando bcrypt
  - [ ] 2.3 Implementar método validateGlobalKey()
  - [ ] 2.4 Implementar método validateInstanceKey()
  - [ ] 2.5 Implementar método revokeKey()
  - [ ] 2.6 Implementar método rotateKey()
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

- [ ]* 2.7 Write property test: API Key generation entropy
  - **Property 5: API Key generation is cryptographically secure**
  - **Validates: Requirements 3.1**

- [ ]* 2.8 Write property test: API Keys stored as hashes
  - **Property 6: API Keys are stored as hashes**
  - **Validates: Requirements 3.2**

## Fase 2: Guards e Decorators

- [ ] 3. Criar ApiKeyGuard
  - [ ] 3.1 Implementar extração do header X-API-Key
  - [ ] 3.2 Implementar validação de Global Key via env GLOBAL_API_KEY
  - [ ] 3.3 Implementar validação de Instance Key via banco
  - [ ] 3.4 Implementar injeção do payload no request
  - [ ] 3.5 Retornar 401 para keys inválidas/ausentes
  - _Requirements: 1.2, 2.2, 3.4_

- [ ]* 3.6 Write property test: Invalid keys return 401
  - **Property 4: Invalid keys return 401**
  - **Validates: Requirements 3.4**

- [ ] 4. Criar Decorators de Autorização
  - [ ] 4.1 Criar @RequireGlobalKey() decorator
  - [ ] 4.2 Criar @RequireApiKey() decorator (aceita ambos)
  - [ ] 4.3 Criar @CurrentApiKey() parameter decorator
  - [ ] 4.4 Criar @RequireInstanceAccess() para validar acesso à instância
  - _Requirements: 1.2, 2.3_

- [ ]* 4.5 Write property test: Instance Key restricts access
  - **Property 2: Instance Key restricts to own instance**
  - **Validates: Requirements 2.3, 2.4**

- [ ]* 4.6 Write property test: Instance Key cannot access admin
  - **Property 3: Instance Key cannot access admin routes**
  - **Validates: Requirements 2.5**

## Fase 3: Refatorar Endpoints Existentes

- [ ] 5. Refatorar InstancesController
  - [ ] 5.1 Substituir JwtAuthGuard por ApiKeyGuard
  - [ ] 5.2 Adicionar @RequireGlobalKey() em rotas admin (create, delete all)
  - [ ] 5.3 Adicionar @RequireApiKey() em rotas de instância
  - [ ] 5.4 Implementar filtro automático por instanceId quando usar Instance Key
  - [ ] 5.5 Gerar API Key automaticamente ao criar instância
  - _Requirements: 1.3, 2.1, 2.3_

- [ ] 6. Refatorar MessagesController
  - [ ] 6.1 Substituir JwtAuthGuard por ApiKeyGuard
  - [ ] 6.2 Validar acesso à instância antes de enviar mensagem
  - [ ] 6.3 Usar instanceId do payload quando Instance Key
  - _Requirements: 2.3_

- [ ] 7. Refatorar outros Controllers
  - [ ] 7.1 Atualizar GroupsController
  - [ ] 7.2 Atualizar NewsletterController
  - [ ] 7.3 Atualizar IntegrationsController
  - _Requirements: 2.3_

- [ ] 8. Checkpoint - Testar autenticação
  - Ensure all tests pass, ask the user if questions arise.

## Fase 4: Endpoints de Gerenciamento de API Keys

- [ ] 9. Criar ApiKeysController
  - [ ] 9.1 POST /api-keys/instance/:instanceId - Gerar nova key (Global only)
  - [ ] 9.2 DELETE /api-keys/:keyId - Revogar key (Global only)
  - [ ] 9.3 POST /api-keys/:keyId/rotate - Rotacionar key (Global only)
  - [ ] 9.4 GET /api-keys - Listar keys (metadata only, Global only)
  - [ ] 9.5 GET /api-keys/instance/:instanceId - Listar keys da instância
  - _Requirements: 4.1, 4.2, 4.4_

- [ ]* 9.6 Write property test: Key rotation invalidates old key
  - **Property 7: Key rotation invalidates old key**
  - **Validates: Requirements 4.2**

## Fase 5: Remover Sistema JWT

- [ ] 10. Remover código JWT
  - [ ] 10.1 Remover AuthController (login/register)
  - [ ] 10.2 Remover AuthService (métodos JWT)
  - [ ] 10.3 Remover JwtStrategy
  - [ ] 10.4 Remover JwtAuthGuard
  - [ ] 10.5 Remover dependências JWT do package.json
  - [ ] 10.6 Remover model User do Prisma (ou manter para outros fins)
  - [ ] 10.7 Atualizar AuthModule para novo sistema
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 11. Checkpoint - Verificar remoção JWT
  - Ensure all tests pass, ask the user if questions arise.

## Fase 6: Integrar Frontend na API

- [ ] 12. Configurar servir arquivos estáticos
  - [ ] 12.1 Configurar NestJS ServeStaticModule para /frontend
  - [ ] 12.2 Copiar build do frontend para pasta public/
  - [ ] 12.3 Configurar fallback para SPA (index.html)
  - _Requirements: 6.1, 6.2_

- [ ] 13. Atualizar Frontend para API Key Auth
  - [ ] 13.1 Criar tela de login com campos: API URL e Global API Key
  - [ ] 13.2 Remover lógica de JWT do frontend
  - [ ] 13.3 Configurar axios/fetch para enviar X-API-Key header
  - [ ] 13.4 Armazenar API Key em sessionStorage
  - [ ] 13.5 Implementar logout (limpar sessionStorage)
  - _Requirements: 6.3, 6.4, 6.5_

## Fase 7: Logging e Auditoria

- [ ] 14. Implementar logging de API Keys
  - [ ] 14.1 Criar interceptor para log de requests autenticados
  - [ ] 14.2 Logar keyId (não a key), endpoint, método, status
  - [ ] 14.3 Atualizar lastUsedAt na ApiKey após uso
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

## Fase 8: Atualizar Documentação

- [ ] 15. Atualizar Swagger/OpenAPI
  - [ ] 15.1 Remover esquema de autenticação Bearer JWT
  - [ ] 15.2 Adicionar esquema de autenticação ApiKey
  - [ ] 15.3 Documentar todos os endpoints com novo auth
  - [ ] 15.4 Adicionar exemplos de uso
  - _Requirements: 1.1, 2.2_

- [ ] 16. Checkpoint Final
  - Ensure all tests pass, ask the user if questions arise.

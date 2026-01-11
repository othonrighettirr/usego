# Requirements Document

## Introduction

Refatoração completa do sistema de autenticação da GOapi, substituindo o modelo atual baseado em JWT/usuário-senha por um modelo stateless baseado exclusivamente em API Keys. O sistema terá dois tipos de chaves: Global (acesso administrativo total) e por Instância (acesso restrito à instância específica). O dashboard frontend será integrado diretamente na API via rota `/frontend`.

## Glossary

- **GOapi**: Sistema de API WhatsApp baseado em Baileys
- **API Key Global (Master Key)**: Chave com acesso irrestrito a todos os endpoints
- **API Key de Instância**: Chave com acesso restrito apenas à instância associada
- **Instância**: Conexão WhatsApp individual gerenciada pela API
- **X-API-Key**: Header HTTP usado para enviar a API Key nas requisições

## Requirements

### Requirement 1: API Key Global (Master Key)

**User Story:** As an administrator, I want to use a Global API Key to access all API endpoints, so that I can manage the entire system without user/password authentication.

#### Acceptance Criteria

1. WHEN the system starts, THE GOapi SHALL generate or load a Global API Key from environment variable `GLOBAL_API_KEY`
2. WHEN a request contains a valid Global API Key in header `X-API-Key`, THE GOapi SHALL grant access to all endpoints
3. WHEN a Global API Key is used, THE GOapi SHALL allow management of all instances (create, list, update, delete)
4. WHEN a Global API Key is used, THE GOapi SHALL allow management of all Instance API Keys (create, revoke, rotate)
5. WHEN a Global API Key is used, THE GOapi SHALL allow access to administrative routes

### Requirement 2: API Key por Instância

**User Story:** As an API consumer, I want each instance to have its own API Key, so that I can securely access only the resources of that specific instance.

#### Acceptance Criteria

1. WHEN an instance is created, THE GOapi SHALL automatically generate a unique API Key for that instance
2. WHEN a request contains a valid Instance API Key in header `X-API-Key`, THE GOapi SHALL identify the associated instance automatically
3. WHEN an Instance API Key is used, THE GOapi SHALL restrict access only to endpoints related to that specific instance
4. WHEN an Instance API Key attempts to access another instance's resources, THE GOapi SHALL return HTTP 403 Forbidden
5. WHEN an Instance API Key attempts to access administrative endpoints, THE GOapi SHALL return HTTP 403 Forbidden

### Requirement 3: Validação e Segurança de API Keys

**User Story:** As a security administrator, I want API Keys to be securely generated and stored, so that the system remains protected against unauthorized access.

#### Acceptance Criteria

1. WHEN an API Key is generated, THE GOapi SHALL use cryptographically secure random generation (minimum 32 bytes)
2. WHEN an API Key is stored, THE GOapi SHALL store only the hashed version using bcrypt or HMAC
3. WHEN an API Key is validated, THE GOapi SHALL compare the provided key against the stored hash
4. WHEN a request has no API Key or invalid API Key, THE GOapi SHALL return HTTP 401 Unauthorized
5. WHEN a request has valid API Key but insufficient permissions, THE GOapi SHALL return HTTP 403 Forbidden

### Requirement 4: Gerenciamento de API Keys

**User Story:** As an administrator, I want to manage API Keys (revoke, rotate), so that I can maintain security and control access.

#### Acceptance Criteria

1. WHEN an administrator requests to revoke an Instance API Key, THE GOapi SHALL invalidate the key immediately
2. WHEN an administrator requests to rotate an Instance API Key, THE GOapi SHALL generate a new key and invalidate the old one
3. WHEN an API Key is revoked or rotated, THE GOapi SHALL log the action with timestamp and actor
4. WHEN listing API Keys, THE GOapi SHALL show only metadata (id, instance, created_at, last_used) without exposing the actual key

### Requirement 5: Remoção do Sistema JWT

**User Story:** As a developer, I want the JWT authentication system removed, so that the codebase is simplified and uses only API Key authentication.

#### Acceptance Criteria

1. WHEN the refactoring is complete, THE GOapi SHALL not have any JWT generation or validation code
2. WHEN the refactoring is complete, THE GOapi SHALL not have login/register endpoints for user/password
3. WHEN the refactoring is complete, THE GOapi SHALL not require the User model for authentication purposes
4. WHEN the refactoring is complete, THE GOapi SHALL use only X-API-Key header for all authentication

### Requirement 6: Dashboard Frontend Integrado

**User Story:** As a user, I want to access the dashboard directly from the API server, so that I don't need to configure separate services.

#### Acceptance Criteria

1. WHEN a request is made to `/frontend`, THE GOapi SHALL serve the static dashboard files (HTML, JS, CSS)
2. WHEN a request is made to `/frontend/*`, THE GOapi SHALL serve the corresponding static assets
3. WHEN the dashboard loads, THE GOapi SHALL require the user to input the API URL and Global API Key
4. WHEN the dashboard makes API requests, THE GOapi SHALL include the Global API Key in the X-API-Key header
5. WHEN the dashboard stores the API Key, THE GOapi SHALL use only session storage (not persistent storage)

### Requirement 7: Logging e Auditoria

**User Story:** As a security administrator, I want all API Key usage logged, so that I can audit access and detect anomalies.

#### Acceptance Criteria

1. WHEN any authenticated request is made, THE GOapi SHALL log the API Key identifier (not the key itself)
2. WHEN any authenticated request is made, THE GOapi SHALL log the endpoint accessed and HTTP method
3. WHEN any authenticated request is made, THE GOapi SHALL log the timestamp and response status
4. WHEN an Instance API Key is used, THE GOapi SHALL update the `last_used` timestamp for that key

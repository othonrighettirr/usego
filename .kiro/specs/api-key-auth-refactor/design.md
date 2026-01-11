# Design Document: API Key Authentication Refactor

## Overview

Esta refatoração substitui o sistema de autenticação JWT por um modelo stateless baseado em API Keys. O sistema terá dois tipos de chaves: Global (Master Key) para acesso administrativo completo e API Keys por Instância para acesso restrito. O frontend será servido diretamente pela API.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        GOapi Server                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  /frontend  │  │   /api/*    │  │     /instances/*    │  │
│  │  (Static)   │  │  (Global)   │  │  (Global+Instance)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │  API Key    │                          │
│                    │  Guard      │                          │
│                    └──────┬──────┘                          │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         ▼                 ▼                 ▼               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Global    │  │  Instance   │  │    No Key   │         │
│  │   Access    │  │   Access    │  │   (401)     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. ApiKeyGuard (NestJS Guard)

```typescript
interface ApiKeyPayload {
  type: 'global' | 'instance';
  instanceId?: string;
  keyId?: string;
}

@Injectable()
class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
```

### 2. ApiKeyService

```typescript
interface ApiKeyService {
  // Validação
  validateGlobalKey(key: string): Promise<boolean>;
  validateInstanceKey(key: string): Promise<{ valid: boolean; instanceId?: string }>;
  
  // Gerenciamento
  generateInstanceKey(instanceId: string): Promise<string>;
  revokeInstanceKey(instanceId: string): Promise<void>;
  rotateInstanceKey(instanceId: string): Promise<string>;
  
  // Utilitários
  hashKey(key: string): Promise<string>;
  compareKey(key: string, hash: string): Promise<boolean>;
}
```

### 3. Decorators

```typescript
// Requer API Key Global
@RequireGlobalKey()

// Requer API Key (Global ou Instance)
@RequireApiKey()

// Obtém dados da API Key validada
@CurrentApiKey() payload: ApiKeyPayload
```

## Data Models

### Prisma Schema Updates

```prisma
model ApiKey {
  id          String    @id @default(uuid())
  keyHash     String    @unique
  keyPrefix   String    // Primeiros 8 chars para identificação
  type        ApiKeyType
  instanceId  String?
  createdAt   DateTime  @default(now())
  lastUsedAt  DateTime?
  revokedAt   DateTime?
  
  instance    Instance? @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  
  @@index([keyPrefix])
  @@index([instanceId])
}

enum ApiKeyType {
  GLOBAL
  INSTANCE
}

model Instance {
  id          String   @id @default(uuid())
  name        String
  status      String   @default("DISCONNECTED")
  sessionData Json?
  createdAt   DateTime @default(now())
  
  apiKeys     ApiKey[]
  messages    Message[]
  // ... outros relacionamentos
}
```

### Remover do Schema

- Model `User` (não mais necessário para auth)
- Campo `userId` de `Instance`
- Campo `apiKey` de `Instance` (migrar para model ApiKey)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Global Key grants full access
*For any* valid Global API Key and any endpoint, the request SHALL be authorized (not return 401 or 403 due to authentication/authorization)
**Validates: Requirements 1.2, 1.3, 1.4, 1.5**

### Property 2: Instance Key restricts to own instance
*For any* valid Instance API Key and any request to another instance's resources, the request SHALL return HTTP 403
**Validates: Requirements 2.3, 2.4**

### Property 3: Instance Key cannot access admin routes
*For any* valid Instance API Key and any administrative endpoint, the request SHALL return HTTP 403
**Validates: Requirements 2.5**

### Property 4: Invalid keys return 401
*For any* request without API Key or with invalid API Key, the request SHALL return HTTP 401
**Validates: Requirements 3.4**

### Property 5: API Key generation is cryptographically secure
*For any* generated API Key, the key SHALL have at least 256 bits of entropy (32 bytes random)
**Validates: Requirements 3.1**

### Property 6: API Keys are stored as hashes
*For any* stored API Key, the database SHALL contain only the hashed version, never the plaintext
**Validates: Requirements 3.2**

### Property 7: Key rotation invalidates old key
*For any* API Key rotation operation, the old key SHALL immediately become invalid for authentication
**Validates: Requirements 4.2**

## Error Handling

| Scenario | HTTP Status | Response Body |
|----------|-------------|---------------|
| No API Key provided | 401 | `{ "error": "API Key required", "code": "NO_API_KEY" }` |
| Invalid API Key | 401 | `{ "error": "Invalid API Key", "code": "INVALID_API_KEY" }` |
| Revoked API Key | 401 | `{ "error": "API Key has been revoked", "code": "REVOKED_API_KEY" }` |
| Insufficient permissions | 403 | `{ "error": "Insufficient permissions", "code": "FORBIDDEN" }` |
| Instance not found | 404 | `{ "error": "Instance not found", "code": "INSTANCE_NOT_FOUND" }` |

## Testing Strategy

### Unit Tests
- ApiKeyService: geração, hash, validação
- ApiKeyGuard: lógica de autorização
- Decorators: extração de payload

### Property-Based Tests (usando fast-check)
- Testar que qualquer key gerada tem entropia suficiente
- Testar que hash nunca é reversível
- Testar que rotação sempre invalida key anterior

### Integration Tests
- Fluxo completo de autenticação
- Acesso a endpoints com diferentes tipos de key
- Revogação e rotação de keys

## Migration Strategy

1. **Fase 1**: Adicionar novo sistema de API Keys (paralelo ao JWT)
2. **Fase 2**: Migrar endpoints para aceitar ambos
3. **Fase 3**: Migrar dados existentes (criar API Keys para instâncias)
4. **Fase 4**: Remover código JWT
5. **Fase 5**: Integrar frontend na API

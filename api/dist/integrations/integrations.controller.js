"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const integrations_service_1 = require("./integrations.service");
const integration_dto_1 = require("./dto/integration.dto");
const axios_1 = __importDefault(require("axios"));
let IntegrationsController = class IntegrationsController {
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    findAll(req) {
        return this.integrationsService.findAll(req.user.id);
    }
    async createTypebot(dto, req) {
        if (dto.enabled) {
            if (!dto.apiUrl || !dto.publicName) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Typebot requer API URL e Public Name',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            try {
                const apiUrl = dto.apiUrl.endsWith('/') ? dto.apiUrl.slice(0, -1) : dto.apiUrl;
                await axios_1.default.get(`${apiUrl}/api/v1/typebots/${dto.publicName}`, { timeout: 10000 });
            }
            catch (error) {
                if (error.response?.status === 404) {
                    throw new common_1.HttpException({
                        success: false,
                        message: `Typebot "${dto.publicName}" não encontrado. Verifique o Public Name.`,
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
                if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Não foi possível conectar ao servidor Typebot. Verifique a URL.',
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
            }
        }
        const result = await this.integrationsService.createTypebot(dto, req.user.id);
        return {
            ...result,
            success: true,
            message: 'Integração Typebot configurada com sucesso!',
        };
    }
    async testTypebot(dto) {
        if (!dto.apiUrl || !dto.publicName) {
            throw new common_1.HttpException({
                success: false,
                message: 'API URL e Public Name são obrigatórios para testar',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const apiUrl = dto.apiUrl.endsWith('/') ? dto.apiUrl.slice(0, -1) : dto.apiUrl;
            const response = await axios_1.default.get(`${apiUrl}/api/v1/typebots/${dto.publicName}`, { timeout: 10000 });
            const typebotData = response.data?.typebot || response.data;
            return {
                success: true,
                message: `Conexão com Typebot OK! Bot "${typebotData?.name || dto.publicName}" encontrado.`,
                typebot: {
                    id: typebotData?.id,
                    name: typebotData?.name,
                    publicId: typebotData?.publicId || dto.publicName,
                },
            };
        }
        catch (error) {
            const errorMessage = error.response?.status === 404
                ? `Typebot "${dto.publicName}" não encontrado`
                : error.response?.status === 401
                    ? 'Acesso não autorizado ao Typebot'
                    : error.code === 'ECONNREFUSED'
                        ? 'Servidor Typebot não acessível'
                        : error.code === 'ENOTFOUND'
                            ? 'URL do Typebot não encontrada'
                            : 'Erro: ' + (error.message || 'Verifique as configurações');
            throw new common_1.HttpException({
                success: false,
                message: errorMessage,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createN8n(dto, req) {
        if (dto.enabled) {
            if (!dto.webhookUrl) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'n8n requer Webhook URL',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            try {
                const url = new URL(dto.webhookUrl);
                if (!url.protocol.startsWith('http')) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'URL do webhook n8n inválida. Use http:// ou https://',
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            catch (error) {
                if (error instanceof common_1.HttpException)
                    throw error;
                throw new common_1.HttpException({
                    success: false,
                    message: 'URL do webhook n8n inválida',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const result = await this.integrationsService.createN8n(dto, req.user.id);
        return {
            ...result,
            success: true,
            message: 'Integração n8n configurada com sucesso!',
        };
    }
    async testN8n(dto) {
        if (!dto.webhookUrl) {
            throw new common_1.HttpException({
                success: false,
                message: 'Webhook URL é obrigatório para testar',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const url = new URL(dto.webhookUrl);
            if (!url.protocol.startsWith('http')) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'URL inválida. Use http:// ou https://',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const headers = { 'Content-Type': 'application/json' };
            if (dto.basicAuthUser && dto.basicAuthPassword) {
                const auth = Buffer.from(`${dto.basicAuthUser}:${dto.basicAuthPassword}`).toString('base64');
                headers['Authorization'] = `Basic ${auth}`;
            }
            const testPayload = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Teste de conexão GO-API',
            };
            const response = await axios_1.default.post(dto.webhookUrl, testPayload, {
                headers,
                timeout: 15000,
                validateStatus: (status) => status < 500,
            });
            if (response.status >= 200 && response.status < 400) {
                return {
                    success: true,
                    message: `Conexão com n8n OK! Webhook respondeu com status ${response.status}.`,
                    response: {
                        status: response.status,
                        data: response.data,
                    },
                };
            }
            else {
                return {
                    success: true,
                    message: `Webhook acessível, mas retornou status ${response.status}. Verifique a configuração do workflow.`,
                    response: {
                        status: response.status,
                    },
                };
            }
        }
        catch (error) {
            const errorMessage = error.response?.status === 401
                ? 'Autenticação falhou. Verifique usuário e senha.'
                : error.response?.status === 404
                    ? 'Webhook não encontrado. Verifique a URL.'
                    : error.code === 'ECONNREFUSED'
                        ? 'Servidor n8n não acessível'
                        : error.code === 'ENOTFOUND'
                            ? 'URL não encontrada'
                            : error.code === 'ETIMEDOUT'
                                ? 'Timeout - servidor demorou para responder'
                                : 'Erro: ' + (error.message || 'Verifique as configurações');
            throw new common_1.HttpException({
                success: false,
                message: errorMessage,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createChatwoot(dto, req) {
        if (dto.enabled) {
            if (!dto.url || !dto.accountId || !dto.token) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Chatwoot requer URL, Account ID e Token',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            try {
                const baseUrl = dto.url.endsWith('/') ? dto.url.slice(0, -1) : dto.url;
                const response = await axios_1.default.get(`${baseUrl}/api/v1/accounts/${dto.accountId}/inboxes`, {
                    headers: {
                        'Content-Type': 'application/json',
                        api_access_token: dto.token,
                    },
                    timeout: 10000,
                });
                if (response.status !== 200) {
                    throw new Error('Falha na conexão');
                }
            }
            catch (error) {
                const errorMessage = error.response?.status === 401
                    ? 'Token do Chatwoot inválido ou sem permissão'
                    : error.response?.status === 404
                        ? 'Account ID do Chatwoot não encontrado'
                        : error.code === 'ECONNREFUSED'
                            ? 'Não foi possível conectar ao servidor Chatwoot'
                            : error.code === 'ENOTFOUND'
                                ? 'URL do Chatwoot não encontrada'
                                : 'Erro ao conectar com Chatwoot: ' + (error.message || 'Verifique as credenciais');
                throw new common_1.HttpException({
                    success: false,
                    message: errorMessage,
                    details: error.response?.data || null,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const result = await this.integrationsService.createChatwoot(dto, req.user.id);
        return {
            ...result,
            success: true,
            message: 'Integração Chatwoot configurada com sucesso! Conexão validada.',
        };
    }
    async testChatwoot(dto) {
        if (!dto.url || !dto.accountId || !dto.token) {
            throw new common_1.HttpException({
                success: false,
                message: 'URL, Account ID e Token são obrigatórios para testar',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const baseUrl = dto.url.endsWith('/') ? dto.url.slice(0, -1) : dto.url;
            const response = await axios_1.default.get(`${baseUrl}/api/v1/accounts/${dto.accountId}/inboxes`, {
                headers: {
                    'Content-Type': 'application/json',
                    api_access_token: dto.token,
                },
                timeout: 10000,
            });
            const inboxes = response.data?.payload || [];
            return {
                success: true,
                message: `Conexão com Chatwoot OK! ${inboxes.length} inbox(es) encontrada(s).`,
                inboxes: inboxes.map((i) => ({ id: i.id, name: i.name })),
            };
        }
        catch (error) {
            const errorMessage = error.response?.status === 401
                ? 'Token inválido ou sem permissão'
                : error.response?.status === 404
                    ? 'Account ID não encontrado'
                    : error.code === 'ECONNREFUSED'
                        ? 'Servidor Chatwoot não acessível'
                        : error.code === 'ENOTFOUND'
                            ? 'URL não encontrada'
                            : 'Erro: ' + (error.message || 'Verifique as credenciais');
            throw new common_1.HttpException({
                success: false,
                message: errorMessage,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    update(id, dto, req) {
        return this.integrationsService.update(id, dto, req.user.id);
    }
    delete(id, req) {
        return this.integrationsService.delete(id, req.user.id);
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('typebot'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [integration_dto_1.CreateTypebotDto, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "createTypebot", null);
__decorate([
    (0, common_1.Post)('typebot/test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [integration_dto_1.CreateTypebotDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "testTypebot", null);
__decorate([
    (0, common_1.Post)('n8n'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [integration_dto_1.CreateN8nDto, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "createN8n", null);
__decorate([
    (0, common_1.Post)('n8n/test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [integration_dto_1.CreateN8nDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "testN8n", null);
__decorate([
    (0, common_1.Post)('chatwoot'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [integration_dto_1.CreateChatwootDto, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "createChatwoot", null);
__decorate([
    (0, common_1.Post)('chatwoot/test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [integration_dto_1.CreateChatwootDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "testChatwoot", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, integration_dto_1.UpdateIntegrationDto, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "delete", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, common_1.Controller)('integrations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map
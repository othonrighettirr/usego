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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma.service");
const typebot_service_1 = require("./typebot.service");
const n8n_service_1 = require("./n8n.service");
const chatwoot_service_1 = require("./chatwoot.service");
const baileys_service_1 = require("../instances/baileys.service");
let IntegrationsService = class IntegrationsService {
    constructor(prisma, typebotService, n8nService, chatwootService, baileys) {
        this.prisma = prisma;
        this.typebotService = typebotService;
        this.n8nService = n8nService;
        this.chatwootService = chatwootService;
        this.baileys = baileys;
    }
    async findAll(userId) {
        return this.prisma.integration.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findByType(userId, type) {
        return this.prisma.integration.findFirst({
            where: { userId, type }
        });
    }
    async upsertIntegration(userId, type, config, active = true) {
        const existing = await this.findByType(userId, type);
        let result;
        if (existing) {
            result = await this.prisma.integration.update({
                where: { id: existing.id },
                data: { config, active },
            });
        }
        else {
            result = await this.prisma.integration.create({
                data: { userId, type, config, active },
            });
        }
        await this.syncIntegrationCallbacks(userId, type, active);
        return result;
    }
    async syncIntegrationCallbacks(userId, type, active) {
        const instances = await this.prisma.instance.findMany({
            where: { userId },
        });
        for (const instance of instances) {
            const isConnected = this.baileys.getStatus(instance.id) === 'CONNECTED';
            if (!isConnected)
                continue;
            if (type === 'typebot') {
                if (active) {
                    this.typebotService.registerInstance(instance.id);
                }
                else {
                    this.typebotService.unregisterInstance(instance.id);
                }
            }
            else if (type === 'n8n') {
                if (active) {
                    this.n8nService.registerInstance(instance.id);
                }
                else {
                    this.n8nService.unregisterInstance(instance.id);
                }
            }
            else if (type === 'chatwoot') {
                if (active) {
                    this.chatwootService.registerInstance(instance.id);
                }
                else {
                    this.chatwootService.unregisterInstance(instance.id);
                }
            }
        }
    }
    async createTypebot(dto, userId) {
        const config = {
            enabled: dto.enabled !== false,
            description: dto.description || '',
            apiUrl: dto.apiUrl || '',
            publicName: dto.publicName || '',
            triggerType: dto.triggerType || 'keyword',
            triggerOperator: dto.triggerOperator || 'contains',
            keyword: dto.keyword || '',
            expireMinutes: dto.expireMinutes || 0,
            keywordFinish: dto.keywordFinish || '',
            delayMessage: dto.delayMessage || 1000,
            unknownMessage: dto.unknownMessage || '',
            listeningFromMe: dto.listeningFromMe || false,
            stopBotFromMe: dto.stopBotFromMe || false,
            keepOpen: dto.keepOpen || false,
            debounceTime: dto.debounceTime || 10,
        };
        return this.upsertIntegration(userId, 'typebot', config, dto.enabled !== false);
    }
    async createN8n(dto, userId) {
        const config = {
            enabled: dto.enabled !== false,
            description: dto.description || '',
            webhookUrl: dto.webhookUrl || '',
            basicAuthUser: dto.basicAuthUser || '',
            basicAuthPassword: dto.basicAuthPassword || '',
            triggerType: dto.triggerType || 'keyword',
            triggerOperator: dto.triggerOperator || 'contains',
            keyword: dto.keyword || '',
            expireMinutes: dto.expireMinutes || 0,
            keywordFinish: dto.keywordFinish || '',
            delayMessage: dto.delayMessage || 1000,
            unknownMessage: dto.unknownMessage || '',
            listeningFromMe: dto.listeningFromMe || false,
            stopBotFromMe: dto.stopBotFromMe || false,
            keepOpen: dto.keepOpen || false,
            debounceTime: dto.debounceTime || 10,
            splitMessages: dto.splitMessages || false,
        };
        return this.upsertIntegration(userId, 'n8n', config, dto.enabled !== false);
    }
    async createChatwoot(dto, userId) {
        const config = {
            enabled: dto.enabled !== false,
            sqs: dto.sqs || false,
            url: dto.url || '',
            accountId: dto.accountId || '',
            token: dto.token || '',
            signMessages: dto.signMessages || false,
            signDelimiter: dto.signDelimiter || '\\n',
            nameInbox: dto.nameInbox || '',
            organization: dto.organization || '',
            logo: dto.logo || '',
            conversationPending: dto.conversationPending || false,
            reopenConversation: dto.reopenConversation !== false,
            importContacts: dto.importContacts || false,
            importMessages: dto.importMessages || false,
            daysLimitImport: dto.daysLimitImport || 3,
            ignoreJids: dto.ignoreJids || '',
            autoCreate: dto.autoCreate !== false,
        };
        return this.upsertIntegration(userId, 'chatwoot', config, dto.enabled !== false);
    }
    async update(id, dto, userId) {
        const integration = await this.prisma.integration.findFirst({
            where: { id, userId }
        });
        if (!integration)
            throw new common_1.NotFoundException('Integração não encontrada');
        return this.prisma.integration.update({
            where: { id },
            data: dto
        });
    }
    async delete(id, userId) {
        const integration = await this.prisma.integration.findFirst({
            where: { id, userId }
        });
        if (!integration)
            throw new common_1.NotFoundException('Integração não encontrada');
        await this.prisma.integration.delete({ where: { id } });
        return { message: 'Integração removida' };
    }
    async toggleActive(id, userId, active) {
        const integration = await this.prisma.integration.findFirst({
            where: { id, userId }
        });
        if (!integration)
            throw new common_1.NotFoundException('Integração não encontrada');
        return this.prisma.integration.update({
            where: { id },
            data: { active },
        });
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => typebot_service_1.TypebotService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => n8n_service_1.N8nService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => chatwoot_service_1.ChatwootService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => baileys_service_1.BaileysService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        typebot_service_1.TypebotService,
        n8n_service_1.N8nService,
        chatwoot_service_1.ChatwootService,
        baileys_service_1.BaileysService])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map
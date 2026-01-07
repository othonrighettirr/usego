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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma.service");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WebhooksService_1.name);
    }
    async findAll(userId) {
        return this.prisma.webhook.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }
    async create(dto, userId) {
        return this.prisma.webhook.create({ data: { ...dto, userId } });
    }
    async update(id, dto, userId) {
        const webhook = await this.prisma.webhook.findFirst({ where: { id, userId } });
        if (!webhook)
            throw new common_1.NotFoundException('Webhook não encontrado');
        return this.prisma.webhook.update({ where: { id }, data: dto });
    }
    async delete(id, userId) {
        const webhook = await this.prisma.webhook.findFirst({ where: { id, userId } });
        if (!webhook)
            throw new common_1.NotFoundException('Webhook não encontrado');
        await this.prisma.webhook.delete({ where: { id } });
        return { message: 'Webhook removido' };
    }
    async trigger(instanceId, event, data) {
        const instance = await this.prisma.instance.findUnique({ where: { id: instanceId } });
        if (!instance)
            return;
        const webhooks = await this.prisma.webhook.findMany({
            where: { userId: instance.userId, active: true, events: { has: event } },
        });
        for (const webhook of webhooks) {
            try {
                await fetch(webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event, instanceId, data, timestamp: new Date().toISOString() }),
                });
            }
            catch (err) {
                this.logger.error(`Webhook ${webhook.id} falhou: ${err.message}`);
            }
        }
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map
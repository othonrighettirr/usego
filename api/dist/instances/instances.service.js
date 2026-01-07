"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma.service");
const baileys_service_1 = require("./baileys.service");
const typebot_service_1 = require("../integrations/typebot.service");
const n8n_service_1 = require("../integrations/n8n.service");
const chatwoot_service_1 = require("../integrations/chatwoot.service");
const QRCode = __importStar(require("qrcode"));
const crypto = __importStar(require("crypto"));
let InstancesService = class InstancesService {
    constructor(prisma, baileys, typebot, n8n, chatwoot) {
        this.prisma = prisma;
        this.baileys = baileys;
        this.typebot = typebot;
        this.n8n = n8n;
        this.chatwoot = chatwoot;
    }
    async findAll(userId) {
        const instances = await this.prisma.instance.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return instances.map((i) => ({
            ...i,
            status: this.baileys.getStatus(i.id) || i.status,
            phone: this.baileys.getPhone(i.id),
            profilePic: this.baileys.getProfilePic(i.id),
            profileName: this.baileys.getProfileName(i.id),
            apiKey: i.apiKey,
        }));
    }
    async findOne(id, userId) {
        const instance = await this.prisma.instance.findFirst({
            where: { id, userId },
        });
        if (!instance)
            throw new common_1.NotFoundException('Instância não encontrada');
        return {
            ...instance,
            status: this.baileys.getStatus(id) || instance.status,
            phone: this.baileys.getPhone(id),
            profilePic: this.baileys.getProfilePic(id),
            profileName: this.baileys.getProfileName(id),
            apiKey: instance.apiKey,
        };
    }
    async create(dto, userId) {
        const apiKey = crypto.randomBytes(32).toString('hex');
        return this.prisma.instance.create({
            data: { name: dto.name, userId, apiKey },
        });
    }
    async update(id, dto, userId) {
        await this.findOne(id, userId);
        return this.prisma.instance.update({
            where: { id },
            data: { name: dto.name },
        });
    }
    async delete(id, userId) {
        await this.findOne(id, userId);
        await this.baileys.deleteSession(id);
        await this.prisma.instance.delete({ where: { id } });
        return { message: 'Instância removida com sucesso' };
    }
    async connect(id, userId) {
        await this.findOne(id, userId);
        const qr = await this.baileys.connect(id);
        this.typebot.registerInstance(id);
        this.n8n.registerInstance(id);
        this.chatwoot.registerInstance(id);
        await this.prisma.instance.update({
            where: { id },
            data: { status: qr ? 'WAITING_QR' : 'CONNECTED' },
        });
        return { qr, status: qr ? 'WAITING_QR' : 'CONNECTED' };
    }
    async disconnect(id, userId) {
        await this.findOne(id, userId);
        await this.baileys.disconnect(id);
        await this.prisma.instance.update({
            where: { id },
            data: { status: 'DISCONNECTED' },
        });
        return { message: 'Desconectado com sucesso' };
    }
    async reconnect(id, userId) {
        await this.findOne(id, userId);
        const qr = await this.baileys.reconnect(id);
        this.typebot.registerInstance(id);
        this.n8n.registerInstance(id);
        this.chatwoot.registerInstance(id);
        await this.prisma.instance.update({
            where: { id },
            data: { status: qr ? 'WAITING_QR' : 'CONNECTED' },
        });
        return { qr, status: qr ? 'WAITING_QR' : 'CONNECTED' };
    }
    async restart(id, userId) {
        await this.findOne(id, userId);
        await this.baileys.restart(id);
        this.typebot.registerInstance(id);
        this.n8n.registerInstance(id);
        this.chatwoot.registerInstance(id);
        return { message: 'Instância reiniciada com sucesso' };
    }
    async getQR(id, userId) {
        await this.findOne(id, userId);
        const qr = this.baileys.getQR(id);
        const status = this.baileys.getStatus(id);
        if (status === 'CONNECTED') {
            return {
                status: 'CONNECTED',
                qrCode: null,
                phone: this.baileys.getPhone(id),
                profilePic: this.baileys.getProfilePic(id),
                profileName: this.baileys.getProfileName(id),
            };
        }
        if (!qr) {
            return { status: 'WAITING', qrCode: null };
        }
        const qrCode = await QRCode.toDataURL(qr);
        return { status: 'QR_READY', qrCode };
    }
    async getSettings(id, userId) {
        await this.findOne(id, userId);
        return this.baileys.getSettings(id);
    }
    async updateSettings(id, dto, userId) {
        await this.findOne(id, userId);
        return this.baileys.setSettings(id, dto);
    }
    async createSharedToken(instanceId, userId, expiresInHours = 24, permissions = ['view_qr']) {
        const instance = await this.prisma.instance.findFirst({
            where: { id: instanceId, userId },
        });
        if (!instance)
            throw new common_1.NotFoundException('Instância não encontrada');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
        await this.prisma.sharedToken.create({
            data: {
                instanceId,
                token,
                permissions,
                expiresAt,
            },
        });
        return { token, expiresAt };
    }
    async getSharedQR(token) {
        const tokenData = await this.prisma.sharedToken.findUnique({
            where: { token },
            include: { instance: true },
        });
        if (!tokenData) {
            throw new common_1.BadRequestException('Token inválido ou expirado');
        }
        if (new Date() > tokenData.expiresAt) {
            await this.prisma.sharedToken.delete({ where: { id: tokenData.id } });
            throw new common_1.BadRequestException('Token expirado');
        }
        const instance = tokenData.instance;
        if (!instance) {
            throw new common_1.NotFoundException('Instância não encontrada');
        }
        const qr = this.baileys.getQR(tokenData.instanceId);
        const status = this.baileys.getStatus(tokenData.instanceId);
        if (status === 'CONNECTED') {
            return {
                status: 'CONNECTED',
                qrCode: null,
                instanceName: instance.name,
            };
        }
        if (!qr) {
            await this.baileys.connect(tokenData.instanceId);
            return {
                status: 'WAITING',
                qrCode: null,
                instanceName: instance.name,
            };
        }
        const qrCode = await QRCode.toDataURL(qr);
        return {
            status: 'QR_READY',
            qrCode,
            instanceName: instance.name,
        };
    }
};
exports.InstancesService = InstancesService;
exports.InstancesService = InstancesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => typebot_service_1.TypebotService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => n8n_service_1.N8nService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => chatwoot_service_1.ChatwootService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        baileys_service_1.BaileysService,
        typebot_service_1.TypebotService,
        n8n_service_1.N8nService,
        chatwoot_service_1.ChatwootService])
], InstancesService);
//# sourceMappingURL=instances.service.js.map
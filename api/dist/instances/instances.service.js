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
        for (const instance of instances) {
            if (!instance.apiKey) {
                const apiKey = crypto.randomBytes(32).toString('hex');
                await this.prisma.instance.update({
                    where: { id: instance.id },
                    data: { apiKey },
                });
                instance.apiKey = apiKey;
            }
        }
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
        let qr = null;
        try {
            qr = await this.baileys.connect(id);
        }
        catch (error) {
            console.error(`Erro ao conectar instância ${id}:`, error);
            throw new common_1.BadRequestException(`Erro ao conectar: ${error.message || 'Erro desconhecido'}`);
        }
        try {
            this.typebot.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar Typebot para ${id}:`, e);
        }
        try {
            this.n8n.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar N8n para ${id}:`, e);
        }
        try {
            this.chatwoot.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar Chatwoot para ${id}:`, e);
        }
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
        let qr = null;
        try {
            qr = await this.baileys.reconnect(id);
        }
        catch (error) {
            console.error(`Erro ao reconectar instância ${id}:`, error);
            throw new common_1.BadRequestException(`Erro ao reconectar: ${error.message || 'Erro desconhecido'}`);
        }
        try {
            this.typebot.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar Typebot para ${id}:`, e);
        }
        try {
            this.n8n.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar N8n para ${id}:`, e);
        }
        try {
            this.chatwoot.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar Chatwoot para ${id}:`, e);
        }
        await this.prisma.instance.update({
            where: { id },
            data: { status: qr ? 'WAITING_QR' : 'CONNECTED' },
        });
        return { qr, status: qr ? 'WAITING_QR' : 'CONNECTED' };
    }
    async restart(id, userId) {
        await this.findOne(id, userId);
        try {
            await this.baileys.restart(id);
        }
        catch (error) {
            console.error(`Erro ao reiniciar instância ${id}:`, error);
            throw new common_1.BadRequestException(`Erro ao reiniciar: ${error.message || 'Erro desconhecido'}`);
        }
        try {
            this.typebot.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar Typebot para ${id}:`, e);
        }
        try {
            this.n8n.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar N8n para ${id}:`, e);
        }
        try {
            this.chatwoot.registerInstance(id);
        }
        catch (e) {
            console.warn(`Erro ao registrar Chatwoot para ${id}:`, e);
        }
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
    async createSharedToken(instanceId, userId, expiresInHours = 168, permissions = ['view_qr']) {
        console.log(`[SharedToken] Criando token para instância ${instanceId}, userId: ${userId}, expiresInHours: ${expiresInHours}`);
        const instance = await this.prisma.instance.findFirst({
            where: { id: instanceId, userId },
        });
        if (!instance) {
            console.log(`[SharedToken] Instância não encontrada: ${instanceId}`);
            throw new common_1.NotFoundException('Instância não encontrada');
        }
        const deleted = await this.prisma.sharedToken.deleteMany({
            where: { instanceId },
        });
        console.log(`[SharedToken] Tokens antigos deletados: ${deleted.count}`);
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
        const created = await this.prisma.sharedToken.create({
            data: {
                instanceId,
                token,
                permissions,
                expiresAt,
            },
        });
        console.log(`[SharedToken] Token criado: ${token.substring(0, 10)}..., expira em: ${expiresAt}`);
        return { token, expiresAt };
    }
    async getSharedQR(token) {
        console.log(`[SharedQR] Buscando token: ${token}`);
        const tokenData = await this.prisma.sharedToken.findUnique({
            where: { token },
            include: { instance: true },
        });
        if (!tokenData) {
            console.log(`[SharedQR] Token não encontrado no banco: ${token}`);
            throw new common_1.BadRequestException('Token inválido ou expirado');
        }
        console.log(`[SharedQR] Token encontrado, instanceId: ${tokenData.instanceId}, expiresAt: ${tokenData.expiresAt}`);
        if (new Date() > tokenData.expiresAt) {
            console.log(`[SharedQR] Token expirado: ${token}`);
            await this.prisma.sharedToken.delete({ where: { id: tokenData.id } });
            throw new common_1.BadRequestException('Token expirado');
        }
        const instance = tokenData.instance;
        if (!instance) {
            console.log(`[SharedQR] Instância não encontrada para token: ${token}`);
            throw new common_1.NotFoundException('Instância não encontrada');
        }
        const instanceId = tokenData.instanceId;
        let status = this.baileys.getStatus(instanceId);
        let qr = this.baileys.getQR(instanceId);
        console.log(`[SharedQR] Status atual: ${status}, QR disponível: ${!!qr}`);
        if (status === 'CONNECTED') {
            return {
                status: 'CONNECTED',
                qrCode: null,
                instanceName: instance.name,
            };
        }
        if (!qr && status !== 'CONNECTING') {
            try {
                console.log(`[SharedQR] Iniciando conexão para instância ${instanceId}`);
                const connectResult = await this.baileys.connect(instanceId);
                await new Promise(resolve => setTimeout(resolve, 2000));
                qr = this.baileys.getQR(instanceId);
                status = this.baileys.getStatus(instanceId);
                console.log(`[SharedQR] Após conexão - Status: ${status}, QR disponível: ${!!qr}`);
                if (status === 'CONNECTED') {
                    return {
                        status: 'CONNECTED',
                        qrCode: null,
                        instanceName: instance.name,
                    };
                }
            }
            catch (error) {
                console.error(`[SharedQR] Erro ao conectar instância ${instanceId}:`, error);
            }
        }
        if (!qr) {
            console.log(`[SharedQR] QR ainda não disponível, retornando WAITING`);
            return {
                status: 'WAITING',
                qrCode: null,
                instanceName: instance.name,
            };
        }
        console.log(`[SharedQR] Gerando QR Code em base64`);
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
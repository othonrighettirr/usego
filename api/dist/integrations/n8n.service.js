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
var N8nService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nService = void 0;
const common_1 = require("@nestjs/common");
const baileys_service_1 = require("../instances/baileys.service");
const axios_1 = __importDefault(require("axios"));
let N8nService = N8nService_1 = class N8nService {
    constructor(baileys) {
        this.baileys = baileys;
        this.logger = new common_1.Logger(N8nService_1.name);
        this.sessions = new Map();
        this.debounceTimers = new Map();
        this.messageBuffer = new Map();
        this.registeredInstances = new Set();
    }
    async onModuleInit() {
        this.logger.log('N8nService inicializado');
    }
    registerInstance(instanceId) {
        if (this.registeredInstances.has(instanceId))
            return;
        this.baileys.onMessage(instanceId, async (remoteJid, message, fromMe) => {
            await this.processMessage(instanceId, remoteJid, message, fromMe);
        }, `n8n_${instanceId}`);
        this.registeredInstances.add(instanceId);
        this.logger.log(`n8n registrado para instância ${instanceId}`);
    }
    unregisterInstance(instanceId) {
        this.registeredInstances.delete(instanceId);
        this.baileys.offMessage(instanceId, `n8n_${instanceId}`);
    }
    shouldTrigger(message, config) {
        if (config.triggerType === 'all')
            return true;
        if (config.triggerType === 'none')
            return false;
        if (config.triggerType === 'keyword' && config.keyword) {
            const keyword = config.keyword.toLowerCase();
            const msg = message.toLowerCase();
            switch (config.triggerOperator) {
                case 'equals': return msg === keyword;
                case 'startsWith': return msg.startsWith(keyword);
                case 'endsWith': return msg.endsWith(keyword);
                case 'regex': return new RegExp(config.keyword, 'i').test(message);
                case 'contains':
                default: return msg.includes(keyword);
            }
        }
        return false;
    }
    shouldFinish(message, config) {
        if (!config.keywordFinish)
            return false;
        return message.toLowerCase() === config.keywordFinish.toLowerCase();
    }
    getSessionKey(instanceId, remoteJid) {
        return `${instanceId}:${remoteJid}`;
    }
    async processMessage(instanceId, remoteJid, message, fromMe) {
        try {
            if (remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast')
                return;
            const ignoredAutoMessages = [
                'Workflow was started',
                'Workflow executed successfully',
                'Workflow executed',
                'workflow was started',
                'workflow executed successfully',
                'workflow executed',
            ];
            const messageLower = message.toLowerCase().trim();
            if (ignoredAutoMessages.some(ignored => messageLower === ignored.toLowerCase() || message.includes(ignored))) {
                this.logger.debug(`n8n: Ignorando mensagem automática: "${message}" (fromMe: ${fromMe})`);
                return;
            }
            const settings = this.baileys.getSettings(instanceId);
            const config = settings.n8n;
            if (!config) {
                this.logger.debug(`n8n: Nenhuma configuração n8n para instância ${instanceId}`);
                return;
            }
            if (!config.enabled) {
                this.logger.debug('n8n: Integração desabilitada');
                return;
            }
            if (!config.webhookUrl) {
                this.logger.warn('n8n não configurado: falta webhookUrl');
                return;
            }
            this.logger.debug(`n8n: Processando mensagem de ${remoteJid}: "${message}"`);
            if (fromMe && !config.listeningFromMe)
                return;
            if (fromMe && config.stopBotFromMe) {
                this.endSession(instanceId, remoteJid);
                return;
            }
            const sessionKey = this.getSessionKey(instanceId, remoteJid);
            const existingSession = this.sessions.get(sessionKey);
            if (this.shouldFinish(message, config)) {
                this.endSession(instanceId, remoteJid);
                return;
            }
            if (existingSession && config.expireMinutes > 0) {
                const elapsed = (Date.now() - existingSession.lastActivity.getTime()) / 1000 / 60;
                if (elapsed > config.expireMinutes) {
                    this.endSession(instanceId, remoteJid);
                }
            }
            if (!this.sessions.has(sessionKey)) {
                const shouldTrigger = this.shouldTrigger(message, config);
                this.logger.debug(`n8n: Trigger check - type: ${config.triggerType}, keyword: ${config.keyword}, result: ${shouldTrigger}`);
                if (!shouldTrigger) {
                    if (config.unknownMessage) {
                        await this.sendMessage(instanceId, remoteJid, config.unknownMessage, config.delayMessage);
                    }
                    return;
                }
                this.sessions.set(sessionKey, { lastActivity: new Date(), active: true });
                this.logger.log(`n8n: Nova sessão criada para ${remoteJid}`);
            }
            if (config.debounceTime > 0) {
                this.addToBuffer(sessionKey, message);
                this.scheduleDebounce(sessionKey, instanceId, remoteJid, config);
            }
            else {
                await this.sendToN8n(instanceId, remoteJid, message, config);
            }
        }
        catch (error) {
            this.logger.error(`Erro ao processar mensagem n8n: ${error.message}`);
        }
    }
    addToBuffer(sessionKey, message) {
        const buffer = this.messageBuffer.get(sessionKey) || [];
        buffer.push(message);
        this.messageBuffer.set(sessionKey, buffer);
    }
    scheduleDebounce(sessionKey, instanceId, remoteJid, config) {
        const existingTimer = this.debounceTimers.get(sessionKey);
        if (existingTimer)
            clearTimeout(existingTimer);
        const timer = setTimeout(async () => {
            const messages = this.messageBuffer.get(sessionKey) || [];
            this.messageBuffer.delete(sessionKey);
            this.debounceTimers.delete(sessionKey);
            if (messages.length > 0) {
                const combinedMessage = config.splitMessages ? messages : [messages.join(' ')];
                for (const msg of combinedMessage) {
                    await this.sendToN8n(instanceId, remoteJid, Array.isArray(msg) ? msg.join(' ') : msg, config);
                }
            }
        }, config.debounceTime * 1000);
        this.debounceTimers.set(sessionKey, timer);
    }
    async sendToN8n(instanceId, remoteJid, message, config) {
        try {
            const sessionKey = this.getSessionKey(instanceId, remoteJid);
            this.logger.log(`n8n: Enviando para webhook: ${config.webhookUrl}`);
            const headers = { 'Content-Type': 'application/json' };
            if (config.basicAuthUser && config.basicAuthPassword) {
                const auth = Buffer.from(`${config.basicAuthUser}:${config.basicAuthPassword}`).toString('base64');
                headers['Authorization'] = `Basic ${auth}`;
            }
            const payload = {
                instanceId,
                remoteJid,
                message,
                pushName: remoteJid.split('@')[0],
                timestamp: new Date().toISOString(),
            };
            this.logger.debug(`n8n: Payload: ${JSON.stringify(payload)}`);
            const response = await axios_1.default.post(config.webhookUrl, payload, { headers, timeout: 30000 });
            this.logger.log(`n8n: Resposta recebida - status: ${response.status}`);
            const session = this.sessions.get(sessionKey);
            if (session) {
                session.lastActivity = new Date();
                this.sessions.set(sessionKey, session);
            }
            const ignoredResponses = [
                'Workflow was started',
                'Workflow executed successfully',
                'success',
                'ok',
                'OK',
                'Success',
            ];
            if (response.data) {
                this.logger.debug(`n8n: Dados da resposta: ${JSON.stringify(response.data)}`);
                const isIgnoredResponse = (msg) => {
                    if (!msg || typeof msg !== 'string')
                        return true;
                    const trimmed = msg.trim();
                    return ignoredResponses.includes(trimmed) || trimmed === '';
                };
                if (typeof response.data === 'string' && response.data.trim()) {
                    if (!isIgnoredResponse(response.data)) {
                        await this.sendMessage(instanceId, remoteJid, response.data, config.delayMessage);
                    }
                    else {
                        this.logger.debug(`n8n: Ignorando resposta automática: "${response.data}"`);
                    }
                }
                else if (response.data.message) {
                    if (!isIgnoredResponse(response.data.message)) {
                        await this.sendMessage(instanceId, remoteJid, response.data.message, config.delayMessage);
                    }
                    else {
                        this.logger.debug(`n8n: Ignorando resposta automática: "${response.data.message}"`);
                    }
                }
                else if (response.data.messages && Array.isArray(response.data.messages)) {
                    for (const msg of response.data.messages) {
                        if (!isIgnoredResponse(msg)) {
                            if (config.delayMessage > 0) {
                                await new Promise(resolve => setTimeout(resolve, config.delayMessage));
                            }
                            await this.sendMessage(instanceId, remoteJid, msg);
                        }
                    }
                }
            }
            if (!config.keepOpen && response.data?.endSession) {
                this.endSession(instanceId, remoteJid);
            }
        }
        catch (error) {
            this.logger.error(`Erro ao comunicar com n8n: ${error.message}`);
            if (error.response) {
                this.logger.error(`n8n response error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
        }
    }
    async sendMessage(instanceId, remoteJid, text, delay = 0) {
        if (delay > 0)
            await new Promise(resolve => setTimeout(resolve, delay));
        const socket = this.baileys.getSocket(instanceId);
        if (socket) {
            await socket.sendMessage(remoteJid, { text });
        }
    }
    endSession(instanceId, remoteJid) {
        const sessionKey = this.getSessionKey(instanceId, remoteJid);
        this.sessions.delete(sessionKey);
        this.messageBuffer.delete(sessionKey);
        const timer = this.debounceTimers.get(sessionKey);
        if (timer) {
            clearTimeout(timer);
            this.debounceTimers.delete(sessionKey);
        }
        this.logger.log(`Sessão n8n finalizada: ${sessionKey}`);
    }
};
exports.N8nService = N8nService;
exports.N8nService = N8nService = N8nService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => baileys_service_1.BaileysService))),
    __metadata("design:paramtypes", [baileys_service_1.BaileysService])
], N8nService);
//# sourceMappingURL=n8n.service.js.map
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
var TypebotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypebotService = void 0;
const common_1 = require("@nestjs/common");
const baileys_service_1 = require("../instances/baileys.service");
const axios_1 = __importDefault(require("axios"));
let TypebotService = TypebotService_1 = class TypebotService {
    constructor(baileys) {
        this.baileys = baileys;
        this.logger = new common_1.Logger(TypebotService_1.name);
        this.sessions = new Map();
        this.debounceTimers = new Map();
        this.messageBuffer = new Map();
        this.registeredInstances = new Set();
    }
    async onModuleInit() {
        this.logger.log('TypebotService inicializado');
    }
    registerInstance(instanceId) {
        if (this.registeredInstances.has(instanceId))
            return;
        this.baileys.onMessage(instanceId, async (remoteJid, message, fromMe) => {
            await this.processMessage(instanceId, remoteJid, message, fromMe);
        }, `typebot_${instanceId}`);
        this.registeredInstances.add(instanceId);
        this.logger.log(`Typebot registrado para instância ${instanceId}`);
    }
    unregisterInstance(instanceId) {
        this.registeredInstances.delete(instanceId);
        this.baileys.offMessage(instanceId, `typebot_${instanceId}`);
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
            const settings = this.baileys.getSettings(instanceId);
            const config = settings.typebot;
            if (!config) {
                this.logger.debug(`Typebot: Nenhuma configuração para instância ${instanceId}`);
                return;
            }
            if (!config.enabled)
                return;
            if (!config.apiUrl || !config.publicName) {
                this.logger.warn('Typebot não configurado corretamente: falta apiUrl ou publicName');
                return;
            }
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
                if (!this.shouldTrigger(message, config)) {
                    if (config.unknownMessage) {
                        await this.sendMessage(instanceId, remoteJid, config.unknownMessage, config.delayMessage);
                    }
                    return;
                }
            }
            if (config.debounceTime > 0) {
                this.addToBuffer(sessionKey, message);
                this.scheduleDebounce(sessionKey, instanceId, remoteJid, config);
            }
            else {
                await this.sendToTypebot(instanceId, remoteJid, message, config);
            }
        }
        catch (error) {
            this.logger.error(`Erro ao processar mensagem Typebot: ${error.message}`);
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
                const combinedMessage = messages.join(' ');
                await this.sendToTypebot(instanceId, remoteJid, combinedMessage, config);
            }
        }, config.debounceTime * 1000);
        this.debounceTimers.set(sessionKey, timer);
    }
    async sendToTypebot(instanceId, remoteJid, message, config) {
        try {
            const sessionKey = this.getSessionKey(instanceId, remoteJid);
            let session = this.sessions.get(sessionKey);
            const apiUrl = config.apiUrl.endsWith('/') ? config.apiUrl.slice(0, -1) : config.apiUrl;
            if (!session) {
                this.logger.log(`Typebot: Iniciando nova sessão para ${remoteJid}`);
                const startResponse = await axios_1.default.post(`${apiUrl}/api/v1/typebots/${config.publicName}/startChat`, {
                    message,
                    prefilledVariables: {
                        remoteJid,
                        instanceId,
                        pushName: remoteJid.split('@')[0],
                        phoneNumber: remoteJid.split('@')[0],
                    },
                }, { timeout: 30000 });
                this.logger.debug(`Typebot: startChat response: ${JSON.stringify(startResponse.data)}`);
                session = {
                    sessionId: startResponse.data.sessionId,
                    typebotId: config.publicName,
                    lastActivity: new Date(),
                };
                this.sessions.set(sessionKey, session);
                if (startResponse.data.messages && startResponse.data.messages.length > 0) {
                    await this.processTypebotMessages(instanceId, remoteJid, startResponse.data.messages, config.delayMessage);
                }
                return;
            }
            this.logger.log(`Typebot: Continuando sessão ${session.sessionId}`);
            const response = await axios_1.default.post(`${apiUrl}/api/v1/sessions/${session.sessionId}/continueChat`, { message }, { timeout: 30000 });
            this.logger.debug(`Typebot: continueChat response: ${JSON.stringify(response.data)}`);
            session.lastActivity = new Date();
            this.sessions.set(sessionKey, session);
            if (response.data.messages && response.data.messages.length > 0) {
                await this.processTypebotMessages(instanceId, remoteJid, response.data.messages, config.delayMessage);
            }
            if (!config.keepOpen && response.data.input === null) {
                this.endSession(instanceId, remoteJid);
            }
        }
        catch (error) {
            this.logger.error(`Erro ao comunicar com Typebot: ${error.message}`);
            if (error.response) {
                this.logger.error(`Typebot response error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            if (error.response?.status === 404 || error.response?.status === 400) {
                const sessionKey = this.getSessionKey(instanceId, remoteJid);
                this.sessions.delete(sessionKey);
                this.logger.log('Typebot: Sessão removida, será criada nova na próxima mensagem');
            }
        }
    }
    async processTypebotMessages(instanceId, remoteJid, messages, delayMs) {
        for (const msg of messages) {
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            try {
                switch (msg.type) {
                    case 'text':
                        let text = '';
                        if (msg.content?.richText) {
                            text = this.extractTextFromRichText(msg.content.richText);
                        }
                        else if (msg.content?.plainText) {
                            text = msg.content.plainText;
                        }
                        else if (typeof msg.content === 'string') {
                            text = msg.content;
                        }
                        if (text) {
                            await this.sendMessage(instanceId, remoteJid, text);
                        }
                        break;
                    case 'image':
                        if (msg.content?.url) {
                            await this.sendImage(instanceId, remoteJid, msg.content.url, msg.content?.caption);
                        }
                        break;
                    case 'video':
                        if (msg.content?.url) {
                            await this.sendVideo(instanceId, remoteJid, msg.content.url, msg.content?.caption);
                        }
                        break;
                    case 'audio':
                        if (msg.content?.url) {
                            await this.sendAudio(instanceId, remoteJid, msg.content.url);
                        }
                        break;
                    default:
                        if (msg.content?.plainText) {
                            await this.sendMessage(instanceId, remoteJid, msg.content.plainText);
                        }
                        else if (typeof msg.content === 'string') {
                            await this.sendMessage(instanceId, remoteJid, msg.content);
                        }
                }
            }
            catch (error) {
                this.logger.error(`Erro ao processar mensagem Typebot tipo ${msg.type}: ${error.message}`);
            }
        }
    }
    extractTextFromRichText(richText) {
        if (!Array.isArray(richText))
            return '';
        return richText.map(block => {
            if (block.children && Array.isArray(block.children)) {
                return block.children.map((child) => {
                    if (typeof child.text === 'string')
                        return child.text;
                    if (child.children)
                        return this.extractTextFromRichText([child]);
                    return '';
                }).join('');
            }
            if (typeof block.text === 'string')
                return block.text;
            return '';
        }).join('\n');
    }
    async sendMessage(instanceId, remoteJid, text, delay = 0) {
        if (!text || !text.trim())
            return;
        if (delay > 0)
            await new Promise(resolve => setTimeout(resolve, delay));
        const socket = this.baileys.getSocket(instanceId);
        if (socket) {
            await socket.sendMessage(remoteJid, { text: text.trim() });
            this.logger.debug(`Typebot: Mensagem enviada para ${remoteJid}`);
        }
    }
    async sendImage(instanceId, remoteJid, url, caption) {
        const socket = this.baileys.getSocket(instanceId);
        if (socket) {
            await socket.sendMessage(remoteJid, {
                image: { url },
                caption: caption || undefined
            });
            this.logger.debug(`Typebot: Imagem enviada para ${remoteJid}`);
        }
    }
    async sendVideo(instanceId, remoteJid, url, caption) {
        const socket = this.baileys.getSocket(instanceId);
        if (socket) {
            await socket.sendMessage(remoteJid, {
                video: { url },
                caption: caption || undefined
            });
            this.logger.debug(`Typebot: Vídeo enviado para ${remoteJid}`);
        }
    }
    async sendAudio(instanceId, remoteJid, url) {
        const socket = this.baileys.getSocket(instanceId);
        if (socket) {
            await socket.sendMessage(remoteJid, { audio: { url }, ptt: true });
            this.logger.debug(`Typebot: Áudio enviado para ${remoteJid}`);
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
        this.logger.log(`Sessão Typebot finalizada: ${sessionKey}`);
    }
};
exports.TypebotService = TypebotService;
exports.TypebotService = TypebotService = TypebotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => baileys_service_1.BaileysService))),
    __metadata("design:paramtypes", [baileys_service_1.BaileysService])
], TypebotService);
//# sourceMappingURL=typebot.service.js.map
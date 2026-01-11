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
var ChatwootService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatwootService = void 0;
const common_1 = require("@nestjs/common");
const baileys_service_1 = require("../instances/baileys.service");
const axios_1 = __importDefault(require("axios"));
let ChatwootService = ChatwootService_1 = class ChatwootService {
    constructor(baileys) {
        this.baileys = baileys;
        this.logger = new common_1.Logger(ChatwootService_1.name);
        this.registeredInstances = new Set();
        this.contacts = new Map();
        this.conversations = new Map();
        this.inboxes = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
    }
    async onModuleInit() {
        this.logger.log('ChatwootService inicializado');
        setInterval(() => this.cleanCache(), this.CACHE_TTL);
    }
    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.contacts) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.contacts.delete(key);
            }
        }
        for (const [key, value] of this.conversations) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.conversations.delete(key);
            }
        }
        for (const [key, value] of this.inboxes) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.inboxes.delete(key);
            }
        }
    }
    registerInstance(instanceId) {
        if (this.registeredInstances.has(instanceId)) {
            this.logger.debug(`Chatwoot: Instância ${instanceId} já registrada`);
            return;
        }
        this.baileys.onMessage(instanceId, async (remoteJid, message, fromMe) => {
            this.processMessage(instanceId, remoteJid, message, fromMe).catch(err => {
                this.logger.error(`Chatwoot: Erro ao processar mensagem: ${err.message}`);
            });
        }, `chatwoot_${instanceId}`);
        this.registeredInstances.add(instanceId);
        this.logger.log(`Chatwoot: Registrado para instância ${instanceId}`);
    }
    unregisterInstance(instanceId) {
        this.registeredInstances.delete(instanceId);
        this.baileys.offMessage(instanceId, `chatwoot_${instanceId}`);
        this.logger.log(`Chatwoot: Desregistrado da instância ${instanceId}`);
    }
    getContactKey(instanceId, remoteJid) {
        return `${instanceId}:${remoteJid}`;
    }
    shouldIgnore(remoteJid, config) {
        if (!config.ignoreJids)
            return false;
        const ignoreList = config.ignoreJids.split(',').map((j) => j.trim());
        return ignoreList.some((jid) => remoteJid.includes(jid));
    }
    async processMessage(instanceId, remoteJid, message, fromMe) {
        const startTime = Date.now();
        try {
            if (remoteJid.endsWith('@g.us') ||
                remoteJid === 'status@broadcast' ||
                remoteJid.endsWith('@newsletter') ||
                remoteJid.endsWith('@broadcast') ||
                remoteJid.endsWith('@lid')) {
                this.logger.debug(`Chatwoot: Ignorando JID não suportado: ${remoteJid}`);
                return;
            }
            const phoneNumber = remoteJid.split('@')[0];
            if (!/^\d{10,15}$/.test(phoneNumber)) {
                this.logger.debug(`Chatwoot: Ignorando JID com número inválido: ${remoteJid}`);
                return;
            }
            const settings = this.baileys.getSettings(instanceId);
            const config = settings.chatwoot;
            if (!config) {
                this.logger.debug(`Chatwoot: Nenhuma configuração para instância ${instanceId}`);
                return;
            }
            if (!config.enabled) {
                this.logger.debug('Chatwoot: Integração desabilitada');
                return;
            }
            if (!config.url || !config.accountId || !config.token) {
                this.logger.warn('Chatwoot não configurado: falta url, accountId ou token');
                return;
            }
            if (this.shouldIgnore(remoteJid, config)) {
                this.logger.debug(`Chatwoot: JID ${remoteJid} está na lista de ignorados`);
                return;
            }
            this.logger.log(`Chatwoot: Processando mensagem de ${remoteJid}: "${message.substring(0, 50)}..."`);
            let inboxId = this.getCachedInbox(instanceId);
            if (!inboxId) {
                inboxId = await this.getOrCreateInbox(instanceId, config);
                if (inboxId) {
                    this.setCachedInbox(instanceId, inboxId);
                }
            }
            if (!inboxId) {
                this.logger.error('Chatwoot: Não foi possível obter/criar inbox');
                return;
            }
            const contactKey = this.getContactKey(instanceId, remoteJid);
            let contact = this.getCachedContact(contactKey);
            if (!contact) {
                contact = await this.getOrCreateContact(remoteJid, config, inboxId);
                if (contact) {
                    this.setCachedContact(contactKey, contact);
                }
            }
            if (!contact) {
                this.logger.error('Chatwoot: Não foi possível obter/criar contato');
                return;
            }
            let conversation = this.getCachedConversation(contactKey);
            if (!conversation || (config.reopenConversation && !fromMe)) {
                conversation = await this.getOrCreateConversation(contact, config, inboxId);
                if (conversation) {
                    this.setCachedConversation(contactKey, conversation);
                }
            }
            if (!conversation) {
                this.logger.error('Chatwoot: Não foi possível obter/criar conversa');
                return;
            }
            await this.sendMessageToChatwoot(conversation.id, message, fromMe, config);
            const elapsed = Date.now() - startTime;
            this.logger.log(`Chatwoot: Mensagem processada em ${elapsed}ms para conversa ${conversation.id}`);
        }
        catch (error) {
            this.logger.error(`Erro ao processar mensagem Chatwoot: ${error.message}`);
            if (error.response?.data) {
                this.logger.error(`Chatwoot API Error: ${JSON.stringify(error.response.data)}`);
            }
        }
    }
    getCachedInbox(instanceId) {
        const cached = this.inboxes.get(instanceId);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.id;
        }
        return null;
    }
    setCachedInbox(instanceId, id) {
        this.inboxes.set(instanceId, { id, timestamp: Date.now() });
    }
    getCachedContact(key) {
        const cached = this.contacts.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        return null;
    }
    setCachedContact(key, data) {
        this.contacts.set(key, { data, timestamp: Date.now() });
    }
    getCachedConversation(key) {
        const cached = this.conversations.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        return null;
    }
    setCachedConversation(key, data) {
        this.conversations.set(key, { data, timestamp: Date.now() });
    }
    async getOrCreateInbox(instanceId, config) {
        try {
            const headers = this.getHeaders(config);
            const baseUrl = this.getBaseUrl(config);
            const response = await axios_1.default.get(`${baseUrl}/inboxes`, { headers, timeout: 10000 });
            const inboxName = config.nameInbox || `WhatsApp - ${instanceId.slice(0, 8)}`;
            const existingInbox = response.data?.payload?.find((inbox) => inbox.name === inboxName);
            if (existingInbox) {
                this.logger.debug(`Chatwoot: Inbox encontrada: ${existingInbox.id}`);
                return existingInbox.id;
            }
            if (config.autoCreate) {
                const createResponse = await axios_1.default.post(`${baseUrl}/inboxes`, {
                    name: inboxName,
                    channel: {
                        type: 'api',
                        webhook_url: '',
                    },
                }, { headers, timeout: 10000 });
                this.logger.log(`Chatwoot: Nova inbox criada: ${createResponse.data?.id}`);
                return createResponse.data?.id;
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao obter/criar inbox: ${error.message}`);
            return null;
        }
    }
    async getOrCreateContact(remoteJid, config, inboxId) {
        try {
            const headers = this.getHeaders(config);
            const baseUrl = this.getBaseUrl(config);
            const phoneNumber = remoteJid.split('@')[0];
            try {
                const searchResponse = await axios_1.default.get(`${baseUrl}/contacts/search`, {
                    headers,
                    params: { q: phoneNumber },
                    timeout: 10000,
                });
                const existingContact = searchResponse.data?.payload?.find((c) => c.phone_number === `+${phoneNumber}` ||
                    c.phone_number === phoneNumber ||
                    c.identifier === remoteJid);
                if (existingContact) {
                    this.logger.debug(`Chatwoot: Contato encontrado: ${existingContact.id}`);
                    await this.ensureContactInbox(existingContact.id, inboxId, remoteJid, config);
                    return {
                        id: existingContact.id,
                        sourceId: remoteJid,
                        name: existingContact.name || phoneNumber,
                    };
                }
            }
            catch (searchError) {
                this.logger.debug(`Chatwoot: Busca de contato falhou: ${searchError.message}`);
            }
            const createResponse = await axios_1.default.post(`${baseUrl}/contacts`, {
                inbox_id: inboxId,
                name: phoneNumber,
                phone_number: `+${phoneNumber}`,
                identifier: remoteJid,
            }, { headers, timeout: 10000 });
            const contactData = createResponse.data?.payload?.contact || createResponse.data?.payload;
            const contactId = contactData?.id;
            if (contactId) {
                this.logger.log(`Chatwoot: Novo contato criado: ${contactId}`);
                return {
                    id: contactId,
                    sourceId: remoteJid,
                    name: phoneNumber,
                };
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao obter/criar contato: ${error.message}`);
            if (error.response) {
                this.logger.error(`Chatwoot response: ${JSON.stringify(error.response.data)}`);
            }
            return null;
        }
    }
    async ensureContactInbox(contactId, inboxId, sourceId, config) {
        try {
            const headers = this.getHeaders(config);
            const baseUrl = this.getBaseUrl(config);
            await axios_1.default.post(`${baseUrl}/contacts/${contactId}/contact_inboxes`, {
                inbox_id: inboxId,
                source_id: sourceId,
            }, { headers, timeout: 10000 });
        }
        catch (error) {
            if (error.response?.status !== 422) {
                this.logger.debug(`Chatwoot: Erro ao criar contact_inbox: ${error.message}`);
            }
        }
    }
    async getOrCreateConversation(contact, config, inboxId) {
        try {
            const headers = this.getHeaders(config);
            const baseUrl = this.getBaseUrl(config);
            try {
                const searchResponse = await axios_1.default.get(`${baseUrl}/contacts/${contact.id}/conversations`, {
                    headers,
                    timeout: 10000,
                });
                const conversations = searchResponse.data?.payload || [];
                const openConversation = conversations.find((c) => c.status === 'open' || c.status === 'pending');
                if (openConversation) {
                    this.logger.debug(`Chatwoot: Conversa encontrada: ${openConversation.id}`);
                    return {
                        id: openConversation.id,
                        contactId: contact.id,
                        inboxId: inboxId,
                    };
                }
            }
            catch (searchError) {
                this.logger.debug(`Chatwoot: Busca de conversa falhou: ${searchError.message}`);
            }
            const status = config.conversationPending ? 'pending' : 'open';
            const createResponse = await axios_1.default.post(`${baseUrl}/conversations`, {
                source_id: contact.sourceId,
                inbox_id: inboxId,
                contact_id: contact.id,
                status: status,
            }, { headers, timeout: 10000 });
            const conversationId = createResponse.data?.id || createResponse.data?.payload?.id;
            if (conversationId) {
                this.logger.log(`Chatwoot: Nova conversa criada: ${conversationId}`);
                return {
                    id: conversationId,
                    contactId: contact.id,
                    inboxId: inboxId,
                };
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao obter/criar conversa: ${error.message}`);
            if (error.response) {
                this.logger.error(`Chatwoot response: ${JSON.stringify(error.response.data)}`);
            }
            return null;
        }
    }
    async sendMessageToChatwoot(conversationId, message, fromMe, config) {
        try {
            const headers = this.getHeaders(config);
            const baseUrl = this.getBaseUrl(config);
            const messageType = fromMe ? 'outgoing' : 'incoming';
            let content = message;
            if (config.signMessages && fromMe) {
                const delimiter = config.signDelimiter || '\n';
                content = `${config.organization || 'Bot'}${delimiter}${message}`;
            }
            await axios_1.default.post(`${baseUrl}/conversations/${conversationId}/messages`, {
                content: content,
                message_type: messageType,
                private: false,
            }, { headers, timeout: 10000 });
            this.logger.debug(`Chatwoot: Mensagem enviada para conversa ${conversationId}`);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem para Chatwoot: ${error.message}`);
        }
    }
    async sendToWhatsApp(instanceId, remoteJid, message) {
        try {
            const socket = this.baileys.getSocket(instanceId);
            if (socket) {
                await socket.sendMessage(remoteJid, { text: message });
                this.logger.debug(`Chatwoot: Mensagem enviada para WhatsApp ${remoteJid}`);
            }
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem para WhatsApp: ${error.message}`);
        }
    }
    getHeaders(config) {
        return {
            'Content-Type': 'application/json',
            api_access_token: config.token,
        };
    }
    getBaseUrl(config) {
        const url = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
        return `${url}/api/v1/accounts/${config.accountId}`;
    }
};
exports.ChatwootService = ChatwootService;
exports.ChatwootService = ChatwootService = ChatwootService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => baileys_service_1.BaileysService))),
    __metadata("design:paramtypes", [baileys_service_1.BaileysService])
], ChatwootService);
//# sourceMappingURL=chatwoot.service.js.map
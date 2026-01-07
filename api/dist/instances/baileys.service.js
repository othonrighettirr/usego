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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BaileysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaileysService = void 0;
const common_1 = require("@nestjs/common");
const baileys_1 = __importStar(require("baileys"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pino_1 = __importDefault(require("pino"));
const socks_proxy_agent_1 = require("socks-proxy-agent");
const https_proxy_agent_1 = require("https-proxy-agent");
let BaileysService = BaileysService_1 = class BaileysService {
    constructor() {
        this.logger = new common_1.Logger(BaileysService_1.name);
        this.sockets = new Map();
        this.settings = new Map();
        this.qrCallbacks = new Map();
        this.statusCallbacks = new Map();
        this.messageCallbacks = new Map();
        this.reconnecting = new Map();
        this.reconnectAttempts = new Map();
    }
    getSocket(instanceId) {
        return this.sockets.get(instanceId)?.socket;
    }
    getQR(instanceId) {
        return this.sockets.get(instanceId)?.qr || null;
    }
    getStatus(instanceId) {
        return this.sockets.get(instanceId)?.status || 'DISCONNECTED';
    }
    getPhone(instanceId) {
        return this.sockets.get(instanceId)?.phone || null;
    }
    getProfilePic(instanceId) {
        return this.sockets.get(instanceId)?.profilePic || null;
    }
    getProfileName(instanceId) {
        return this.sockets.get(instanceId)?.name || null;
    }
    getPushName(instanceId, jid) {
        return this.sockets.get(instanceId)?.pushNames.get(jid) || null;
    }
    getPushNames(instanceId) {
        return this.sockets.get(instanceId)?.pushNames || new Map();
    }
    getContacts(instanceId) {
        return this.sockets.get(instanceId)?.contacts || new Map();
    }
    getContact(instanceId, jid) {
        return this.sockets.get(instanceId)?.contacts.get(jid) || null;
    }
    getLidMappings(instanceId) {
        return this.sockets.get(instanceId)?.lidMappings || new Map();
    }
    getLidMapping(instanceId, lid) {
        return this.sockets.get(instanceId)?.lidMappings.get(lid) || null;
    }
    getNewsletters(instanceId) {
        const newsletters = this.sockets.get(instanceId)?.newsletters;
        if (!newsletters)
            return [];
        return Array.from(newsletters.values());
    }
    getSettings(instanceId) {
        return this.settings.get(instanceId) || {
            rejectCalls: false,
            ignoreGroups: false,
            alwaysOnline: false,
            readMessages: false,
            syncFullHistory: false,
            readStatus: false,
            proxy: {
                enabled: false,
                protocol: 'http',
                host: '',
                port: 0,
                username: '',
                password: '',
            },
        };
    }
    setSettings(instanceId, newSettings) {
        const current = this.getSettings(instanceId);
        const updatedProxy = newSettings.proxy
            ? { ...current.proxy, ...newSettings.proxy }
            : current.proxy;
        const updatedWebhook = newSettings.webhook
            ? { ...(current.webhook || { enabled: false, url: '', events: [] }), ...newSettings.webhook }
            : current.webhook;
        const updatedWebsocket = newSettings.websocket
            ? { ...(current.websocket || { enabled: false, events: [] }), ...newSettings.websocket }
            : current.websocket;
        const updatedRabbitmq = newSettings.rabbitmq
            ? { ...(current.rabbitmq || { enabled: false, uri: '', exchange: '', events: [] }), ...newSettings.rabbitmq }
            : current.rabbitmq;
        const updatedSqs = newSettings.sqs
            ? { ...(current.sqs || { enabled: false, accessKeyId: '', secretAccessKey: '', region: '', queueUrl: '', events: [] }), ...newSettings.sqs }
            : current.sqs;
        const updatedTypebot = newSettings.typebot
            ? { ...(current.typebot || { enabled: false, apiUrl: '', publicName: '', triggerType: 'keyword', triggerOperator: 'contains', keyword: '', expireMinutes: 0, keywordFinish: '', delayMessage: 1000, unknownMessage: '', listeningFromMe: false, stopBotFromMe: false, keepOpen: false, debounceTime: 10 }), ...newSettings.typebot }
            : current.typebot;
        const updatedN8n = newSettings.n8n
            ? { ...(current.n8n || { enabled: false, webhookUrl: '', basicAuthUser: '', basicAuthPassword: '', triggerType: 'keyword', triggerOperator: 'contains', keyword: '', expireMinutes: 0, keywordFinish: '', delayMessage: 1000, unknownMessage: '', listeningFromMe: false, stopBotFromMe: false, keepOpen: false, debounceTime: 10, splitMessages: false }), ...newSettings.n8n }
            : current.n8n;
        const updatedChatwoot = newSettings.chatwoot
            ? { ...(current.chatwoot || { enabled: false, url: '', accountId: '', token: '', signMessages: false, signDelimiter: '\\n', nameInbox: '', organization: '', logo: '', conversationPending: false, reopenConversation: true, importContacts: false, importMessages: false, daysLimitImport: 3, ignoreJids: '', autoCreate: true }), ...newSettings.chatwoot }
            : current.chatwoot;
        const updated = {
            rejectCalls: newSettings.rejectCalls ?? current.rejectCalls,
            ignoreGroups: newSettings.ignoreGroups ?? current.ignoreGroups,
            alwaysOnline: newSettings.alwaysOnline ?? current.alwaysOnline,
            readMessages: newSettings.readMessages ?? current.readMessages,
            syncFullHistory: newSettings.syncFullHistory ?? current.syncFullHistory,
            readStatus: newSettings.readStatus ?? current.readStatus,
            proxy: updatedProxy,
            webhook: updatedWebhook,
            websocket: updatedWebsocket,
            rabbitmq: updatedRabbitmq,
            sqs: updatedSqs,
            typebot: updatedTypebot,
            n8n: updatedN8n,
            chatwoot: updatedChatwoot,
        };
        this.settings.set(instanceId, updated);
        this.applySettings(instanceId);
        this.saveSettingsToFile(instanceId, updated);
        return updated;
    }
    applySettings(instanceId) {
        const instance = this.sockets.get(instanceId);
        const settings = this.getSettings(instanceId);
        if (!instance?.socket)
            return;
        const socket = instance.socket;
        if (settings.alwaysOnline) {
            socket.sendPresenceUpdate('available');
        }
    }
    saveSettingsToFile(instanceId, settings) {
        const settingsDir = path.join(process.cwd(), 'sessions', instanceId);
        if (!fs.existsSync(settingsDir)) {
            fs.mkdirSync(settingsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(settingsDir, 'settings.json'), JSON.stringify(settings, null, 2));
    }
    loadSettingsFromFile(instanceId) {
        const settingsPath = path.join(process.cwd(), 'sessions', instanceId, 'settings.json');
        if (fs.existsSync(settingsPath)) {
            try {
                return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
            }
            catch {
                return this.getSettings(instanceId);
            }
        }
        return this.getSettings(instanceId);
    }
    onQR(instanceId, callback) {
        this.qrCallbacks.set(instanceId, callback);
    }
    onStatus(instanceId, callback) {
        this.statusCallbacks.set(instanceId, callback);
    }
    onMessage(instanceId, callback, callbackId) {
        if (!this.messageCallbacks.has(instanceId)) {
            this.messageCallbacks.set(instanceId, new Map());
        }
        const id = callbackId || `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.messageCallbacks.get(instanceId).set(id, callback);
        return id;
    }
    offMessage(instanceId, callbackId) {
        const callbacks = this.messageCallbacks.get(instanceId);
        if (callbacks) {
            callbacks.delete(callbackId);
        }
    }
    createProxyAgent(proxy) {
        if (!proxy.enabled || !proxy.host || !proxy.port) {
            return undefined;
        }
        const auth = proxy.username && proxy.password
            ? `${proxy.username}:${proxy.password}@`
            : '';
        const proxyUrl = `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;
        this.logger.log(`Usando proxy: ${proxy.protocol}://${proxy.host}:${proxy.port}`);
        if (proxy.protocol === 'socks4' || proxy.protocol === 'socks5') {
            return new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
        }
        else {
            return new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
        }
    }
    async connect(instanceId) {
        try {
            const savedSettings = this.loadSettingsFromFile(instanceId);
            this.settings.set(instanceId, savedSettings);
            const authDir = path.join(process.cwd(), 'sessions', instanceId);
            if (!fs.existsSync(authDir)) {
                fs.mkdirSync(authDir, { recursive: true });
            }
            const logger = (0, pino_1.default)({ level: 'silent' });
            const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(authDir);
            const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
            const proxyAgent = this.createProxyAgent(savedSettings.proxy);
            const socket = (0, baileys_1.default)({
                version,
                logger,
                printQRInTerminal: false,
                auth: {
                    creds: state.creds,
                    keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
                },
                generateHighQualityLinkPreview: true,
                syncFullHistory: savedSettings.syncFullHistory,
                agent: proxyAgent,
                fetchAgent: proxyAgent,
            });
            this.sockets.set(instanceId, {
                socket,
                qr: null,
                status: 'CONNECTING',
                phone: null,
                profilePic: null,
                name: null,
                pushNames: new Map(),
                contacts: new Map(),
                lidMappings: new Map(),
                newsletters: new Map(),
            });
            socket.ev.on('creds.update', saveCreds);
            socket.ev.on('contacts.update', (updates) => {
                const instance = this.sockets.get(instanceId);
                if (!instance)
                    return;
                for (const contact of updates) {
                    if (contact.id) {
                        const existing = instance.contacts.get(contact.id) || { id: contact.id };
                        instance.contacts.set(contact.id, {
                            ...existing,
                            ...contact,
                        });
                        if (contact.notify) {
                            instance.pushNames.set(contact.id, contact.notify);
                        }
                    }
                }
            });
            socket.ev.on('contacts.upsert', (contacts) => {
                const instance = this.sockets.get(instanceId);
                if (!instance)
                    return;
                for (const contact of contacts) {
                    if (contact.id) {
                        instance.contacts.set(contact.id, {
                            id: contact.id,
                            name: contact.name,
                            notify: contact.notify,
                            verifiedName: contact.verifiedName,
                        });
                        const name = contact.notify || contact.name || contact.verifiedName;
                        if (name) {
                            instance.pushNames.set(contact.id, name);
                        }
                    }
                }
                this.logger.log(`Sincronizados ${contacts.length} contatos para instância ${instanceId}`);
            });
            socket.ev.on('chats.upsert', (chats) => {
                const instance = this.sockets.get(instanceId);
                if (!instance)
                    return;
                for (const chat of chats) {
                    if (chat.id?.endsWith('@newsletter')) {
                        instance.newsletters.set(chat.id, {
                            id: chat.id,
                            name: chat.name || chat.subject || 'Canal',
                            description: chat.description || '',
                            picture: chat.picture || null,
                        });
                    }
                }
            });
            socket.ev.on('messaging-history.set', ({ chats }) => {
                const instance = this.sockets.get(instanceId);
                if (!instance)
                    return;
                for (const chat of chats) {
                    if (chat.id?.endsWith('@newsletter')) {
                        instance.newsletters.set(chat.id, {
                            id: chat.id,
                            name: chat.name || chat.subject || 'Canal',
                            description: chat.description || '',
                            picture: chat.picture || null,
                        });
                    }
                }
                const newsletterCount = instance.newsletters.size;
                if (newsletterCount > 0) {
                    this.logger.log(`Encontrados ${newsletterCount} canais para instância ${instanceId}`);
                }
            });
            socket.ev.on('lid-mapping.update', (mapping) => {
                const instance = this.sockets.get(instanceId);
                if (!instance)
                    return;
                if (mapping.lid && mapping.pn) {
                    const phone = mapping.pn
                        .replace(/@s\.whatsapp\.net$/, '')
                        .replace(/@c\.us$/, '')
                        .split(':')[0];
                    instance.lidMappings.set(mapping.lid, phone);
                    const lidWithoutSuffix = mapping.lid.replace(/@lid$/, '').split(':')[0];
                    instance.lidMappings.set(lidWithoutSuffix, phone);
                    this.logger.debug(`Mapeamento LID->PN: ${mapping.lid} -> ${phone}`);
                }
            });
            socket.ev.on('messages.upsert', async (m) => {
                const settings = this.getSettings(instanceId);
                const instance = this.sockets.get(instanceId);
                for (const msg of m.messages) {
                    if (msg.pushName && msg.key.remoteJid && instance) {
                        const senderJid = msg.key.participant || msg.key.remoteJid;
                        instance.pushNames.set(senderJid, msg.pushName);
                    }
                    if (settings.ignoreGroups && msg.key.remoteJid?.endsWith('@g.us')) {
                        continue;
                    }
                    if (settings.readMessages && !msg.key.fromMe) {
                        await socket.readMessages([msg.key]);
                    }
                    const messageText = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        msg.message?.imageMessage?.caption ||
                        msg.message?.videoMessage?.caption || '';
                    if (messageText && msg.key.remoteJid && this.messageCallbacks.has(instanceId)) {
                        const callbacks = this.messageCallbacks.get(instanceId);
                        if (callbacks) {
                            for (const [, callback] of callbacks) {
                                try {
                                    callback(msg.key.remoteJid, messageText, msg.key.fromMe || false);
                                }
                                catch (err) {
                                    this.logger.error(`Erro ao executar callback de mensagem: ${err}`);
                                }
                            }
                        }
                    }
                }
            });
            socket.ev.on('call', async (calls) => {
                const settings = this.getSettings(instanceId);
                if (settings.rejectCalls) {
                    for (const call of calls) {
                        if (call.status === 'offer') {
                            await socket.rejectCall(call.id, call.from);
                            this.logger.log(`Chamada rejeitada de ${call.from}`);
                        }
                    }
                }
            });
            socket.ev.on('messages.update', async (updates) => {
                const settings = this.getSettings(instanceId);
                if (settings.readStatus) {
                    for (const update of updates) {
                        if (update.key.remoteJid === 'status@broadcast') {
                        }
                    }
                }
            });
            socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    const instance = this.sockets.get(instanceId);
                    if (instance)
                        instance.qr = qr;
                    this.qrCallbacks.get(instanceId)?.(qr);
                    this.logger.log(`QR Code gerado para instância ${instanceId}`);
                }
                if (connection === 'close') {
                    const reason = lastDisconnect?.error?.output?.statusCode;
                    const reasonMessage = lastDisconnect?.error?.message || 'Unknown';
                    const instance = this.sockets.get(instanceId);
                    if (instance)
                        instance.status = 'DISCONNECTED';
                    this.statusCallbacks.get(instanceId)?.('DISCONNECTED');
                    this.logger.warn(`Conexão fechada para ${instanceId}: ${reason} - ${reasonMessage}`);
                    if (this.reconnecting.get(instanceId)) {
                        this.logger.warn(`Instância ${instanceId} já está reconectando, ignorando...`);
                        return;
                    }
                    if (reason === baileys_1.DisconnectReason.loggedOut) {
                        this.logger.log(`Instância ${instanceId} deslogada pelo usuário`);
                        this.sockets.delete(instanceId);
                        this.reconnecting.delete(instanceId);
                        this.reconnectAttempts.delete(instanceId);
                        return;
                    }
                    if (reason === baileys_1.DisconnectReason.connectionReplaced) {
                        this.logger.warn(`Instância ${instanceId} substituída por outra conexão`);
                        this.sockets.delete(instanceId);
                        this.reconnecting.delete(instanceId);
                        this.reconnectAttempts.delete(instanceId);
                        return;
                    }
                    if (reason === baileys_1.DisconnectReason.forbidden || reason === 403) {
                        this.logger.error(`Instância ${instanceId} foi banida ou bloqueada`);
                        this.sockets.delete(instanceId);
                        this.reconnecting.delete(instanceId);
                        this.reconnectAttempts.delete(instanceId);
                        return;
                    }
                    const attempts = this.reconnectAttempts.get(instanceId) || 0;
                    if (attempts >= 3) {
                        this.logger.error(`Instância ${instanceId} falhou após 3 tentativas de reconexão`);
                        this.reconnecting.delete(instanceId);
                        this.reconnectAttempts.delete(instanceId);
                        return;
                    }
                    const shouldReconnect = [
                        baileys_1.DisconnectReason.connectionClosed,
                        baileys_1.DisconnectReason.connectionLost,
                        baileys_1.DisconnectReason.timedOut,
                        baileys_1.DisconnectReason.restartRequired,
                    ].includes(reason);
                    if (!shouldReconnect) {
                        this.logger.warn(`Instância ${instanceId} desconectada com razão ${reason}, não reconectando automaticamente`);
                        return;
                    }
                    this.reconnecting.set(instanceId, true);
                    this.reconnectAttempts.set(instanceId, attempts + 1);
                    const delay = Math.min(5000 * Math.pow(2, attempts), 60000);
                    this.logger.warn(`Reconectando instância ${instanceId} em ${delay}ms (tentativa ${attempts + 1}/3)...`);
                    setTimeout(async () => {
                        try {
                            await this.connect(instanceId);
                        }
                        catch (err) {
                            this.logger.error(`Erro ao reconectar ${instanceId}: ${err}`);
                        }
                        finally {
                            this.reconnecting.delete(instanceId);
                        }
                    }, delay);
                }
                if (connection === 'open') {
                    const instance = this.sockets.get(instanceId);
                    if (instance) {
                        instance.status = 'CONNECTED';
                        instance.qr = null;
                        this.reconnecting.delete(instanceId);
                        this.reconnectAttempts.delete(instanceId);
                        try {
                            const user = socket.user;
                            if (user) {
                                instance.phone = user.id.split(':')[0].split('@')[0];
                                instance.name = user.name || user.verifiedName || null;
                                try {
                                    const ppUrl = await socket.profilePictureUrl(user.id, 'image');
                                    instance.profilePic = ppUrl;
                                }
                                catch {
                                    instance.profilePic = null;
                                }
                            }
                        }
                        catch (e) {
                            this.logger.warn(`Erro ao obter perfil: ${e}`);
                        }
                        this.applySettings(instanceId);
                    }
                    this.statusCallbacks.get(instanceId)?.('CONNECTED');
                    this.logger.log(`Instância ${instanceId} conectada com sucesso!`);
                }
            });
            return new Promise((resolve) => {
                const checkQR = setInterval(() => {
                    const instance = this.sockets.get(instanceId);
                    if (instance?.qr) {
                        clearInterval(checkQR);
                        resolve(instance.qr);
                    }
                    if (instance?.status === 'CONNECTED') {
                        clearInterval(checkQR);
                        resolve(null);
                    }
                }, 500);
                setTimeout(() => {
                    clearInterval(checkQR);
                    resolve(this.sockets.get(instanceId)?.qr || null);
                }, 30000);
            });
        }
        catch (error) {
            this.logger.error(`Erro ao conectar instância ${instanceId}: ${error}`);
            throw error;
        }
    }
    async disconnect(instanceId) {
        const instance = this.sockets.get(instanceId);
        if (instance?.socket) {
            await instance.socket.logout();
            this.sockets.delete(instanceId);
        }
    }
    async deleteSession(instanceId) {
        await this.disconnect(instanceId);
        const authDir = path.join(process.cwd(), 'sessions', instanceId);
        if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true });
        }
        this.settings.delete(instanceId);
        this.reconnecting.delete(instanceId);
        this.reconnectAttempts.delete(instanceId);
    }
    async reconnect(instanceId) {
        this.reconnecting.delete(instanceId);
        this.reconnectAttempts.delete(instanceId);
        const instance = this.sockets.get(instanceId);
        if (instance?.socket) {
            try {
                instance.socket.end();
            }
            catch { }
            this.sockets.delete(instanceId);
        }
        return this.connect(instanceId);
    }
    async restart(instanceId) {
        this.reconnecting.delete(instanceId);
        this.reconnectAttempts.delete(instanceId);
        const instance = this.sockets.get(instanceId);
        if (instance?.socket) {
            try {
                instance.socket.end();
            }
            catch { }
            this.sockets.delete(instanceId);
        }
        await this.connect(instanceId);
        this.logger.log(`Instância ${instanceId} reiniciada`);
    }
};
exports.BaileysService = BaileysService;
exports.BaileysService = BaileysService = BaileysService_1 = __decorate([
    (0, common_1.Injectable)()
], BaileysService);
//# sourceMappingURL=baileys.service.js.map
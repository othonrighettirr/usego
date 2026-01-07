import { Injectable, Logger } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
} from 'baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import P from 'pino';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface SocketInstance {
  socket: any;
  qr: string | null;
  status: string;
  phone: string | null;
  profilePic: string | null;
  name: string | null;
  pushNames: Map<string, string>; // Armazena pushName por jid
  contacts: Map<string, { id: string; name?: string; notify?: string; verifiedName?: string }>; // Store de contatos
  lidMappings: Map<string, string>; // Mapeamento LID -> número de telefone
  newsletters: Map<string, { id: string; name?: string; description?: string; picture?: string }>; // Store de newsletters
}

export interface ProxySettings {
  enabled: boolean;
  protocol: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface WebhookSettings {
  enabled: boolean;
  url: string;
  events: string[];
}

export interface WebSocketSettings {
  enabled: boolean;
  events: string[];
}

export interface RabbitMQSettings {
  enabled: boolean;
  uri: string;
  exchange: string;
  events: string[];
}

export interface SQSSettings {
  enabled: boolean;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  queueUrl: string;
  events: string[];
}

export interface TypebotSettings {
  enabled: boolean;
  apiUrl: string;
  publicName: string;
  triggerType: string;
  triggerOperator: string;
  keyword: string;
  expireMinutes: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
}

export interface N8nSettings {
  enabled: boolean;
  webhookUrl: string;
  basicAuthUser: string;
  basicAuthPassword: string;
  triggerType: string;
  triggerOperator: string;
  keyword: string;
  expireMinutes: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  splitMessages: boolean;
}

export interface ChatwootSettings {
  enabled: boolean;
  url: string;
  accountId: string;
  token: string;
  signMessages: boolean;
  signDelimiter: string;
  nameInbox: string;
  organization: string;
  logo: string;
  conversationPending: boolean;
  reopenConversation: boolean;
  importContacts: boolean;
  importMessages: boolean;
  daysLimitImport: number;
  ignoreJids: string;
  autoCreate: boolean;
}

export interface InstanceSettings {
  rejectCalls: boolean;
  ignoreGroups: boolean;
  alwaysOnline: boolean;
  readMessages: boolean;
  syncFullHistory: boolean;
  readStatus: boolean;
  proxy: ProxySettings;
  webhook?: WebhookSettings;
  websocket?: WebSocketSettings;
  rabbitmq?: RabbitMQSettings;
  sqs?: SQSSettings;
  typebot?: TypebotSettings;
  n8n?: N8nSettings;
  chatwoot?: ChatwootSettings;
}

// Tipo para atualização parcial (aceita campos opcionais)
export type InstanceSettingsUpdate = {
  rejectCalls?: boolean;
  ignoreGroups?: boolean;
  alwaysOnline?: boolean;
  readMessages?: boolean;
  syncFullHistory?: boolean;
  readStatus?: boolean;
  proxy?: Partial<ProxySettings>;
  webhook?: Partial<WebhookSettings>;
  websocket?: Partial<WebSocketSettings>;
  rabbitmq?: Partial<RabbitMQSettings>;
  sqs?: Partial<SQSSettings>;
  typebot?: Partial<TypebotSettings>;
  n8n?: Partial<N8nSettings>;
  chatwoot?: Partial<ChatwootSettings>;
};

@Injectable()
export class BaileysService {
  private readonly logger = new Logger(BaileysService.name);
  private sockets: Map<string, SocketInstance> = new Map();
  private settings: Map<string, InstanceSettings> = new Map();
  private qrCallbacks: Map<string, (qr: string) => void> = new Map();
  private statusCallbacks: Map<string, (status: string) => void> = new Map();
  // Suporta múltiplos callbacks por instância (key: instanceId, value: Map<callbackId, callback>)
  private messageCallbacks: Map<string, Map<string, (remoteJid: string, message: string, fromMe: boolean) => void>> = new Map();
  // Controle de reconexão para evitar loops
  private reconnecting: Map<string, boolean> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();

  getSocket(instanceId: string) {
    return this.sockets.get(instanceId)?.socket;
  }

  getQR(instanceId: string) {
    return this.sockets.get(instanceId)?.qr || null;
  }

  getStatus(instanceId: string) {
    return this.sockets.get(instanceId)?.status || 'DISCONNECTED';
  }

  getPhone(instanceId: string) {
    return this.sockets.get(instanceId)?.phone || null;
  }

  getProfilePic(instanceId: string) {
    return this.sockets.get(instanceId)?.profilePic || null;
  }

  getProfileName(instanceId: string) {
    return this.sockets.get(instanceId)?.name || null;
  }

  getPushName(instanceId: string, jid: string): string | null {
    return this.sockets.get(instanceId)?.pushNames.get(jid) || null;
  }

  getPushNames(instanceId: string): Map<string, string> {
    return this.sockets.get(instanceId)?.pushNames || new Map();
  }

  getContacts(instanceId: string): Map<string, { id: string; name?: string; notify?: string; verifiedName?: string }> {
    return this.sockets.get(instanceId)?.contacts || new Map();
  }

  getContact(instanceId: string, jid: string): { id: string; name?: string; notify?: string; verifiedName?: string } | null {
    return this.sockets.get(instanceId)?.contacts.get(jid) || null;
  }

  getLidMappings(instanceId: string): Map<string, string> {
    return this.sockets.get(instanceId)?.lidMappings || new Map();
  }

  getLidMapping(instanceId: string, lid: string): string | null {
    return this.sockets.get(instanceId)?.lidMappings.get(lid) || null;
  }

  getNewsletters(instanceId: string): { id: string; name?: string; description?: string; picture?: string }[] {
    const newsletters = this.sockets.get(instanceId)?.newsletters;
    if (!newsletters) return [];
    return Array.from(newsletters.values());
  }

  getSettings(instanceId: string): InstanceSettings {
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

  setSettings(instanceId: string, newSettings: InstanceSettingsUpdate): InstanceSettings {
    const current = this.getSettings(instanceId);
    
    // Merge proxy settings separadamente
    const updatedProxy = newSettings.proxy 
      ? { ...current.proxy, ...newSettings.proxy }
      : current.proxy;

    // Merge webhook settings
    const updatedWebhook = newSettings.webhook 
      ? { ...(current.webhook || { enabled: false, url: '', events: [] }), ...newSettings.webhook }
      : current.webhook;

    // Merge websocket settings
    const updatedWebsocket = newSettings.websocket 
      ? { ...(current.websocket || { enabled: false, events: [] }), ...newSettings.websocket }
      : current.websocket;

    // Merge rabbitmq settings
    const updatedRabbitmq = newSettings.rabbitmq 
      ? { ...(current.rabbitmq || { enabled: false, uri: '', exchange: '', events: [] }), ...newSettings.rabbitmq }
      : current.rabbitmq;

    // Merge sqs settings
    const updatedSqs = newSettings.sqs 
      ? { ...(current.sqs || { enabled: false, accessKeyId: '', secretAccessKey: '', region: '', queueUrl: '', events: [] }), ...newSettings.sqs }
      : current.sqs;

    // Merge typebot settings
    const updatedTypebot = newSettings.typebot 
      ? { ...(current.typebot || { enabled: false, apiUrl: '', publicName: '', triggerType: 'keyword', triggerOperator: 'contains', keyword: '', expireMinutes: 0, keywordFinish: '', delayMessage: 1000, unknownMessage: '', listeningFromMe: false, stopBotFromMe: false, keepOpen: false, debounceTime: 10 }), ...newSettings.typebot }
      : current.typebot;

    // Merge n8n settings
    const updatedN8n = newSettings.n8n 
      ? { ...(current.n8n || { enabled: false, webhookUrl: '', basicAuthUser: '', basicAuthPassword: '', triggerType: 'keyword', triggerOperator: 'contains', keyword: '', expireMinutes: 0, keywordFinish: '', delayMessage: 1000, unknownMessage: '', listeningFromMe: false, stopBotFromMe: false, keepOpen: false, debounceTime: 10, splitMessages: false }), ...newSettings.n8n }
      : current.n8n;

    // Merge chatwoot settings
    const updatedChatwoot = newSettings.chatwoot 
      ? { ...(current.chatwoot || { enabled: false, url: '', accountId: '', token: '', signMessages: false, signDelimiter: '\\n', nameInbox: '', organization: '', logo: '', conversationPending: false, reopenConversation: true, importContacts: false, importMessages: false, daysLimitImport: 3, ignoreJids: '', autoCreate: true }), ...newSettings.chatwoot }
      : current.chatwoot;
    
    const updated: InstanceSettings = {
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
    
    // Aplicar configurações no socket ativo
    this.applySettings(instanceId);
    
    // Salvar em arquivo
    this.saveSettingsToFile(instanceId, updated);
    
    return updated;
  }

  private applySettings(instanceId: string) {
    const instance = this.sockets.get(instanceId);
    const settings = this.getSettings(instanceId);
    
    if (!instance?.socket) return;
    
    const socket = instance.socket;
    
    // Always Online
    if (settings.alwaysOnline) {
      socket.sendPresenceUpdate('available');
    }
  }

  private saveSettingsToFile(instanceId: string, settings: InstanceSettings) {
    const settingsDir = path.join(process.cwd(), 'sessions', instanceId);
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(settingsDir, 'settings.json'),
      JSON.stringify(settings, null, 2)
    );
  }

  private loadSettingsFromFile(instanceId: string): InstanceSettings {
    const settingsPath = path.join(process.cwd(), 'sessions', instanceId, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      try {
        return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      } catch {
        return this.getSettings(instanceId);
      }
    }
    return this.getSettings(instanceId);
  }

  onQR(instanceId: string, callback: (qr: string) => void) {
    this.qrCallbacks.set(instanceId, callback);
  }

  onStatus(instanceId: string, callback: (status: string) => void) {
    this.statusCallbacks.set(instanceId, callback);
  }

  onMessage(instanceId: string, callback: (remoteJid: string, message: string, fromMe: boolean) => void, callbackId?: string) {
    if (!this.messageCallbacks.has(instanceId)) {
      this.messageCallbacks.set(instanceId, new Map());
    }
    // Usar callbackId ou gerar um único baseado no timestamp
    const id = callbackId || `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.messageCallbacks.get(instanceId)!.set(id, callback);
    return id;
  }

  offMessage(instanceId: string, callbackId: string) {
    const callbacks = this.messageCallbacks.get(instanceId);
    if (callbacks) {
      callbacks.delete(callbackId);
    }
  }

  // Criar agent de proxy baseado nas configurações
  private createProxyAgent(proxy: ProxySettings): any {
    if (!proxy.enabled || !proxy.host || !proxy.port) {
      return undefined;
    }

    const auth = proxy.username && proxy.password 
      ? `${proxy.username}:${proxy.password}@` 
      : '';

    const proxyUrl = `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;

    this.logger.log(`Usando proxy: ${proxy.protocol}://${proxy.host}:${proxy.port}`);

    if (proxy.protocol === 'socks4' || proxy.protocol === 'socks5') {
      return new SocksProxyAgent(proxyUrl);
    } else {
      return new HttpsProxyAgent(proxyUrl);
    }
  }


  async connect(instanceId: string): Promise<string | null> {
    try {
      // Carregar configurações salvas
      const savedSettings = this.loadSettingsFromFile(instanceId);
      this.settings.set(instanceId, savedSettings);
      
      const authDir = path.join(process.cwd(), 'sessions', instanceId);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      const logger = P({ level: 'silent' });
      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      const { version } = await fetchLatestBaileysVersion();

      // Criar agent de proxy se configurado
      const proxyAgent = this.createProxyAgent(savedSettings.proxy);

      const socket = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
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

    // Evento de atualização de contatos
    socket.ev.on('contacts.update', (updates) => {
      const instance = this.sockets.get(instanceId);
      if (!instance) return;
      
      for (const contact of updates) {
        if (contact.id) {
          const existing = instance.contacts.get(contact.id) || { id: contact.id };
          instance.contacts.set(contact.id, {
            ...existing,
            ...contact,
          });
          
          // Também atualizar pushNames se tiver notify
          if (contact.notify) {
            instance.pushNames.set(contact.id, contact.notify);
          }
        }
      }
    });

    // Evento de contatos recebidos (sync inicial)
    socket.ev.on('contacts.upsert', (contacts) => {
      const instance = this.sockets.get(instanceId);
      if (!instance) return;
      
      for (const contact of contacts) {
        if (contact.id) {
          instance.contacts.set(contact.id, {
            id: contact.id,
            name: (contact as any).name,
            notify: (contact as any).notify,
            verifiedName: (contact as any).verifiedName,
          });
          
          // Também atualizar pushNames
          const name = (contact as any).notify || (contact as any).name || (contact as any).verifiedName;
          if (name) {
            instance.pushNames.set(contact.id, name);
          }
        }
      }
      this.logger.log(`Sincronizados ${contacts.length} contatos para instância ${instanceId}`);
    });

    // Evento de chats para capturar newsletters
    socket.ev.on('chats.upsert', (chats) => {
      const instance = this.sockets.get(instanceId);
      if (!instance) return;
      
      for (const chat of chats) {
        // Verificar se é uma newsletter (termina com @newsletter)
        if (chat.id?.endsWith('@newsletter')) {
          instance.newsletters.set(chat.id, {
            id: chat.id,
            name: (chat as any).name || (chat as any).subject || 'Canal',
            description: (chat as any).description || '',
            picture: (chat as any).picture || null,
          });
        }
      }
    });

    // Evento de mensagens para capturar newsletters
    socket.ev.on('messaging-history.set', ({ chats }) => {
      const instance = this.sockets.get(instanceId);
      if (!instance) return;
      
      for (const chat of chats) {
        if (chat.id?.endsWith('@newsletter')) {
          instance.newsletters.set(chat.id, {
            id: chat.id,
            name: (chat as any).name || (chat as any).subject || 'Canal',
            description: (chat as any).description || '',
            picture: (chat as any).picture || null,
          });
        }
      }
      
      const newsletterCount = instance.newsletters.size;
      if (newsletterCount > 0) {
        this.logger.log(`Encontrados ${newsletterCount} canais para instância ${instanceId}`);
      }
    });

    // Evento de mapeamento LID -> PN (para resolver LIDs para números de telefone)
    socket.ev.on('lid-mapping.update', (mapping) => {
      const instance = this.sockets.get(instanceId);
      if (!instance) return;
      
      // Armazenar o mapeamento no store para referência futura
      if (mapping.lid && mapping.pn) {
        // Extrair número do PN
        const phone = mapping.pn
          .replace(/@s\.whatsapp\.net$/, '')
          .replace(/@c\.us$/, '')
          .split(':')[0];
        
        // Armazenar mapeamento LID -> número
        instance.lidMappings.set(mapping.lid, phone);
        
        // Também armazenar sem o sufixo @lid para facilitar busca
        const lidWithoutSuffix = mapping.lid.replace(/@lid$/, '').split(':')[0];
        instance.lidMappings.set(lidWithoutSuffix, phone);
        
        this.logger.debug(`Mapeamento LID->PN: ${mapping.lid} -> ${phone}`);
      }
    });

    // Eventos de mensagens
    socket.ev.on('messages.upsert', async (m) => {
      const settings = this.getSettings(instanceId);
      const instance = this.sockets.get(instanceId);
      
      for (const msg of m.messages) {
        // Salvar pushName do remetente
        if (msg.pushName && msg.key.remoteJid && instance) {
          const senderJid = msg.key.participant || msg.key.remoteJid;
          instance.pushNames.set(senderJid, msg.pushName);
        }
        
        // Ignorar grupos se configurado
        if (settings.ignoreGroups && msg.key.remoteJid?.endsWith('@g.us')) {
          continue;
        }
        
        // Marcar como lida se configurado
        if (settings.readMessages && !msg.key.fromMe) {
          await socket.readMessages([msg.key]);
        }

        // Extrair texto da mensagem
        const messageText = msg.message?.conversation || 
                           msg.message?.extendedTextMessage?.text ||
                           msg.message?.imageMessage?.caption ||
                           msg.message?.videoMessage?.caption || '';

        // Chamar todos os callbacks de mensagem registrados para esta instância
        if (messageText && msg.key.remoteJid && this.messageCallbacks.has(instanceId)) {
          const callbacks = this.messageCallbacks.get(instanceId);
          if (callbacks) {
            for (const [, callback] of callbacks) {
              try {
                callback(msg.key.remoteJid, messageText, msg.key.fromMe || false);
              } catch (err) {
                this.logger.error(`Erro ao executar callback de mensagem: ${err}`);
              }
            }
          }
        }
      }
    });

    // Rejeitar chamadas
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

    // Marcar status como visualizado
    socket.ev.on('messages.update', async (updates) => {
      const settings = this.getSettings(instanceId);
      if (settings.readStatus) {
        for (const update of updates) {
          if (update.key.remoteJid === 'status@broadcast') {
            // Status visualizado automaticamente
          }
        }
      }
    });

    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const instance = this.sockets.get(instanceId);
        if (instance) instance.qr = qr;
        this.qrCallbacks.get(instanceId)?.(qr);
        this.logger.log(`QR Code gerado para instância ${instanceId}`);
      }

      if (connection === 'close') {
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const reasonMessage = (lastDisconnect?.error as Boom)?.message || 'Unknown';
        const instance = this.sockets.get(instanceId);
        if (instance) instance.status = 'DISCONNECTED';
        this.statusCallbacks.get(instanceId)?.('DISCONNECTED');

        this.logger.warn(`Conexão fechada para ${instanceId}: ${reason} - ${reasonMessage}`);

        // Verificar se já está reconectando
        if (this.reconnecting.get(instanceId)) {
          this.logger.warn(`Instância ${instanceId} já está reconectando, ignorando...`);
          return;
        }

        // Se foi logout manual, não reconectar
        if (reason === DisconnectReason.loggedOut) {
          this.logger.log(`Instância ${instanceId} deslogada pelo usuário`);
          this.sockets.delete(instanceId);
          this.reconnecting.delete(instanceId);
          this.reconnectAttempts.delete(instanceId);
          return;
        }

        // Se foi erro de conflito (outra sessão aberta), não reconectar automaticamente
        if (reason === DisconnectReason.connectionReplaced) {
          this.logger.warn(`Instância ${instanceId} substituída por outra conexão`);
          this.sockets.delete(instanceId);
          this.reconnecting.delete(instanceId);
          this.reconnectAttempts.delete(instanceId);
          return;
        }

        // Se foi banido ou bloqueado, não reconectar
        if (reason === DisconnectReason.forbidden || reason === 403) {
          this.logger.error(`Instância ${instanceId} foi banida ou bloqueada`);
          this.sockets.delete(instanceId);
          this.reconnecting.delete(instanceId);
          this.reconnectAttempts.delete(instanceId);
          return;
        }

        // Limitar tentativas de reconexão
        const attempts = this.reconnectAttempts.get(instanceId) || 0;
        if (attempts >= 3) {
          this.logger.error(`Instância ${instanceId} falhou após 3 tentativas de reconexão`);
          this.reconnecting.delete(instanceId);
          this.reconnectAttempts.delete(instanceId);
          // Não deletar o socket, apenas parar de tentar
          return;
        }

        // Só reconectar se for erro de conexão temporário
        const shouldReconnect = [
          DisconnectReason.connectionClosed,
          DisconnectReason.connectionLost,
          DisconnectReason.timedOut,
          DisconnectReason.restartRequired,
        ].includes(reason);

        if (!shouldReconnect) {
          this.logger.warn(`Instância ${instanceId} desconectada com razão ${reason}, não reconectando automaticamente`);
          return;
        }

        // Marcar como reconectando
        this.reconnecting.set(instanceId, true);
        this.reconnectAttempts.set(instanceId, attempts + 1);

        const delay = Math.min(5000 * Math.pow(2, attempts), 60000); // Backoff exponencial, máx 60s
        this.logger.warn(`Reconectando instância ${instanceId} em ${delay}ms (tentativa ${attempts + 1}/3)...`);
        
        setTimeout(async () => {
          try {
            await this.connect(instanceId);
          } catch (err) {
            this.logger.error(`Erro ao reconectar ${instanceId}: ${err}`);
          } finally {
            this.reconnecting.delete(instanceId);
          }
        }, delay);
      }

      if (connection === 'open') {
        const instance = this.sockets.get(instanceId);
        if (instance) {
          instance.status = 'CONNECTED';
          instance.qr = null;
          
          // Resetar contadores de reconexão
          this.reconnecting.delete(instanceId);
          this.reconnectAttempts.delete(instanceId);
          
          // Obter informações do perfil
          try {
            const user = socket.user;
            if (user) {
              instance.phone = user.id.split(':')[0].split('@')[0];
              instance.name = user.name || user.verifiedName || null;
              
              // Buscar foto do perfil
              try {
                const ppUrl = await socket.profilePictureUrl(user.id, 'image');
                instance.profilePic = ppUrl;
              } catch {
                instance.profilePic = null;
              }
            }
          } catch (e) {
            this.logger.warn(`Erro ao obter perfil: ${e}`);
          }
          
          // Aplicar configurações
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
    } catch (error) {
      this.logger.error(`Erro ao conectar instância ${instanceId}: ${error}`);
      throw error;
    }
  }

  async disconnect(instanceId: string) {
    const instance = this.sockets.get(instanceId);
    if (instance?.socket) {
      await instance.socket.logout();
      this.sockets.delete(instanceId);
    }
  }

  async deleteSession(instanceId: string) {
    await this.disconnect(instanceId);
    const authDir = path.join(process.cwd(), 'sessions', instanceId);
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true });
    }
    this.settings.delete(instanceId);
    this.reconnecting.delete(instanceId);
    this.reconnectAttempts.delete(instanceId);
  }

  // Reconectar instância (sem logout, apenas reconecta)
  async reconnect(instanceId: string): Promise<string | null> {
    // Limpar flags de reconexão
    this.reconnecting.delete(instanceId);
    this.reconnectAttempts.delete(instanceId);
    
    const instance = this.sockets.get(instanceId);
    if (instance?.socket) {
      try {
        instance.socket.end();
      } catch {}
      this.sockets.delete(instanceId);
    }
    return this.connect(instanceId);
  }

  // Reiniciar instância mantendo a sessão (não pede QR novamente)
  async restart(instanceId: string): Promise<void> {
    // Limpar flags de reconexão
    this.reconnecting.delete(instanceId);
    this.reconnectAttempts.delete(instanceId);
    
    const instance = this.sockets.get(instanceId);
    if (instance?.socket) {
      try {
        // Apenas fecha a conexão atual
        instance.socket.end();
      } catch {}
      this.sockets.delete(instanceId);
    }
    
    // Reconecta usando a sessão existente
    await this.connect(instanceId);
    this.logger.log(`Instância ${instanceId} reiniciada`);
  }
}

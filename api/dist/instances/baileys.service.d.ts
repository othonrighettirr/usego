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
export declare class BaileysService {
    private readonly logger;
    private sockets;
    private settings;
    private qrCallbacks;
    private statusCallbacks;
    private messageCallbacks;
    private reconnecting;
    private reconnectAttempts;
    getSocket(instanceId: string): any;
    getQR(instanceId: string): string;
    getStatus(instanceId: string): string;
    getPhone(instanceId: string): string;
    getProfilePic(instanceId: string): string;
    getProfileName(instanceId: string): string;
    getPushName(instanceId: string, jid: string): string | null;
    getPushNames(instanceId: string): Map<string, string>;
    getContacts(instanceId: string): Map<string, {
        id: string;
        name?: string;
        notify?: string;
        verifiedName?: string;
    }>;
    getContact(instanceId: string, jid: string): {
        id: string;
        name?: string;
        notify?: string;
        verifiedName?: string;
    } | null;
    getLidMappings(instanceId: string): Map<string, string>;
    getLidMapping(instanceId: string, lid: string): string | null;
    getNewsletters(instanceId: string): {
        id: string;
        name?: string;
        description?: string;
        picture?: string;
    }[];
    getSettings(instanceId: string): InstanceSettings;
    setSettings(instanceId: string, newSettings: InstanceSettingsUpdate): InstanceSettings;
    private applySettings;
    private saveSettingsToFile;
    private loadSettingsFromFile;
    onQR(instanceId: string, callback: (qr: string) => void): void;
    onStatus(instanceId: string, callback: (status: string) => void): void;
    onMessage(instanceId: string, callback: (remoteJid: string, message: string, fromMe: boolean) => void, callbackId?: string): string;
    offMessage(instanceId: string, callbackId: string): void;
    private triggerSettingsWebhook;
    private getMessageType;
    private createProxyAgent;
    connect(instanceId: string): Promise<string | null>;
    disconnect(instanceId: string): Promise<void>;
    deleteSession(instanceId: string): Promise<void>;
    reconnect(instanceId: string): Promise<string | null>;
    restart(instanceId: string): Promise<void>;
}

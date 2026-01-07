export declare class CreateInstanceDto {
    name: string;
}
export declare class UpdateInstanceDto {
    name: string;
}
export declare class ProxySettingsDto {
    enabled?: boolean;
    protocol?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
}
export declare class WebhookSettingsDto {
    enabled?: boolean;
    url?: string;
    events?: string[];
}
export declare class WebSocketSettingsDto {
    enabled?: boolean;
    events?: string[];
}
export declare class RabbitMQSettingsDto {
    enabled?: boolean;
    uri?: string;
    exchange?: string;
    events?: string[];
}
export declare class SQSSettingsDto {
    enabled?: boolean;
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    queueUrl?: string;
    events?: string[];
}
export declare class TypebotSettingsDto {
    enabled?: boolean;
    apiUrl?: string;
    publicName?: string;
    triggerType?: string;
    triggerOperator?: string;
    keyword?: string;
    expireMinutes?: number;
    keywordFinish?: string;
    delayMessage?: number;
    unknownMessage?: string;
    listeningFromMe?: boolean;
    stopBotFromMe?: boolean;
    keepOpen?: boolean;
    debounceTime?: number;
}
export declare class N8nSettingsDto {
    enabled?: boolean;
    webhookUrl?: string;
    basicAuthUser?: string;
    basicAuthPassword?: string;
    triggerType?: string;
    triggerOperator?: string;
    keyword?: string;
    expireMinutes?: number;
    keywordFinish?: string;
    delayMessage?: number;
    unknownMessage?: string;
    listeningFromMe?: boolean;
    stopBotFromMe?: boolean;
    keepOpen?: boolean;
    debounceTime?: number;
    splitMessages?: boolean;
}
export declare class ChatwootSettingsDto {
    enabled?: boolean;
    url?: string;
    accountId?: string;
    token?: string;
    signMessages?: boolean;
    signDelimiter?: string;
    nameInbox?: string;
    organization?: string;
    logo?: string;
    conversationPending?: boolean;
    reopenConversation?: boolean;
    importContacts?: boolean;
    importMessages?: boolean;
    daysLimitImport?: number;
    ignoreJids?: string;
    autoCreate?: boolean;
}
export declare class UpdateSettingsDto {
    rejectCalls?: boolean;
    ignoreGroups?: boolean;
    alwaysOnline?: boolean;
    readMessages?: boolean;
    syncFullHistory?: boolean;
    readStatus?: boolean;
    proxy?: ProxySettingsDto;
    webhook?: WebhookSettingsDto;
    websocket?: WebSocketSettingsDto;
    rabbitmq?: RabbitMQSettingsDto;
    sqs?: SQSSettingsDto;
    typebot?: TypebotSettingsDto;
    n8n?: N8nSettingsDto;
    chatwoot?: ChatwootSettingsDto;
}
export declare class SharedTokenDto {
    instanceId: string;
    expiresInHours?: number;
    permissions?: string[];
}

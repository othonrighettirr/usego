export declare class CreateTypebotDto {
    enabled?: boolean;
    description?: string;
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
export declare class CreateN8nDto {
    enabled?: boolean;
    description?: string;
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
export declare class CreateChatwootDto {
    enabled?: boolean;
    sqs?: boolean;
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
export declare class UpdateIntegrationDto {
    config?: any;
    active?: boolean;
}

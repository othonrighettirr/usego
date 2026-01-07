import { OnModuleInit } from '@nestjs/common';
import { BaileysService } from '../instances/baileys.service';
export declare class N8nService implements OnModuleInit {
    private baileys;
    private readonly logger;
    private sessions;
    private debounceTimers;
    private messageBuffer;
    private registeredInstances;
    constructor(baileys: BaileysService);
    onModuleInit(): Promise<void>;
    registerInstance(instanceId: string): void;
    unregisterInstance(instanceId: string): void;
    private shouldTrigger;
    private shouldFinish;
    private getSessionKey;
    processMessage(instanceId: string, remoteJid: string, message: string, fromMe: boolean): Promise<void>;
    private addToBuffer;
    private scheduleDebounce;
    private sendToN8n;
    private sendMessage;
    private endSession;
}

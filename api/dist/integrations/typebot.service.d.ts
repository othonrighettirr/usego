import { OnModuleInit } from '@nestjs/common';
import { BaileysService } from '../instances/baileys.service';
export declare class TypebotService implements OnModuleInit {
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
    private sendToTypebot;
    private processTypebotMessages;
    private extractTextFromRichText;
    private sendMessage;
    private sendImage;
    private sendVideo;
    private sendAudio;
    private endSession;
}

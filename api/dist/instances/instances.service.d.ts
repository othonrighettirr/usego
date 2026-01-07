import { PrismaService } from '../shared/prisma.service';
import { BaileysService, InstanceSettings } from './baileys.service';
import { CreateInstanceDto, UpdateInstanceDto, UpdateSettingsDto } from './dto/instance.dto';
import { TypebotService } from '../integrations/typebot.service';
import { N8nService } from '../integrations/n8n.service';
import { ChatwootService } from '../integrations/chatwoot.service';
export declare class InstancesService {
    private prisma;
    private baileys;
    private typebot;
    private n8n;
    private chatwoot;
    constructor(prisma: PrismaService, baileys: BaileysService, typebot: TypebotService, n8n: N8nService, chatwoot: ChatwootService);
    findAll(userId: string): Promise<{
        status: string;
        phone: string;
        profilePic: string;
        profileName: string;
        apiKey: string;
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        sessionData: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        status: string;
        phone: string;
        profilePic: string;
        profileName: string;
        apiKey: string;
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        sessionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    create(dto: CreateInstanceDto, userId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        userId: string;
        apiKey: string | null;
        sessionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, dto: UpdateInstanceDto, userId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        userId: string;
        apiKey: string | null;
        sessionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    connect(id: string, userId: string): Promise<{
        qr: string;
        status: string;
    }>;
    disconnect(id: string, userId: string): Promise<{
        message: string;
    }>;
    reconnect(id: string, userId: string): Promise<{
        qr: string;
        status: string;
    }>;
    restart(id: string, userId: string): Promise<{
        message: string;
    }>;
    getQR(id: string, userId: string): Promise<{
        status: string;
        qrCode: any;
        phone: string;
        profilePic: string;
        profileName: string;
    } | {
        status: string;
        qrCode: string;
        phone?: undefined;
        profilePic?: undefined;
        profileName?: undefined;
    }>;
    getSettings(id: string, userId: string): Promise<InstanceSettings>;
    updateSettings(id: string, dto: UpdateSettingsDto, userId: string): Promise<InstanceSettings>;
    createSharedToken(instanceId: string, userId: string, expiresInHours?: number, permissions?: string[]): Promise<{
        token: string;
        expiresAt: Date;
    }>;
    getSharedQR(token: string): Promise<{
        status: string;
        qrCode: string;
        instanceName: string;
    }>;
}

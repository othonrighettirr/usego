import { PrismaService } from '../shared/prisma.service';
import { CreateTypebotDto, CreateN8nDto, CreateChatwootDto, UpdateIntegrationDto } from './dto/integration.dto';
import { TypebotService } from './typebot.service';
import { N8nService } from './n8n.service';
import { ChatwootService } from './chatwoot.service';
import { BaileysService } from '../instances/baileys.service';
export declare class IntegrationsService {
    private prisma;
    private typebotService;
    private n8nService;
    private chatwootService;
    private baileys;
    constructor(prisma: PrismaService, typebotService: TypebotService, n8nService: N8nService, chatwootService: ChatwootService, baileys: BaileysService);
    findAll(userId: string): Promise<{
        type: string;
        id: string;
        userId: string;
        createdAt: Date;
        config: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
    }[]>;
    findByType(userId: string, type: string): Promise<{
        type: string;
        id: string;
        userId: string;
        createdAt: Date;
        config: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
    }>;
    private upsertIntegration;
    private syncIntegrationCallbacks;
    createTypebot(dto: CreateTypebotDto, userId: string): Promise<any>;
    createN8n(dto: CreateN8nDto, userId: string): Promise<any>;
    createChatwoot(dto: CreateChatwootDto, userId: string): Promise<any>;
    update(id: string, dto: UpdateIntegrationDto, userId: string): Promise<{
        type: string;
        id: string;
        userId: string;
        createdAt: Date;
        config: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string, userId: string, active: boolean): Promise<{
        type: string;
        id: string;
        userId: string;
        createdAt: Date;
        config: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
    }>;
}

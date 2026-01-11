import { PrismaService } from '../shared/prisma.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
export declare class WebhooksService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        url: string;
        events: string[];
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
    }[]>;
    create(dto: CreateWebhookDto, userId: string): Promise<{
        url: string;
        events: string[];
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
    }>;
    update(id: string, dto: UpdateWebhookDto, userId: string): Promise<{
        url: string;
        events: string[];
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    trigger(instanceId: string, event: string, data: any): Promise<void>;
}

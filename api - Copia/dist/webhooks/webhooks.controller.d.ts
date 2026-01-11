import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
export declare class WebhooksController {
    private webhooksService;
    constructor(webhooksService: WebhooksService);
    findAll(req: any): Promise<{
        url: string;
        events: string[];
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
    }[]>;
    create(dto: CreateWebhookDto, req: any): Promise<{
        url: string;
        events: string[];
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
    }>;
    update(id: string, dto: UpdateWebhookDto, req: any): Promise<{
        url: string;
        events: string[];
        id: string;
        userId: string;
        createdAt: Date;
        active: boolean;
    }>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
}

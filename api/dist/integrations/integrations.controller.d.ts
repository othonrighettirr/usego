import { IntegrationsService } from './integrations.service';
import { CreateTypebotDto, CreateN8nDto, CreateChatwootDto, UpdateIntegrationDto } from './dto/integration.dto';
export declare class IntegrationsController {
    private integrationsService;
    constructor(integrationsService: IntegrationsService);
    findAll(req: any): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        userId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
    }[]>;
    createTypebot(dto: CreateTypebotDto, req: any): Promise<any>;
    testTypebot(dto: CreateTypebotDto): Promise<{
        success: boolean;
        message: string;
        typebot: {
            id: any;
            name: any;
            publicId: any;
        };
    }>;
    createN8n(dto: CreateN8nDto, req: any): Promise<any>;
    testN8n(dto: CreateN8nDto): Promise<{
        success: boolean;
        message: string;
        response: {
            status: number;
            data: any;
        };
    } | {
        success: boolean;
        message: string;
        response: {
            status: number;
            data?: undefined;
        };
    }>;
    createChatwoot(dto: CreateChatwootDto, req: any): Promise<any>;
    testChatwoot(dto: CreateChatwootDto): Promise<{
        success: boolean;
        message: string;
        inboxes: any;
    }>;
    update(id: string, dto: UpdateIntegrationDto, req: any): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        userId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        active: boolean;
    }>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
}

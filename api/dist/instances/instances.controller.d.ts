import { InstancesService } from './instances.service';
import { CreateInstanceDto, UpdateInstanceDto, UpdateSettingsDto, SharedTokenDto } from './dto/instance.dto';
export declare class InstancesController {
    private instancesService;
    constructor(instancesService: InstancesService);
    getSharedQR(token: string): Promise<{
        status: string;
        qrCode: string;
        instanceName: string;
    }>;
    findAll(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    create(dto: CreateInstanceDto, req: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        userId: string;
        apiKey: string | null;
        sessionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, dto: UpdateInstanceDto, req: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        userId: string;
        apiKey: string | null;
        sessionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
    connect(id: string, req: any): Promise<{
        qr: string;
        status: string;
    }>;
    disconnect(id: string, req: any): Promise<{
        message: string;
    }>;
    reconnect(id: string, req: any): Promise<{
        qr: string;
        status: string;
    }>;
    restart(id: string, req: any): Promise<{
        message: string;
    }>;
    getQR(id: string, req: any): Promise<{
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
    getSettings(id: string, req: any): Promise<import("./baileys.service").InstanceSettings>;
    updateSettings(id: string, dto: UpdateSettingsDto, req: any): Promise<import("./baileys.service").InstanceSettings>;
}
export declare class AuthSharedTokenController {
    private instancesService;
    constructor(instancesService: InstancesService);
    createSharedToken(dto: SharedTokenDto, req: any): Promise<{
        token: string;
        expiresAt: Date;
    }>;
}

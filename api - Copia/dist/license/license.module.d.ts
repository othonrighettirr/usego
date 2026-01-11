import { DynamicModule, OnModuleInit, OnModuleDestroy, NestMiddleware, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LicenseStatus } from './LicenseValidator';
export interface LicenseModuleOptions {
    serverUrl: string;
    apiKey: string;
    cacheDir?: string;
    validateOnStart?: boolean;
    checkInterval?: number;
}
export declare class LicenseService implements OnModuleInit, OnModuleDestroy {
    private options;
    private validator;
    private licenseConfigured;
    constructor(options: LicenseModuleOptions);
    onModuleInit(): Promise<void>;
    validate(): Promise<boolean>;
    forceValidate(): Promise<boolean>;
    isBlocked(): boolean;
    getBlockReason(): string | null;
    getStatus(): LicenseStatus;
    onModuleDestroy(): void;
}
export declare class LicenseMiddleware implements NestMiddleware {
    private licenseService;
    constructor(licenseService: LicenseService);
    use(_req: any, res: any, next: () => void): Promise<any>;
}
export declare class LicenseController {
    private licenseService;
    constructor(licenseService: LicenseService);
    check(): Promise<{
        error: string;
        message: string;
        reason: string;
        blocked: boolean;
        status: LicenseStatus;
        success?: undefined;
    } | {
        success: boolean;
        blocked: boolean;
        status: LicenseStatus;
        error?: undefined;
        message?: undefined;
        reason?: undefined;
    }>;
    getStatus(): {
        blocked: boolean;
        reason: string;
        status: LicenseStatus;
    };
}
export declare class LicenseModule implements NestModule {
    static forRoot(options: LicenseModuleOptions): DynamicModule;
    configure(consumer: MiddlewareConsumer): void;
}

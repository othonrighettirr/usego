"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LicenseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseModule = exports.LicenseController = exports.LicenseMiddleware = exports.LicenseService = void 0;
const common_1 = require("@nestjs/common");
const LicenseValidator_1 = require("./LicenseValidator");
const LICENSE_OPTIONS = 'LICENSE_OPTIONS';
let LicenseService = class LicenseService {
    constructor(options) {
        this.options = options;
        this.validator = null;
        this.licenseConfigured = false;
        if (options.serverUrl && options.apiKey) {
            this.validator = new LicenseValidator_1.LicenseValidator(options.serverUrl, options.apiKey, options.cacheDir || '/app/license');
            this.licenseConfigured = true;
        }
        else {
            console.warn('⚠️ Licença não configurada - sistema funcionando sem validação');
        }
    }
    async onModuleInit() {
        if (this.licenseConfigured && this.validator && this.options.validateOnStart !== false) {
            console.log('🔐 Validando licença...');
            await this.validator.validateOrDie();
        }
    }
    async validate() {
        if (!this.licenseConfigured || !this.validator) {
            return true;
        }
        return this.validator.validate();
    }
    async forceValidate() {
        if (!this.licenseConfigured || !this.validator) {
            return true;
        }
        return this.validator.validate(true);
    }
    isBlocked() {
        if (!this.licenseConfigured || !this.validator) {
            return false;
        }
        return this.validator.isLicenseBlocked();
    }
    getBlockReason() {
        if (!this.licenseConfigured || !this.validator) {
            return null;
        }
        return this.validator.getBlockReason();
    }
    getStatus() {
        if (!this.licenseConfigured || !this.validator) {
            return {
                valid: true,
                blocked: false,
                reason: null,
                machineId: 'not-configured',
                ip: 'not-configured',
                expiresAt: null,
            };
        }
        return this.validator.getStatus();
    }
    onModuleDestroy() {
        if (this.validator) {
            this.validator.stopRealtimeCheck();
        }
    }
};
exports.LicenseService = LicenseService;
exports.LicenseService = LicenseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(LICENSE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], LicenseService);
let LicenseMiddleware = class LicenseMiddleware {
    constructor(licenseService) {
        this.licenseService = licenseService;
    }
    async use(_req, res, next) {
        try {
            const isValid = await this.licenseService.forceValidate();
            if (!isValid || this.licenseService.isBlocked()) {
                return res.status(403).json({
                    error: 'LICENSE_BLOCKED',
                    message: 'Licença bloqueada',
                    reason: this.licenseService.getBlockReason(),
                    blocked: true,
                    status: this.licenseService.getStatus(),
                });
            }
            next();
        }
        catch (error) {
            console.error('Erro no middleware de licença:', error);
            next();
        }
    }
};
exports.LicenseMiddleware = LicenseMiddleware;
exports.LicenseMiddleware = LicenseMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [LicenseService])
], LicenseMiddleware);
let LicenseController = class LicenseController {
    constructor(licenseService) {
        this.licenseService = licenseService;
    }
    async check() {
        try {
            const isValid = await this.licenseService.forceValidate();
            if (!isValid || this.licenseService.isBlocked()) {
                return {
                    error: 'LICENSE_BLOCKED',
                    message: 'Licença bloqueada',
                    reason: this.licenseService.getBlockReason(),
                    blocked: true,
                    status: this.licenseService.getStatus(),
                };
            }
            return {
                success: true,
                blocked: false,
                status: this.licenseService.getStatus(),
            };
        }
        catch (error) {
            console.error('Erro ao verificar licença:', error);
            return {
                success: true,
                blocked: false,
                status: {
                    valid: true,
                    blocked: false,
                    reason: null,
                    machineId: 'unknown',
                    ip: 'unknown',
                    expiresAt: null,
                },
            };
        }
    }
    getStatus() {
        return {
            blocked: this.licenseService.isBlocked(),
            reason: this.licenseService.getBlockReason(),
            status: this.licenseService.getStatus(),
        };
    }
};
exports.LicenseController = LicenseController;
__decorate([
    (0, common_1.Get)('check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "getStatus", null);
exports.LicenseController = LicenseController = __decorate([
    (0, common_1.Controller)('license'),
    __metadata("design:paramtypes", [LicenseService])
], LicenseController);
let LicenseModule = LicenseModule_1 = class LicenseModule {
    static forRoot(options) {
        return {
            module: LicenseModule_1,
            controllers: [LicenseController],
            providers: [
                {
                    provide: LICENSE_OPTIONS,
                    useValue: options,
                },
                LicenseService,
                LicenseMiddleware,
            ],
            exports: [LicenseService],
        };
    }
    configure(consumer) {
        consumer
            .apply(LicenseMiddleware)
            .exclude('health', 'health/(.*)', 'license', 'license/check', 'license/(.*)', 'status', 'auth/login', 'auth/register', { path: '*', method: common_1.RequestMethod.OPTIONS })
            .forRoutes('*');
    }
};
exports.LicenseModule = LicenseModule;
exports.LicenseModule = LicenseModule = LicenseModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], LicenseModule);
//# sourceMappingURL=license.module.js.map
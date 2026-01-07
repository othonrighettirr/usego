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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSharedTokenController = exports.InstancesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const instances_service_1 = require("./instances.service");
const instance_dto_1 = require("./dto/instance.dto");
let InstancesController = class InstancesController {
    constructor(instancesService) {
        this.instancesService = instancesService;
    }
    getSharedQR(token) {
        return this.instancesService.getSharedQR(token);
    }
    findAll(req) {
        return this.instancesService.findAll(req.user.id);
    }
    findOne(id, req) {
        return this.instancesService.findOne(id, req.user.id);
    }
    create(dto, req) {
        return this.instancesService.create(dto, req.user.id);
    }
    update(id, dto, req) {
        return this.instancesService.update(id, dto, req.user.id);
    }
    delete(id, req) {
        return this.instancesService.delete(id, req.user.id);
    }
    connect(id, req) {
        return this.instancesService.connect(id, req.user.id);
    }
    disconnect(id, req) {
        return this.instancesService.disconnect(id, req.user.id);
    }
    reconnect(id, req) {
        return this.instancesService.reconnect(id, req.user.id);
    }
    restart(id, req) {
        return this.instancesService.restart(id, req.user.id);
    }
    getQR(id, req) {
        return this.instancesService.getQR(id, req.user.id);
    }
    getSettings(id, req) {
        return this.instancesService.getSettings(id, req.user.id);
    }
    updateSettings(id, dto, req) {
        return this.instancesService.updateSettings(id, dto, req.user.id);
    }
};
exports.InstancesController = InstancesController;
__decorate([
    (0, common_1.Get)('shared/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "getSharedQR", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instance_dto_1.CreateInstanceDto, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, instance_dto_1.UpdateInstanceDto, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/connect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "connect", null);
__decorate([
    (0, common_1.Post)(':id/disconnect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Post)(':id/reconnect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "reconnect", null);
__decorate([
    (0, common_1.Post)(':id/restart'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "restart", null);
__decorate([
    (0, common_1.Get)(':id/qr'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "getQR", null);
__decorate([
    (0, common_1.Get)(':id/settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)(':id/settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, instance_dto_1.UpdateSettingsDto, Object]),
    __metadata("design:returntype", void 0)
], InstancesController.prototype, "updateSettings", null);
exports.InstancesController = InstancesController = __decorate([
    (0, common_1.Controller)('instances'),
    __metadata("design:paramtypes", [instances_service_1.InstancesService])
], InstancesController);
let AuthSharedTokenController = class AuthSharedTokenController {
    constructor(instancesService) {
        this.instancesService = instancesService;
    }
    createSharedToken(dto, req) {
        return this.instancesService.createSharedToken(dto.instanceId, req.user.id, dto.expiresInHours || 24, dto.permissions || ['view_qr']);
    }
};
exports.AuthSharedTokenController = AuthSharedTokenController;
__decorate([
    (0, common_1.Post)('shared-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instance_dto_1.SharedTokenDto, Object]),
    __metadata("design:returntype", void 0)
], AuthSharedTokenController.prototype, "createSharedToken", null);
exports.AuthSharedTokenController = AuthSharedTokenController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [instances_service_1.InstancesService])
], AuthSharedTokenController);
//# sourceMappingURL=instances.controller.js.map
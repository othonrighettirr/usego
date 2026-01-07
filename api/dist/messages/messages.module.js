"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const common_1 = require("@nestjs/common");
const messages_controller_1 = require("./messages.controller");
const api_controller_1 = require("./api.controller");
const messages_service_1 = require("./messages.service");
const instances_module_1 = require("../instances/instances.module");
const auth_module_1 = require("../auth/auth.module");
const api_key_guard_1 = require("../auth/api-key.guard");
let MessagesModule = class MessagesModule {
};
exports.MessagesModule = MessagesModule;
exports.MessagesModule = MessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [instances_module_1.InstancesModule, auth_module_1.AuthModule],
        controllers: [messages_controller_1.MessagesController, api_controller_1.ApiController],
        providers: [messages_service_1.MessagesService, api_key_guard_1.ApiKeyGuard],
    })
], MessagesModule);
//# sourceMappingURL=messages.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const integrations_controller_1 = require("./integrations.controller");
const integrations_service_1 = require("./integrations.service");
const typebot_service_1 = require("./typebot.service");
const n8n_service_1 = require("./n8n.service");
const chatwoot_service_1 = require("./chatwoot.service");
const instances_module_1 = require("../instances/instances.module");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => instances_module_1.InstancesModule)],
        controllers: [integrations_controller_1.IntegrationsController],
        providers: [integrations_service_1.IntegrationsService, typebot_service_1.TypebotService, n8n_service_1.N8nService, chatwoot_service_1.ChatwootService],
        exports: [integrations_service_1.IntegrationsService, typebot_service_1.TypebotService, n8n_service_1.N8nService, chatwoot_service_1.ChatwootService],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map
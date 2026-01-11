"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstancesModule = void 0;
const common_1 = require("@nestjs/common");
const instances_controller_1 = require("./instances.controller");
const instances_service_1 = require("./instances.service");
const baileys_service_1 = require("./baileys.service");
const contacts_controller_1 = require("./contacts.controller");
const integrations_module_1 = require("../integrations/integrations.module");
let InstancesModule = class InstancesModule {
};
exports.InstancesModule = InstancesModule;
exports.InstancesModule = InstancesModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => integrations_module_1.IntegrationsModule)],
        controllers: [contacts_controller_1.ContactsController, instances_controller_1.InstancesController, instances_controller_1.AuthSharedTokenController],
        providers: [instances_service_1.InstancesService, baileys_service_1.BaileysService],
        exports: [baileys_service_1.BaileysService, instances_service_1.InstancesService],
    })
], InstancesModule);
//# sourceMappingURL=instances.module.js.map
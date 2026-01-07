"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const instances_module_1 = require("./instances/instances.module");
const messages_module_1 = require("./messages/messages.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const integrations_module_1 = require("./integrations/integrations.module");
const shared_module_1 = require("./shared/shared.module");
const license_module_1 = require("./license/license.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            license_module_1.LicenseModule.forRoot({
                serverUrl: process.env.LICENSE_SERVER || '',
                apiKey: process.env.LICENSE_KEY || '',
            }),
            shared_module_1.SharedModule,
            auth_module_1.AuthModule,
            instances_module_1.InstancesModule,
            messages_module_1.MessagesModule,
            webhooks_module_1.WebhooksModule,
            integrations_module_1.IntegrationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
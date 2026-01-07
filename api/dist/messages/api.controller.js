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
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
const api_key_guard_1 = require("../auth/api-key.guard");
const messages_service_1 = require("./messages.service");
let ApiController = class ApiController {
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    withInstanceId(dto, req) {
        return { ...dto, instanceId: req.instanceId };
    }
    sendText(dto, req) {
        return this.messagesService.sendText(this.withInstanceId(dto, req));
    }
    sendImage(dto, req) {
        return this.messagesService.sendImage(this.withInstanceId(dto, req));
    }
    sendAudio(dto, req) {
        return this.messagesService.sendAudio(this.withInstanceId(dto, req));
    }
    sendVideo(dto, req) {
        return this.messagesService.sendVideo(this.withInstanceId(dto, req));
    }
    sendDocument(dto, req) {
        return this.messagesService.sendDocument(this.withInstanceId(dto, req));
    }
    sendContact(dto, req) {
        return this.messagesService.sendContact(this.withInstanceId(dto, req));
    }
    sendLocation(dto, req) {
        return this.messagesService.sendLocation(this.withInstanceId(dto, req));
    }
    sendList(dto, req) {
        return this.messagesService.sendList(this.withInstanceId(dto, req));
    }
    sendPoll(dto, req) {
        return this.messagesService.sendPoll(this.withInstanceId(dto, req));
    }
    sendSticker(dto, req) {
        return this.messagesService.sendSticker(this.withInstanceId(dto, req));
    }
    deleteMessage(dto, req) {
        return this.messagesService.deleteMessage(this.withInstanceId(dto, req));
    }
    reactMessage(dto, req) {
        return this.messagesService.reactMessage(this.withInstanceId(dto, req));
    }
    sendWithMentions(dto, req) {
        return this.messagesService.sendTextWithMentions(this.withInstanceId(dto, req));
    }
    createGroup(dto, req) {
        return this.messagesService.createGroup(this.withInstanceId(dto, req));
    }
    addGroupParticipants(dto, req) {
        return this.messagesService.addGroupParticipants(this.withInstanceId(dto, req));
    }
    removeGroupParticipants(dto, req) {
        return this.messagesService.removeGroupParticipants(this.withInstanceId(dto, req));
    }
    promoteGroupParticipants(dto, req) {
        return this.messagesService.promoteGroupParticipants(this.withInstanceId(dto, req));
    }
    demoteGroupParticipants(dto, req) {
        return this.messagesService.demoteGroupParticipants(this.withInstanceId(dto, req));
    }
    updateGroupSubject(dto, req) {
        return this.messagesService.updateGroupSubject(this.withInstanceId(dto, req));
    }
    updateGroupDescription(dto, req) {
        return this.messagesService.updateGroupDescription(this.withInstanceId(dto, req));
    }
    updateGroupSettings(dto, req) {
        return this.messagesService.updateGroupSettings(this.withInstanceId(dto, req));
    }
    leaveGroup(body, req) {
        return this.messagesService.leaveGroup(req.instanceId, body.groupId);
    }
    getGroupInvite(groupId, req) {
        return this.messagesService.getGroupInviteCode(req.instanceId, groupId);
    }
    revokeGroupInvite(body, req) {
        return this.messagesService.revokeGroupInvite(req.instanceId, body.groupId);
    }
    getNewsletters(req) {
        return this.messagesService.getNewsletters(req.instanceId);
    }
    sendNewsletterText(dto, req) {
        return this.messagesService.sendNewsletterText(this.withInstanceId(dto, req));
    }
    sendNewsletterImage(dto, req) {
        return this.messagesService.sendNewsletterImage(this.withInstanceId(dto, req));
    }
    sendNewsletterVideo(dto, req) {
        return this.messagesService.sendNewsletterVideo(this.withInstanceId(dto, req));
    }
};
exports.ApiController = ApiController;
__decorate([
    (0, common_1.Post)('send/text'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendText", null);
__decorate([
    (0, common_1.Post)('send/image'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendImage", null);
__decorate([
    (0, common_1.Post)('send/audio'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendAudio", null);
__decorate([
    (0, common_1.Post)('send/video'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendVideo", null);
__decorate([
    (0, common_1.Post)('send/document'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendDocument", null);
__decorate([
    (0, common_1.Post)('send/contact'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendContact", null);
__decorate([
    (0, common_1.Post)('send/location'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendLocation", null);
__decorate([
    (0, common_1.Post)('send/list'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendList", null);
__decorate([
    (0, common_1.Post)('send/poll'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendPoll", null);
__decorate([
    (0, common_1.Post)('send/sticker'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendSticker", null);
__decorate([
    (0, common_1.Post)('message/delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Post)('message/react'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "reactMessage", null);
__decorate([
    (0, common_1.Post)('send/mention'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendWithMentions", null);
__decorate([
    (0, common_1.Post)('group/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)('group/add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "addGroupParticipants", null);
__decorate([
    (0, common_1.Post)('group/remove'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "removeGroupParticipants", null);
__decorate([
    (0, common_1.Post)('group/promote'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "promoteGroupParticipants", null);
__decorate([
    (0, common_1.Post)('group/demote'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "demoteGroupParticipants", null);
__decorate([
    (0, common_1.Post)('group/subject'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "updateGroupSubject", null);
__decorate([
    (0, common_1.Post)('group/description'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "updateGroupDescription", null);
__decorate([
    (0, common_1.Post)('group/settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "updateGroupSettings", null);
__decorate([
    (0, common_1.Post)('group/leave'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "leaveGroup", null);
__decorate([
    (0, common_1.Get)('group/:groupId/invite'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getGroupInvite", null);
__decorate([
    (0, common_1.Post)('group/revoke-invite'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "revokeGroupInvite", null);
__decorate([
    (0, common_1.Get)('newsletter'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getNewsletters", null);
__decorate([
    (0, common_1.Post)('newsletter/text'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendNewsletterText", null);
__decorate([
    (0, common_1.Post)('newsletter/image'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendNewsletterImage", null);
__decorate([
    (0, common_1.Post)('newsletter/video'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendNewsletterVideo", null);
exports.ApiController = ApiController = __decorate([
    (0, common_1.Controller)('api'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], ApiController);
//# sourceMappingURL=api.controller.js.map
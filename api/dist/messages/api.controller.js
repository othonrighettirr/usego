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
const swagger_1 = require("@nestjs/swagger");
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
    revokeGroupInviteByParam(groupId, req) {
        return this.messagesService.revokeGroupInvite(req.instanceId, groupId);
    }
    revokeGroupInvite(body, req) {
        return this.messagesService.revokeGroupInvite(req.instanceId, body.groupId);
    }
    getNewsletters(req) {
        return this.messagesService.getNewsletters(req.instanceId);
    }
    getNewsletterMetadata(newsletterId, req) {
        return this.messagesService.getNewsletterMetadata(req.instanceId, newsletterId);
    }
    getNewsletterSubscribers(newsletterId, req) {
        return this.messagesService.getNewsletterSubscribers(req.instanceId, newsletterId);
    }
    getNewsletterMessages(newsletterId, req) {
        return this.messagesService.getNewsletterMessages(req.instanceId, newsletterId, 10);
    }
    createNewsletter(body, req) {
        return this.messagesService.createNewsletter(req.instanceId, body.name, body.description);
    }
    followNewsletter(body, req) {
        return this.messagesService.followNewsletter(req.instanceId, body.newsletterId);
    }
    unfollowNewsletter(body, req) {
        return this.messagesService.unfollowNewsletter(req.instanceId, body.newsletterId);
    }
    muteNewsletter(body, req) {
        return this.messagesService.muteNewsletter(req.instanceId, body.newsletterId);
    }
    unmuteNewsletter(body, req) {
        return this.messagesService.unmuteNewsletter(req.instanceId, body.newsletterId);
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
    getGroups(req) {
        return this.messagesService.getGroups(req.instanceId);
    }
    getGroupParticipants(groupId, req) {
        return this.messagesService.getGroupParticipants(req.instanceId, groupId);
    }
    getContacts(req) {
        return this.messagesService.getAllContacts(req.instanceId);
    }
    getAllContacts(req) {
        return this.messagesService.getAllContacts(req.instanceId);
    }
    getFollowedNewsletters(req) {
        return this.messagesService.getFollowedNewsletters(req.instanceId);
    }
    getChannelSubscribers(newsletterId, req) {
        return this.messagesService.getChannelSubscribers(req.instanceId, newsletterId);
    }
};
exports.ApiController = ApiController;
__decorate([
    (0, common_1.Post)('send/text'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar texto via API Key' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendText", null);
__decorate([
    (0, common_1.Post)('send/image'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar imagem via API Key' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendImage", null);
__decorate([
    (0, common_1.Post)('send/audio'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar áudio via API Key' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendAudio", null);
__decorate([
    (0, common_1.Post)('send/video'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar vídeo via API Key' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendVideo", null);
__decorate([
    (0, common_1.Post)('send/document'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar documento via API Key' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendDocument", null);
__decorate([
    (0, common_1.Post)('send/contact'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar contato via API Key' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendContact", null);
__decorate([
    (0, common_1.Post)('send/location'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar localização via API Key' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendLocation", null);
__decorate([
    (0, common_1.Post)('send/list'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar lista via API Key' }),
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
    (0, common_1.Post)('group/:groupId/revoke'),
    (0, swagger_1.ApiOperation)({ summary: 'Revogar link de convite do grupo' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "revokeGroupInviteByParam", null);
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
    (0, swagger_1.ApiOperation)({ summary: 'Informações sobre newsletters e endpoints disponíveis' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getNewsletters", null);
__decorate([
    (0, common_1.Get)('newsletter/:newsletterId'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar metadados de uma newsletter' }),
    __param(0, (0, common_1.Param)('newsletterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getNewsletterMetadata", null);
__decorate([
    (0, common_1.Get)('newsletter/:newsletterId/subscribers'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter número de inscritos de uma newsletter' }),
    __param(0, (0, common_1.Param)('newsletterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getNewsletterSubscribers", null);
__decorate([
    (0, common_1.Get)('newsletter/:newsletterId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar mensagens de uma newsletter' }),
    __param(0, (0, common_1.Param)('newsletterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getNewsletterMessages", null);
__decorate([
    (0, common_1.Post)('newsletter/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar uma nova newsletter/canal' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createNewsletter", null);
__decorate([
    (0, common_1.Post)('newsletter/follow'),
    (0, swagger_1.ApiOperation)({ summary: 'Seguir uma newsletter' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "followNewsletter", null);
__decorate([
    (0, common_1.Post)('newsletter/unfollow'),
    (0, swagger_1.ApiOperation)({ summary: 'Deixar de seguir uma newsletter' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "unfollowNewsletter", null);
__decorate([
    (0, common_1.Post)('newsletter/mute'),
    (0, swagger_1.ApiOperation)({ summary: 'Silenciar uma newsletter' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "muteNewsletter", null);
__decorate([
    (0, common_1.Post)('newsletter/unmute'),
    (0, swagger_1.ApiOperation)({ summary: 'Dessilenciar uma newsletter' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "unmuteNewsletter", null);
__decorate([
    (0, common_1.Post)('newsletter/text'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar texto para newsletter' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendNewsletterText", null);
__decorate([
    (0, common_1.Post)('newsletter/image'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar imagem para newsletter' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendNewsletterImage", null);
__decorate([
    (0, common_1.Post)('newsletter/video'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar vídeo para newsletter' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "sendNewsletterVideo", null);
__decorate([
    (0, common_1.Get)('contacts/groups'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os grupos da instância' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getGroups", null);
__decorate([
    (0, common_1.Get)('contacts/groups/:groupId/participants'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar participantes de um grupo' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getGroupParticipants", null);
__decorate([
    (0, common_1.Get)('contacts'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os contatos da instância' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Get)('contacts/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os contatos da instância' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getAllContacts", null);
__decorate([
    (0, common_1.Get)('contacts/newsletters'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar canais/newsletters seguidos' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getFollowedNewsletters", null);
__decorate([
    (0, common_1.Get)('contacts/newsletters/:newsletterId/subscribers'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter número de inscritos de um canal' }),
    __param(0, (0, common_1.Param)('newsletterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getChannelSubscribers", null);
exports.ApiController = ApiController = __decorate([
    (0, swagger_1.ApiTags)('API'),
    (0, swagger_1.ApiSecurity)('api-key'),
    (0, common_1.Controller)('api'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], ApiController);
//# sourceMappingURL=api.controller.js.map
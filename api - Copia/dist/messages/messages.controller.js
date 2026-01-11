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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const messages_service_1 = require("./messages.service");
const message_dto_1 = require("./dto/message.dto");
let MessagesController = class MessagesController {
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    sendText(dto) {
        return this.messagesService.sendText(dto);
    }
    sendImage(dto) {
        return this.messagesService.sendImage(dto);
    }
    sendAudio(dto) {
        return this.messagesService.sendAudio(dto);
    }
    sendVideo(dto) {
        return this.messagesService.sendVideo(dto);
    }
    sendDocument(dto) {
        return this.messagesService.sendDocument(dto);
    }
    sendContact(dto) {
        return this.messagesService.sendContact(dto);
    }
    sendLocation(dto) {
        return this.messagesService.sendLocation(dto);
    }
    sendList(dto) {
        return this.messagesService.sendList(dto);
    }
    sendPoll(dto) {
        return this.messagesService.sendPoll(dto);
    }
    sendSticker(dto) {
        return this.messagesService.sendSticker(dto);
    }
    deleteMessage(dto) {
        return this.messagesService.deleteMessage(dto);
    }
    reactMessage(dto) {
        return this.messagesService.reactMessage(dto);
    }
    sendWithMentions(dto) {
        return this.messagesService.sendTextWithMentions(dto);
    }
    createGroup(dto) {
        return this.messagesService.createGroup(dto);
    }
    addGroupParticipants(dto) {
        return this.messagesService.addGroupParticipants(dto);
    }
    removeGroupParticipants(dto) {
        return this.messagesService.removeGroupParticipants(dto);
    }
    promoteGroupParticipants(dto) {
        return this.messagesService.promoteGroupParticipants(dto);
    }
    demoteGroupParticipants(dto) {
        return this.messagesService.demoteGroupParticipants(dto);
    }
    updateGroupSubject(dto) {
        return this.messagesService.updateGroupSubject(dto);
    }
    updateGroupDescription(dto) {
        return this.messagesService.updateGroupDescription(dto);
    }
    updateGroupSettings(dto) {
        return this.messagesService.updateGroupSettings(dto);
    }
    leaveGroup(body) {
        return this.messagesService.leaveGroup(body.instanceId, body.groupId);
    }
    getGroupInvite(instanceId, groupId) {
        return this.messagesService.getGroupInviteCode(instanceId, groupId);
    }
    revokeGroupInvite(body) {
        return this.messagesService.revokeGroupInvite(body.instanceId, body.groupId);
    }
    getNewsletters(instanceId) {
        return this.messagesService.getNewsletters(instanceId);
    }
    sendNewsletterText(dto) {
        return this.messagesService.sendNewsletterText(dto);
    }
    sendNewsletterImage(dto) {
        return this.messagesService.sendNewsletterImage(dto);
    }
    sendNewsletterVideo(dto) {
        return this.messagesService.sendNewsletterVideo(dto);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)('text'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensagem de texto' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendTextDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendText", null);
__decorate([
    (0, common_1.Post)('image'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar imagem' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendImageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendImage", null);
__decorate([
    (0, common_1.Post)('audio'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar áudio' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendAudioDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendAudio", null);
__decorate([
    (0, common_1.Post)('video'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar vídeo' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendVideoDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendVideo", null);
__decorate([
    (0, common_1.Post)('document'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar documento' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendDocumentDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendDocument", null);
__decorate([
    (0, common_1.Post)('contact'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar contato' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendContactDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendContact", null);
__decorate([
    (0, common_1.Post)('location'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar localização' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendLocationDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendLocation", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendListDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendList", null);
__decorate([
    (0, common_1.Post)('poll'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendPollDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendPoll", null);
__decorate([
    (0, common_1.Post)('sticker'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendStickerDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendSticker", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.DeleteMessageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Post)('react'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.ReactMessageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "reactMessage", null);
__decorate([
    (0, common_1.Post)('mention'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendTextDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendWithMentions", null);
__decorate([
    (0, common_1.Post)('group/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.CreateGroupDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)('group/add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.GroupParticipantsDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "addGroupParticipants", null);
__decorate([
    (0, common_1.Post)('group/remove'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.GroupParticipantsDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "removeGroupParticipants", null);
__decorate([
    (0, common_1.Post)('group/promote'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.GroupParticipantsDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "promoteGroupParticipants", null);
__decorate([
    (0, common_1.Post)('group/demote'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.GroupParticipantsDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "demoteGroupParticipants", null);
__decorate([
    (0, common_1.Post)('group/subject'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.GroupSubjectDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "updateGroupSubject", null);
__decorate([
    (0, common_1.Post)('group/description'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.GroupDescriptionDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "updateGroupDescription", null);
__decorate([
    (0, common_1.Post)('group/settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.GroupSettingsDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "updateGroupSettings", null);
__decorate([
    (0, common_1.Post)('group/leave'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "leaveGroup", null);
__decorate([
    (0, common_1.Get)('group/:instanceId/:groupId/invite'),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getGroupInvite", null);
__decorate([
    (0, common_1.Post)('group/revoke-invite'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "revokeGroupInvite", null);
__decorate([
    (0, common_1.Get)('newsletter/:instanceId'),
    __param(0, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getNewsletters", null);
__decorate([
    (0, common_1.Post)('newsletter/text'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendNewsletterTextDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendNewsletterText", null);
__decorate([
    (0, common_1.Post)('newsletter/image'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendNewsletterImageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendNewsletterImage", null);
__decorate([
    (0, common_1.Post)('newsletter/video'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.SendNewsletterVideoDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "sendNewsletterVideo", null);
exports.MessagesController = MessagesController = __decorate([
    (0, swagger_1.ApiTags)('Messages'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map
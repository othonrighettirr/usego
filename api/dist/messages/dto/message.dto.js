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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendNewsletterVideoDto = exports.SendNewsletterImageDto = exports.SendNewsletterTextDto = exports.CreateGroupDto = exports.ReactMessageDto = exports.DeleteMessageDto = exports.GroupSettingsDto = exports.GroupDescriptionDto = exports.GroupSubjectDto = exports.GroupParticipantsDto = exports.SendStickerDto = exports.SendPollDto = exports.SendListDto = exports.ListSectionDto = exports.ListRowDto = exports.SendLocationDto = exports.SendContactDto = exports.SendDocumentDto = exports.SendVideoDto = exports.SendAudioDto = exports.SendImageDto = exports.SendTextDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SendTextDto {
}
exports.SendTextDto = SendTextDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTextDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTextDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTextDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SendTextDto.prototype, "mentions", void 0);
class SendImageDto {
}
exports.SendImageDto = SendImageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendImageDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendImageDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendImageDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendImageDto.prototype, "caption", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SendImageDto.prototype, "mentions", void 0);
class SendAudioDto {
}
exports.SendAudioDto = SendAudioDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendAudioDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendAudioDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendAudioDto.prototype, "audioUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SendAudioDto.prototype, "ptt", void 0);
class SendVideoDto {
}
exports.SendVideoDto = SendVideoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendVideoDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendVideoDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendVideoDto.prototype, "videoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendVideoDto.prototype, "caption", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SendVideoDto.prototype, "mentions", void 0);
class SendDocumentDto {
}
exports.SendDocumentDto = SendDocumentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendDocumentDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendDocumentDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendDocumentDto.prototype, "documentUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendDocumentDto.prototype, "filename", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendDocumentDto.prototype, "caption", void 0);
class SendContactDto {
}
exports.SendContactDto = SendContactDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendContactDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendContactDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendContactDto.prototype, "contactName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendContactDto.prototype, "contactPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendContactDto.prototype, "organization", void 0);
class SendLocationDto {
}
exports.SendLocationDto = SendLocationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendLocationDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendLocationDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SendLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SendLocationDto.prototype, "longitude", void 0);
class ListRowDto {
}
exports.ListRowDto = ListRowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListRowDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListRowDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListRowDto.prototype, "rowId", void 0);
class ListSectionDto {
}
exports.ListSectionDto = ListSectionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListSectionDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ListRowDto),
    __metadata("design:type", Array)
], ListSectionDto.prototype, "rows", void 0);
class SendListDto {
}
exports.SendListDto = SendListDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendListDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendListDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendListDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendListDto.prototype, "buttonText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendListDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendListDto.prototype, "footer", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ListSectionDto),
    __metadata("design:type", Array)
], SendListDto.prototype, "sections", void 0);
class SendPollDto {
}
exports.SendPollDto = SendPollDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendPollDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendPollDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendPollDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SendPollDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SendPollDto.prototype, "selectableCount", void 0);
class SendStickerDto {
}
exports.SendStickerDto = SendStickerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendStickerDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendStickerDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendStickerDto.prototype, "stickerUrl", void 0);
class GroupParticipantsDto {
}
exports.GroupParticipantsDto = GroupParticipantsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupParticipantsDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupParticipantsDto.prototype, "groupId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GroupParticipantsDto.prototype, "participants", void 0);
class GroupSubjectDto {
}
exports.GroupSubjectDto = GroupSubjectDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupSubjectDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupSubjectDto.prototype, "groupId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupSubjectDto.prototype, "subject", void 0);
class GroupDescriptionDto {
}
exports.GroupDescriptionDto = GroupDescriptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupDescriptionDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupDescriptionDto.prototype, "groupId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupDescriptionDto.prototype, "description", void 0);
class GroupSettingsDto {
}
exports.GroupSettingsDto = GroupSettingsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupSettingsDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupSettingsDto.prototype, "groupId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GroupSettingsDto.prototype, "announce", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GroupSettingsDto.prototype, "restrict", void 0);
class DeleteMessageDto {
}
exports.DeleteMessageDto = DeleteMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteMessageDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteMessageDto.prototype, "remoteJid", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteMessageDto.prototype, "messageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DeleteMessageDto.prototype, "forEveryone", void 0);
class ReactMessageDto {
}
exports.ReactMessageDto = ReactMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReactMessageDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReactMessageDto.prototype, "remoteJid", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReactMessageDto.prototype, "messageId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReactMessageDto.prototype, "emoji", void 0);
class CreateGroupDto {
}
exports.CreateGroupDto = CreateGroupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateGroupDto.prototype, "participants", void 0);
class SendNewsletterTextDto {
}
exports.SendNewsletterTextDto = SendNewsletterTextDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterTextDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterTextDto.prototype, "newsletterId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterTextDto.prototype, "text", void 0);
class SendNewsletterImageDto {
}
exports.SendNewsletterImageDto = SendNewsletterImageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterImageDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterImageDto.prototype, "newsletterId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterImageDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterImageDto.prototype, "caption", void 0);
class SendNewsletterVideoDto {
}
exports.SendNewsletterVideoDto = SendNewsletterVideoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterVideoDto.prototype, "instanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterVideoDto.prototype, "newsletterId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterVideoDto.prototype, "videoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNewsletterVideoDto.prototype, "caption", void 0);
//# sourceMappingURL=message.dto.js.map
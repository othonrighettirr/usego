import { MessagesService } from './messages.service';
import { SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto, SendContactDto, SendLocationDto, SendListDto, SendPollDto, SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto, GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto, SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto } from './dto/message.dto';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    sendText(dto: SendTextDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendImage(dto: SendImageDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendAudio(dto: SendAudioDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendVideo(dto: SendVideoDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendDocument(dto: SendDocumentDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendContact(dto: SendContactDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendLocation(dto: SendLocationDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendList(dto: SendListDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendPoll(dto: SendPollDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendSticker(dto: SendStickerDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    deleteMessage(dto: DeleteMessageDto): Promise<{
        success: boolean;
        message: string;
    }>;
    reactMessage(dto: ReactMessageDto): Promise<{
        success: boolean;
        emoji: string;
    }>;
    sendWithMentions(dto: SendTextDto): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    createGroup(dto: CreateGroupDto): Promise<{
        success: boolean;
        groupId: any;
        name: string;
        participants: any;
    }>;
    addGroupParticipants(dto: GroupParticipantsDto): Promise<{
        success: boolean;
        result: any;
    }>;
    removeGroupParticipants(dto: GroupParticipantsDto): Promise<{
        success: boolean;
        result: any;
    }>;
    promoteGroupParticipants(dto: GroupParticipantsDto): Promise<{
        success: boolean;
        result: any;
    }>;
    demoteGroupParticipants(dto: GroupParticipantsDto): Promise<{
        success: boolean;
        result: any;
    }>;
    updateGroupSubject(dto: GroupSubjectDto): Promise<{
        success: boolean;
        subject: string;
    }>;
    updateGroupDescription(dto: GroupDescriptionDto): Promise<{
        success: boolean;
        description: string;
    }>;
    updateGroupSettings(dto: GroupSettingsDto): Promise<{
        success: boolean;
        announce: boolean;
        restrict: boolean;
    }>;
    leaveGroup(body: {
        instanceId: string;
        groupId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getGroupInvite(instanceId: string, groupId: string): Promise<{
        success: boolean;
        code: any;
        link: string;
    }>;
    revokeGroupInvite(body: {
        instanceId: string;
        groupId: string;
    }): Promise<{
        success: boolean;
        code: any;
        link: string;
    }>;
    getNewsletters(instanceId: string): Promise<{
        success: boolean;
        newsletters: any;
        message?: undefined;
    } | {
        success: boolean;
        newsletters: any[];
        message: string;
    }>;
    sendNewsletterText(dto: SendNewsletterTextDto): Promise<{
        success: boolean;
        newsletterId: string;
        type: string;
    }>;
    sendNewsletterImage(dto: SendNewsletterImageDto): Promise<{
        success: boolean;
        newsletterId: string;
        type: string;
    }>;
    sendNewsletterVideo(dto: SendNewsletterVideoDto): Promise<{
        success: boolean;
        newsletterId: string;
        type: string;
    }>;
}

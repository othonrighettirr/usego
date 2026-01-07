import { MessagesService } from './messages.service';
import { SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto, SendContactDto, SendLocationDto, SendListDto, SendPollDto, SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto, GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto, SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto } from './dto/message.dto';
export declare class ApiController {
    private messagesService;
    constructor(messagesService: MessagesService);
    private withInstanceId;
    sendText(dto: Omit<SendTextDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendImage(dto: Omit<SendImageDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendAudio(dto: Omit<SendAudioDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendVideo(dto: Omit<SendVideoDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendDocument(dto: Omit<SendDocumentDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendContact(dto: Omit<SendContactDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendLocation(dto: Omit<SendLocationDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendList(dto: Omit<SendListDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendPoll(dto: Omit<SendPollDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    sendSticker(dto: Omit<SendStickerDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    deleteMessage(dto: Omit<DeleteMessageDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    reactMessage(dto: Omit<ReactMessageDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        emoji: string;
    }>;
    sendWithMentions(dto: Omit<SendTextDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        id: string;
        from: string;
        to: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
        instanceId: string;
    }>;
    createGroup(dto: Omit<CreateGroupDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        groupId: any;
        name: string;
        participants: any;
    }>;
    addGroupParticipants(dto: Omit<GroupParticipantsDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        result: any;
    }>;
    removeGroupParticipants(dto: Omit<GroupParticipantsDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        result: any;
    }>;
    promoteGroupParticipants(dto: Omit<GroupParticipantsDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        result: any;
    }>;
    demoteGroupParticipants(dto: Omit<GroupParticipantsDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        result: any;
    }>;
    updateGroupSubject(dto: Omit<GroupSubjectDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        subject: string;
    }>;
    updateGroupDescription(dto: Omit<GroupDescriptionDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        description: string;
    }>;
    updateGroupSettings(dto: Omit<GroupSettingsDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        announce: boolean;
        restrict: boolean;
    }>;
    leaveGroup(body: {
        groupId: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getGroupInvite(groupId: string, req: any): Promise<{
        success: boolean;
        code: any;
        link: string;
    }>;
    revokeGroupInvite(body: {
        groupId: string;
    }, req: any): Promise<{
        success: boolean;
        code: any;
        link: string;
    }>;
    getNewsletters(req: any): Promise<{
        success: boolean;
        newsletters: any;
        message?: undefined;
    } | {
        success: boolean;
        newsletters: any[];
        message: string;
    }>;
    sendNewsletterText(dto: Omit<SendNewsletterTextDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        newsletterId: string;
        type: string;
    }>;
    sendNewsletterImage(dto: Omit<SendNewsletterImageDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        newsletterId: string;
        type: string;
    }>;
    sendNewsletterVideo(dto: Omit<SendNewsletterVideoDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        success: boolean;
        newsletterId: string;
        type: string;
    }>;
}

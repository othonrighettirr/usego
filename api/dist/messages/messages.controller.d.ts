import { MessagesService } from './messages.service';
import { SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto, SendContactDto, SendLocationDto, SendListDto, SendPollDto, SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto, GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto, SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto } from './dto/message.dto';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    sendText(dto: SendTextDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendImage(dto: SendImageDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendAudio(dto: SendAudioDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendVideo(dto: SendVideoDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendDocument(dto: SendDocumentDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendContact(dto: SendContactDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendLocation(dto: SendLocationDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendList(dto: SendListDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendPoll(dto: SendPollDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
    }>;
    sendSticker(dto: SendStickerDto): Promise<{
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
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
        instanceId: string;
        to: string;
        id: string;
        from: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        createdAt: Date;
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
        newsletters: any[];
        info: {
            message: string;
            formato: string;
            comoObter: string;
            endpoints: {
                metadados: string;
                enviarTexto: string;
                enviarImagem: string;
                enviarVideo: string;
                criar: string;
                seguir: string;
                deixarDeSeguir: string;
                silenciar: string;
                inscritos: string;
            };
        };
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

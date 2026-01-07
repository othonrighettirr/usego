import { MessagesService } from './messages.service';
import { SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto, SendContactDto, SendLocationDto, SendListDto, SendPollDto, SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto, GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto, SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto } from './dto/message.dto';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    sendText(dto: SendTextDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendImage(dto: SendImageDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendAudio(dto: SendAudioDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendVideo(dto: SendVideoDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendDocument(dto: SendDocumentDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendContact(dto: SendContactDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendLocation(dto: SendLocationDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendList(dto: SendListDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendPoll(dto: SendPollDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendSticker(dto: SendStickerDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
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
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
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
        total: number;
        info: {
            message: string;
            formato: string;
            comoObter: string;
            endpoints: {
                listar: string;
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
        owned?: undefined;
    } | {
        success: boolean;
        newsletters: {
            id: any;
            name: any;
            description: any;
            subscribers: number;
            picture: any;
            isOwner: boolean;
            role: string;
        }[];
        total: number;
        owned: number;
        info?: undefined;
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

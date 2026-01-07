import { MessagesService } from './messages.service';
import { SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto, SendContactDto, SendLocationDto, SendListDto, SendPollDto, SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto, GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto, SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto } from './dto/message.dto';
export declare class ApiController {
    private messagesService;
    constructor(messagesService: MessagesService);
    private withInstanceId;
    sendText(dto: Omit<SendTextDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendImage(dto: Omit<SendImageDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendAudio(dto: Omit<SendAudioDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendVideo(dto: Omit<SendVideoDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendDocument(dto: Omit<SendDocumentDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendContact(dto: Omit<SendContactDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendLocation(dto: Omit<SendLocationDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendList(dto: Omit<SendListDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendPoll(dto: Omit<SendPollDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
    }>;
    sendSticker(dto: Omit<SendStickerDto, 'instanceId'> & {
        instanceId?: string;
    }, req: any): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
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
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
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
    getNewsletterMetadata(newsletterId: string, req: any): Promise<{
        success: boolean;
        newsletter: any;
    }>;
    getNewsletterSubscribers(newsletterId: string, req: any): Promise<{
        success: boolean;
        newsletterId: string;
        subscribers: any;
    }>;
    getNewsletterMessages(newsletterId: string, req: any): Promise<{
        success: boolean;
        newsletterId: string;
        messages: any;
        count: any;
    }>;
    createNewsletter(body: {
        name: string;
        description?: string;
    }, req: any): Promise<{
        success: boolean;
        newsletter: any;
        message: string;
    }>;
    followNewsletter(body: {
        newsletterId: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    unfollowNewsletter(body: {
        newsletterId: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    muteNewsletter(body: {
        newsletterId: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    unmuteNewsletter(body: {
        newsletterId: string;
    }, req: any): Promise<{
        success: boolean;
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
    getGroups(req: any): Promise<{
        success: boolean;
        groups: {
            id: any;
            name: any;
            participants: any;
            creation: any;
            owner: any;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        groups: any[];
        error: any;
    }>;
    getGroupParticipants(groupId: string, req: any): Promise<{
        success: boolean;
        groupName: any;
        groupId: any;
        participants: any;
    }>;
    getAllContacts(req: any): Promise<{
        success: boolean;
        contacts: {
            id: string;
            phone: string;
            name: string;
        }[];
    }>;
    getFollowedNewsletters(req: any): Promise<{
        success: boolean;
        newsletters: {
            id: any;
            name: any;
            description: any;
            subscribers: number;
            picture: any;
        }[];
    }>;
    getChannelSubscribers(newsletterId: string, req: any): Promise<{
        success: boolean;
        newsletterId: string;
        subscribers: any;
        error?: undefined;
    } | {
        success: boolean;
        subscribers: number;
        error: any;
        newsletterId?: undefined;
    }>;
}

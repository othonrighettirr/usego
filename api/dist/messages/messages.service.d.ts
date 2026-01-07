import { PrismaService } from '../shared/prisma.service';
import { BaileysService } from '../instances/baileys.service';
import { SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto, SendContactDto, SendLocationDto, SendListDto, SendPollDto, SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto, GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto, SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto } from './dto/message.dto';
export declare class MessagesService {
    private prisma;
    private baileys;
    private readonly logger;
    constructor(prisma: PrismaService, baileys: BaileysService);
    private normalizeUrl;
    private downloadMedia;
    private convertToOggOpus;
    private getMimeType;
    private formatPhone;
    private normalizeBrazilianPhone;
    private getValidWhatsAppNumber;
    private saveMessage;
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
    leaveGroup(instanceId: string, groupId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getGroupInviteCode(instanceId: string, groupId: string): Promise<{
        success: boolean;
        code: any;
        link: string;
    }>;
    revokeGroupInvite(instanceId: string, groupId: string): Promise<{
        success: boolean;
        code: any;
        link: string;
    }>;
    deleteMessage(dto: DeleteMessageDto): Promise<{
        success: boolean;
        message: string;
    }>;
    reactMessage(dto: ReactMessageDto): Promise<{
        success: boolean;
        emoji: string;
    }>;
    sendTextWithMentions(dto: SendTextDto): Promise<{
        type: string;
        instanceId: string;
        id: string;
        status: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        to: string;
        from: string;
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
    getNewsletterMetadata(instanceId: string, newsletterId: string): Promise<{
        success: boolean;
        newsletter: any;
    }>;
    createNewsletter(instanceId: string, name: string, description?: string): Promise<{
        success: boolean;
        newsletter: any;
        message: string;
    }>;
    followNewsletter(instanceId: string, newsletterId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unfollowNewsletter(instanceId: string, newsletterId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    muteNewsletter(instanceId: string, newsletterId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unmuteNewsletter(instanceId: string, newsletterId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getNewsletterSubscribers(instanceId: string, newsletterId: string): Promise<{
        success: boolean;
        newsletterId: string;
        subscribers: any;
    }>;
    getNewsletterMessages(instanceId: string, newsletterId: string, count?: number): Promise<{
        success: boolean;
        newsletterId: string;
        messages: any;
        count: any;
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
    getGroups(instanceId: string): Promise<{
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
    getGroupParticipants(instanceId: string, groupId: string): Promise<{
        success: boolean;
        groupName: any;
        groupId: any;
        participants: any;
    }>;
    getAllContacts(instanceId: string): Promise<{
        success: boolean;
        contacts: {
            id: string;
            phone: string;
            name: string;
        }[];
    }>;
    getFollowedNewsletters(instanceId: string): Promise<{
        success: boolean;
        newsletters: {
            id: any;
            name: any;
            description: any;
            subscribers: number;
            picture: any;
        }[];
    }>;
    getChannelSubscribers(instanceId: string, newsletterId: string): Promise<{
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

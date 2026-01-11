export declare class SendTextDto {
    instanceId: string;
    to: string;
    text: string;
    mentions?: string[];
}
export declare class SendImageDto {
    instanceId: string;
    to: string;
    imageUrl: string;
    caption?: string;
    mentions?: string[];
}
export declare class SendAudioDto {
    instanceId: string;
    to: string;
    audioUrl: string;
    ptt?: boolean;
}
export declare class SendVideoDto {
    instanceId: string;
    to: string;
    videoUrl: string;
    caption?: string;
    mentions?: string[];
}
export declare class SendDocumentDto {
    instanceId: string;
    to: string;
    documentUrl: string;
    filename?: string;
    caption?: string;
}
export declare class SendContactDto {
    instanceId: string;
    to: string;
    contactName: string;
    contactPhone: string;
    organization?: string;
}
export declare class SendLocationDto {
    instanceId: string;
    to: string;
    latitude: number;
    longitude: number;
}
export declare class ListRowDto {
    title: string;
    description?: string;
    rowId: string;
}
export declare class ListSectionDto {
    title: string;
    rows: ListRowDto[];
}
export declare class SendListDto {
    instanceId: string;
    to: string;
    text: string;
    buttonText: string;
    title?: string;
    footer?: string;
    sections: ListSectionDto[];
}
export declare class SendPollDto {
    instanceId: string;
    to: string;
    question: string;
    options: string[];
    selectableCount?: number;
}
export declare class SendStickerDto {
    instanceId: string;
    to: string;
    stickerUrl: string;
}
export declare class GroupParticipantsDto {
    instanceId: string;
    groupId: string;
    participants: string[];
}
export declare class GroupSubjectDto {
    instanceId: string;
    groupId: string;
    subject: string;
}
export declare class GroupDescriptionDto {
    instanceId: string;
    groupId: string;
    description: string;
}
export declare class GroupSettingsDto {
    instanceId: string;
    groupId: string;
    announce?: boolean;
    restrict?: boolean;
}
export declare class DeleteMessageDto {
    instanceId: string;
    remoteJid: string;
    messageId: string;
    forEveryone?: boolean;
}
export declare class ReactMessageDto {
    instanceId: string;
    remoteJid: string;
    messageId: string;
    emoji: string;
}
export declare class CreateGroupDto {
    instanceId: string;
    name: string;
    participants: string[];
}
export declare class SendNewsletterTextDto {
    instanceId: string;
    newsletterId: string;
    text: string;
}
export declare class SendNewsletterImageDto {
    instanceId: string;
    newsletterId: string;
    imageUrl: string;
    caption?: string;
}
export declare class SendNewsletterVideoDto {
    instanceId: string;
    newsletterId: string;
    videoUrl: string;
    caption?: string;
}

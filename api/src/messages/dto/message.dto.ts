import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SendTextDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() text: string;
  @IsOptional() @IsArray() @IsString({ each: true }) mentions?: string[];
}

export class SendImageDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() imageUrl: string;
  @IsOptional() @IsString() caption?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) mentions?: string[];
}

export class SendAudioDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() audioUrl: string;
  @IsOptional() @IsBoolean() ptt?: boolean;
}

export class SendVideoDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() videoUrl: string;
  @IsOptional() @IsString() caption?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) mentions?: string[];
}

export class SendDocumentDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() documentUrl: string;
  @IsOptional() @IsString() filename?: string;
  @IsOptional() @IsString() caption?: string;
}

export class SendContactDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() contactName: string;
  @IsString() contactPhone: string;
  @IsOptional() @IsString() organization?: string;
}

export class SendLocationDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsNumber() latitude: number;
  @IsNumber() longitude: number;
}

export class ListRowDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsString() rowId: string;
}

export class ListSectionDto {
  @IsString() title: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ListRowDto)
  rows: ListRowDto[];
}

export class SendListDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() text: string;
  @IsString() buttonText: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() footer?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ListSectionDto)
  sections: ListSectionDto[];
}

export class SendPollDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() question: string;
  @IsArray() @IsString({ each: true }) options: string[];
  @IsOptional() @IsNumber() selectableCount?: number;
}

// ========================================
// DTOs para Stickers
// ========================================
export class SendStickerDto {
  @IsString() instanceId: string;
  @IsString() to: string;
  @IsString() stickerUrl: string;
}

// ========================================
// DTOs para Gerenciamento de Grupos
// ========================================
export class GroupParticipantsDto {
  @IsString() instanceId: string;
  @IsString() groupId: string;
  @IsArray() @IsString({ each: true }) participants: string[];
}

export class GroupSubjectDto {
  @IsString() instanceId: string;
  @IsString() groupId: string;
  @IsString() subject: string;
}

export class GroupDescriptionDto {
  @IsString() instanceId: string;
  @IsString() groupId: string;
  @IsString() description: string;
}

export class GroupSettingsDto {
  @IsString() instanceId: string;
  @IsString() groupId: string;
  @IsOptional() @IsBoolean() announce?: boolean; // Apenas admins podem enviar
  @IsOptional() @IsBoolean() restrict?: boolean; // Apenas admins podem editar info
}

export class DeleteMessageDto {
  @IsString() instanceId: string;
  @IsString() remoteJid: string;
  @IsString() messageId: string;
  @IsOptional() @IsBoolean() forEveryone?: boolean;
}

export class ReactMessageDto {
  @IsString() instanceId: string;
  @IsString() remoteJid: string;
  @IsString() messageId: string;
  @IsString() emoji: string;
}

export class CreateGroupDto {
  @IsString() instanceId: string;
  @IsString() name: string;
  @IsArray() @IsString({ each: true }) participants: string[];
}

// ========================================
// DTOs para Newsletter/Canal
// ========================================
export class SendNewsletterTextDto {
  @IsString() instanceId: string;
  @IsString() newsletterId: string;
  @IsString() text: string;
}

export class SendNewsletterImageDto {
  @IsString() instanceId: string;
  @IsString() newsletterId: string;
  @IsString() imageUrl: string;
  @IsOptional() @IsString() caption?: string;
}

export class SendNewsletterVideoDto {
  @IsString() instanceId: string;
  @IsString() newsletterId: string;
  @IsString() videoUrl: string;
  @IsOptional() @IsString() caption?: string;
}

import { Controller, Post, Body, UseGuards, Get, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';
import {
  SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto,
  SendContactDto, SendLocationDto, SendListDto, SendPollDto,
  SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto,
  GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto,
  SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto,
} from './dto/message.dto';

@ApiTags('Messages')
@ApiBearerAuth('JWT-auth')
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('text')
  @ApiOperation({ summary: 'Enviar mensagem de texto' })
  sendText(@Body() dto: SendTextDto) {
    return this.messagesService.sendText(dto);
  }

  @Post('image')
  @ApiOperation({ summary: 'Enviar imagem' })
  sendImage(@Body() dto: SendImageDto) {
    return this.messagesService.sendImage(dto);
  }

  @Post('audio')
  @ApiOperation({ summary: 'Enviar áudio' })
  sendAudio(@Body() dto: SendAudioDto) {
    return this.messagesService.sendAudio(dto);
  }

  @Post('video')
  @ApiOperation({ summary: 'Enviar vídeo' })
  sendVideo(@Body() dto: SendVideoDto) {
    return this.messagesService.sendVideo(dto);
  }

  @Post('document')
  @ApiOperation({ summary: 'Enviar documento' })
  sendDocument(@Body() dto: SendDocumentDto) {
    return this.messagesService.sendDocument(dto);
  }

  @Post('contact')
  @ApiOperation({ summary: 'Enviar contato' })
  sendContact(@Body() dto: SendContactDto) {
    return this.messagesService.sendContact(dto);
  }

  @Post('location')
  @ApiOperation({ summary: 'Enviar localização' })
  sendLocation(@Body() dto: SendLocationDto) {
    return this.messagesService.sendLocation(dto);
  }

  @Post('list')
  sendList(@Body() dto: SendListDto) {
    return this.messagesService.sendList(dto);
  }

  @Post('poll')
  sendPoll(@Body() dto: SendPollDto) {
    return this.messagesService.sendPoll(dto);
  }

  @Post('sticker')
  sendSticker(@Body() dto: SendStickerDto) {
    return this.messagesService.sendSticker(dto);
  }

  // ========================================
  // AÇÕES DE MENSAGENS
  // ========================================

  @Post('delete')
  deleteMessage(@Body() dto: DeleteMessageDto) {
    return this.messagesService.deleteMessage(dto);
  }

  @Post('react')
  reactMessage(@Body() dto: ReactMessageDto) {
    return this.messagesService.reactMessage(dto);
  }

  @Post('mention')
  sendWithMentions(@Body() dto: SendTextDto) {
    return this.messagesService.sendTextWithMentions(dto);
  }

  // ========================================
  // GERENCIAMENTO DE GRUPOS
  // ========================================

  @Post('group/create')
  createGroup(@Body() dto: CreateGroupDto) {
    return this.messagesService.createGroup(dto);
  }

  @Post('group/add')
  addGroupParticipants(@Body() dto: GroupParticipantsDto) {
    return this.messagesService.addGroupParticipants(dto);
  }

  @Post('group/remove')
  removeGroupParticipants(@Body() dto: GroupParticipantsDto) {
    return this.messagesService.removeGroupParticipants(dto);
  }

  @Post('group/promote')
  promoteGroupParticipants(@Body() dto: GroupParticipantsDto) {
    return this.messagesService.promoteGroupParticipants(dto);
  }

  @Post('group/demote')
  demoteGroupParticipants(@Body() dto: GroupParticipantsDto) {
    return this.messagesService.demoteGroupParticipants(dto);
  }

  @Post('group/subject')
  updateGroupSubject(@Body() dto: GroupSubjectDto) {
    return this.messagesService.updateGroupSubject(dto);
  }

  @Post('group/description')
  updateGroupDescription(@Body() dto: GroupDescriptionDto) {
    return this.messagesService.updateGroupDescription(dto);
  }

  @Post('group/settings')
  updateGroupSettings(@Body() dto: GroupSettingsDto) {
    return this.messagesService.updateGroupSettings(dto);
  }

  @Post('group/leave')
  leaveGroup(@Body() body: { instanceId: string; groupId: string }) {
    return this.messagesService.leaveGroup(body.instanceId, body.groupId);
  }

  @Get('group/:instanceId/:groupId/invite')
  getGroupInvite(@Param('instanceId') instanceId: string, @Param('groupId') groupId: string) {
    return this.messagesService.getGroupInviteCode(instanceId, groupId);
  }

  @Post('group/revoke-invite')
  revokeGroupInvite(@Body() body: { instanceId: string; groupId: string }) {
    return this.messagesService.revokeGroupInvite(body.instanceId, body.groupId);
  }

  // ========================================
  // NEWSLETTER / CANAIS
  // ========================================

  @Get('newsletter/:instanceId')
  getNewsletters(@Param('instanceId') instanceId: string) {
    return this.messagesService.getNewsletters(instanceId);
  }

  @Post('newsletter/text')
  sendNewsletterText(@Body() dto: SendNewsletterTextDto) {
    return this.messagesService.sendNewsletterText(dto);
  }

  @Post('newsletter/image')
  sendNewsletterImage(@Body() dto: SendNewsletterImageDto) {
    return this.messagesService.sendNewsletterImage(dto);
  }

  @Post('newsletter/video')
  sendNewsletterVideo(@Body() dto: SendNewsletterVideoDto) {
    return this.messagesService.sendNewsletterVideo(dto);
  }
}

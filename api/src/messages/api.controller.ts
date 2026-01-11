import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { MessagesService } from './messages.service';
import {
  SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto,
  SendContactDto, SendLocationDto, SendListDto, SendPollDto,
  SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto,
  GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto,
  SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto,
} from './dto/message.dto';

@ApiTags('API')
@ApiSecurity('api-key')
@Controller('api')
@UseGuards(ApiKeyGuard)
export class ApiController {
  constructor(private messagesService: MessagesService) {}

  private withInstanceId(dto: any, req: any) {
    return { ...dto, instanceId: req.instanceId };
  }

  @Post('send/text')
  @ApiOperation({ summary: 'Enviar texto via API Key' })
  sendText(@Body() dto: Omit<SendTextDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendText(this.withInstanceId(dto, req));
  }

  @Post('send/image')
  @ApiOperation({ summary: 'Enviar imagem via API Key' })
  sendImage(@Body() dto: Omit<SendImageDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendImage(this.withInstanceId(dto, req));
  }

  @Post('send/audio')
  @ApiOperation({ summary: 'Enviar áudio via API Key' })
  sendAudio(@Body() dto: Omit<SendAudioDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendAudio(this.withInstanceId(dto, req));
  }

  @Post('send/video')
  @ApiOperation({ summary: 'Enviar vídeo via API Key' })
  sendVideo(@Body() dto: Omit<SendVideoDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendVideo(this.withInstanceId(dto, req));
  }

  @Post('send/document')
  @ApiOperation({ summary: 'Enviar documento via API Key' })
  sendDocument(@Body() dto: Omit<SendDocumentDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendDocument(this.withInstanceId(dto, req));
  }

  @Post('send/contact')
  @ApiOperation({ summary: 'Enviar contato via API Key' })
  sendContact(@Body() dto: Omit<SendContactDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendContact(this.withInstanceId(dto, req));
  }

  @Post('send/location')
  @ApiOperation({ summary: 'Enviar localização via API Key' })
  sendLocation(@Body() dto: Omit<SendLocationDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendLocation(this.withInstanceId(dto, req));
  }

  @Post('send/list')
  @ApiOperation({ summary: 'Enviar lista via API Key' })
  sendList(@Body() dto: Omit<SendListDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendList(this.withInstanceId(dto, req));
  }

  @Post('send/poll')
  sendPoll(@Body() dto: Omit<SendPollDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendPoll(this.withInstanceId(dto, req));
  }

  @Post('send/sticker')
  sendSticker(@Body() dto: Omit<SendStickerDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendSticker(this.withInstanceId(dto, req));
  }

  // ========================================
  // AÇÕES DE MENSAGENS
  // ========================================

  @Post('message/delete')
  deleteMessage(@Body() dto: Omit<DeleteMessageDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.deleteMessage(this.withInstanceId(dto, req));
  }

  @Post('message/react')
  reactMessage(@Body() dto: Omit<ReactMessageDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.reactMessage(this.withInstanceId(dto, req));
  }

  @Post('send/mention')
  sendWithMentions(@Body() dto: Omit<SendTextDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendTextWithMentions(this.withInstanceId(dto, req));
  }

  // ========================================
  // GERENCIAMENTO DE GRUPOS
  // ========================================

  @Post('group/create')
  createGroup(@Body() dto: Omit<CreateGroupDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.createGroup(this.withInstanceId(dto, req));
  }

  @Post('group/add')
  addGroupParticipants(@Body() dto: Omit<GroupParticipantsDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.addGroupParticipants(this.withInstanceId(dto, req));
  }

  @Post('group/remove')
  removeGroupParticipants(@Body() dto: Omit<GroupParticipantsDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.removeGroupParticipants(this.withInstanceId(dto, req));
  }

  @Post('group/promote')
  promoteGroupParticipants(@Body() dto: Omit<GroupParticipantsDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.promoteGroupParticipants(this.withInstanceId(dto, req));
  }

  @Post('group/demote')
  demoteGroupParticipants(@Body() dto: Omit<GroupParticipantsDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.demoteGroupParticipants(this.withInstanceId(dto, req));
  }

  @Post('group/subject')
  updateGroupSubject(@Body() dto: Omit<GroupSubjectDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.updateGroupSubject(this.withInstanceId(dto, req));
  }

  @Post('group/description')
  updateGroupDescription(@Body() dto: Omit<GroupDescriptionDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.updateGroupDescription(this.withInstanceId(dto, req));
  }

  @Post('group/settings')
  updateGroupSettings(@Body() dto: Omit<GroupSettingsDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.updateGroupSettings(this.withInstanceId(dto, req));
  }

  @Post('group/leave')
  leaveGroup(@Body() body: { groupId: string }, @Req() req: any) {
    return this.messagesService.leaveGroup(req.instanceId, body.groupId);
  }

  @Get('group/:groupId/invite')
  getGroupInvite(@Param('groupId') groupId: string, @Req() req: any) {
    return this.messagesService.getGroupInviteCode(req.instanceId, groupId);
  }

  @Post('group/:groupId/revoke')
  @ApiOperation({ summary: 'Revogar link de convite do grupo' })
  revokeGroupInviteByParam(@Param('groupId') groupId: string, @Req() req: any) {
    return this.messagesService.revokeGroupInvite(req.instanceId, groupId);
  }

  @Post('group/revoke-invite')
  revokeGroupInvite(@Body() body: { groupId: string }, @Req() req: any) {
    return this.messagesService.revokeGroupInvite(req.instanceId, body.groupId);
  }

  // ========================================
  // NEWSLETTER / CANAIS
  // ========================================

  @Get('newsletter')
  @ApiOperation({ summary: 'Informações sobre newsletters e endpoints disponíveis' })
  getNewsletters(@Req() req: any) {
    return this.messagesService.getNewsletters(req.instanceId);
  }

  @Get('newsletter/:newsletterId')
  @ApiOperation({ summary: 'Buscar metadados de uma newsletter' })
  getNewsletterMetadata(@Param('newsletterId') newsletterId: string, @Req() req: any) {
    return this.messagesService.getNewsletterMetadata(req.instanceId, newsletterId);
  }

  @Get('newsletter/:newsletterId/subscribers')
  @ApiOperation({ summary: 'Obter número de inscritos de uma newsletter' })
  getNewsletterSubscribers(@Param('newsletterId') newsletterId: string, @Req() req: any) {
    return this.messagesService.getNewsletterSubscribers(req.instanceId, newsletterId);
  }

  @Get('newsletter/:newsletterId/messages')
  @ApiOperation({ summary: 'Buscar mensagens de uma newsletter' })
  getNewsletterMessages(@Param('newsletterId') newsletterId: string, @Req() req: any) {
    return this.messagesService.getNewsletterMessages(req.instanceId, newsletterId, 10);
  }

  @Post('newsletter/create')
  @ApiOperation({ summary: 'Criar uma nova newsletter/canal' })
  createNewsletter(@Body() body: { name: string; description?: string }, @Req() req: any) {
    return this.messagesService.createNewsletter(req.instanceId, body.name, body.description);
  }

  @Post('newsletter/follow')
  @ApiOperation({ summary: 'Seguir uma newsletter' })
  followNewsletter(@Body() body: { newsletterId: string }, @Req() req: any) {
    return this.messagesService.followNewsletter(req.instanceId, body.newsletterId);
  }

  @Post('newsletter/unfollow')
  @ApiOperation({ summary: 'Deixar de seguir uma newsletter' })
  unfollowNewsletter(@Body() body: { newsletterId: string }, @Req() req: any) {
    return this.messagesService.unfollowNewsletter(req.instanceId, body.newsletterId);
  }

  @Post('newsletter/mute')
  @ApiOperation({ summary: 'Silenciar uma newsletter' })
  muteNewsletter(@Body() body: { newsletterId: string }, @Req() req: any) {
    return this.messagesService.muteNewsletter(req.instanceId, body.newsletterId);
  }

  @Post('newsletter/unmute')
  @ApiOperation({ summary: 'Dessilenciar uma newsletter' })
  unmuteNewsletter(@Body() body: { newsletterId: string }, @Req() req: any) {
    return this.messagesService.unmuteNewsletter(req.instanceId, body.newsletterId);
  }

  @Post('newsletter/text')
  @ApiOperation({ summary: 'Enviar texto para newsletter' })
  sendNewsletterText(@Body() dto: Omit<SendNewsletterTextDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendNewsletterText(this.withInstanceId(dto, req));
  }

  @Post('newsletter/image')
  @ApiOperation({ summary: 'Enviar imagem para newsletter' })
  sendNewsletterImage(@Body() dto: Omit<SendNewsletterImageDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendNewsletterImage(this.withInstanceId(dto, req));
  }

  @Post('newsletter/video')
  @ApiOperation({ summary: 'Enviar vídeo para newsletter' })
  sendNewsletterVideo(@Body() dto: Omit<SendNewsletterVideoDto, 'instanceId'> & { instanceId?: string }, @Req() req: any) {
    return this.messagesService.sendNewsletterVideo(this.withInstanceId(dto, req));
  }

  // ========================================
  // CONTATOS E CANAIS
  // ========================================

  @Get('contacts/groups')
  @ApiOperation({ summary: 'Listar todos os grupos da instância' })
  getGroups(@Req() req: any) {
    return this.messagesService.getGroups(req.instanceId);
  }

  @Get('contacts/groups/:groupId/participants')
  @ApiOperation({ summary: 'Listar participantes de um grupo' })
  getGroupParticipants(@Param('groupId') groupId: string, @Req() req: any) {
    return this.messagesService.getGroupParticipants(req.instanceId, groupId);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Listar todos os contatos da instância' })
  getContacts(@Req() req: any) {
    return this.messagesService.getAllContacts(req.instanceId);
  }

  @Get('contacts/all')
  @ApiOperation({ summary: 'Listar todos os contatos da instância' })
  getAllContacts(@Req() req: any) {
    return this.messagesService.getAllContacts(req.instanceId);
  }

  @Get('contacts/newsletters')
  @ApiOperation({ summary: 'Listar canais/newsletters seguidos' })
  getFollowedNewsletters(@Req() req: any) {
    return this.messagesService.getFollowedNewsletters(req.instanceId);
  }

  @Get('contacts/newsletters/:newsletterId/subscribers')
  @ApiOperation({ summary: 'Obter número de inscritos de um canal' })
  getChannelSubscribers(@Param('newsletterId') newsletterId: string, @Req() req: any) {
    return this.messagesService.getChannelSubscribers(req.instanceId, newsletterId);
  }
}

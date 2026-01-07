import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { BaileysService } from '../instances/baileys.service';
import {
  SendTextDto, SendImageDto, SendAudioDto, SendVideoDto, SendDocumentDto,
  SendContactDto, SendLocationDto, SendListDto, SendPollDto,
  SendStickerDto, GroupParticipantsDto, GroupSubjectDto, GroupDescriptionDto,
  GroupSettingsDto, DeleteMessageDto, ReactMessageDto, CreateGroupDto,
  SendNewsletterTextDto, SendNewsletterImageDto, SendNewsletterVideoDto,
} from './dto/message.dto';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private prisma: PrismaService,
    private baileys: BaileysService,
  ) {
    // Usar ffmpeg do sistema (instalado via apk no Docker)
    // O fluent-ffmpeg vai encontrar automaticamente no PATH
  }

  /**
   * Normaliza URL para garantir que funcione com http:// ou https://
   * Remove espaços e garante protocolo válido
   */
  private normalizeUrl(url: string): string {
    if (!url) return url;
    
    // Remove espaços
    let normalized = url.trim();
    
    // Se não tem protocolo, adiciona https://
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    
    return normalized;
  }

  private async downloadMedia(url: string): Promise<Buffer> {
    // Normaliza a URL antes de fazer download
    const normalizedUrl = this.normalizeUrl(url);
    
    return new Promise((resolve, reject) => {
      const protocol = normalizedUrl.startsWith('https') ? https : http;
      const options = {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      };

      protocol.get(normalizedUrl, options, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            this.downloadMedia(redirectUrl).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject).on('timeout', () => reject(new Error('Download timeout')));
    });
  }

  private async convertToOggOpus(inputBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const tempDir = os.tmpdir();
      const inputPath = path.join(tempDir, `input_${Date.now()}.tmp`);
      const outputPath = path.join(tempDir, `output_${Date.now()}.ogg`);

      fs.writeFileSync(inputPath, inputBuffer);

      ffmpeg(inputPath)
        .audioCodec('libopus')
        .audioFrequency(48000)
        .audioChannels(1)
        .audioBitrate('64k')
        .format('ogg')
        .on('error', (err) => {
          this.logger.error(`FFmpeg error: ${err.message}`);
          try { fs.unlinkSync(inputPath); } catch {}
          try { fs.unlinkSync(outputPath); } catch {}
          reject(err);
        })
        .on('end', () => {
          try {
            const outputBuffer = fs.readFileSync(outputPath);
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            resolve(outputBuffer);
          } catch (err) {
            reject(err);
          }
        })
        .save(outputPath);
    });
  }

  private getMimeType(url: string, type: 'image' | 'audio' | 'video' | 'document'): string {
    const normalizedUrl = this.normalizeUrl(url);
    const ext = normalizedUrl.split('.').pop()?.toLowerCase().split('?')[0];
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
      mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac',
      mp4: 'video/mp4', avi: 'video/avi', mkv: 'video/mkv', webm: 'video/webm',
      pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    if (ext && mimeTypes[ext]) return mimeTypes[ext];
    
    const defaults = { image: 'image/jpeg', audio: 'audio/mp4', video: 'video/mp4', document: 'application/octet-stream' };
    return defaults[type];
  }

  /**
   * Formata número de telefone para JID do WhatsApp
   */
  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (phone.includes('@s.whatsapp.net')) return phone;
    return `${cleaned}@s.whatsapp.net`;
  }

  /**
   * Normaliza número de telefone brasileiro
   * Gera variações com e sem o 9 para números brasileiros
   */
  private normalizeBrazilianPhone(phone: string): string[] {
    let cleaned = phone.replace(/\D/g, '');
    const variations: string[] = [];
    
    // Se já é um JID, retorna como está
    if (phone.includes('@s.whatsapp.net')) {
      return [phone];
    }
    
    // Adiciona o número original
    variations.push(cleaned);
    
    // Se é número brasileiro (começa com 55)
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      const ddd = cleaned.substring(2, 4);
      const rest = cleaned.substring(4);
      
      // DDDs que usam 9 dígitos (celulares): todos os celulares brasileiros agora têm 9 dígitos
      
      if (rest.length === 9 && rest.startsWith('9')) {
        // Número com 9 dígitos começando com 9 - tentar sem o 9
        const withoutNine = `55${ddd}${rest.substring(1)}`;
        variations.push(withoutNine);
      } else if (rest.length === 8) {
        // Número com 8 dígitos - tentar com o 9
        const withNine = `55${ddd}9${rest}`;
        variations.push(withNine);
      }
    }
    
    // Se não começa com código de país, assumir Brasil
    if (!cleaned.startsWith('55') && cleaned.length >= 10 && cleaned.length <= 11) {
      const withCountry = `55${cleaned}`;
      variations.push(withCountry);
      
      // Também gerar variações com/sem 9
      if (cleaned.length === 11 && cleaned.substring(2, 3) === '9') {
        // Com 9 - tentar sem
        const withoutNine = `55${cleaned.substring(0, 2)}${cleaned.substring(3)}`;
        variations.push(withoutNine);
      } else if (cleaned.length === 10) {
        // Sem 9 - tentar com
        const withNine = `55${cleaned.substring(0, 2)}9${cleaned.substring(2)}`;
        variations.push(withNine);
      }
    }
    
    return [...new Set(variations)]; // Remove duplicatas
  }

  /**
   * Verifica se um número existe no WhatsApp e retorna o JID válido
   * Tenta múltiplas variações do número (com/sem 9 para Brasil)
   */
  private async getValidWhatsAppNumber(socket: any, phone: string): Promise<string> {
    // Se já é um JID de grupo, retorna como está
    if (phone.includes('@g.us')) {
      return phone;
    }
    
    // Se já é um JID válido, retorna
    if (phone.includes('@s.whatsapp.net')) {
      return phone;
    }
    
    // Gera variações do número
    const variations = this.normalizeBrazilianPhone(phone);
    this.logger.debug(`Verificando variações do número: ${variations.join(', ')}`);
    
    // Tenta cada variação
    for (const number of variations) {
      try {
        const [result] = await socket.onWhatsApp(number);
        if (result?.exists) {
          this.logger.debug(`✅ Número válido encontrado: ${number} -> ${result.jid}`);
          return result.jid;
        }
      } catch (e) {
        this.logger.debug(`Erro ao verificar ${number}: ${e.message}`);
      }
    }
    
    // Se nenhuma variação foi encontrada, lança erro
    const originalNumber = phone.replace(/\D/g, '');
    throw new BadRequestException(
      `Número ${originalNumber} não encontrado no WhatsApp. ` +
      `Verifique se o número está correto e possui conta no WhatsApp. ` +
      `Variações testadas: ${variations.join(', ')}`
    );
  }

  private async saveMessage(instanceId: string, to: string, type: string, content: any) {
    return this.prisma.message.create({
      data: { instanceId, from: 'me', to, type, content, status: 'SENT' },
    });
  }

  async sendText(dto: SendTextDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    await socket.sendMessage(to, { text: dto.text });
    return this.saveMessage(dto.instanceId, dto.to, 'TEXT', { text: dto.text });
  }

  async sendImage(dto: SendImageDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    const imageUrl = this.normalizeUrl(dto.imageUrl);
    
    try {
      const imageBuffer = await this.downloadMedia(imageUrl);
      const mimetype = this.getMimeType(imageUrl, 'image');
      
      await socket.sendMessage(to, { 
        image: imageBuffer, 
        mimetype,
        caption: dto.caption 
      });
    } catch (downloadError) {
      this.logger.warn(`Download failed, trying direct URL: ${downloadError.message}`);
      try {
        await socket.sendMessage(to, { image: { url: imageUrl }, caption: dto.caption });
      } catch (urlError) {
        this.logger.error(`Failed to send image: ${urlError.message}`);
        throw new BadRequestException(`Não foi possível enviar a imagem. Verifique se a URL é acessível: ${imageUrl}`);
      }
    }
    
    return this.saveMessage(dto.instanceId, dto.to, 'IMAGE', { imageUrl, caption: dto.caption });
  }

  async sendAudio(dto: SendAudioDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    const audioUrl = this.normalizeUrl(dto.audioUrl);
    
    try {
      const audioBuffer = await this.downloadMedia(audioUrl);
      
      let finalBuffer: Buffer;
      let mimetype: string;
      
      if (dto.ptt !== false) {
        this.logger.log('Convertendo áudio para OGG Opus (PTT)...');
        finalBuffer = await this.convertToOggOpus(audioBuffer);
        mimetype = 'audio/ogg; codecs=opus';
      } else {
        finalBuffer = audioBuffer;
        mimetype = this.getMimeType(audioUrl, 'audio');
      }
      
      await socket.sendMessage(to, { 
        audio: finalBuffer, 
        mimetype,
        ptt: dto.ptt !== false,
      });
      
      this.logger.log(`Áudio enviado com sucesso para ${dto.to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar áudio: ${error.message}`);
      throw new BadRequestException(`Não foi possível enviar o áudio. Erro: ${error.message}`);
    }
    
    return this.saveMessage(dto.instanceId, dto.to, 'AUDIO', { audioUrl });
  }

  async sendLocation(dto: SendLocationDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    await socket.sendMessage(to, { location: { degreesLatitude: dto.latitude, degreesLongitude: dto.longitude } });
    return this.saveMessage(dto.instanceId, dto.to, 'LOCATION', { latitude: dto.latitude, longitude: dto.longitude });
  }

  async sendVideo(dto: SendVideoDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    const videoUrl = this.normalizeUrl(dto.videoUrl);
    
    try {
      const videoBuffer = await this.downloadMedia(videoUrl);
      const mimetype = this.getMimeType(videoUrl, 'video');
      
      await socket.sendMessage(to, { 
        video: videoBuffer, 
        mimetype,
        caption: dto.caption 
      });
    } catch (downloadError) {
      this.logger.warn(`Download failed, trying direct URL: ${downloadError.message}`);
      try {
        await socket.sendMessage(to, { video: { url: videoUrl }, caption: dto.caption });
      } catch (urlError) {
        this.logger.error(`Failed to send video: ${urlError.message}`);
        throw new BadRequestException(`Não foi possível enviar o vídeo. Verifique se a URL é acessível: ${videoUrl}`);
      }
    }
    
    return this.saveMessage(dto.instanceId, dto.to, 'VIDEO', { videoUrl, caption: dto.caption });
  }

  async sendDocument(dto: SendDocumentDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    const documentUrl = this.normalizeUrl(dto.documentUrl);
    const filename = dto.filename || documentUrl.split('/').pop()?.split('?')[0] || 'document';
    
    try {
      const docBuffer = await this.downloadMedia(documentUrl);
      const mimetype = this.getMimeType(documentUrl, 'document');
      
      await socket.sendMessage(to, { 
        document: docBuffer, 
        mimetype,
        fileName: filename,
        caption: dto.caption 
      });
    } catch (downloadError) {
      this.logger.warn(`Download failed, trying direct URL: ${downloadError.message}`);
      try {
        await socket.sendMessage(to, { 
          document: { url: documentUrl }, 
          fileName: filename,
          caption: dto.caption 
        });
      } catch (urlError) {
        this.logger.error(`Failed to send document: ${urlError.message}`);
        throw new BadRequestException(`Não foi possível enviar o documento. Verifique se a URL é acessível: ${documentUrl}`);
      }
    }
    
    return this.saveMessage(dto.instanceId, dto.to, 'DOCUMENT', { documentUrl, filename, caption: dto.caption });
  }

  async sendContact(dto: SendContactDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    const phoneClean = dto.contactPhone.replace(/\D/g, '');
    
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:;${dto.contactName};;;
FN:${dto.contactName}
TEL;type=CELL;type=VOICE;waid=${phoneClean}:+${phoneClean}${dto.organization ? `\nORG:${dto.organization}` : ''}
END:VCARD`;

    await socket.sendMessage(to, {
      contacts: {
        displayName: dto.contactName,
        contacts: [{ vcard }],
      },
    });
    
    return this.saveMessage(dto.instanceId, dto.to, 'CONTACT', { contactName: dto.contactName, contactPhone: dto.contactPhone });
  }

  async sendList(dto: SendListDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    
    await socket.sendMessage(to, {
      text: dto.text,
      buttonText: dto.buttonText,
      title: dto.title || '',
      footer: dto.footer || 'GO-API',
      listType: 1,
      sections: dto.sections.map(section => ({
        title: section.title,
        rows: section.rows.map(row => ({
          title: row.title,
          description: row.description || '',
          rowId: row.rowId,
        })),
      })),
    });

    return this.saveMessage(dto.instanceId, dto.to, 'LIST', { text: dto.text, sections: JSON.parse(JSON.stringify(dto.sections)) });
  }

  async sendPoll(dto: SendPollDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    await socket.sendMessage(to, {
      poll: { name: dto.question, values: dto.options, selectableCount: dto.selectableCount || 1 },
    });

    return this.saveMessage(dto.instanceId, dto.to, 'POLL', { question: dto.question, options: dto.options });
  }

  // ========================================
  // STICKERS
  // ========================================
  async sendSticker(dto: SendStickerDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = await this.getValidWhatsAppNumber(socket, dto.to);
    const stickerUrl = this.normalizeUrl(dto.stickerUrl);
    
    try {
      const stickerBuffer = await this.downloadMedia(stickerUrl);
      await socket.sendMessage(to, { sticker: stickerBuffer });
    } catch (error) {
      this.logger.error(`Erro ao enviar sticker: ${error.message}`);
      throw new BadRequestException(`Não foi possível enviar o sticker: ${error.message}`);
    }
    
    return this.saveMessage(dto.instanceId, dto.to, 'STICKER', { stickerUrl });
  }

  // ========================================
  // GERENCIAMENTO DE GRUPOS
  // ========================================
  
  // Criar grupo
  async createGroup(dto: CreateGroupDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const participants = dto.participants.map(p => this.formatPhone(p));
    
    try {
      const result = await socket.groupCreate(dto.name, participants);
      this.logger.log(`Grupo criado: ${result.id}`);
      return { 
        success: true, 
        groupId: result.id, 
        name: dto.name,
        participants: result.participants 
      };
    } catch (error) {
      this.logger.error(`Erro ao criar grupo: ${error.message}`);
      throw new BadRequestException(`Erro ao criar grupo: ${error.message}`);
    }
  }

  // Adicionar participantes ao grupo
  async addGroupParticipants(dto: GroupParticipantsDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const participants = dto.participants.map(p => this.formatPhone(p));
    
    try {
      const result = await socket.groupParticipantsUpdate(dto.groupId, participants, 'add');
      this.logger.log(`Participantes adicionados ao grupo ${dto.groupId}`);
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Erro ao adicionar participantes: ${error.message}`);
      throw new BadRequestException(`Erro ao adicionar participantes: ${error.message}`);
    }
  }

  // Remover participantes do grupo
  async removeGroupParticipants(dto: GroupParticipantsDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const participants = dto.participants.map(p => this.formatPhone(p));
    
    try {
      const result = await socket.groupParticipantsUpdate(dto.groupId, participants, 'remove');
      this.logger.log(`Participantes removidos do grupo ${dto.groupId}`);
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Erro ao remover participantes: ${error.message}`);
      throw new BadRequestException(`Erro ao remover participantes: ${error.message}`);
    }
  }

  // Promover participantes a admin
  async promoteGroupParticipants(dto: GroupParticipantsDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const participants = dto.participants.map(p => this.formatPhone(p));
    
    try {
      const result = await socket.groupParticipantsUpdate(dto.groupId, participants, 'promote');
      this.logger.log(`Participantes promovidos a admin no grupo ${dto.groupId}`);
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Erro ao promover participantes: ${error.message}`);
      throw new BadRequestException(`Erro ao promover participantes: ${error.message}`);
    }
  }

  // Rebaixar admins a membros
  async demoteGroupParticipants(dto: GroupParticipantsDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const participants = dto.participants.map(p => this.formatPhone(p));
    
    try {
      const result = await socket.groupParticipantsUpdate(dto.groupId, participants, 'demote');
      this.logger.log(`Participantes rebaixados no grupo ${dto.groupId}`);
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Erro ao rebaixar participantes: ${error.message}`);
      throw new BadRequestException(`Erro ao rebaixar participantes: ${error.message}`);
    }
  }

  // Alterar nome do grupo
  async updateGroupSubject(dto: GroupSubjectDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      await socket.groupUpdateSubject(dto.groupId, dto.subject);
      this.logger.log(`Nome do grupo ${dto.groupId} alterado para: ${dto.subject}`);
      return { success: true, subject: dto.subject };
    } catch (error) {
      this.logger.error(`Erro ao alterar nome do grupo: ${error.message}`);
      throw new BadRequestException(`Erro ao alterar nome do grupo: ${error.message}`);
    }
  }

  // Alterar descrição do grupo
  async updateGroupDescription(dto: GroupDescriptionDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      await socket.groupUpdateDescription(dto.groupId, dto.description);
      this.logger.log(`Descrição do grupo ${dto.groupId} alterada`);
      return { success: true, description: dto.description };
    } catch (error) {
      this.logger.error(`Erro ao alterar descrição do grupo: ${error.message}`);
      throw new BadRequestException(`Erro ao alterar descrição do grupo: ${error.message}`);
    }
  }

  // Alterar configurações do grupo
  async updateGroupSettings(dto: GroupSettingsDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      if (dto.announce !== undefined) {
        await socket.groupSettingUpdate(dto.groupId, dto.announce ? 'announcement' : 'not_announcement');
      }
      if (dto.restrict !== undefined) {
        await socket.groupSettingUpdate(dto.groupId, dto.restrict ? 'locked' : 'unlocked');
      }
      this.logger.log(`Configurações do grupo ${dto.groupId} atualizadas`);
      return { success: true, announce: dto.announce, restrict: dto.restrict };
    } catch (error) {
      this.logger.error(`Erro ao alterar configurações do grupo: ${error.message}`);
      throw new BadRequestException(`Erro ao alterar configurações do grupo: ${error.message}`);
    }
  }

  // Sair do grupo
  async leaveGroup(instanceId: string, groupId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      await socket.groupLeave(groupId);
      this.logger.log(`Saiu do grupo ${groupId}`);
      return { success: true, message: 'Saiu do grupo com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao sair do grupo: ${error.message}`);
      throw new BadRequestException(`Erro ao sair do grupo: ${error.message}`);
    }
  }

  // Obter link de convite do grupo
  async getGroupInviteCode(instanceId: string, groupId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      const code = await socket.groupInviteCode(groupId);
      const link = `https://chat.whatsapp.com/${code}`;
      this.logger.log(`Link de convite obtido para grupo ${groupId}`);
      return { success: true, code, link };
    } catch (error) {
      this.logger.error(`Erro ao obter link de convite: ${error.message}`);
      throw new BadRequestException(`Erro ao obter link de convite: ${error.message}`);
    }
  }

  // Revogar link de convite do grupo
  async revokeGroupInvite(instanceId: string, groupId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      const newCode = await socket.groupRevokeInvite(groupId);
      const link = `https://chat.whatsapp.com/${newCode}`;
      this.logger.log(`Link de convite revogado para grupo ${groupId}`);
      return { success: true, code: newCode, link };
    } catch (error) {
      this.logger.error(`Erro ao revogar link de convite: ${error.message}`);
      throw new BadRequestException(`Erro ao revogar link de convite: ${error.message}`);
    }
  }

  // ========================================
  // MENSAGENS - AÇÕES
  // ========================================

  // Deletar mensagem
  async deleteMessage(dto: DeleteMessageDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      const key = {
        remoteJid: dto.remoteJid,
        id: dto.messageId,
        fromMe: true,
      };
      
      await socket.sendMessage(dto.remoteJid, { delete: key });
      this.logger.log(`Mensagem ${dto.messageId} deletada`);
      return { success: true, message: 'Mensagem deletada com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao deletar mensagem: ${error.message}`);
      throw new BadRequestException(`Erro ao deletar mensagem: ${error.message}`);
    }
  }

  // Reagir a mensagem
  async reactMessage(dto: ReactMessageDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      const key = {
        remoteJid: dto.remoteJid,
        id: dto.messageId,
      };
      
      await socket.sendMessage(dto.remoteJid, { react: { text: dto.emoji, key } });
      this.logger.log(`Reação ${dto.emoji} adicionada à mensagem ${dto.messageId}`);
      return { success: true, emoji: dto.emoji };
    } catch (error) {
      this.logger.error(`Erro ao reagir mensagem: ${error.message}`);
      throw new BadRequestException(`Erro ao reagir mensagem: ${error.message}`);
    }
  }

  // Enviar mensagem com menções
  async sendTextWithMentions(dto: SendTextDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const to = dto.to.includes('@g.us') ? dto.to : await this.getValidWhatsAppNumber(socket, dto.to);
    
    // Formatar menções
    const mentions = dto.mentions?.map(m => this.formatPhone(m)) || [];
    
    await socket.sendMessage(to, { 
      text: dto.text,
      mentions 
    });
    
    return this.saveMessage(dto.instanceId, dto.to, 'TEXT', { text: dto.text, mentions });
  }

  // ========================================
  // NEWSLETTER / CANAIS
  // ========================================

  /**
   * Listar newsletters/canais da instância
   * Busca do store de chats e retorna com metadados
   */
  async getNewsletters(instanceId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    // Buscar newsletters do store interno do BaileysService
    let newsletters = this.baileys.getNewsletters(instanceId);
    this.logger.debug(`[getNewsletters] Newsletters no store: ${newsletters.length}`);
    
    // Se não tiver newsletters no store, tentar buscar do store de chats do socket
    if (newsletters.length === 0) {
      try {
        const store = (socket as any).store;
        if (store?.chats) {
          const allChats = typeof store.chats.all === 'function' 
            ? store.chats.all() 
            : Array.from(store.chats.values?.() || []);
          
          this.logger.debug(`[getNewsletters] Total de chats no store: ${allChats.length}`);
          
          for (const chat of allChats) {
            if (chat.id?.endsWith('@newsletter')) {
              newsletters.push({
                id: chat.id,
                name: chat.name || chat.subject || 'Canal',
                description: chat.description || '',
                picture: chat.picture || null,
              });
            }
          }
          
          this.logger.debug(`[getNewsletters] Newsletters encontradas no store de chats: ${newsletters.length}`);
        }
      } catch (e) {
        this.logger.warn(`Não foi possível acessar store de chats: ${e.message}`);
      }
    }

    // Se ainda não tiver newsletters, retornar lista vazia com instruções
    if (newsletters.length === 0) {
      return { 
        success: true, 
        newsletters: [],
        total: 0,
        info: {
          message: 'Nenhum canal encontrado no cache. Os canais são descobertos automaticamente quando você recebe mensagens ou sincroniza o histórico.',
          nota: 'Se você sabe o ID de um canal, pode usar os endpoints abaixo diretamente.',
          formato: '120363xxxxxxxxxx@newsletter',
          comoObter: 'Copie o link do canal (ex: https://whatsapp.com/channel/0029VaXXXXXX) e use o código após /channel/',
          dica: 'Ative "Sincronizar Histórico Completo" nas configurações da instância e reinicie para sincronizar os canais.',
          endpoints: {
            metadados: 'GET /api/newsletter/{newsletterId}',
            enviarTexto: 'POST /api/newsletter/text',
            enviarImagem: 'POST /api/newsletter/image',
            enviarVideo: 'POST /api/newsletter/video',
            criar: 'POST /api/newsletter/create',
            seguir: 'POST /api/newsletter/follow',
            deixarDeSeguir: 'POST /api/newsletter/unfollow',
            silenciar: 'POST /api/newsletter/mute',
            inscritos: 'GET /api/newsletter/{newsletterId}/subscribers'
          }
        }
      };
    }

    // Buscar metadados para cada newsletter
    const newsletterList = await Promise.all(
      newsletters.map(async (n: any) => {
        let subscribers = 0;
        let name = n.name || 'Canal sem nome';
        let description = n.description || '';
        let picture = n.picture || null;
        let isOwner = false;
        let role = 'SUBSCRIBER';
        
        try {
          const metadata = await socket.newsletterMetadata('jid', n.id);
          this.logger.debug(`Newsletter metadata for ${n.id}: ${JSON.stringify(metadata)}`);
          if (metadata) {
            // O metadata pode ter diferentes estruturas dependendo da versão do Baileys
            name = metadata.name || metadata.subject || metadata.title || name;
            description = metadata.description || metadata.desc || description;
            picture = metadata.picture?.url || metadata.pictureUrl || metadata.picture || picture;
            
            // Verificar role/owner
            if (metadata.role) {
              role = metadata.role;
              isOwner = metadata.role === 'OWNER' || metadata.role === 'ADMIN';
            }
            if (metadata.state === 'ACTIVE' && metadata.viewer_metadata?.role) {
              role = metadata.viewer_metadata.role;
              isOwner = role === 'OWNER' || role === 'ADMIN';
            }
          }
        } catch (err: any) {
          this.logger.warn(`Erro ao buscar metadata de ${n.id}: ${err.message}`);
        }
        
        try {
          const result = await socket.newsletterSubscribers(n.id);
          subscribers = result?.subscribers || 0;
        } catch {}
        
        return {
          id: n.id,
          name,
          description,
          subscribers,
          picture,
          isOwner,
          role,
        };
      })
    );

    return { 
      success: true, 
      newsletters: newsletterList,
      total: newsletterList.length,
      owned: newsletterList.filter(n => n.isOwner).length,
    };
  }

  /**
   * Buscar metadados de uma newsletter específica
   * Pode buscar por JID ou por código de convite
   */
  async getNewsletterMetadata(instanceId: string, newsletterId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      let metadata;
      
      // Se parece com um código de convite (não tem @newsletter)
      if (!newsletterId.includes('@') && newsletterId.length < 30) {
        // Tentar como código de convite
        metadata = await socket.newsletterMetadata('invite', newsletterId);
      } else {
        // Usar como JID
        const newsletterJid = newsletterId.includes('@newsletter') 
          ? newsletterId 
          : `${newsletterId}@newsletter`;
        metadata = await socket.newsletterMetadata('jid', newsletterJid);
      }
      
      if (!metadata) {
        throw new BadRequestException('Newsletter não encontrada');
      }
      
      return { 
        success: true, 
        newsletter: metadata 
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar newsletter: ${error.message}`);
      throw new BadRequestException(`Newsletter não encontrada ou inacessível: ${error.message}`);
    }
  }

  /**
   * Criar uma nova newsletter/canal
   */
  async createNewsletter(instanceId: string, name: string, description?: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      const result = await socket.newsletterCreate(name, description);
      
      // O Baileys pode retornar diferentes estruturas ou null
      // Mesmo se retornar null, a newsletter pode ter sido criada
      const newsletterId = result?.id || result?.jid || null;
      
      if (newsletterId) {
        this.logger.log(`Newsletter criada com ID: ${newsletterId}`);
      } else {
        this.logger.log(`Newsletter "${name}" criada (ID não retornado pelo Baileys)`);
      }
      
      return { 
        success: true, 
        newsletter: result || { name, description },
        id: newsletterId,
        message: 'Newsletter criada com sucesso! Verifique no WhatsApp.',
        nota: newsletterId 
          ? `ID do canal: ${newsletterId}` 
          : 'O canal foi criado mas o ID não foi retornado. Verifique no WhatsApp e use GET /api/newsletter para listar.'
      };
    } catch (error: any) {
      // Verificar se é erro de parsing mas a operação pode ter funcionado
      if (error.message?.includes('Cannot read properties of null') || 
          error.message?.includes('Cannot read properties of undefined')) {
        this.logger.warn(`Newsletter "${name}" possivelmente criada, mas resposta do Baileys foi null`);
        return { 
          success: true, 
          newsletter: { name, description },
          id: null,
          message: 'Newsletter provavelmente criada! Verifique no WhatsApp.',
          nota: 'O Baileys não retornou o ID, mas a operação pode ter sido bem-sucedida. Verifique no WhatsApp.'
        };
      }
      
      this.logger.error(`Erro ao criar newsletter: ${error.message}`);
      throw new BadRequestException(`Erro ao criar newsletter: ${error.message}`);
    }
  }

  /**
   * Seguir uma newsletter
   */
  async followNewsletter(instanceId: string, newsletterId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const newsletterJid = newsletterId.includes('@newsletter') 
      ? newsletterId 
      : `${newsletterId}@newsletter`;

    try {
      await socket.newsletterFollow(newsletterJid);
      this.logger.log(`Seguindo newsletter: ${newsletterJid}`);
      return { success: true, message: 'Agora você está seguindo esta newsletter' };
    } catch (error) {
      this.logger.error(`Erro ao seguir newsletter: ${error.message}`);
      throw new BadRequestException(`Erro ao seguir newsletter: ${error.message}`);
    }
  }

  /**
   * Deixar de seguir uma newsletter
   */
  async unfollowNewsletter(instanceId: string, newsletterId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const newsletterJid = newsletterId.includes('@newsletter') 
      ? newsletterId 
      : `${newsletterId}@newsletter`;

    try {
      await socket.newsletterUnfollow(newsletterJid);
      this.logger.log(`Deixou de seguir newsletter: ${newsletterJid}`);
      return { success: true, message: 'Você deixou de seguir esta newsletter' };
    } catch (error) {
      this.logger.error(`Erro ao deixar de seguir newsletter: ${error.message}`);
      throw new BadRequestException(`Erro ao deixar de seguir newsletter: ${error.message}`);
    }
  }

  /**
   * Silenciar uma newsletter
   */
  async muteNewsletter(instanceId: string, newsletterId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const newsletterJid = newsletterId.includes('@newsletter') 
      ? newsletterId 
      : `${newsletterId}@newsletter`;

    try {
      await socket.newsletterMute(newsletterJid);
      this.logger.log(`Newsletter silenciada: ${newsletterJid}`);
      return { success: true, message: 'Newsletter silenciada' };
    } catch (error) {
      this.logger.error(`Erro ao silenciar newsletter: ${error.message}`);
      throw new BadRequestException(`Erro ao silenciar newsletter: ${error.message}`);
    }
  }

  /**
   * Dessilenciar uma newsletter
   */
  async unmuteNewsletter(instanceId: string, newsletterId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const newsletterJid = newsletterId.includes('@newsletter') 
      ? newsletterId 
      : `${newsletterId}@newsletter`;

    try {
      await socket.newsletterUnmute(newsletterJid);
      this.logger.log(`Newsletter dessilenciada: ${newsletterJid}`);
      return { success: true, message: 'Newsletter dessilenciada' };
    } catch (error) {
      this.logger.error(`Erro ao dessilenciar newsletter: ${error.message}`);
      throw new BadRequestException(`Erro ao dessilenciar newsletter: ${error.message}`);
    }
  }

  /**
   * Obter número de inscritos de uma newsletter
   */
  async getNewsletterSubscribers(instanceId: string, newsletterId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const newsletterJid = newsletterId.includes('@newsletter') 
      ? newsletterId 
      : `${newsletterId}@newsletter`;

    try {
      const result = await socket.newsletterSubscribers(newsletterJid);
      return { 
        success: true, 
        newsletterId: newsletterJid,
        subscribers: result.subscribers 
      };
    } catch (error) {
      this.logger.error(`Erro ao obter inscritos: ${error.message}`);
      throw new BadRequestException(`Erro ao obter inscritos: ${error.message}`);
    }
  }

  /**
   * Buscar mensagens de uma newsletter
   */
  async getNewsletterMessages(instanceId: string, newsletterId: string, count: number = 10) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const newsletterJid = newsletterId.includes('@newsletter') 
      ? newsletterId 
      : `${newsletterId}@newsletter`;

    try {
      const messages = await socket.newsletterFetchMessages(newsletterJid, count, 0, 0);
      return { 
        success: true, 
        newsletterId: newsletterJid,
        messages: messages || [],
        count: messages?.length || 0
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar mensagens: ${error.message}`);
      throw new BadRequestException(`Erro ao buscar mensagens: ${error.message}`);
    }
  }

  // Enviar texto para newsletter/canal
  async sendNewsletterText(dto: SendNewsletterTextDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    // Newsletter JID deve terminar com @newsletter
    const newsletterJid = dto.newsletterId.includes('@newsletter') 
      ? dto.newsletterId 
      : `${dto.newsletterId}@newsletter`;

    try {
      await socket.sendMessage(newsletterJid, { text: dto.text });
      this.logger.log(`Mensagem enviada para newsletter ${newsletterJid}`);
      return { success: true, newsletterId: newsletterJid, type: 'text' };
    } catch (error) {
      this.logger.error(`Erro ao enviar para newsletter: ${error.message}`);
      throw new BadRequestException(`Erro ao enviar para newsletter: ${error.message}`);
    }
  }

  // Enviar imagem para newsletter/canal
  async sendNewsletterImage(dto: SendNewsletterImageDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const newsletterJid = dto.newsletterId.includes('@newsletter') 
      ? dto.newsletterId 
      : `${dto.newsletterId}@newsletter`;

    const imageUrl = this.normalizeUrl(dto.imageUrl);

    try {
      const imageBuffer = await this.downloadMedia(imageUrl);
      const mimetype = this.getMimeType(imageUrl, 'image');
      
      await socket.sendMessage(newsletterJid, { 
        image: imageBuffer, 
        mimetype,
        caption: dto.caption 
      });
      
      this.logger.log(`Imagem enviada para newsletter ${newsletterJid}`);
      return { success: true, newsletterId: newsletterJid, type: 'image' };
    } catch (error) {
      this.logger.error(`Erro ao enviar imagem para newsletter: ${error.message}`);
      throw new BadRequestException(`Erro ao enviar imagem para newsletter: ${error.message}`);
    }
  }

  // Enviar vídeo para newsletter/canal
  async sendNewsletterVideo(dto: SendNewsletterVideoDto) {
    const socket = this.baileys.getSocket(dto.instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    const newsletterJid = dto.newsletterId.includes('@newsletter') 
      ? dto.newsletterId 
      : `${dto.newsletterId}@newsletter`;

    const videoUrl = this.normalizeUrl(dto.videoUrl);

    try {
      const videoBuffer = await this.downloadMedia(videoUrl);
      const mimetype = this.getMimeType(videoUrl, 'video');
      
      await socket.sendMessage(newsletterJid, { 
        video: videoBuffer, 
        mimetype,
        caption: dto.caption 
      });
      
      this.logger.log(`Vídeo enviado para newsletter ${newsletterJid}`);
      return { success: true, newsletterId: newsletterJid, type: 'video' };
    } catch (error) {
      this.logger.error(`Erro ao enviar vídeo para newsletter: ${error.message}`);
      throw new BadRequestException(`Erro ao enviar vídeo para newsletter: ${error.message}`);
    }
  }

  // ========================================
  // CONTATOS E CANAIS (via API Key)
  // ========================================

  /**
   * Listar todos os grupos da instância
   */
  async getGroups(instanceId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      const groups = await socket.groupFetchAllParticipating();
      const groupList = Object.values(groups).map((g: any) => ({
        id: g.id,
        name: g.subject,
        participants: g.participants?.length || 0,
        creation: g.creation,
        owner: g.owner?.replace(/@s\.whatsapp\.net$/, '') || null,
      }));
      return { success: true, groups: groupList };
    } catch (error) {
      this.logger.error(`Erro ao listar grupos: ${error.message}`);
      return { success: false, groups: [], error: error.message };
    }
  }

  /**
   * Listar participantes de um grupo
   */
  async getGroupParticipants(instanceId: string, groupId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      const metadata = await socket.groupMetadata(groupId);
      const pushNames = this.baileys.getPushNames(instanceId);
      const contacts = this.baileys.getContacts(instanceId);
      
      const participants = metadata.participants.map((p: any) => {
        // Buscar nome de múltiplas fontes
        let name = p.notify || p.verifiedName || null;
        if (!name) {
          const pushName = pushNames.get(p.id);
          if (pushName) name = pushName;
        }
        if (!name) {
          const contact = contacts.get(p.id);
          if (contact) name = contact.name || contact.notify || contact.verifiedName || null;
        }
        
        // Extrair telefone do JID
        const phone = p.id
          .replace(/@s\.whatsapp\.net$/, '')
          .replace(/@c\.us$/, '')
          .replace(/@lid$/, '')
          .split(':')[0];
        
        return {
          id: p.id,
          phone,
          name,
          admin: p.admin || null,
        };
      });
      
      return {
        success: true,
        groupName: metadata.subject,
        groupId: metadata.id,
        participants,
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar participantes: ${error.message}`);
      throw new BadRequestException(`Erro ao buscar participantes: ${error.message}`);
    }
  }

  /**
   * Listar todos os contatos da instância
   */
  async getAllContacts(instanceId: string) {
    const contacts = this.baileys.getContacts(instanceId);
    
    if (contacts.size === 0) {
      return { success: true, contacts: [] };
    }

    const contactList = Array.from(contacts.values())
      .filter(
        (c) =>
          c.id &&
          !c.id.endsWith('@g.us') &&
          !c.id.endsWith('@broadcast') &&
          !c.id.endsWith('@lid'),
      )
      .map((c) => ({
        id: c.id,
        phone: c.id
          .replace(/@s\.whatsapp\.net$/, '')
          .replace(/@c\.us$/, '')
          .split(':')[0],
        name: c.name || c.notify || c.verifiedName || null,
      }));
      
    return { success: true, contacts: contactList };
  }

  /**
   * Listar canais/newsletters seguidos e próprios
   */
  async getFollowedNewsletters(instanceId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    // Buscar newsletters do store
    let newsletters = this.baileys.getNewsletters(instanceId);
    this.logger.debug(`[getFollowedNewsletters] Newsletters no store: ${newsletters.length}`);
    
    // Se não tiver newsletters no store, tentar buscar do store de chats
    if (newsletters.length === 0) {
      try {
        // Acessar store interno do socket se disponível
        const store = (socket as any).store;
        if (store?.chats) {
          const allChats = typeof store.chats.all === 'function' 
            ? store.chats.all() 
            : Array.from(store.chats.values?.() || []);
          
          for (const chat of allChats) {
            if (chat.id?.endsWith('@newsletter')) {
              newsletters.push({
                id: chat.id,
                name: chat.name || chat.subject || null,
                description: chat.description || '',
                picture: chat.picture || null,
              });
            }
          }
        }
      } catch (e) {
        this.logger.warn(`Não foi possível acessar store de chats: ${e.message}`);
      }
    }
    
    // Buscar metadados e inscritos para cada newsletter
    const newsletterList = await Promise.all(
      newsletters.map(async (n: any) => {
        let subscribers = 0;
        let name = n.name || null;
        let description = n.description || '';
        let picture = n.picture || null;
        let isOwner = false;
        let role = 'SUBSCRIBER';
        
        // SEMPRE buscar metadados para obter o nome correto
        try {
          const metadata = await socket.newsletterMetadata('jid', n.id);
          this.logger.debug(`[getFollowedNewsletters] Metadata para ${n.id}: ${JSON.stringify(metadata)}`);
          
          if (metadata) {
            // Tentar várias propriedades para o nome
            name = metadata.name || metadata.subject || metadata.title || name;
            description = metadata.description || metadata.desc || description;
            picture = metadata.picture?.url || metadata.pictureUrl || metadata.picture || picture;
            
            // Verificar se é dono (owner)
            if (metadata.role) {
              role = metadata.role;
              isOwner = metadata.role === 'OWNER' || metadata.role === 'ADMIN';
            }
            if (metadata.state === 'ACTIVE' && metadata.viewer_metadata?.role) {
              role = metadata.viewer_metadata.role;
              isOwner = role === 'OWNER' || role === 'ADMIN';
            }
          }
        } catch (err: any) {
          this.logger.warn(`Erro ao buscar metadata de ${n.id}: ${err.message}`);
        }
        
        // Buscar número de inscritos
        try {
          const result = await socket.newsletterSubscribers(n.id);
          subscribers = result?.subscribers || 0;
        } catch {}
        
        // Se ainda não tem nome, usar "Canal" como fallback
        if (!name || name === 'Canal sem nome') {
          name = 'Canal';
        }
        
        return {
          id: n.id,
          name,
          description,
          subscribers,
          picture,
          isOwner,
          role,
        };
      })
    );

    return { 
      success: true, 
      newsletters: newsletterList,
      total: newsletterList.length,
      owned: newsletterList.filter(n => n.isOwner).length,
    };
  }

  /**
   * Obter número de inscritos de um canal
   */
  async getChannelSubscribers(instanceId: string, newsletterId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) throw new BadRequestException('Instância não conectada');

    try {
      const newsletterJid = newsletterId.includes('@newsletter') 
        ? newsletterId 
        : `${newsletterId}@newsletter`;
      
      const result = await socket.newsletterSubscribers(newsletterJid);
      return { 
        success: true,
        newsletterId: newsletterJid,
        subscribers: result?.subscribers || 0 
      };
    } catch (error) {
      this.logger.error(`Erro ao obter inscritos: ${error.message}`);
      return { success: false, subscribers: 0, error: error.message };
    }
  }
}

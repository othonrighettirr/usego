"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma.service");
const baileys_service_1 = require("../instances/baileys.service");
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
let MessagesService = MessagesService_1 = class MessagesService {
    constructor(prisma, baileys) {
        this.prisma = prisma;
        this.baileys = baileys;
        this.logger = new common_1.Logger(MessagesService_1.name);
    }
    async downloadMedia(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            const options = {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            };
            protocol.get(url, options, (response) => {
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
                const chunks = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            }).on('error', reject).on('timeout', () => reject(new Error('Download timeout')));
        });
    }
    async convertToOggOpus(inputBuffer) {
        return new Promise((resolve, reject) => {
            const tempDir = os.tmpdir();
            const inputPath = path.join(tempDir, `input_${Date.now()}.tmp`);
            const outputPath = path.join(tempDir, `output_${Date.now()}.ogg`);
            fs.writeFileSync(inputPath, inputBuffer);
            (0, fluent_ffmpeg_1.default)(inputPath)
                .audioCodec('libopus')
                .audioFrequency(48000)
                .audioChannels(1)
                .audioBitrate('64k')
                .format('ogg')
                .on('error', (err) => {
                this.logger.error(`FFmpeg error: ${err.message}`);
                try {
                    fs.unlinkSync(inputPath);
                }
                catch { }
                try {
                    fs.unlinkSync(outputPath);
                }
                catch { }
                reject(err);
            })
                .on('end', () => {
                try {
                    const outputBuffer = fs.readFileSync(outputPath);
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);
                    resolve(outputBuffer);
                }
                catch (err) {
                    reject(err);
                }
            })
                .save(outputPath);
        });
    }
    getMimeType(url, type) {
        const ext = url.split('.').pop()?.toLowerCase().split('?')[0];
        const mimeTypes = {
            jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
            mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac',
            mp4: 'video/mp4', avi: 'video/avi', mkv: 'video/mkv', webm: 'video/webm',
            pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        if (ext && mimeTypes[ext])
            return mimeTypes[ext];
        const defaults = { image: 'image/jpeg', audio: 'audio/mp4', video: 'video/mp4', document: 'application/octet-stream' };
        return defaults[type];
    }
    formatPhone(phone) {
        let cleaned = phone.replace(/\D/g, '');
        if (phone.includes('@s.whatsapp.net'))
            return phone;
        return `${cleaned}@s.whatsapp.net`;
    }
    async getValidWhatsAppNumber(socket, phone) {
        let cleaned = phone.replace(/\D/g, '');
        if (phone.includes('@s.whatsapp.net'))
            return phone;
        const jid1 = `${cleaned}@s.whatsapp.net`;
        try {
            const [result1] = await socket.onWhatsApp(cleaned);
            if (result1?.exists) {
                this.logger.debug(`Número válido encontrado: ${cleaned}`);
                return result1.jid;
            }
        }
        catch (e) {
            this.logger.debug(`Erro ao verificar ${cleaned}: ${e.message}`);
        }
        if (cleaned.startsWith('55') && cleaned.length >= 12) {
            const ddd = cleaned.substring(2, 4);
            const rest = cleaned.substring(4);
            let alternativeNumber;
            if (rest.length === 9 && rest.startsWith('9')) {
                alternativeNumber = `55${ddd}${rest.substring(1)}`;
            }
            else if (rest.length === 8) {
                alternativeNumber = `55${ddd}9${rest}`;
            }
            else {
                return jid1;
            }
            try {
                const [result2] = await socket.onWhatsApp(alternativeNumber);
                if (result2?.exists) {
                    this.logger.debug(`Número alternativo válido encontrado: ${alternativeNumber}`);
                    return result2.jid;
                }
            }
            catch (e) {
                this.logger.debug(`Erro ao verificar alternativo ${alternativeNumber}: ${e.message}`);
            }
        }
        return jid1;
    }
    async saveMessage(instanceId, to, type, content) {
        return this.prisma.message.create({
            data: { instanceId, from: 'me', to, type, content, status: 'SENT' },
        });
    }
    async sendText(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = await this.getValidWhatsAppNumber(socket, dto.to);
        await socket.sendMessage(to, { text: dto.text });
        return this.saveMessage(dto.instanceId, dto.to, 'TEXT', { text: dto.text });
    }
    async sendImage(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = await this.getValidWhatsAppNumber(socket, dto.to);
        try {
            const imageBuffer = await this.downloadMedia(dto.imageUrl);
            const mimetype = this.getMimeType(dto.imageUrl, 'image');
            await socket.sendMessage(to, {
                image: imageBuffer,
                mimetype,
                caption: dto.caption
            });
        }
        catch (downloadError) {
            this.logger.warn(`Download failed, trying direct URL: ${downloadError.message}`);
            try {
                await socket.sendMessage(to, { image: { url: dto.imageUrl }, caption: dto.caption });
            }
            catch (urlError) {
                this.logger.error(`Failed to send image: ${urlError.message}`);
                throw new common_1.BadRequestException(`Não foi possível enviar a imagem. Verifique se a URL é acessível: ${dto.imageUrl}`);
            }
        }
        return this.saveMessage(dto.instanceId, dto.to, 'IMAGE', { imageUrl: dto.imageUrl, caption: dto.caption });
    }
    async sendAudio(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = await this.getValidWhatsAppNumber(socket, dto.to);
        try {
            const audioBuffer = await this.downloadMedia(dto.audioUrl);
            let finalBuffer;
            let mimetype;
            if (dto.ptt !== false) {
                this.logger.log('Convertendo áudio para OGG Opus (PTT)...');
                finalBuffer = await this.convertToOggOpus(audioBuffer);
                mimetype = 'audio/ogg; codecs=opus';
            }
            else {
                finalBuffer = audioBuffer;
                mimetype = this.getMimeType(dto.audioUrl, 'audio');
            }
            await socket.sendMessage(to, {
                audio: finalBuffer,
                mimetype,
                ptt: dto.ptt !== false,
            });
            this.logger.log(`Áudio enviado com sucesso para ${dto.to}`);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar áudio: ${error.message}`);
            throw new common_1.BadRequestException(`Não foi possível enviar o áudio. Erro: ${error.message}`);
        }
        return this.saveMessage(dto.instanceId, dto.to, 'AUDIO', { audioUrl: dto.audioUrl });
    }
    async sendLocation(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = await this.getValidWhatsAppNumber(socket, dto.to);
        await socket.sendMessage(to, { location: { degreesLatitude: dto.latitude, degreesLongitude: dto.longitude } });
        return this.saveMessage(dto.instanceId, dto.to, 'LOCATION', { latitude: dto.latitude, longitude: dto.longitude });
    }
    async sendVideo(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = await this.getValidWhatsAppNumber(socket, dto.to);
        try {
            const videoBuffer = await this.downloadMedia(dto.videoUrl);
            const mimetype = this.getMimeType(dto.videoUrl, 'video');
            await socket.sendMessage(to, {
                video: videoBuffer,
                mimetype,
                caption: dto.caption
            });
        }
        catch (downloadError) {
            this.logger.warn(`Download failed, trying direct URL: ${downloadError.message}`);
            try {
                await socket.sendMessage(to, { video: { url: dto.videoUrl }, caption: dto.caption });
            }
            catch (urlError) {
                this.logger.error(`Failed to send video: ${urlError.message}`);
                throw new common_1.BadRequestException(`Não foi possível enviar o vídeo. Verifique se a URL é acessível: ${dto.videoUrl}`);
            }
        }
        return this.saveMessage(dto.instanceId, dto.to, 'VIDEO', { videoUrl: dto.videoUrl, caption: dto.caption });
    }
    async sendDocument(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = await this.getValidWhatsAppNumber(socket, dto.to);
        const filename = dto.filename || dto.documentUrl.split('/').pop() || 'document';
        try {
            const docBuffer = await this.downloadMedia(dto.documentUrl);
            const mimetype = this.getMimeType(dto.documentUrl, 'document');
            await socket.sendMessage(to, {
                document: docBuffer,
                mimetype,
                fileName: filename,
                caption: dto.caption
            });
        }
        catch (downloadError) {
            this.logger.warn(`Download failed, trying direct URL: ${downloadError.message}`);
            try {
                await socket.sendMessage(to, {
                    document: { url: dto.documentUrl },
                    fileName: filename,
                    caption: dto.caption
                });
            }
            catch (urlError) {
                this.logger.error(`Failed to send document: ${urlError.message}`);
                throw new common_1.BadRequestException(`Não foi possível enviar o documento. Verifique se a URL é acessível: ${dto.documentUrl}`);
            }
        }
        return this.saveMessage(dto.instanceId, dto.to, 'DOCUMENT', { documentUrl: dto.documentUrl, filename, caption: dto.caption });
    }
    async sendContact(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
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
    async sendList(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
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
    async sendPoll(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = await this.getValidWhatsAppNumber(socket, dto.to);
        await socket.sendMessage(to, {
            poll: { name: dto.question, values: dto.options, selectableCount: dto.selectableCount || 1 },
        });
        return this.saveMessage(dto.instanceId, dto.to, 'POLL', { question: dto.question, options: dto.options });
    }
    async sendSticker(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = await this.getValidWhatsAppNumber(socket, dto.to);
        try {
            const stickerBuffer = await this.downloadMedia(dto.stickerUrl);
            await socket.sendMessage(to, { sticker: stickerBuffer });
        }
        catch (error) {
            this.logger.error(`Erro ao enviar sticker: ${error.message}`);
            throw new common_1.BadRequestException(`Não foi possível enviar o sticker: ${error.message}`);
        }
        return this.saveMessage(dto.instanceId, dto.to, 'STICKER', { stickerUrl: dto.stickerUrl });
    }
    async createGroup(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
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
        }
        catch (error) {
            this.logger.error(`Erro ao criar grupo: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao criar grupo: ${error.message}`);
        }
    }
    async addGroupParticipants(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const participants = dto.participants.map(p => this.formatPhone(p));
        try {
            const result = await socket.groupParticipantsUpdate(dto.groupId, participants, 'add');
            this.logger.log(`Participantes adicionados ao grupo ${dto.groupId}`);
            return { success: true, result };
        }
        catch (error) {
            this.logger.error(`Erro ao adicionar participantes: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao adicionar participantes: ${error.message}`);
        }
    }
    async removeGroupParticipants(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const participants = dto.participants.map(p => this.formatPhone(p));
        try {
            const result = await socket.groupParticipantsUpdate(dto.groupId, participants, 'remove');
            this.logger.log(`Participantes removidos do grupo ${dto.groupId}`);
            return { success: true, result };
        }
        catch (error) {
            this.logger.error(`Erro ao remover participantes: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao remover participantes: ${error.message}`);
        }
    }
    async promoteGroupParticipants(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const participants = dto.participants.map(p => this.formatPhone(p));
        try {
            const result = await socket.groupParticipantsUpdate(dto.groupId, participants, 'promote');
            this.logger.log(`Participantes promovidos a admin no grupo ${dto.groupId}`);
            return { success: true, result };
        }
        catch (error) {
            this.logger.error(`Erro ao promover participantes: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao promover participantes: ${error.message}`);
        }
    }
    async demoteGroupParticipants(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const participants = dto.participants.map(p => this.formatPhone(p));
        try {
            const result = await socket.groupParticipantsUpdate(dto.groupId, participants, 'demote');
            this.logger.log(`Participantes rebaixados no grupo ${dto.groupId}`);
            return { success: true, result };
        }
        catch (error) {
            this.logger.error(`Erro ao rebaixar participantes: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao rebaixar participantes: ${error.message}`);
        }
    }
    async updateGroupSubject(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            await socket.groupUpdateSubject(dto.groupId, dto.subject);
            this.logger.log(`Nome do grupo ${dto.groupId} alterado para: ${dto.subject}`);
            return { success: true, subject: dto.subject };
        }
        catch (error) {
            this.logger.error(`Erro ao alterar nome do grupo: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao alterar nome do grupo: ${error.message}`);
        }
    }
    async updateGroupDescription(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            await socket.groupUpdateDescription(dto.groupId, dto.description);
            this.logger.log(`Descrição do grupo ${dto.groupId} alterada`);
            return { success: true, description: dto.description };
        }
        catch (error) {
            this.logger.error(`Erro ao alterar descrição do grupo: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao alterar descrição do grupo: ${error.message}`);
        }
    }
    async updateGroupSettings(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            if (dto.announce !== undefined) {
                await socket.groupSettingUpdate(dto.groupId, dto.announce ? 'announcement' : 'not_announcement');
            }
            if (dto.restrict !== undefined) {
                await socket.groupSettingUpdate(dto.groupId, dto.restrict ? 'locked' : 'unlocked');
            }
            this.logger.log(`Configurações do grupo ${dto.groupId} atualizadas`);
            return { success: true, announce: dto.announce, restrict: dto.restrict };
        }
        catch (error) {
            this.logger.error(`Erro ao alterar configurações do grupo: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao alterar configurações do grupo: ${error.message}`);
        }
    }
    async leaveGroup(instanceId, groupId) {
        const socket = this.baileys.getSocket(instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            await socket.groupLeave(groupId);
            this.logger.log(`Saiu do grupo ${groupId}`);
            return { success: true, message: 'Saiu do grupo com sucesso' };
        }
        catch (error) {
            this.logger.error(`Erro ao sair do grupo: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao sair do grupo: ${error.message}`);
        }
    }
    async getGroupInviteCode(instanceId, groupId) {
        const socket = this.baileys.getSocket(instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            const code = await socket.groupInviteCode(groupId);
            const link = `https://chat.whatsapp.com/${code}`;
            this.logger.log(`Link de convite obtido para grupo ${groupId}`);
            return { success: true, code, link };
        }
        catch (error) {
            this.logger.error(`Erro ao obter link de convite: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao obter link de convite: ${error.message}`);
        }
    }
    async revokeGroupInvite(instanceId, groupId) {
        const socket = this.baileys.getSocket(instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            const newCode = await socket.groupRevokeInvite(groupId);
            const link = `https://chat.whatsapp.com/${newCode}`;
            this.logger.log(`Link de convite revogado para grupo ${groupId}`);
            return { success: true, code: newCode, link };
        }
        catch (error) {
            this.logger.error(`Erro ao revogar link de convite: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao revogar link de convite: ${error.message}`);
        }
    }
    async deleteMessage(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            const key = {
                remoteJid: dto.remoteJid,
                id: dto.messageId,
                fromMe: true,
            };
            await socket.sendMessage(dto.remoteJid, { delete: key });
            this.logger.log(`Mensagem ${dto.messageId} deletada`);
            return { success: true, message: 'Mensagem deletada com sucesso' };
        }
        catch (error) {
            this.logger.error(`Erro ao deletar mensagem: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao deletar mensagem: ${error.message}`);
        }
    }
    async reactMessage(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            const key = {
                remoteJid: dto.remoteJid,
                id: dto.messageId,
            };
            await socket.sendMessage(dto.remoteJid, { react: { text: dto.emoji, key } });
            this.logger.log(`Reação ${dto.emoji} adicionada à mensagem ${dto.messageId}`);
            return { success: true, emoji: dto.emoji };
        }
        catch (error) {
            this.logger.error(`Erro ao reagir mensagem: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao reagir mensagem: ${error.message}`);
        }
    }
    async sendTextWithMentions(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const to = dto.to.includes('@g.us') ? dto.to : await this.getValidWhatsAppNumber(socket, dto.to);
        const mentions = dto.mentions?.map(m => this.formatPhone(m)) || [];
        await socket.sendMessage(to, {
            text: dto.text,
            mentions
        });
        return this.saveMessage(dto.instanceId, dto.to, 'TEXT', { text: dto.text, mentions });
    }
    async getNewsletters(instanceId) {
        const socket = this.baileys.getSocket(instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        try {
            const newsletters = await socket.newsletterMetadata('subscribed');
            return { success: true, newsletters };
        }
        catch (error) {
            this.logger.error(`Erro ao listar newsletters: ${error.message}`);
            return { success: true, newsletters: [], message: 'Funcionalidade pode não estar disponível nesta versão' };
        }
    }
    async sendNewsletterText(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const newsletterJid = dto.newsletterId.includes('@newsletter')
            ? dto.newsletterId
            : `${dto.newsletterId}@newsletter`;
        try {
            await socket.sendMessage(newsletterJid, { text: dto.text });
            this.logger.log(`Mensagem enviada para newsletter ${newsletterJid}`);
            return { success: true, newsletterId: newsletterJid, type: 'text' };
        }
        catch (error) {
            this.logger.error(`Erro ao enviar para newsletter: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao enviar para newsletter: ${error.message}`);
        }
    }
    async sendNewsletterImage(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const newsletterJid = dto.newsletterId.includes('@newsletter')
            ? dto.newsletterId
            : `${dto.newsletterId}@newsletter`;
        try {
            const imageBuffer = await this.downloadMedia(dto.imageUrl);
            const mimetype = this.getMimeType(dto.imageUrl, 'image');
            await socket.sendMessage(newsletterJid, {
                image: imageBuffer,
                mimetype,
                caption: dto.caption
            });
            this.logger.log(`Imagem enviada para newsletter ${newsletterJid}`);
            return { success: true, newsletterId: newsletterJid, type: 'image' };
        }
        catch (error) {
            this.logger.error(`Erro ao enviar imagem para newsletter: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao enviar imagem para newsletter: ${error.message}`);
        }
    }
    async sendNewsletterVideo(dto) {
        const socket = this.baileys.getSocket(dto.instanceId);
        if (!socket)
            throw new common_1.BadRequestException('Instância não conectada');
        const newsletterJid = dto.newsletterId.includes('@newsletter')
            ? dto.newsletterId
            : `${dto.newsletterId}@newsletter`;
        try {
            const videoBuffer = await this.downloadMedia(dto.videoUrl);
            const mimetype = this.getMimeType(dto.videoUrl, 'video');
            await socket.sendMessage(newsletterJid, {
                video: videoBuffer,
                mimetype,
                caption: dto.caption
            });
            this.logger.log(`Vídeo enviado para newsletter ${newsletterJid}`);
            return { success: true, newsletterId: newsletterJid, type: 'video' };
        }
        catch (error) {
            this.logger.error(`Erro ao enviar vídeo para newsletter: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao enviar vídeo para newsletter: ${error.message}`);
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        baileys_service_1.BaileysService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map
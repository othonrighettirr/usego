import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { BaileysService, InstanceSettings, InstanceSettingsUpdate } from './baileys.service';
import { CreateInstanceDto, UpdateInstanceDto, UpdateSettingsDto } from './dto/instance.dto';
import { TypebotService } from '../integrations/typebot.service';
import { N8nService } from '../integrations/n8n.service';
import { ChatwootService } from '../integrations/chatwoot.service';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class InstancesService {
  constructor(
    private prisma: PrismaService,
    private baileys: BaileysService,
    @Inject(forwardRef(() => TypebotService))
    private typebot: TypebotService,
    @Inject(forwardRef(() => N8nService))
    private n8n: N8nService,
    @Inject(forwardRef(() => ChatwootService))
    private chatwoot: ChatwootService,
  ) {}

  async findAll(userId: string) {
    const instances = await this.prisma.instance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Gerar API Key para instâncias que não têm
    for (const instance of instances) {
      if (!instance.apiKey) {
        const apiKey = crypto.randomBytes(32).toString('hex');
        await this.prisma.instance.update({
          where: { id: instance.id },
          data: { apiKey },
        });
        instance.apiKey = apiKey;
      }
    }

    return instances.map((i) => ({
      ...i,
      status: this.baileys.getStatus(i.id) || i.status,
      phone: this.baileys.getPhone(i.id),
      profilePic: this.baileys.getProfilePic(i.id),
      profileName: this.baileys.getProfileName(i.id),
      apiKey: i.apiKey,
    }));
  }

  async findOne(id: string, userId: string) {
    const instance = await this.prisma.instance.findFirst({
      where: { id, userId },
    });
    if (!instance) throw new NotFoundException('Instância não encontrada');
    return {
      ...instance,
      status: this.baileys.getStatus(id) || instance.status,
      phone: this.baileys.getPhone(id),
      profilePic: this.baileys.getProfilePic(id),
      profileName: this.baileys.getProfileName(id),
      apiKey: instance.apiKey,
    };
  }

  async create(dto: CreateInstanceDto, userId: string) {
    // Gerar API Key apenas com números e letras (sem prefixo)
    const apiKey = crypto.randomBytes(32).toString('hex');
    return this.prisma.instance.create({
      data: { name: dto.name, userId, apiKey },
    });
  }

  async update(id: string, dto: UpdateInstanceDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.instance.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.baileys.deleteSession(id);
    await this.prisma.instance.delete({ where: { id } });
    return { message: 'Instância removida com sucesso' };
  }

  async connect(id: string, userId: string) {
    await this.findOne(id, userId);
    
    let qr: string | null = null;
    try {
      qr = await this.baileys.connect(id);
    } catch (error) {
      console.error(`Erro ao conectar instância ${id}:`, error);
      throw new BadRequestException(`Erro ao conectar: ${error.message || 'Erro desconhecido'}`);
    }
    
    // Registrar callbacks das integrações para esta instância (com tratamento de erro)
    try {
      this.typebot.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar Typebot para ${id}:`, e);
    }
    
    try {
      this.n8n.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar N8n para ${id}:`, e);
    }
    
    try {
      this.chatwoot.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar Chatwoot para ${id}:`, e);
    }
    
    await this.prisma.instance.update({
      where: { id },
      data: { status: qr ? 'WAITING_QR' : 'CONNECTED' },
    });

    return { qr, status: qr ? 'WAITING_QR' : 'CONNECTED' };
  }

  async disconnect(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.baileys.disconnect(id);
    
    await this.prisma.instance.update({
      where: { id },
      data: { status: 'DISCONNECTED' },
    });

    return { message: 'Desconectado com sucesso' };
  }

  async reconnect(id: string, userId: string) {
    await this.findOne(id, userId);
    
    let qr: string | null = null;
    try {
      qr = await this.baileys.reconnect(id);
    } catch (error) {
      console.error(`Erro ao reconectar instância ${id}:`, error);
      throw new BadRequestException(`Erro ao reconectar: ${error.message || 'Erro desconhecido'}`);
    }
    
    // Registrar callbacks das integrações para esta instância (com tratamento de erro)
    try {
      this.typebot.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar Typebot para ${id}:`, e);
    }
    
    try {
      this.n8n.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar N8n para ${id}:`, e);
    }
    
    try {
      this.chatwoot.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar Chatwoot para ${id}:`, e);
    }
    
    await this.prisma.instance.update({
      where: { id },
      data: { status: qr ? 'WAITING_QR' : 'CONNECTED' },
    });

    return { qr, status: qr ? 'WAITING_QR' : 'CONNECTED' };
  }

  // Reiniciar instância mantendo a sessão (sem precisar de QR)
  async restart(id: string, userId: string) {
    await this.findOne(id, userId);
    
    try {
      await this.baileys.restart(id);
    } catch (error) {
      console.error(`Erro ao reiniciar instância ${id}:`, error);
      throw new BadRequestException(`Erro ao reiniciar: ${error.message || 'Erro desconhecido'}`);
    }
    
    // Registrar callbacks das integrações para esta instância (com tratamento de erro)
    try {
      this.typebot.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar Typebot para ${id}:`, e);
    }
    
    try {
      this.n8n.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar N8n para ${id}:`, e);
    }
    
    try {
      this.chatwoot.registerInstance(id);
    } catch (e) {
      console.warn(`Erro ao registrar Chatwoot para ${id}:`, e);
    }
    
    return { message: 'Instância reiniciada com sucesso' };
  }

  async getQR(id: string, userId: string) {
    await this.findOne(id, userId);
    const qr = this.baileys.getQR(id);
    const status = this.baileys.getStatus(id);
    
    if (status === 'CONNECTED') {
      return { 
        status: 'CONNECTED', 
        qrCode: null,
        phone: this.baileys.getPhone(id),
        profilePic: this.baileys.getProfilePic(id),
        profileName: this.baileys.getProfileName(id),
      };
    }
    
    if (!qr) {
      return { status: 'WAITING', qrCode: null };
    }

    const qrCode = await QRCode.toDataURL(qr);
    return { status: 'QR_READY', qrCode };
  }

  async getSettings(id: string, userId: string): Promise<InstanceSettings> {
    await this.findOne(id, userId);
    return this.baileys.getSettings(id);
  }

  async updateSettings(id: string, dto: UpdateSettingsDto, userId: string): Promise<InstanceSettings> {
    await this.findOne(id, userId);
    return this.baileys.setSettings(id, dto);
  }

  // Shared Token Methods - Persistido no banco de dados
  async createSharedToken(instanceId: string, userId: string, expiresInHours = 168, permissions = ['view_qr']) {
    console.log(`[SharedToken] Criando token para instância ${instanceId}, userId: ${userId}, expiresInHours: ${expiresInHours}`);
    
    // Verificar se a instância pertence ao usuário
    const instance = await this.prisma.instance.findFirst({
      where: { id: instanceId, userId },
    });
    if (!instance) {
      console.log(`[SharedToken] Instância não encontrada: ${instanceId}`);
      throw new NotFoundException('Instância não encontrada');
    }

    // Deletar tokens antigos desta instância
    const deleted = await this.prisma.sharedToken.deleteMany({
      where: { instanceId },
    });
    console.log(`[SharedToken] Tokens antigos deletados: ${deleted.count}`);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // Salvar no banco de dados
    const created = await this.prisma.sharedToken.create({
      data: {
        instanceId,
        token,
        permissions,
        expiresAt,
      },
    });
    
    console.log(`[SharedToken] Token criado: ${token.substring(0, 10)}..., expira em: ${expiresAt}`);

    return { token, expiresAt };
  }

  async getSharedQR(token: string) {
    console.log(`[SharedQR] Buscando token: ${token}`);
    
    // Buscar token no banco de dados
    const tokenData = await this.prisma.sharedToken.findUnique({
      where: { token },
      include: { instance: true },
    });
    
    if (!tokenData) {
      console.log(`[SharedQR] Token não encontrado no banco: ${token}`);
      throw new BadRequestException('Token inválido ou expirado');
    }
    
    console.log(`[SharedQR] Token encontrado, instanceId: ${tokenData.instanceId}, expiresAt: ${tokenData.expiresAt}`);
    
    if (new Date() > tokenData.expiresAt) {
      console.log(`[SharedQR] Token expirado: ${token}`);
      // Deletar token expirado
      await this.prisma.sharedToken.delete({ where: { id: tokenData.id } });
      throw new BadRequestException('Token expirado');
    }

    const instance = tokenData.instance;
    if (!instance) {
      console.log(`[SharedQR] Instância não encontrada para token: ${token}`);
      throw new NotFoundException('Instância não encontrada');
    }

    const instanceId = tokenData.instanceId;
    let status = this.baileys.getStatus(instanceId);
    let qr = this.baileys.getQR(instanceId);
    
    console.log(`[SharedQR] Status atual: ${status}, QR disponível: ${!!qr}`);

    // Se está conectado, retornar sucesso
    if (status === 'CONNECTED') {
      return {
        status: 'CONNECTED',
        qrCode: null,
        instanceName: instance.name,
      };
    }

    // Se não tem QR e não está conectado, tentar iniciar conexão
    if (!qr && status !== 'CONNECTING') {
      try {
        console.log(`[SharedQR] Iniciando conexão para instância ${instanceId}`);
        const connectResult = await this.baileys.connect(instanceId);
        
        // Aguardar um pouco para o QR ser gerado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Buscar QR novamente
        qr = this.baileys.getQR(instanceId);
        status = this.baileys.getStatus(instanceId);
        
        console.log(`[SharedQR] Após conexão - Status: ${status}, QR disponível: ${!!qr}`);
        
        if (status === 'CONNECTED') {
          return {
            status: 'CONNECTED',
            qrCode: null,
            instanceName: instance.name,
          };
        }
      } catch (error) {
        console.error(`[SharedQR] Erro ao conectar instância ${instanceId}:`, error);
        // Continuar mesmo com erro, pode ser que o QR já esteja disponível
      }
    }

    // Se ainda não tem QR, retornar status de espera
    if (!qr) {
      console.log(`[SharedQR] QR ainda não disponível, retornando WAITING`);
      return {
        status: 'WAITING',
        qrCode: null,
        instanceName: instance.name,
      };
    }

    // Gerar QR Code em base64
    console.log(`[SharedQR] Gerando QR Code em base64`);
    const qrCode = await QRCode.toDataURL(qr);
    return {
      status: 'QR_READY',
      qrCode,
      instanceName: instance.name,
    };
  }
}

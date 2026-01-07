import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BaileysService } from './baileys.service';

@Controller('instances/:instanceId/contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private baileys: BaileysService) {}

  // Store de newsletters por instância
  private newsletterStore: Map<string, any[]> = new Map();

  // Cache local de mapeamentos LID -> PN descobertos
  private lidCache: Map<string, string> = new Map();

  // Função para extrair número de telefone do JID
  private extractPhoneNumber(jid: string): string {
    if (!jid) return '';
    
    // Se for LID, retornar vazio (será resolvido depois via LIDMappingStore)
    if (jid.endsWith('@lid')) {
      return '';
    }
    
    // Extrair número do JID normal
    return jid
      .replace(/@s\.whatsapp\.net$/, '')
      .replace(/@c\.us$/, '')
      .replace(/@hosted$/, '')
      .split(':')[0]; // Remove a parte após ":" se existir
  }

  // Resolver LID para número de telefone usando LIDMappingStore do Baileys
  private async resolveLIDToPhone(socket: any, lid: string, instanceId: string): Promise<string> {
    if (!lid.endsWith('@lid')) {
      return this.extractPhoneNumber(lid);
    }

    // Verificar cache local primeiro
    const cached = this.lidCache.get(lid);
    if (cached) {
      return cached;
    }

    // Verificar store de mapeamentos do BaileysService
    const storedMapping = this.baileys.getLidMapping(instanceId, lid);
    if (storedMapping) {
      this.lidCache.set(lid, storedMapping);
      return storedMapping;
    }

    try {
      // Acessar o LIDMappingStore através do signalRepository do socket
      const signalRepo = socket.signalRepository;
      if (signalRepo?.lidMapping) {
        const pn = await signalRepo.lidMapping.getPNForLID(lid);
        if (pn) {
          // pn vem no formato "5598984072210:0@s.whatsapp.net"
          const phone = this.extractPhoneNumber(pn);
          if (phone) {
            this.lidCache.set(lid, phone);
            return phone;
          }
        }
      }
    } catch (e) {
      // Silenciar erro - retornar LID sem sufixo como fallback
    }

    // Fallback: retornar o LID sem o sufixo @lid
    // Nota: isso não é um número de telefone válido, mas permite identificar o participante
    return lid.replace(/@lid$/, '').split(':')[0];
  }

  // Buscar nome do contato de múltiplas fontes
  private getContactName(
    participant: any,
    pushNames: Map<string, string>,
    contacts: Map<string, { id: string; name?: string; notify?: string; verifiedName?: string }>,
  ): string | null {
    // 1. Do próprio participante (notify/verifiedName)
    if (participant.notify) {
      return participant.notify;
    }
    if (participant.verifiedName) {
      return participant.verifiedName;
    }
    
    // 2. Do cache de pushNames
    const pushName = pushNames.get(participant.id);
    if (pushName) {
      return pushName;
    }
    
    // 3. Do store de contatos
    const contact = contacts.get(participant.id);
    if (contact) {
      return contact.name || contact.notify || contact.verifiedName || null;
    }
    
    return null;
  }

  @Get('groups')
  async getGroups(@Param('instanceId') instanceId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) return { groups: [] };

    try {
      const groups = await socket.groupFetchAllParticipating();
      const groupList = Object.values(groups).map((g: any) => ({
        id: g.id,
        name: g.subject,
        participants: g.participants?.length || 0,
        creation: g.creation,
        owner: g.owner?.replace(/@s\.whatsapp\.net$/, '') || null,
      }));
      return { groups: groupList };
    } catch (e) {
      return { groups: [] };
    }
  }

  @Get('groups/:groupId/participants')
  async getGroupParticipants(
    @Param('instanceId') instanceId: string,
    @Param('groupId') groupId: string,
  ) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) return { participants: [] };

    try {
      const metadata = await socket.groupMetadata(groupId);
      const pushNames = this.baileys.getPushNames(instanceId);
      const contacts = this.baileys.getContacts(instanceId);
      
      const participants = await Promise.all(
        metadata.participants.map(async (p: any) => {
          // Buscar nome de múltiplas fontes
          const name = this.getContactName(p, pushNames, contacts);
          
          // Resolver LID para número de telefone real usando LIDMappingStore
          const phone = await this.resolveLIDToPhone(socket, p.id, instanceId);
          
          return {
            id: p.id,
            phone,
            name,
            admin: p.admin || null,
          };
        })
      );
      
      return {
        groupName: metadata.subject,
        groupId: metadata.id,
        participants,
      };
    } catch (e) {
      console.error('Erro ao buscar participantes:', e);
      return { participants: [] };
    }
  }

  @Get('all')
  async getAllContacts(@Param('instanceId') instanceId: string) {
    const contacts = this.baileys.getContacts(instanceId);
    
    if (contacts.size === 0) {
      return { contacts: [] };
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
        phone: this.extractPhoneNumber(c.id),
        name: c.name || c.notify || c.verifiedName || null,
      }));
      
    return { contacts: contactList };
  }

  @Get('newsletters')
  async getNewsletters(@Param('instanceId') instanceId: string) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) return { newsletters: [] };

    // Buscar newsletters do store de chats (terminam com @newsletter)
    let newsletters = this.baileys.getNewsletters(instanceId);
    
    // Se não tiver newsletters no store, tentar buscar do histórico de chats
    if (newsletters.length === 0) {
      try {
        // Tentar buscar chats que são newsletters
        const store = socket.store;
        if (store?.chats) {
          const chats = store.chats.all();
          for (const chat of chats) {
            if (chat.id?.endsWith('@newsletter')) {
              newsletters.push({
                id: chat.id,
                name: chat.name || 'Canal',
                description: '',
                picture: null,
              });
            }
          }
        }
      } catch (e) {
        console.log('Store não disponível, usando apenas cache');
      }
    }
    
    // Buscar metadados e inscritos para cada newsletter
    const newsletterList = await Promise.all(
      newsletters.map(async (n: any) => {
        let subscribers = 0;
        let name = n.name || 'Canal sem nome';
        
        try {
          // Buscar metadados para obter nome correto
          const metadata = await socket.newsletterMetadata('jid', n.id);
          if (metadata) {
            name = metadata.name || name;
          }
        } catch {}
        
        try {
          const result = await socket.newsletterSubscribers(n.id);
          subscribers = result?.subscribers || 0;
        } catch {}
        
        return {
          id: n.id,
          name,
          description: n.description || '',
          subscribers,
          picture: n.picture || null,
        };
      })
    );

    return { newsletters: newsletterList };
  }

  @Get('newsletters/:newsletterId/subscribers')
  async getNewsletterSubscribers(
    @Param('instanceId') instanceId: string,
    @Param('newsletterId') newsletterId: string,
  ) {
    const socket = this.baileys.getSocket(instanceId);
    if (!socket) return { subscribers: 0 };

    try {
      const newsletterJid = newsletterId.includes('@newsletter') 
        ? newsletterId 
        : `${newsletterId}@newsletter`;
      
      const result = await socket.newsletterSubscribers(newsletterJid);
      return { 
        newsletterId: newsletterJid,
        subscribers: result?.subscribers || 0 
      };
    } catch (e) {
      return { subscribers: 0, error: e.message };
    }
  }
}

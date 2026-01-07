"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const baileys_service_1 = require("./baileys.service");
let ContactsController = class ContactsController {
    constructor(baileys) {
        this.baileys = baileys;
        this.newsletterStore = new Map();
        this.lidCache = new Map();
    }
    extractPhoneNumber(jid) {
        if (!jid)
            return '';
        if (jid.endsWith('@lid')) {
            return '';
        }
        return jid
            .replace(/@s\.whatsapp\.net$/, '')
            .replace(/@c\.us$/, '')
            .replace(/@hosted$/, '')
            .split(':')[0];
    }
    async resolveLIDToPhone(socket, lid, instanceId) {
        if (!lid.endsWith('@lid')) {
            return this.extractPhoneNumber(lid);
        }
        const cached = this.lidCache.get(lid);
        if (cached) {
            return cached;
        }
        const storedMapping = this.baileys.getLidMapping(instanceId, lid);
        if (storedMapping) {
            this.lidCache.set(lid, storedMapping);
            return storedMapping;
        }
        try {
            const signalRepo = socket.signalRepository;
            if (signalRepo?.lidMapping) {
                const pn = await signalRepo.lidMapping.getPNForLID(lid);
                if (pn) {
                    const phone = this.extractPhoneNumber(pn);
                    if (phone) {
                        this.lidCache.set(lid, phone);
                        return phone;
                    }
                }
            }
        }
        catch (e) {
        }
        return lid.replace(/@lid$/, '').split(':')[0];
    }
    getContactName(participant, pushNames, contacts) {
        if (participant.notify) {
            return participant.notify;
        }
        if (participant.verifiedName) {
            return participant.verifiedName;
        }
        const pushName = pushNames.get(participant.id);
        if (pushName) {
            return pushName;
        }
        const contact = contacts.get(participant.id);
        if (contact) {
            return contact.name || contact.notify || contact.verifiedName || null;
        }
        return null;
    }
    async getGroups(instanceId) {
        const socket = this.baileys.getSocket(instanceId);
        if (!socket)
            return { groups: [] };
        try {
            const groups = await socket.groupFetchAllParticipating();
            const groupList = Object.values(groups).map((g) => ({
                id: g.id,
                name: g.subject,
                participants: g.participants?.length || 0,
                creation: g.creation,
                owner: g.owner?.replace(/@s\.whatsapp\.net$/, '') || null,
            }));
            return { groups: groupList };
        }
        catch (e) {
            return { groups: [] };
        }
    }
    async getGroupParticipants(instanceId, groupId) {
        const socket = this.baileys.getSocket(instanceId);
        if (!socket)
            return { participants: [] };
        try {
            const metadata = await socket.groupMetadata(groupId);
            const pushNames = this.baileys.getPushNames(instanceId);
            const contacts = this.baileys.getContacts(instanceId);
            const participants = await Promise.all(metadata.participants.map(async (p) => {
                const name = this.getContactName(p, pushNames, contacts);
                const phone = await this.resolveLIDToPhone(socket, p.id, instanceId);
                return {
                    id: p.id,
                    phone,
                    name,
                    admin: p.admin || null,
                };
            }));
            return {
                groupName: metadata.subject,
                groupId: metadata.id,
                participants,
            };
        }
        catch (e) {
            console.error('Erro ao buscar participantes:', e);
            return { participants: [] };
        }
    }
    async getAllContacts(instanceId) {
        const contacts = this.baileys.getContacts(instanceId);
        if (contacts.size === 0) {
            return { contacts: [] };
        }
        const contactList = Array.from(contacts.values())
            .filter((c) => c.id &&
            !c.id.endsWith('@g.us') &&
            !c.id.endsWith('@broadcast') &&
            !c.id.endsWith('@lid'))
            .map((c) => ({
            id: c.id,
            phone: this.extractPhoneNumber(c.id),
            name: c.name || c.notify || c.verifiedName || null,
        }));
        return { contacts: contactList };
    }
    async getNewsletters(instanceId) {
        const socket = this.baileys.getSocket(instanceId);
        if (!socket)
            return { newsletters: [] };
        let newsletters = this.baileys.getNewsletters(instanceId);
        if (newsletters.length === 0) {
            try {
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
            }
            catch (e) {
                console.log('Store não disponível, usando apenas cache');
            }
        }
        const newsletterList = await Promise.all(newsletters.map(async (n) => {
            let subscribers = 0;
            let name = n.name || 'Canal sem nome';
            try {
                const metadata = await socket.newsletterMetadata('jid', n.id);
                if (metadata) {
                    name = metadata.name || name;
                }
            }
            catch { }
            try {
                const result = await socket.newsletterSubscribers(n.id);
                subscribers = result?.subscribers || 0;
            }
            catch { }
            return {
                id: n.id,
                name,
                description: n.description || '',
                subscribers,
                picture: n.picture || null,
            };
        }));
        return { newsletters: newsletterList };
    }
    async getNewsletterSubscribers(instanceId, newsletterId) {
        const socket = this.baileys.getSocket(instanceId);
        if (!socket)
            return { subscribers: 0 };
        try {
            const newsletterJid = newsletterId.includes('@newsletter')
                ? newsletterId
                : `${newsletterId}@newsletter`;
            const result = await socket.newsletterSubscribers(newsletterJid);
            return {
                newsletterId: newsletterJid,
                subscribers: result?.subscribers || 0
            };
        }
        catch (e) {
            return { subscribers: 0, error: e.message };
        }
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Get)('groups'),
    __param(0, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getGroups", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/participants'),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getGroupParticipants", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getAllContacts", null);
__decorate([
    (0, common_1.Get)('newsletters'),
    __param(0, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getNewsletters", null);
__decorate([
    (0, common_1.Get)('newsletters/:newsletterId/subscribers'),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, common_1.Param)('newsletterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getNewsletterSubscribers", null);
exports.ContactsController = ContactsController = __decorate([
    (0, common_1.Controller)('instances/:instanceId/contacts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [baileys_service_1.BaileysService])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map